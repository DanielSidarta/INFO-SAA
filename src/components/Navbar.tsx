import React from 'react';
import { ActiveTab } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Church, 
  Bell, 
  Radio, 
  Video, 
  Image as ImageIcon, 
  RefreshCw 
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onGlobalRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onGlobalRefresh,
  isRefreshing,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'profile',
      label: 'Gereja Katolik St. Albertus Agung',
      icon: Church,
    },
    {
      id: 'pengumuman',
      label: 'Pengumuman Gereja',
      icon: Bell,
    },
    {
      id: 'livestream',
      label: 'Live Streaming Gereja SAA',
      icon: Radio,
    },
    {
      id: 'homili',
      label: 'Video Homili & Lainnya',
      icon: Video,
    },
    {
      id: 'dokumentasi',
      label: 'Dokumentasi Acara Gereja',
      icon: ImageIcon,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#7b1113] text-white shadow-md border-b border-amber-500/30">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Church Branding */}
          <div 
            onClick={() => onTabChange('profile')}
            className="flex items-center gap-3 cursor-pointer group select-none min-w-0"
          >
            <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-200 shadow-md flex-shrink-0 group-hover:scale-105 transition duration-200">
              <img
                src="/assets/aistudio/favicon_SAA_df75b2a3.png"
                alt="Logo SAA"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-contain bg-white"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-wider text-amber-300 font-serif">
                  INFO SAA
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-black/25 text-amber-200 border border-amber-400/30">
                  PWA
                </span>
              </div>
              <p className="text-xs text-amber-100/90 truncate font-medium max-w-[220px] sm:max-w-md">
                Paroki St. Albertus Agung - Makassar
              </p>
            </div>
          </div>

          {/* Right Header Controls: Global Refresh & PWA Install */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Global Refresh Button */}
            <button
              onClick={onGlobalRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/15 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Muat Ulang Semua Data Google Drive"
            >
              <RefreshCw className={`w-4 h-4 text-amber-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Segarkan Data</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />
          </div>
        </div>
      </div>

      {/* TOP TABS NAVIGATION (TAB ada dibagian atas aplikasi) */}
      <div className="bg-[#600c0e] border-t border-[#8c1315]/80 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-1.5 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`group relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
                    isActive
                      ? 'bg-[#7b1113] text-amber-300 shadow-sm border border-amber-400/40'
                      : 'text-amber-100/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-amber-200/60 group-hover:text-amber-300'
                    }`}
                  />
                  <span>{tab.label}</span>

                  {/* Active Tab Accent Underline indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
