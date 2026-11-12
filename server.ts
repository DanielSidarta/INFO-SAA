import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Basic JSON parser
app.use(express.json());

// In-memory cache for Drive file listings and metadata
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

function getCached(key: string) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key: string, data: any, ttl = CACHE_TTL_MS) {
  cache.set(key, { data, expiry: Date.now() + ttl });
}

// 1. Files listing from Google Drive Folder
app.get('/api/drive/files', async (req: Request, res: Response) => {
  try {
    const folderId = req.query.folderId as string;
    const apiKey = req.query.apiKey as string;
    const forceRefresh = req.query.refresh === 'true';

    if (!folderId || !apiKey) {
      return res.status(400).json({ error: 'folderId and apiKey are required' });
    }

    const cacheKey = `files_${folderId}`;
    if (!forceRefresh) {
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    // Query Google Drive v3
    const q = `'${folderId}' in parents and trashed=false`;
    const fields = 'files(id,name,mimeType,createdTime,modifiedTime,size,thumbnailLink,webContentLink,imageMediaMetadata,videoMediaMetadata)';
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=100&key=${apiKey}`;

    const driveRes = await fetch(url);
    if (!driveRes.ok) {
      const errorText = await driveRes.text();
      return res.status(driveRes.status).json({ error: 'Google Drive API error', details: errorText });
    }

    const data = await driveRes.json();
    setCached(cacheKey, data);
    res.json(data);
  } catch (err: any) {
    console.error('Error fetching drive files:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// 2. Media proxy with Range Header support (Crucial for MP4 seeking and CORS-safe image loading)
app.get('/api/drive/media/:fileId', async (req: Request, res: Response) => {
  try {
    const fileId = req.params.fileId;
    const apiKey = req.query.key as string;
    const isDownload = req.query.download === '1' || req.query.download === 'true';
    const filename = (req.query.filename as string) || `file_${fileId}`;

    if (!fileId || !apiKey) {
      return res.status(400).send('fileId and key are required');
    }

    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;

    const headers: Record<string, string> = {};
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const driveRes = await fetch(driveUrl, { headers });

    if (!driveRes.ok && driveRes.status !== 206) {
      const errorText = await driveRes.text();
      return res.status(driveRes.status).send(`Drive media error: ${errorText}`);
    }

    // Set appropriate headers
    res.status(driveRes.status);
    
    const contentType = driveRes.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    const contentLength = driveRes.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const contentRange = driveRes.headers.get('content-range');
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
    }

    res.setHeader('Accept-Ranges', 'bytes');

    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    } else {
      res.setHeader('Content-Disposition', 'inline');
    }

    // Cache control
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

    // Stream body to client
    if (driveRes.body) {
      // @ts-ignore Node 18+ Web Streams to Express stream
      const { Readable } = await import('stream');
      // @ts-ignore
      const nodeStream = Readable.fromWeb(driveRes.body);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error('Error proxying drive media:', err);
    if (!res.headersSent) {
      res.status(500).send(`Server media error: ${err.message}`);
    }
  }
});

// Helper function to extract YouTube ID from varied formats
function extractYouTubeId(line: string): string | null {
  const clean = line.trim();
  if (!clean) return null;
  // Raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  // Standard URLs
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = clean.match(regExp);
  return match && match[1] ? match[1] : null;
}

// 3. YouTube Live Embedding list & auto video title
app.get('/api/drive/embedding', async (req: Request, res: Response) => {
  try {
    const fileId = (req.query.fileId as string) || '1LGb3nL0GgRtvJJ2AoTwkyUdhr-msgTcB';
    const apiKey = (req.query.apiKey as string) || 'AIzaSyDiSgv-TBYJk4eIAZy-DMmjq4Q3CF-S7Jc';
    const forceRefresh = req.query.refresh === 'true';

    const cacheKey = `embedding_${fileId}`;
    if (!forceRefresh) {
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    // Fetch the raw text file from Google Drive
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    const driveRes = await fetch(driveUrl);
    if (!driveRes.ok) {
      const errText = await driveRes.text();
      return res.status(driveRes.status).json({ error: 'Failed to read embedding.txt', details: errText });
    }

    const text = await driveRes.text();
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // Fetch titles and thumbnails in parallel
    const items = await Promise.all(
      lines.map(async (line, index) => {
        const videoId = extractYouTubeId(line);
        if (!videoId) return null;

        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        let title = `Live Streaming Gereja SAA #${index + 1}`;
        let author = 'Paroki St. Albertus Agung Makassar';
        let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        try {
          const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`);
          if (oembedRes.ok) {
            const oembed = await oembedRes.json();
            if (oembed.title) title = oembed.title;
            if (oembed.author_name) author = oembed.author_name;
            if (oembed.thumbnail_url) thumbnail = oembed.thumbnail_url;
          }
        } catch {
          // Keep fallbacks
        }

        return {
          id: videoId,
          url: youtubeUrl,
          rawUrl: line,
          title,
          author,
          thumbnail,
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
        };
      })
    );

    const validItems = items.filter(Boolean);
    const result = { items: validItems, rawCount: lines.length };
    setCached(cacheKey, result, 5 * 60 * 1000); // 5 minutes cache
    res.json(result);
  } catch (err: any) {
    console.error('Error reading embedding:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// Setup Vite or Static Serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`INFO SAA server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
