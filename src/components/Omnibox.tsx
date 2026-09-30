import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  Search,
  Zap,
  SlidersHorizontal,
  Server,
  Sparkles,
} from 'lucide-react';
import type { BrowserTab, FastGateway } from '../types.ts';
import { FAST_ONION_GATEWAYS } from '../constants/gateways.ts';
import { translations, type Language } from '../i18n.ts';

interface OmniboxProps {
  activeTab: BrowserTab;
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onGoHome: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  currentGateway: string;
  onChangeGateway: (gatewayId: string) => void;
  onOpenShields: () => void;
  language: Language;
}

export const Omnibox: React.FC<OmniboxProps> = ({
  activeTab,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onGoHome,
  canGoBack,
  canGoForward,
  currentGateway,
  onChangeGateway,
  onOpenShields,
  language,
}) => {
  const t = translations[language];
  const [inputValue, setInputValue] = useState(activeTab.displayUrl || '');
  const [showGatewayDropdown, setShowGatewayDropdown] = useState(false);

  useEffect(() => {
    setInputValue(activeTab.displayUrl || '');
  }, [activeTab.displayUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onNavigate(inputValue.trim());
    }
  };

  const isOnion = inputValue.toLowerCase().includes('.onion') || activeTab.isOnion;
  const activeGatewayObj = FAST_ONION_GATEWAYS.find((g) => g.id === currentGateway) || FAST_ONION_GATEWAYS[0];

  return (
    <div className="h-13 bg-slate-900/90 border-b border-slate-800/80 px-3 flex items-center gap-2 text-slate-300">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onGoBack}
          disabled={!canGoBack}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title={t.back}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onGoForward}
          disabled={!canGoForward}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title={t.forward}
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onReload}
          className={`p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ${
            activeTab.isLoading ? 'animate-spin text-sky-400' : ''
          }`}
          title={t.reload}
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={onGoHome}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={t.home}
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Main Omnibox Address Field */}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center min-w-0">
        <div
          className={`flex items-center gap-2 w-full h-9 px-3 rounded-lg bg-slate-950 border transition-all ${
            isOnion
              ? 'border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.15)] focus-within:border-purple-400'
              : 'border-slate-800 focus-within:border-sky-500 focus-within:shadow-[0_0_10px_rgba(14,165,233,0.15)]'
          }`}
        >
          {/* Security & Protocol Lock Icon */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isOnion ? (
              <span
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-purple-950/80 border border-purple-500/40 text-purple-300"
                title={t.onionNoLagDesc}
              >
                <span className="text-sm leading-none">🧅</span>
                <span className="hidden sm:inline">TOR ONION</span>
              </span>
            ) : (
              <span
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-sky-950/80 border border-sky-500/40 text-sky-300"
                title={t.dohStrictDesc}
              >
                <Lock className="w-3 h-3 text-sky-400" />
                <span className="hidden sm:inline">1.1.1.1 DoH</span>
              </span>
            )}
          </div>

          {/* URL Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t.searchOrUrl}
            className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none font-mono selection:bg-sky-500/30"
          />

          {/* Gateway Switcher for Onion */}
          {isOnion && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowGatewayDropdown(!showGatewayDropdown)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-[10px] font-sans"
                title={t.activeGateway}
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{activeGatewayObj.name.split(' ')[0]}</span>
              </button>

              {showGatewayDropdown && (
                <div className="absolute right-0 top-8 z-50 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1.5 text-xs">
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                    {t.activeGateway}
                  </div>
                  {FAST_ONION_GATEWAYS.map((gateway) => (
                    <button
                      key={gateway.id}
                      type="button"
                      onClick={() => {
                        onChangeGateway(gateway.id);
                        setShowGatewayDropdown(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                        currentGateway === gateway.id
                          ? 'bg-purple-950 text-purple-300 font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{gateway.name}</span>
                      {currentGateway === gateway.id && <Sparkles className="w-3 h-3 text-amber-400" />}
                    </button>
                  ))}
                  <div className="px-2 py-1 text-[10px] text-slate-500 border-t border-slate-800 mt-1">
                    {t.gatewayNote}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Go / Search button */}
          <button
            type="submit"
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-sky-300 rounded transition-colors shrink-0"
            title={t.searchBtn}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Speed & Shields Button */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onOpenShields}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-sky-300 text-xs transition-colors"
          title={t.shields}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline text-[11px] font-medium">{t.shields}</span>
        </button>
      </div>
    </div>
  );
};
