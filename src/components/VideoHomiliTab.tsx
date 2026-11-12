import React, { useState, useEffect, useMemo } from 'react';
import { DriveFile, SortOption } from '../types';
import { DRIVE_CONFIG, fetchFolderFiles } from '../api';
import { VideoPlayerModal } from './VideoPlayerModal';
import { 
  Search, 
  RefreshCw, 
  ArrowUpDown, 
  Calendar, 
  HardDrive, 
  Loader2, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface VideoHomiliTabProps {
  onRefreshTrigger?: number;
}

export const VideoHomiliTab: React.FC<VideoHomiliTabProps> = ({ onRefreshTrigger }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [selectedVideo, setSelectedVideo] = useState<DriveFile | null>(null);

  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const items = await fetchFolderFiles(
        DRIVE_CONFIG.HOMILI_FOLDER_ID,
        DRIVE_CONFIG.SHARED_API_KEY,
        isManualRefresh
      );

      // Filter only mp4/video files
      const videoFiles = items.filter(file => {
        const mime = (file.mimeType || '').toLowerCase();
        const name = (file.name || '').toLowerCase();
        return mime.startsWith('video/') || name.endsWith('.mp4');
      });

      setFiles(videoFiles);
    } catch (err: any) {
      console.error('Error loading video homili:', err);
      setError(err.message || 'Gagal memuat daftar video homili.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (onRefreshTrigger) {
      loadData(true);
    }
  }, [onRefreshTrigger]);

  const filteredFiles = useMemo(() => {
    let result = [...files];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(f => f.name.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      if (sortOption === 'name_asc') {
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      }
      if (sortOption === 'name_desc') {
        return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
      }
      if (sortOption === 'date_desc') {
        const timeA = new Date(a.createdTime || a.modifiedTime || 0).getTime();
        const timeB = new Date(b.createdTime || b.modifiedTime || 0).getTime();
        return timeB - timeA;
      }
      if (sortOption === 'date_asc') {
        const timeA = new Date(a.createdTime || a.modifiedTime || 0).getTime();
        const timeB = new Date(b.createdTime || b.modifiedTime || 0).getTime();
        return timeA - timeB;
      }
      return 0;
    });

    return result;
  }, [files, searchQuery, sortOption]);

  const formatFileSize = (bytesStr?: string) => {
    if (!bytesStr) return '';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '';
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Search, Sort, Refresh Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul video homili..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:border-transparent transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <ArrowUpDown className="w-4 h-4 text-stone-500 absolute left-2.5 pointer-events-none" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="pl-8 pr-7 py-2 text-xs sm:text-sm font-medium rounded-xl bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100 transition focus:outline-none cursor-pointer"
            >
              <option value="date_desc">Waktu: Terkini</option>
              <option value="date_asc">Waktu: Terlama</option>
              <option value="name_asc">Nama (A - Z)</option>
              <option value="name_desc">Nama (Z - A)</option>
            </select>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#7b1113] hover:bg-[#931518] text-white shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Muat ulang dari Google Drive"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Segarkan</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
          <Loader2 className="w-10 h-10 text-[#7b1113] animate-spin" />
          <p className="text-sm font-medium">Memuat berkas video homili dari Google Drive...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Gagal Mengambil Video Homili</h4>
            <p className="text-xs text-red-700 mt-1">{error}</p>
            <button
              onClick={() => loadData(true)}
              className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredFiles.length === 0 && (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/80 p-8">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Tidak ada video homili ditemukan</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ada video yang cocok dengan kata kunci "${searchQuery}".`
              : 'Belum ada berkas video mp4 dalam folder Homili.'}
          </p>
        </div>
      )}

      {/* LIST OF VIDEO NAMES WITHOUT ICONS (Nama-nama video tanpa icon) */}
      {!loading && !error && filteredFiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200/80 divide-y divide-stone-100 overflow-hidden shadow-sm">
          {filteredFiles.map((file, idx) => (
            <div
              key={file.id}
              onClick={() => setSelectedVideo(file)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-amber-50/40 transition-colors cursor-pointer active:bg-amber-100/60"
            >
              <div className="flex items-start gap-3 min-w-0 pr-4">
                <span className="flex-shrink-0 text-xs font-mono font-bold text-stone-400 group-hover:text-[#7b1113] pt-0.5 w-6">
                  {(idx + 1).toString().padStart(2, '0')}.
                </span>
                
                <div className="min-w-0">
                  {/* Video Name without icon */}
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-[#7b1113] transition line-clamp-2">
                    {file.name}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {formatDate(file.createdTime || file.modifiedTime)}
                    </span>
                    {file.size && (
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5 text-stone-400" />
                        {formatFileSize(file.size)}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                      MP4
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-0 flex items-center justify-end flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7b1113] group-hover:bg-[#931518] text-white text-xs font-semibold shadow-sm transition">
                  Putar Video &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          file={selectedVideo}
          apiKey={DRIVE_CONFIG.SHARED_API_KEY}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};
