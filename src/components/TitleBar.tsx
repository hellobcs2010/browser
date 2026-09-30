import React from 'react';
import { Plus, X, Globe, Shield, Flame, Activity, Languages, Smartphone } from 'lucide-react';
import type { BrowserTab } from '../types.ts';
import { translations, type Language } from '../i18n.ts';

interface TitleBarProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onOpenDnsInspector: () => void;
  onTriggerNuke: () => void;
  onOpenApkModal: () => void;
  language: Language;
  onToggleLanguage: () => void;
  dnsLatencyMs: number;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onOpenDnsInspector,
  onTriggerNuke,
  onOpenApkModal,
  language,
  onToggleLanguage,
  dnsLatencyMs,
}) => {
  const t = translations[language];
  const isUrdu = language === 'ur';

  return (
    <div
      className={`h-11 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between px-3 select-none text-xs text-slate-300 ${
        isUrdu ? 'font-sans' : ''
      }`}
    >
      {/* Left: Window controls & Tabs */}
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto no-scrollbar">
        {/* Sleek Window Control Dots */}
        <div className="flex items-center gap-1.5 mr-2 shrink-0">
          <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer shadow-sm shadow-rose-900/40" title={t.resetBrowser} onClick={onTriggerNuke} />
          <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer shadow-sm shadow-amber-900/40" title="Minimize View" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer shadow-sm shadow-emerald-900/40" title="Optimize VPN Speed" />
        </div>

        {/* Tab Items */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg max-w-[200px] min-w-[120px] cursor-pointer transition-all duration-150 border ${
                  isActive
                    ? 'bg-slate-900 text-sky-300 border-slate-700/80 shadow-md shadow-black/40'
                    : 'bg-slate-950/60 text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-slate-200'
                }`}
              >
                {tab.isOnion ? (
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shrink-0" title="Tor .onion (Fast Gateway)" />
                ) : (
                  <Globe className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                )}
                
                <span className="truncate text-xs font-medium flex-1">
                  {tab.title}
                </span>

                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:bg-slate-800 p-0.5 rounded text-slate-400 hover:text-rose-400 transition-opacity"
                    title={t.closeTab}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={onNewTab}
            className="p-1.5 hover:bg-slate-800/80 rounded-md text-slate-400 hover:text-sky-300 transition-colors shrink-0"
            title={t.newTab}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Controls: Android APK + Cloudflare 1.1.1.1 DoH Status + Emergency Panic Nuke + Language Switcher */}
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {/* Android .APK Downloader Button */}
        <button
          onClick={onOpenApkModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 transition-all shadow-sm"
          title="Download Android .APK / WebAPK App"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-[11px]">.APK App</span>
        </button>

        {/* Cloudflare 1.1.1.1 DoH Badge */}
        <button
          onClick={onOpenDnsInspector}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 text-amber-300 transition-all shadow-sm"
          title={t.dohStrictDesc}
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[11px] font-semibold tracking-wide">1.1.1.1 DoH</span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-200 text-[10px] font-mono">
            <Activity className="w-2.5 h-2.5 text-emerald-400" />
            {dnsLatencyMs > 0 ? `${dnsLatencyMs}ms` : 'Active'}
          </span>
        </button>

        {/* Emergency Panic Nuke Button (Auto / Instant Data Delete) */}
        <button
          onClick={onTriggerNuke}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 hover:text-rose-200 transition-all font-medium shadow-sm hover:shadow-rose-950/50"
          title={t.panicNukeConfirm}
        >
          <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="text-[11px]">{t.panicNuke}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-sky-300 transition-colors"
          title="Switch Language / زبان تبدیل کریں"
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">{language === 'ur' ? 'English' : 'اردو'}</span>
        </button>
      </div>
    </div>
  );
};
