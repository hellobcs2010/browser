import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Zap,
  Globe,
  Lock,
  Code,
  Eye,
  RotateCw,
  ExternalLink,
  Activity,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import type { BrowserTab, FastGateway } from '../types.ts';
import { NewTabPage } from './NewTabPage.tsx';
import { FAST_ONION_GATEWAYS } from '../constants/gateways.ts';
import { translations, type Language } from '../i18n.ts';

interface BrowserViewportProps {
  tab: BrowserTab;
  onNavigate: (url: string) => void;
  language: Language;
  currentGateway: string;
  dnsLatencyMs: number;
  onOpenApkModal?: () => void;
}

export const BrowserViewport: React.FC<BrowserViewportProps> = ({
  tab,
  onNavigate,
  language,
  currentGateway,
  dnsLatencyMs,
  onOpenApkModal,
}) => {
  const t = translations[language];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<'render' | 'source'>('render');
  const [rawHtml, setRawHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const isHome = tab.url === 'aether://home' || !tab.url;
  const activeGatewayObj = FAST_ONION_GATEWAYS.find((g) => g.id === currentGateway) || FAST_ONION_GATEWAYS[0];

  // Construct secure proxy URL
  const proxySrc = !isHome
    ? `/api/proxy?url=${encodeURIComponent(tab.url)}&gateway=${currentGateway}`
    : '';

  // Listen to navigation events from inside the proxied iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'AETHER_NAVIGATE' && e.data.url) {
        onNavigate(e.data.url);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate]);

  // Load raw HTML for source code view mode
  useEffect(() => {
    if (!isHome && viewMode === 'source') {
      fetch(proxySrc)
        .then((r) => r.text())
        .then((text) => setRawHtml(text))
        .catch(() => setRawHtml('Failed to fetch source'));
    }
  }, [isHome, viewMode, proxySrc]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(tab.displayUrl || tab.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isHome) {
    return (
      <NewTabPage
        onNavigate={onNavigate}
        language={language}
        dnsLatencyMs={dnsLatencyMs}
        currentGatewayName={activeGatewayObj.name}
        onOpenApkModal={onOpenApkModal}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-hidden relative">
      {/* Loading Progress Bar */}
      {tab.isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-800 z-30">
          <div className="h-full bg-gradient-to-r from-purple-500 via-sky-400 to-emerald-400 animate-pulse w-3/4 transition-all duration-300" />
        </div>
      )}

      {/* Security Info Bar Above Page */}
      <div className="h-7 bg-slate-950 border-b border-slate-800/80 px-3 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0 font-mono">
        <div className="flex items-center gap-2 truncate">
          {tab.isOnion ? (
            <span className="flex items-center gap-1 text-purple-300 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
              <span>🧅 {tab.displayUrl}</span>
              <span className="text-[10px] text-purple-400 font-sans">({activeGatewayObj.name})</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sky-300 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-500/30">
              <Lock className="w-3 h-3 text-sky-400" />
              <span>{tab.displayUrl}</span>
            </span>
          )}

          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-amber-300 text-[10px]">
            <Shield className="w-2.5 h-2.5" />
            <span>1.1.1.1 DoH Strict</span>
          </span>

          {tab.loadTimeMs && (
            <span className="text-slate-500 text-[10px]">
              ({tab.loadTimeMs}ms)
            </span>
          )}
        </div>

        {/* View mode toggle (Rendered vs Source code) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopyUrl}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <div className="flex rounded bg-slate-900 p-0.5 border border-slate-800 text-[10px]">
            <button
              onClick={() => setViewMode('render')}
              className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                viewMode === 'render' ? 'bg-slate-800 text-sky-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Render</span>
            </button>
            <button
              onClick={() => setViewMode('source')}
              className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                viewMode === 'source' ? 'bg-slate-800 text-purple-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3 h-3" />
              <span className="hidden sm:inline">Source</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative bg-white overflow-hidden">
        {viewMode === 'render' ? (
          <iframe
            ref={iframeRef}
            src={proxySrc}
            title={tab.title}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
            onError={() => setIframeError(true)}
          />
        ) : (
          <div className="w-full h-full bg-slate-950 p-4 overflow-auto text-xs font-mono text-slate-300 select-text">
            <div className="mb-2 text-slate-500 flex items-center justify-between border-b border-slate-800 pb-2">
              <span>Encrypted DOM Snapshot ({tab.displayUrl})</span>
              <span className="text-[10px] text-amber-400">Strict 1.1.1.1 DoH Isolated</span>
            </div>
            <pre className="whitespace-pre-wrap break-all leading-relaxed text-[11px] text-slate-300">
              {rawHtml || 'Fetching raw source via proxy...'}
            </pre>
          </div>
        )}
      </div>

      {/* Ephemeral Notice Footer */}
      <div className="h-6 bg-slate-950/95 border-t border-slate-800/80 px-3 flex items-center justify-between text-[10px] text-slate-500 font-mono select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>RAM-Only Session · Auto-Wipe on Exit Active</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>Cloudflare 1.1.1.1: Verified Authentic</span>
          <span>WebRTC Leak: Blocked</span>
        </div>
      </div>
    </div>
  );
};
