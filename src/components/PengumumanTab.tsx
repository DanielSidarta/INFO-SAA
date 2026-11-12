import React, { useState, useEffect, useMemo } from 'react';
import { DriveFile, SortOption } from '../types';
import { DRIVE_CONFIG, fetchFolderFiles, getThumbnailUrl } from '../api';
import { ImageViewerModal } from './ImageViewerModal';
import { 
  Search, 
  RefreshCw, 
  ArrowUpDown, 
  Calendar, 
  FileImage, 
  Loader2, 
  AlertCircle,
  Eye
} from 'lucide-react';

interface PengumumanTabProps {
  onRefreshTrigger?: number;
}

export const PengumumanTab: React.FC<PengumumanTabProps> = ({ onRefreshTrigger }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const items = await fetchFolderFiles(
        DRIVE_CONFIG.PENGUMUMAN_FOLDER_ID,
        DRIVE_CONFIG.PENGUMUMAN_API_KEY,
        isManualRefresh
      );

      // Filter only image files (jpg, jpeg, png) as requested
      const imageFiles = items.filter(file => {
        const mime = (file.mimeType || '').toLowerCase();
        const name = (file.name || '').toLowerCase();
        return (
          mime.startsWith('image/') ||
          name.endsWith('.jpg') ||
          name.endsWith('.jpeg') ||
          name.endsWith('.png')
        );
      });

      setFiles(imageFiles);
    } catch (err: any) {
      console.error('Error loading pengumuman:', err);
      setError(err.message || 'Gagal memuat pengumuman gereja.');
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

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(f => f.name.toLowerCase().includes(q));
    }

    // Sort
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

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Control Bar: Search, Sort, Refresh */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul pengumuman..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Sort and Refresh buttons */}
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
          <p className="text-sm font-medium">Memuat berkas pengumuman dari Google Drive...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Terjadi Kesalahan</h4>
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

      {/* Empty State */}
      {!loading && !error && filteredFiles.length === 0 && (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/80 p-8">
          <FileImage className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Tidak ada pengumuman ditemukan</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ada pengumuman yang cocok dengan kata kunci "${searchQuery}".`
              : 'Belum ada gambar pengumuman di folder Google Drive ini.'}
          </p>
        </div>
      )}

      {/* Grid of Large Icons / Thumbnails */}
      {!loading && !error && filteredFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredFiles.map((file, idx) => {
            const thumbUrl = getThumbnailUrl(file, DRIVE_CONFIG.PENGUMUMAN_API_KEY);
            return (
              <div
                key={file.id}
                onClick={() => setSelectedIndex(idx)}
                className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-amber-400 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                {/* Large Thumbnail Card */}
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={thumbUrl}
                    alt={file.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      // Fallback icon on image error
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Overlay Hover Icon */}
                  <div className="absolute inset-0 bg-[#7b1113]/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="p-3 rounded-full bg-white/90 text-[#7b1113] shadow-lg transform translate-y-2 group-hover:translate-y-0 transition duration-200">
                      <Eye className="w-6 h-6" />
                    </div>
                  </div>

                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-black/60 text-white backdrop-blur-md uppercase">
                    {file.name.split('.').pop() || 'IMG'}
                  </span>
                </div>

                {/* Card Title & Date Info */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <h3
                    className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#7b1113] transition"
                    title={file.name}
                  >
                    {file.name.replace(/\.[^/.]+$/, '')}
                  </h3>

                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      {formatDate(file.createdTime || file.modifiedTime)}
                    </span>
                    <span className="text-[#7b1113] font-semibold text-xs group-hover:underline">
                      Lihat Foto
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Interactive Zoom & Pan Modal */}
      {selectedIndex !== null && (
        <ImageViewerModal
          files={filteredFiles}
          currentIndex={selectedIndex}
          apiKey={DRIVE_CONFIG.PENGUMUMAN_API_KEY}
          onClose={() => setSelectedIndex(null)}
          onNavigate={(newIdx) => setSelectedIndex(newIdx)}
        />
      )}
    </div>
  );
};
