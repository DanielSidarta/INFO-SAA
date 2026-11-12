import React, { useState, useEffect, useMemo } from 'react';
import { DriveFile, SortOption } from '../types';
import { DRIVE_CONFIG, fetchFolderFiles, getThumbnailUrl } from '../api';
import { ImageViewerModal } from './ImageViewerModal';
import { 
  Search, 
  RefreshCw, 
  ArrowUpDown, 
  Calendar, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Eye,
  Images,
  FolderOpen
} from 'lucide-react';

interface DokumentasiTabProps {
  onRefreshTrigger?: number;
}

export const DokumentasiTab: React.FC<DokumentasiTabProps> = ({ onRefreshTrigger }) => {
  // Albums (subfolders)
  const [albums, setAlbums] = useState<DriveFile[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [albumError, setAlbumError] = useState<string | null>(null);

  // Selected Album State
  const [selectedAlbum, setSelectedAlbum] = useState<DriveFile | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<DriveFile[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Search, Sort, Modal
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load Album List (subfolders of "Foto SAA")
  const loadAlbums = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoadingAlbums(true);
      setAlbumError(null);

      const items = await fetchFolderFiles(
        DRIVE_CONFIG.FOTO_SAA_FOLDER_ID,
        DRIVE_CONFIG.SHARED_API_KEY,
        isManualRefresh
      );

      // Subfolders have mimeType === 'application/vnd.google-apps.folder'
      const subfolders = items.filter(
        item => item.mimeType === 'application/vnd.google-apps.folder'
      );

      // Sort albums alphabetically by name by default
      subfolders.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

      setAlbums(subfolders);
    } catch (err: any) {
      console.error('Error loading albums:', err);
      setAlbumError(err.message || 'Gagal memuat daftar album foto dari Google Drive.');
    } finally {
      setLoadingAlbums(false);
      setRefreshing(false);
    }
  };

  // Load Photos for a selected album
  const loadPhotosForAlbum = async (album: DriveFile, isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoadingPhotos(true);
      setPhotoError(null);

      const items = await fetchFolderFiles(
        album.id,
        DRIVE_CONFIG.SHARED_API_KEY,
        isManualRefresh
      );

      // Filter only image files (jpg, jpeg, png)
      const images = items.filter(file => {
        const mime = (file.mimeType || '').toLowerCase();
        const name = (file.name || '').toLowerCase();
        return (
          mime.startsWith('image/') ||
          name.endsWith('.jpg') ||
          name.endsWith('.jpeg') ||
          name.endsWith('.png')
        );
      });

      setAlbumPhotos(images);
    } catch (err: any) {
      console.error('Error loading photos for album:', err);
      setPhotoError(err.message || `Gagal memuat foto dari album "${album.name}".`);
    } finally {
      setLoadingPhotos(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    if (onRefreshTrigger) {
      if (selectedAlbum) {
        loadPhotosForAlbum(selectedAlbum, true);
      } else {
        loadAlbums(true);
      }
    }
  }, [onRefreshTrigger]);

  const handleSelectAlbum = (album: DriveFile) => {
    setSelectedAlbum(album);
    setSearchQuery('');
    setSortOption('name_asc');
    loadPhotosForAlbum(album);
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setAlbumPhotos([]);
    setSearchQuery('');
    setSelectedPhotoIndex(null);
  };

  // Filtered and sorted photos
  const filteredPhotos = useMemo(() => {
    let result = [...albumPhotos];

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
  }, [albumPhotos, searchQuery, sortOption]);

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
      {/* VIEW 1: ALBUM LIST (Nama-nama Album Foto tanpa icon) */}
      {!selectedAlbum && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Dokumentasi Acara & Album Foto
              </h2>
              <p className="text-xs text-gray-500">
                Pilih album foto untuk melihat dokumentasi kegiatan gereja SAA
              </p>
            </div>

            <button
              onClick={() => loadAlbums(true)}
              disabled={loadingAlbums || refreshing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#7b1113] hover:bg-[#931518] text-white shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Segarkan daftar album"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>

          {loadingAlbums && (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
              <Loader2 className="w-10 h-10 text-[#7b1113] animate-spin" />
              <p className="text-sm font-medium">Memuat daftar album foto dari Google Drive...</p>
            </div>
          )}

          {!loadingAlbums && albumError && (
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Gagal Mengambil Album Foto</h4>
                <p className="text-xs text-red-700 mt-1">{albumError}</p>
                <button
                  onClick={() => loadAlbums(true)}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

          {!loadingAlbums && !albumError && albums.length === 0 && (
            <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/80 p-8">
              <FolderOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">Belum Ada Album Foto</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Belum ditemukan subfolder album di folder "Foto SAA" Google Drive.
              </p>
            </div>
          )}

          {/* List of Album Names WITHOUT icon (as explicitly required) */}
          {!loadingAlbums && !albumError && albums.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200/80 divide-y divide-stone-100 overflow-hidden shadow-sm">
              {albums.map((album, idx) => (
                <div
                  key={album.id}
                  onClick={() => handleSelectAlbum(album)}
                  className="group flex items-center justify-between p-4 sm:p-5 hover:bg-amber-50/40 transition-colors cursor-pointer active:bg-amber-100/60"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <span className="flex-shrink-0 text-xs font-mono font-bold text-stone-400 group-hover:text-[#7b1113] w-6">
                      {(idx + 1).toString().padStart(2, '0')}.
                    </span>

                    <div className="min-w-0">
                      {/* Album Name without icon */}
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#7b1113] transition truncate">
                        {album.name}
                      </h3>
                      {album.createdTime && (
                        <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>Dibuat: {formatDate(album.createdTime)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 group-hover:bg-[#7b1113] text-amber-900 group-hover:text-white text-xs font-semibold border border-amber-200/60 group-hover:border-transparent transition">
                      Buka Album &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ALBUM PHOTOS (Large icons/thumbnails inside selected album) */}
      {selectedAlbum && (
        <div className="space-y-6">
          {/* Header navigation bar inside album */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBackToAlbums}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition active:scale-95 cursor-pointer"
                  title="Kembali ke Daftar Album"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>Dokumentasi Foto SAA</span>
                    <span>&rsaquo;</span>
                    <span className="font-semibold text-[#7b1113]">Album Terpilih</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">
                    {selectedAlbum.name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => loadPhotosForAlbum(selectedAlbum, true)}
                  disabled={loadingPhotos || refreshing}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#7b1113] hover:bg-[#931518] text-white shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Muat ulang foto dari album ini"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Segarkan</span>
                </button>
              </div>
            </div>

            {/* Search & Sort inside album */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Cari foto dalam "${selectedAlbum.name}"...`}
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
                    <option value="name_asc">Nama (A - Z)</option>
                    <option value="name_desc">Nama (Z - A)</option>
                    <option value="date_desc">Waktu: Terkini</option>
                    <option value="date_asc">Waktu: Terlama</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Photos */}
          {loadingPhotos && (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
              <Loader2 className="w-10 h-10 text-[#7b1113] animate-spin" />
              <p className="text-sm font-medium">Memuat gambar dalam album "{selectedAlbum.name}"...</p>
            </div>
          )}

          {/* Photo Error */}
          {!loadingPhotos && photoError && (
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Gagal Mengambil Foto</h4>
                <p className="text-xs text-red-700 mt-1">{photoError}</p>
                <button
                  onClick={() => loadPhotosForAlbum(selectedAlbum, true)}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

          {/* Empty photos */}
          {!loadingPhotos && !photoError && filteredPhotos.length === 0 && (
            <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/80 p-8">
              <Images className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">Tidak ada gambar ditemukan</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `Tidak ada foto yang cocok dengan "${searchQuery}".`
                  : 'Belum ada gambar berformat jpg atau png di subfolder album ini.'}
              </p>
            </div>
          )}

          {/* Grid of Large Icons / Thumbnails */}
          {!loadingPhotos && !photoError && filteredPhotos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredPhotos.map((file, idx) => {
                const thumbUrl = getThumbnailUrl(file, DRIVE_CONFIG.SHARED_API_KEY);
                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-amber-400 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  >
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={thumbUrl}
                        alt={file.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />

                      <div className="absolute inset-0 bg-[#7b1113]/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="p-3 rounded-full bg-white/90 text-[#7b1113] shadow-lg transform translate-y-2 group-hover:translate-y-0 transition duration-200">
                          <Eye className="w-6 h-6" />
                        </div>
                      </div>

                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-black/60 text-white backdrop-blur-md uppercase">
                        {file.name.split('.').pop() || 'IMG'}
                      </span>
                    </div>

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

          {/* Interactive Fullscreen Image Viewer Modal */}
          {selectedPhotoIndex !== null && (
            <ImageViewerModal
              files={filteredPhotos}
              currentIndex={selectedPhotoIndex}
              apiKey={DRIVE_CONFIG.SHARED_API_KEY}
              onClose={() => setSelectedPhotoIndex(null)}
              onNavigate={(newIdx) => setSelectedPhotoIndex(newIdx)}
            />
          )}
        </div>
      )}
    </div>
  );
};
