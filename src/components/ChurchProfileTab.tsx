import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Youtube, 
  Facebook, 
  Instagram, 
  Copy, 
  Check, 
  ExternalLink,
  Church,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';

export const ChurchProfileTab: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const address = `Jl. Danau Tanjung Bunga Selatan No. 127
Villa Danau Biru
Makassar 90225`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    {
      title: 'WhatsApp Gereja',
      description: '+62 851-8315-1102 (Sekretariat Paroki)',
      url: 'https://wa.me/6285183151102',
      icon: Phone,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'Chat Langsung',
    },
    {
      title: 'Website Resmi',
      description: 'gerejasaa.com',
      url: 'https://gerejasaa.com',
      icon: Globe,
      color: 'bg-[#7b1113] hover:bg-[#931518] text-white',
      badge: 'Portal Berita',
    },
    {
      title: 'YouTube Paroki',
      description: '@ParokiStAlbertusAgungMakassar',
      url: 'https://www.youtube.com/@ParokiStAlbertusAgungMakassar',
      icon: Youtube,
      color: 'bg-red-600 hover:bg-red-700 text-white',
      badge: 'Live & Homili',
    },
    {
      title: 'Instagram Resmi',
      description: '@parokisantoalbertusagung',
      url: 'https://www.instagram.com/parokisantoalbertusagung',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:opacity-95 text-white',
      badge: 'Foto & Cerita',
    },
    {
      title: 'Facebook Fanpage',
      description: 'gerejasaa',
      url: 'https://www.facebook.com/gerejasaa',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      badge: 'Komunitas',
    },
    {
      title: 'TikTok Resmi',
      description: '@parokisantoalbertusagung',
      url: 'https://www.tiktok.com/@parokisantoalbertusagung',
      icon: Sparkles,
      color: 'bg-neutral-900 hover:bg-black text-white',
      badge: 'Video Singkat',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Hero Header with Large SAA Logo & Gold Rings */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7b1113] via-[#8c1315] to-[#4c0709] text-white p-6 sm:p-10 shadow-xl border border-amber-500/20 text-center">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo SAA ukuran cukup besar */}
          <div className="relative mb-5 p-2 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-2xl">
            <div className="rounded-full p-1 bg-white/95">
              <img
                src="/assets/aistudio/favicon_SAA_df75b2a3.png"
                alt="Logo Gereja Katolik St. Albertus Agung"
                className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 object-contain rounded-full shadow-inner transform hover:scale-105 transition duration-300"
              />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs sm:text-sm font-semibold tracking-wide border border-amber-300/30 mb-2">
            <Church className="w-4 h-4 text-amber-300" />
            Paroki St. Albertus Agung
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-serif">
            Gereja Katolik St. Albertus Agung
          </h1>

          <p className="text-base sm:text-lg text-amber-100/90 font-medium max-w-xl">
            “Gereja Katolik di Keuskupan Agung Makassar”
          </p>
        </div>
      </div>

      {/* Address & Quick Maps Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#7b1113] flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Alamat Gereja</h2>
              <p className="text-xs text-gray-500">Lokasi resmi Gereja Katolik St. Albertus Agung</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyAddress}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-medium transition active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Alamat</span>
                </>
              )}
            </button>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Gereja+Katolik+St.+Albertus+Agung+Makassar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7b1113] hover:bg-[#931518] text-white text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Petunjuk Arah</span>
            </a>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-[#FBF9F5] border border-amber-900/10 text-stone-800 font-medium leading-relaxed">
          <p className="text-base sm:text-lg font-semibold text-[#7b1113]">Jl. Danau Tanjung Bunga Selatan No. 127</p>
          <p className="text-stone-700">Villa Danau Biru</p>
          <p className="text-stone-600">Makassar 90225, Sulawesi Selatan</p>
        </div>
      </div>

      {/* Official Links & Channels Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Tautan & Media Sosial Resmi</h2>
          <span className="text-xs text-gray-500">Klik untuk langsung terhubung</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white border border-stone-200/80 hover:border-amber-400 hover:shadow-md transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl ${link.color} flex items-center justify-center flex-shrink-0 shadow-sm transition transform group-hover:scale-105`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-gray-900 group-hover:text-[#7b1113] transition">
                      {link.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                      {link.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {link.description}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition flex-shrink-0" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Liturgical Schedule Highlight */}
      <div className="rounded-3xl bg-amber-50/60 border border-amber-200/80 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Jadwal Perayaan Ekaristi (Misa)</h3>
            <p className="text-xs text-stone-600">Gereja Katolik St. Albertus Agung - Makassar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-3.5 rounded-xl bg-white border border-amber-100 flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Misa Hari Minggu</p>
              <p className="text-xs text-gray-600">Pagi: 08:00 WITA &bull; Sore: 18:00 WITA</p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-amber-100 flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Misa Harian</p>
              <p className="text-xs text-gray-600">Senin - Sabtu: 18:30 WITA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
