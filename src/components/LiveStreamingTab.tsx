import React, { useState, useEffect } from 'react';
import { YouTubeLiveItem } from '../types';
import { fetchLiveStreams } from '../api';
import { YouTubePlayerModal } from './YouTubePlayerModal';
import { 
  Radio, 
  Play, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  Youtube,
  Tv
} from 'lucide-react';

interface LiveStreamingTabProps {
  onRefreshTrigger?: number;
}

export const LiveStreamingTab: React.FC<LiveStreamingTabProps> = ({ onRefreshTrigger }) => {
  const [items, setItems] = useState<YouTubeLiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeLiveItem | null>(null);

  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await fetchLiveStreams(isManualRefresh);
      setItems(data);
    } catch (err: any) {
      console.error('Error loading live streams:', err);
      setError(err.message || 'Gagal memuat daftar siaran langsung dari YouTube.');
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

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Info & Refresh */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Live Streaming & Siaran Misa
            </h2>
            <p className="text-xs text-gray-500">
              Diambil otomatis dari channel resmi Paroki St. Albertus Agung
            </p>
          </div>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#7b1113] hover:bg-[#931518] text-white shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer self-end sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Segarkan Siaran</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
          <p className="text-sm font-medium">Memuat data live streaming & judul dari YouTube...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Gagal Mengambil Live Stream</h4>
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
      {!loading && !error && items.length === 0 && (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/80 p-8">
          <Tv className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Belum Ada Tautan Live Streaming</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Berkas embedding.txt di Google Drive belum memiliki daftar tautan video YouTube.
          </p>
        </div>
      )}

      {/* Large Icons / Cards of YouTube Videos */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedVideo(item)}
              className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-red-400 hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-[0.98]"
            >
              {/* Large YouTube Thumbnail Card */}
              <div className="relative aspect-video bg-neutral-900 overflow-hidden flex items-center justify-center">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Red Play Badge Centered */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-red-600/90 group-hover:bg-red-600 text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition duration-200">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>

                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>YOUTUBE</span>
                </div>
              </div>

              {/* Title & Channel Info */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3
                    className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-red-700 transition leading-snug"
                    title={item.title}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-red-600" />
                    <span>{item.author}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-mono text-[11px]">ID: {item.id}</span>
                  <span className="text-red-600 font-semibold group-hover:underline">
                    Putar Sekarang &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* YouTube Player Modal */}
      {selectedVideo && (
        <YouTubePlayerModal
          item={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};
