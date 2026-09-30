import React, { useState } from 'react';
import {
  Search,
  Globe,
  Zap,
  ShieldCheck,
  Flame,
  ExternalLink,
  Lock,
  ArrowRight,
  Sparkles,
  Server,
  Activity,
  Layers,
  Smartphone,
  Download,
} from 'lucide-react';
import { ONION_DIRECTORY, CLEARNET_TOOLS } from '../data/onionDirectory.ts';
import { translations, type Language } from '../i18n.ts';

interface NewTabPageProps {
  onNavigate: (url: string) => void;
  language: Language;
  dnsLatencyMs: number;
  currentGatewayName: string;
  onOpenApkModal?: () => void;
}

export const NewTabPage: React.FC<NewTabPageProps> = ({
  onNavigate,
  language,
  dnsLatencyMs,
  currentGatewayName,
  onOpenApkModal,
}) => {
  const t = translations[language];
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate(searchInput.trim());
    }
  };

  const filteredOnionSites = selectedCategory === 'all'
    ? ONION_DIRECTORY
    : ONION_DIRECTORY.filter((s) => s.category === selectedCategory);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-6 md:p-10 select-text">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-medium mb-1">
            <span className="text-sm">🧅</span>
            <span>{t.onionNoLag}</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-400 font-mono">1.1.1.1 DoH</span>
            <span className="text-slate-500">·</span>
            <span className="text-rose-400">{t.autoWipeActive}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>{t.appTitle}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            {t.appSubtitle}
          </p>

          {/* Quick Search / Omnibox Form on Homepage */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-3">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t.searchOrUrl}
                className="w-full px-4 py-3 pl-11 pr-24 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-xl font-mono"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4" />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md"
              >
                <span>{t.searchBtn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Android .APK Download Banner */}
          {onOpenApkModal && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={onOpenApkModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 transition-all text-xs font-semibold shadow-lg shadow-emerald-950/30"
              >
                <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>
                  {language === 'ur'
                    ? 'اینڈرائڈ فون میں .APK انسٹال کریں (Download / Install .APK)'
                    : 'Download & Install Android .APK / WebAPK App'}
                </span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 3 Core Architectures (Matching user's exact Urdu brief) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Fast Tor .onion */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/20 hover:border-purple-500/40 transition-all space-y-2">
            <div className="flex items-center gap-2.5 text-purple-400">
              <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-500/30">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-bold text-xs text-purple-200">
                {language === 'ur' ? 'ٹور اونین بغیر سست نیٹ ورکنگ' : 'Tor .onion at VPN Speeds'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'ur'
                ? 'ٹور کے سست ملٹی ہاپ ریلے کی بجائے تیز رفتار گیٹ وے کا استعمال تاکہ عام وی پی این پر بھی فل سپیڈ انٹرنیٹ ملے۔'
                : 'Bypasses multi-hop Tor latency bottlenecks via high-throughput secure gateways. Seamless over any standard VPN.'}
            </p>
            <div className="text-[10px] text-purple-300 font-mono pt-1 flex items-center gap-1">
              <span>Gateway:</span>
              <span className="font-semibold text-white">{currentGatewayName}</span>
            </div>
          </div>

          {/* Card 2: Strict Cloudflare 1.1.1.1 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-amber-500/20 hover:border-amber-500/40 transition-all space-y-2">
            <div className="flex items-center gap-2.5 text-amber-400">
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/30">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-bold text-xs text-amber-200">
                {language === 'ur' ? 'صرف کلاؤڈ فلیر 1.1.1.1 ڈی این ایس' : 'Strict 1.1.1.1 Cloudflare DoH'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'ur'
                ? 'کوئی دوسرا ڈی این ایس نہیں چلتا۔ تمام استفسارات Cloudflare DoH انکرپٹڈ پروٹوکول سے حل ہوتے ہیں۔'
                : 'Zero third-party or ISP DNS leaks. Strictly enforced Cloudflare Anycast DNS over HTTPS with DNSSEC.'}
            </p>
            <div className="text-[10px] text-amber-300 font-mono pt-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Ping: {dnsLatencyMs > 0 ? `${dnsLatencyMs}ms` : 'Instant'} · Authenticated Data</span>
            </div>
          </div>

          {/* Card 3: Auto-Wipe on Close */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-rose-500/20 hover:border-rose-500/40 transition-all space-y-2">
            <div className="flex items-center gap-2.5 text-rose-400">
              <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/30">
                <Flame className="w-4 h-4 text-rose-400" />
              </div>
              <h3 className="font-bold text-xs text-rose-200">
                {language === 'ur' ? 'براؤزر بند ہوتے ہی ڈیٹا ڈیلیٹ' : 'Zero-Trace Auto-Wipe'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'ur'
                ? 'براؤزر ریمو یا کلوز ہونے پر تمام میموری، ہسٹری، کیشے اور کوکیز مستقل مٹا دی جاتی ہیں۔ کوئی ریکارڈ محفوظ نہیں۔'
                : 'Volatile RAM operation. Hard-erases cookies, tab history, and tokens upon window close or panic trigger.'}
            </p>
            <div className="text-[10px] text-rose-300 font-mono pt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t.autoWipeActive}</span>
            </div>
          </div>
        </div>

        {/* Curated Onion Links Section */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="text-base">🧅</span>
                <span>{t.onionDirectory}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {t.onionDirectoryDesc}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: t.allCategories },
                { id: 'search', label: t.searchCategory },
                { id: 'media', label: t.mediaCategory },
                { id: 'directory', label: t.directoryCategory },
                { id: 'utility', label: t.utilityCategory },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-purple-900/60 text-purple-200 border border-purple-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Onion Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredOnionSites.map((site) => (
              <div
                key={site.id}
                onClick={() => onNavigate(site.onionUrl)}
                className="group p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-purple-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-2 shadow-sm hover:shadow-purple-950/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-xs text-slate-100 group-hover:text-purple-300 transition-colors">
                      {language === 'ur' ? site.titleUrdu : site.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-950/80 border border-purple-500/30 text-purple-300">
                      {language === 'ur' ? site.badgeUrdu : site.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {language === 'ur' ? site.descriptionUrdu : site.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                  <span className="truncate max-w-[220px]">
                    {site.onionUrl}
                  </span>
                  <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>{language === 'ur' ? 'کھولیں' : 'Launch'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clearnet Privacy & Diagnostics Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-slate-100">
              {t.popularClearnet}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CLEARNET_TOOLS.map((tool, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate(tool.url)}
                className="p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span>{language === 'ur' ? tool.titleUrdu : tool.title}</span>
                  <ExternalLink className="w-3 h-3 text-sky-400" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'ur' ? tool.descriptionUrdu : tool.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
