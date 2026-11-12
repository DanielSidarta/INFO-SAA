import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-4 z-50 flex items-center justify-center sm:justify-start gap-2.5 rounded-xl bg-amber-900/90 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm font-medium text-amber-100 shadow-xl border border-amber-600/50 animate-bounce">
      <WifiOff className="w-4 h-4 text-amber-300 animate-pulse" />
      <span>Mode Offline — Data tersimpan dalam cache perangkat.</span>
    </div>
  );
};
