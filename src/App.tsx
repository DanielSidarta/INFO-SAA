import { useState } from 'react';
import { ActiveTab } from './types';
import { Navbar } from './components/Navbar';
import { ChurchProfileTab } from './components/ChurchProfileTab';
import { PengumumanTab } from './components/PengumumanTab';
import { LiveStreamingTab } from './components/LiveStreamingTab';
import { VideoHomiliTab } from './components/VideoHomiliTab';
import { DokumentasiTab } from './components/DokumentasiTab';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Church, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleGlobalRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-slate-800 font-sans selection:bg-[#7b1113] selection:text-white">
      {/* Top Navbar & Header with Top Tabs */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onGlobalRefresh={handleGlobalRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'profile' && <ChurchProfileTab />}
        {activeTab === 'pengumuman' && <PengumumanTab onRefreshTrigger={refreshTrigger} />}
        {activeTab === 'livestream' && <LiveStreamingTab onRefreshTrigger={refreshTrigger} />}
        {activeTab === 'homili' && <VideoHomiliTab onRefreshTrigger={refreshTrigger} />}
        {activeTab === 'dokumentasi' && <DokumentasiTab onRefreshTrigger={refreshTrigger} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-white/80 backdrop-blur-sm text-stone-600 text-xs py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Church className="w-4 h-4 text-[#7b1113]" />
            <span className="font-semibold text-gray-900">
              Gereja Katolik St. Albertus Agung - Keuskupan Agung Makassar
            </span>
          </div>

          <div className="flex items-center gap-1 text-stone-500">
            <span>Aplikasi Resmi INFO SAA</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-amber-700">
              <Heart className="w-3.5 h-3.5 fill-current text-red-600 inline" />
              Untuk Umat & Komunitas SAA
            </span>
          </div>
        </div>
      </footer>

      {/* Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}
