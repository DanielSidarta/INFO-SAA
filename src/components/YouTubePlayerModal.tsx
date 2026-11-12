import React, { useEffect } from 'react';
import { YouTubeLiveItem } from '../types';
import { X, ExternalLink, Radio, Square } from 'lucide-react';

interface YouTubePlayerModalProps {
  item: YouTubeLiveItem;
  onClose: () => void;
}

export const YouTubePlayerModal: React.FC<YouTubePlayerModalProps> = ({
  item,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Embed URL with required parameters
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedSrc = `https://www.youtube.com/embed/${item.id}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(
    origin
  )}&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-white select-none overflow-hidden animate-fadeIn">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-red-600 text-white uppercase tracking-wider animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            Live / Siaran
          </span>
          <h2 className="text-sm sm:text-base font-semibold truncate text-white" title={item.title}>
            {item.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium transition cursor-pointer"
            title="Buka di YouTube"
          >
            <ExternalLink className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Buka di YouTube</span>
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-red-600/80 text-white transition cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Responsive Centered Embed Area (Aspect ratio preserved) */}
      <div className="relative w-full max-w-5xl h-full max-h-[80vh] flex items-center justify-center p-3 sm:p-6">
        <div className="w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <iframe
            src={embedSrc}
            title={item.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      {/* Bottom control bar */}
      <div className="flex items-center justify-between w-full max-w-5xl px-6 pb-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="text-amber-300 font-medium">{item.author}</span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-200 transition cursor-pointer"
        >
          <Square className="w-3.5 h-3.5 text-red-400" />
          <span>Stop & Tutup Video</span>
        </button>
      </div>
    </div>
  );
};
