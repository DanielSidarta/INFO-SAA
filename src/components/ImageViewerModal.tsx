import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DriveFile } from '../types';
import { getMediaUrl, getDownloadUrl } from '../api';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Loader2 
} from 'lucide-react';

interface ImageViewerModalProps {
  files: DriveFile[];
  currentIndex: number;
  apiKey: string;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  files,
  currentIndex,
  apiKey,
  onClose,
  onNavigate,
}) => {
  const currentFile = files[currentIndex];
  
  // Transform states
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Touch pinch zoom refs
  const touchStartDist = useRef<number | null>(null);
  const touchStartScale = useRef<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset transform whenever current image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsLoading(true);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < files.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, files.length, onNavigate]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  // Keyboard navigation & escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev]);

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.35, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.35, 0.7);
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Double click / double tap toggle zoom
  const handleDoubleClick = () => {
    if (scale > 1.2) {
      handleResetZoom();
    } else {
      setScale(2.2);
    }
  };

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = -e.deltaY * 0.0025;
      setScale(prev => {
        const next = Math.min(Math.max(prev + zoomFactor, 0.7), 6);
        if (next <= 1) {
          setPosition({ x: 0, y: 0 });
        }
        return next;
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile Pan & Pinch Zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      touchStartScale.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchStartDist.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / touchStartDist.current;
      const newScale = Math.min(Math.max(touchStartScale.current * factor, 0.7), 6);
      setScale(newScale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      touchStartDist.current = null;
    } else if (e.touches.length === 1) {
      // Re-anchor single touch pan
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
      touchStartDist.current = null;
    }
  };

  if (!currentFile) return null;

  const imageUrl = getMediaUrl(currentFile.id, apiKey);
  const downloadUrl = getDownloadUrl(currentFile.id, apiKey, currentFile.name);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white select-none overflow-hidden animate-fadeIn">
      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#7b1113] text-amber-200 font-medium">
            {currentIndex + 1} / {files.length}
          </span>
          <h2 className="text-sm sm:text-base font-medium text-white truncate max-w-[200px] sm:max-w-md md:max-w-lg" title={currentFile.name}>
            {currentFile.name}
          </h2>
        </div>

        {/* Action Buttons: Zoom in/out, Reset, Download, Close */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
            title="Perkecil (Zoom Out)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <button
            onClick={handleResetZoom}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
            title="Reset Ukuran (Fit)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <a
            href={downloadUrl}
            download={currentFile.name}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#d4af37] text-slate-900 font-semibold text-xs sm:text-sm hover:bg-[#e6c45e] transition active:scale-95 cursor-pointer"
            title="Unduh Gambar"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Unduh</span>
          </a>

          <button
            onClick={onClose}
            className="p-2 ml-1 rounded-lg bg-white/10 hover:bg-red-600/80 text-white transition active:scale-95 cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-0 pointer-events-none">
            <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
            <span className="text-xs text-gray-400">Memuat gambar resolusi penuh...</span>
          </div>
        )}

        <img
          src={imageUrl}
          alt={currentFile.name}
          draggable={false}
          onLoad={() => setIsLoading(false)}
          className={`max-w-full max-h-full object-contain transition-transform duration-75 will-change-transform ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        />

        {/* Previous Button (Tombol ke kanan/kiri untuk navigasi) */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-[#7b1113] text-white backdrop-blur-md transition shadow-2xl active:scale-95 z-20 cursor-pointer"
            title="Gambar Sebelumnya (Panah Kiri)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Next Button */}
        {currentIndex < files.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-[#7b1113] text-white backdrop-blur-md transition shadow-2xl active:scale-95 z-20 cursor-pointer"
            title="Gambar Berikutnya (Panah Kanan)"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* Bottom Hint Bar */}
      <div className="py-2.5 px-4 text-center text-xs text-gray-400 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <span>Gunakan scroll mouse / cubit layar untuk Zoom &bull; Geser untuk Pan &bull; Klik ganda untuk Zoom cepat</span>
      </div>
    </div>
  );
};
