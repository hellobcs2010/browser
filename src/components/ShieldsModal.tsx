import React from 'react';
import { X, ShieldCheck, Zap, Lock, Trash2, EyeOff, Radio, CheckCircle, ShieldAlert } from 'lucide-react';
import type { ShieldsConfig, FastGateway } from '../types.ts';
import { FAST_ONION_GATEWAYS } from '../constants/gateways.ts';
import { translations, type Language } from '../i18n.ts';

interface ShieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shields: ShieldsConfig;
  onToggleShield: (key: keyof ShieldsConfig) => void;
  currentGateway: string;
  onChangeGateway: (gatewayId: string) => void;
  language: Language;
}

export const ShieldsModal: React.FC<ShieldsModalProps> = ({
  isOpen,
  onClose,
  shields,
  onToggleShield,
  currentGateway,
  onChangeGateway,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                {t.shields} &amp; {t.vpnReady}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ur' ? 'پرائیویسی پروٹیکشن اور تیز رفتار وی پی این کنفیگریشن' : 'High-speed VPN and anti-tracking configuration'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Feature 1: No Tor Relay Lag (VPN Optimized) */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-purple-300 text-xs">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{t.onionNoLag} (Fast Gateway Engine)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                100% Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t.onionNoLagDesc}
            </p>

            {/* Gateway Selector */}
            <div className="pt-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
                {t.activeGateway}:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FAST_ONION_GATEWAYS.map((gw) => (
                  <button
                    key={gw.id}
                    onClick={() => onChangeGateway(gw.id)}
                    className={`px-3 py-2 rounded-lg text-left border flex items-center justify-between transition-colors ${
                      currentGateway === gw.id
                        ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs">{gw.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">*.{gw.domain}</div>
                    </div>
                    {currentGateway === gw.id && <CheckCircle className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 2: Strict Cloudflare 1.1.1.1 DoH (Locked) */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
            <div className="space-y-0.5 max-w-[80%]">
              <div className="font-semibold text-amber-300 text-xs flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>{t.dohStrict}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {t.dohStrictDesc}
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
              LOCKED
            </div>
          </div>

          {/* Feature 3: Auto-Wipe on Exit Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 max-w-[80%]">
              <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>{t.wipeOnExitToggle}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {language === 'ur'
                  ? 'براؤزر بند کرنے، ٹیب بند کرنے یا پیج ریفریش کرنے پر کوکیز اور ہسٹری فوراً مٹا دی جاتی ہے۔'
                  : 'Purges cookies, session tokens, and navigation history as soon as the tab or window unloads.'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={shields.autoWipeOnExit}
                onChange={() => onToggleShield('autoWipeOnExit')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Feature 4: WebRTC Real-IP Leak Shield */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 max-w-[80%]">
              <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.webRtcBlocked}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {language === 'ur'
                  ? 'وی پی این کے پیچھے اصلی آئی پی ایڈریس کو ویب آر ٹی سی سے لیک ہونے سے روکتا ہے۔'
                  : 'Blocks WebRTC STUN candidate discovery so websites cannot detect your real router IP.'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={shields.webRtcBlocked}
                onChange={() => onToggleShield('webRtcBlocked')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {/* Feature 5: Anti-Fingerprinting Scrambler */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 max-w-[80%]">
              <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.antiFingerprint}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {language === 'ur'
                  ? 'کینوس اور براؤزر کے ہیڈرز میں رینڈم شور شامل کر کے ٹریکرز کو آپ کی ڈیوائس پہچاننے سے روکتا ہے۔'
                  : 'Injects canvas noise and generic client headers to defeat browser device fingerprinting.'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={shields.antiFingerprinting}
                onChange={() => onToggleShield('antiFingerprinting')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
          >
            {language === 'ur' ? 'محفوظ کریں اور بند کریں' : 'Apply & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
