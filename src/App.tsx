import React, { useState, useEffect, useCallback } from 'react';
import type { BrowserTab, ShieldsConfig, DnsQueryResponse } from './types.ts';
import { TitleBar } from './components/TitleBar.tsx';
import { Omnibox } from './components/Omnibox.tsx';
import { BrowserViewport } from './components/BrowserViewport.tsx';
import { DnsInspectorModal } from './components/DnsInspectorModal.tsx';
import { ShieldsModal } from './components/ShieldsModal.tsx';
import { NukeWipeModal } from './components/NukeWipeModal.tsx';
import { AndroidApkModal } from './components/AndroidApkModal.tsx';
import { translations, type Language } from './i18n.ts';

const DEFAULT_HOME_URL = 'aether://home';

export default function App() {
  const [language, setLanguage] = useState<Language>('ur');
  const t = translations[language];

  // Default Shields Configuration
  const [shields, setShields] = useState<ShieldsConfig>({
    strictDoh1111: true,
    webRtcBlocked: true,
    antiFingerprinting: true,
    autoWipeOnExit: true,
    noTorRelayLag: true,
    blockTelemetry: true,
    spoofUserAgent: true,
  });

  const [currentGateway, setCurrentGateway] = useState<string>('onion-ws');
  const [dnsLatencyMs, setDnsLatencyMs] = useState<number>(14);

  // Tabs state
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: language === 'ur' ? 'نیا ٹیب' : 'New Tab',
      url: DEFAULT_HOME_URL,
      displayUrl: '',
      history: [DEFAULT_HOME_URL],
      historyIndex: 0,
      isLoading: false,
      isOnion: false,
      securityStatus: 'secure-doh',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Modals state
  const [showDnsInspector, setShowDnsInspector] = useState(false);
  const [showShieldsModal, setShowShieldsModal] = useState(false);
  const [showNukeModal, setShowNukeModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Check 1.1.1.1 DoH ping latency on mount
  useEffect(() => {
    const checkDns = async () => {
      try {
        const start = Date.now();
        const res = await fetch('/api/dns-query?name=cloudflare.com&type=A');
        const data = await res.json();
        if (data.latencyMs) {
          setDnsLatencyMs(data.latencyMs);
        } else {
          setDnsLatencyMs(Date.now() - start);
        }
      } catch (e) {
        console.warn('DNS probe fallback', e);
      }
    };
    checkDns();
    const interval = setInterval(checkDns, 30000);
    return () => clearInterval(interval);
  }, []);

  // Strict Auto-Wipe on window close / unload / remove
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (shields.autoWipeOnExit) {
        // Fire zero-trace wipe beacon to server
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/wipe-session');
        }
        sessionStorage.clear();
        localStorage.clear();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleBeforeUnload);
    };
  }, [shields.autoWipeOnExit]);

  // Tab Operations
  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTabObj: BrowserTab = {
      id: newId,
      title: language === 'ur' ? 'نیا ٹیب' : 'New Tab',
      url: DEFAULT_HOME_URL,
      displayUrl: '',
      history: [DEFAULT_HOME_URL],
      historyIndex: 0,
      isLoading: false,
      isOnion: false,
      securityStatus: 'secure-doh',
    };
    setTabs((prev) => [...prev, newTabObj]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (idToClose: string) => {
    if (tabs.length === 1) {
      // If closing the only tab, reset to home
      setTabs([
        {
          id: `tab-${Date.now()}`,
          title: language === 'ur' ? 'نیا ٹیب' : 'New Tab',
          url: DEFAULT_HOME_URL,
          displayUrl: '',
          history: [DEFAULT_HOME_URL],
          historyIndex: 0,
          isLoading: false,
          isOnion: false,
          securityStatus: 'secure-doh',
        },
      ]);
      return;
    }

    const filtered = tabs.filter((t) => t.id !== idToClose);
    setTabs(filtered);
    if (activeTabId === idToClose) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  // Navigate Active Tab
  const handleNavigate = useCallback(
    async (inputUrl: string) => {
      let url = inputUrl.trim();
      if (!url) return;

      const startTime = Date.now();
      const isOnion = url.toLowerCase().includes('.onion');

      // Check if it's search text or URL
      let formattedUrl = url;
      let display = url;

      if (url === DEFAULT_HOME_URL) {
        formattedUrl = DEFAULT_HOME_URL;
        display = '';
      } else if (
        !url.startsWith('http://') &&
        !url.startsWith('https://') &&
        !url.includes('.')
      ) {
        // Search query via DuckDuckGo Onion or clearnet privacy search
        formattedUrl = `https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/?q=${encodeURIComponent(
          url
        )}`;
        display = `Search: ${url}`;
      } else {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          formattedUrl = `https://${url}`;
        }
        display = url.replace(/^https?:\/\//, '');
      }

      // Update tab state to loading
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id !== activeTabId) return t;
          const newHistory = t.history.slice(0, t.historyIndex + 1);
          newHistory.push(formattedUrl);
          return {
            ...t,
            title: display.length > 24 ? display.slice(0, 24) + '...' : display,
            url: formattedUrl,
            displayUrl: display,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            isLoading: true,
            isOnion: isOnion || formattedUrl.includes('.onion'),
            securityStatus: isOnion ? 'secure-onion' : 'secure-doh',
          };
        })
      );

      // Perform parallel DNS query to verify Cloudflare 1.1.1.1 DoH
      try {
        const cleanHost = formattedUrl.replace(/^https?:\/\//, '').split('/')[0];
        const dnsRes = await fetch(`/api/dns-query?name=${encodeURIComponent(cleanHost)}&type=A`);
        const dnsData: DnsQueryResponse = await dnsRes.json();

        const elapsed = Date.now() - startTime;
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id !== activeTabId) return t;
            return {
              ...t,
              isLoading: false,
              loadTimeMs: elapsed,
              dnsResult: dnsData,
            };
          })
        );
      } catch {
        const elapsed = Date.now() - startTime;
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id !== activeTabId) return t;
            return {
              ...t,
              isLoading: false,
              loadTimeMs: elapsed,
            };
          })
        );
      }
    },
    [activeTabId]
  );

  const handleGoBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const targetUrl = activeTab.history[newIndex];
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id !== activeTabId) return t;
          const isHome = targetUrl === DEFAULT_HOME_URL;
          return {
            ...t,
            url: targetUrl,
            displayUrl: isHome ? '' : targetUrl.replace(/^https?:\/\//, ''),
            historyIndex: newIndex,
            isOnion: targetUrl.includes('.onion'),
          };
        })
      );
    }
  };

  const handleGoForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const targetUrl = activeTab.history[newIndex];
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id !== activeTabId) return t;
          const isHome = targetUrl === DEFAULT_HOME_URL;
          return {
            ...t,
            url: targetUrl,
            displayUrl: isHome ? '' : targetUrl.replace(/^https?:\/\//, ''),
            historyIndex: newIndex,
            isOnion: targetUrl.includes('.onion'),
          };
        })
      );
    }
  };

  const handleReload = () => {
    handleNavigate(activeTab.url);
  };

  const handleGoHome = () => {
    handleNavigate(DEFAULT_HOME_URL);
  };

  // Panic / Nuke All Browsing Data (ایمرجنسی وائپ)
  const handleConfirmNuke = async () => {
    try {
      await fetch('/api/wipe-session', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }

    sessionStorage.clear();
    localStorage.clear();

    // Reset tabs to a single clean new tab
    const freshTab: BrowserTab = {
      id: `tab-clean-${Date.now()}`,
      title: language === 'ur' ? 'نیا ٹیب' : 'New Tab',
      url: DEFAULT_HOME_URL,
      displayUrl: '',
      history: [DEFAULT_HOME_URL],
      historyIndex: 0,
      isLoading: false,
      isOnion: false,
      securityStatus: 'secure-doh',
    };
    setTabs([freshTab]);
    setActiveTabId(freshTab.id);
  };

  const toggleShield = (key: keyof ShieldsConfig) => {
    setShields((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div
      dir={language === 'ur' ? 'rtl' : 'ltr'}
      className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none"
    >
      {/* 1. Browser TitleBar & Tab Management */}
      <TitleBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onOpenDnsInspector={() => setShowDnsInspector(true)}
        onTriggerNuke={() => setShowNukeModal(true)}
        onOpenApkModal={() => setShowApkModal(true)}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'ur' ? 'en' : 'ur'))}
        dnsLatencyMs={dnsLatencyMs}
      />

      {/* 2. Omnibox Navigation Toolbar */}
      <Omnibox
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onGoHome={handleGoHome}
        canGoBack={activeTab.historyIndex > 0}
        canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
        currentGateway={currentGateway}
        onChangeGateway={setCurrentGateway}
        onOpenShields={() => setShowShieldsModal(true)}
        language={language}
      />

      {/* 3. Browser Viewport (Web / Onion Proxy or New Tab) */}
      <BrowserViewport
        tab={activeTab}
        onNavigate={handleNavigate}
        language={language}
        currentGateway={currentGateway}
        dnsLatencyMs={dnsLatencyMs}
        onOpenApkModal={() => setShowApkModal(true)}
      />

      {/* Modals */}
      <DnsInspectorModal
        isOpen={showDnsInspector}
        onClose={() => setShowDnsInspector(false)}
        language={language}
        currentDnsResult={activeTab.dnsResult}
      />

      <ShieldsModal
        isOpen={showShieldsModal}
        onClose={() => setShowShieldsModal(false)}
        shields={shields}
        onToggleShield={toggleShield}
        currentGateway={currentGateway}
        onChangeGateway={setCurrentGateway}
        language={language}
      />

      <NukeWipeModal
        isOpen={showNukeModal}
        onClose={() => setShowNukeModal(false)}
        onConfirmWipe={handleConfirmNuke}
        language={language}
      />

      <AndroidApkModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        language={language}
      />
    </div>
  );
}
