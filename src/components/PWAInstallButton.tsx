import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { DownloadCloud, Smartphone, X, Share } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full bg-[#f4d17c] text-[#5a0c0e] hover:bg-[#ffe39c] shadow-sm transition active:scale-95 cursor-pointer"
          title="Install Aplikasi INFO SAA di HP / Komputer"
        >
          <DownloadCloud className="w-4 h-4 text-[#7b1113]" />
          <span>Install App</span>
        </button>
      )}

      {!isInstallable && isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full bg-[#f4d17c] text-[#5a0c0e] hover:bg-[#ffe39c] shadow-sm transition active:scale-95 cursor-pointer"
          title="Petunjuk Install di iPhone / iPad"
        >
          <Smartphone className="w-4 h-4 text-[#7b1113]" />
          <span>Install di iOS</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-amber-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#7b1113]" />
                <h3 className="text-base font-bold text-gray-900">Install di iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-gray-700 leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#7b1113] text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <p>
                  Buka browser <strong>Safari</strong>, lalu tekan tombol <strong>Share</strong> (ikon kotak berpanah <Share className="w-4 h-4 inline text-blue-600 align-text-bottom" />) di bilah bawah.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#7b1113] text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <p>
                  Gulir ke bawah dan pilih <strong>"Add to Home Screen"</strong> (Tambahkan ke Layar Utama).
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#7b1113] text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <p>
                  Tekan <strong>"Add"</strong> di pojok kanan atas. Ikon <strong>INFO SAA</strong> akan langsung tersedia di layar utama perangkat Anda.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-[#7b1113] py-2.5 text-sm font-semibold text-white hover:bg-[#931518] shadow transition cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
