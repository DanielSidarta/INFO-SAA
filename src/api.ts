import { DriveFile, YouTubeLiveItem } from './types';

export const DRIVE_CONFIG = {
  PENGUMUMAN_FOLDER_ID: '1nL79tyR1w9VAa7emuHw5PkpmBJzL_o8n',
  PENGUMUMAN_API_KEY: 'AIzaSyAUsO6s9qbR2wzCvWfg2hqOpm7mf1G7zEk',
  
  EMBEDDING_FILE_ID: '1LGb3nL0GgRtvJJ2AoTwkyUdhr-msgTcB',
  HOMILI_FOLDER_ID: '1kib8Qhl7xPNO-mClke6ZveMpHXErec05',
  FOTO_SAA_FOLDER_ID: '1p3hdHPNuVu47WmHQo6xpC7yyc_wLUSxs',
  SHARED_API_KEY: 'AIzaSyDiSgv-TBYJk4eIAZy-DMmjq4Q3CF-S7Jc',
};

// URL builder for viewing media inline via server proxy
export function getMediaUrl(fileId: string, apiKey: string): string {
  return `/api/drive/media/${fileId}?key=${encodeURIComponent(apiKey)}`;
}

// URL builder for downloading media
export function getDownloadUrl(fileId: string, apiKey: string, filename: string): string {
  return `/api/drive/media/${fileId}?key=${encodeURIComponent(apiKey)}&download=1&filename=${encodeURIComponent(filename)}`;
}

// Optimized thumbnail URL: attempts server proxy or high quality link
export function getThumbnailUrl(file: DriveFile, apiKey: string): string {
  // If thumbnailLink is provided by Google Drive API, we can use it with high-res replacement '=s800' or '=s400'
  if (file.thumbnailLink) {
    return file.thumbnailLink.replace(/=s\d+$/, '=s600');
  }
  // Otherwise use media proxy
  return getMediaUrl(file.id, apiKey);
}

// Fetch list of files from a Google Drive folder
export async function fetchFolderFiles(folderId: string, apiKey: string, refresh = false): Promise<DriveFile[]> {
  const url = `/api/drive/files?folderId=${encodeURIComponent(folderId)}&apiKey=${encodeURIComponent(apiKey)}${refresh ? '&refresh=true' : ''}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Gagal memuat data dari Google Drive (${res.status})`);
    }
    const data = await res.json();
    return (data.files || []) as DriveFile[];
  } catch (err) {
    // Direct client fallback if proxy is unavailable
    const directQ = `'${folderId}' in parents and trashed=false`;
    const directUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(directQ)}&fields=files(id,name,mimeType,createdTime,modifiedTime,size,thumbnailLink)&key=${apiKey}`;
    const fallbackRes = await fetch(directUrl);
    if (!fallbackRes.ok) {
      throw err;
    }
    const fallbackData = await fallbackRes.json();
    return (fallbackData.files || []) as DriveFile[];
  }
}

// Fetch YouTube Live embedding list with titles
export async function fetchLiveStreams(refresh = false): Promise<YouTubeLiveItem[]> {
  const url = `/api/drive/embedding?fileId=${DRIVE_CONFIG.EMBEDDING_FILE_ID}&apiKey=${DRIVE_CONFIG.SHARED_API_KEY}${refresh ? '&refresh=true' : ''}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal membaca berkas embedding.txt (${res.status})`);
  }
  const data = await res.json();
  return (data.items || []) as YouTubeLiveItem[];
}
