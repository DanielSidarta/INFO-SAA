import React, { useRef, useState, useEffect } from 'react';
import { DriveFile } from '../types';
import { getMediaUrl, getDownloadUrl } from '../api';
import { 
  X, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Download,
  Loader2 
} from 'lucide-react';

interface VideoPlayerModalProps {
  file: DriveFile;
  apiKey: string;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  file,
  apiKey,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  const videoUrl = getMediaUrl(file.id, apiKey);
  const downloadUrl = getDownloadUrl(file.id, apiKey, file.name);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipTime(10);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipTime(-10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration || 1000);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-white select-none overflow-hidden animate-fadeIn"
    >
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#7b1113] text-amber-200 uppercase tracking-wider">
            Video MP4
          </span>
          <h2 className="text-sm sm:text-base font-semibold truncate text-white" title={file.name}>
            {file.name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={downloadUrl}
            download={file.name}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37] text-slate-900 font-semibold text-xs sm:text-sm hover:bg-[#e6c45e] transition cursor-pointer"
            title="Unduh Video"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Unduh</span>
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

      {/* Video Content Centered (Responsive aspect ratio for portrait or landscape) */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-2 sm:p-6">
        {isBuffering && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
            <span className="text-xs text-amber-200 mt-2">Memuat streaming video...</span>
          </div>
        )}

        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          playsInline
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              setIsBuffering(false);
            }
          }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
      </div>

      {/* Custom Video Controls Bar */}
      <div className="w-full max-w-4xl px-4 pb-6 pt-2 z-20">
        <div className="bg-neutral-900/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 shadow-2xl">
          {/* Progress / Seek bar (dimaju mundurkan ke waktu tertentu) */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono text-gray-300 w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
            />
            <span className="text-xs font-mono text-gray-400 w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="p-2 sm:p-2.5 rounded-full bg-[#7b1113] hover:bg-[#931518] text-white shadow transition cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              {/* Stop Button */}
              <button
                onClick={stopVideo}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Stop (Kembali ke Awal)"
              >
                <Square className="w-4 h-4" />
              </button>

              {/* Rewind 10s */}
              <button
                onClick={() => skipTime(-10)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Mundur 10 detik"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Forward 10s */}
              <button
                onClick={() => skipTime(10)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Maju 10 detik"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume / Mute */}
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-gray-300 hover:text-white transition cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Layar Penuh"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
