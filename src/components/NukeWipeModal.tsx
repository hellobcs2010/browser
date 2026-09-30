import React, { useState } from 'react';
import { Flame, CheckCircle, ShieldAlert, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { translations, type Language } from '../i18n.ts';

interface NukeWipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmWipe: () => Promise<void>;
  language: Language;
}

export const NukeWipeModal: React.FC<NukeWipeModalProps> = ({
  isOpen,
  onClose,
  onConfirmWipe,
  language,
}) => {
  const t = translations[language];
  const [isWiping, setIsWiping] = useState(false);
  const [wipeComplete, setWipeComplete] = useState(false);

  if (!isOpen) return null;

  const handleStartWipe = async () => {
    setIsWiping(true);
    try {
      await onConfirmWipe();
      setWipeComplete(true);
      setTimeout(() => {
        setWipeComplete(false);
        setIsWiping(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
      setIsWiping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.25)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-rose-950/30 border-b border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-200">
                {t.panicNuke}
              </h3>
              <p className="text-[11px] text-rose-300/80">
                {language === 'ur' ? 'زیرو ٹریس میموری واش' : 'Zero-Trace Memory Erasure'}
              </p>
            </div>
          </div>
          {!isWiping && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {wipeComplete ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center animate-bounce">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-emerald-300">
                {t.panicNukeSuccess}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                RAM Buffers Zeroed · Cookies Erased · DNS Cache Flushed
              </div>
            </div>
          ) : isWiping ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-rose-400 animate-spin" />
              <div className="text-sm font-semibold text-rose-300">
                {language === 'ur' ? 'ڈیٹا مٹایا جا رہا ہے...' : 'Purging browsing traces...'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Overwriting session registers with random bits...
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-[11px]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {language === 'ur' ? 'کیا کچھ فوری ڈیلیٹ ہو گا؟' : 'What will be instantly eradicated?'}
                  </span>
                </div>
                <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                  <li>
                    {language === 'ur' ? 'تمام کھلے ٹیبز اور ہسٹری لاگز' : 'All opened tabs and navigation history'}
                  </li>
                  <li>
                    {language === 'ur' ? 'کوکیز، سیشن اسٹوریج اور عارضی کیشے' : 'All session cookies, token storage & RAM cache'}
                  </li>
                  <li>
                    {language === 'ur' ? 'کلپ بورڈ اور فارم ان پٹ کی میموری' : 'Temporary form inputs and clipboard memory'}
                  </li>
                  <li>
                    {language === 'ur' ? 'سرور سائیڈ سیشن اور ڈی این ایس کیشے' : 'Server-side proxy handles and Clear-Site-Data header'}
                  </li>
                </ul>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                {language === 'ur'
                  ? 'براؤزر بند کرنے یا ونڈو ریمو کرنے پر بھی یہ سارا ڈیٹا از خود ختم ہو جاتا ہے۔'
                  : 'This browser automatically executes this zero-fill purge when you close or reload the window as well.'}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
                >
                  {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleStartWipe}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-900/50 flex items-center justify-center gap-1.5"
                >
                  <Flame className="w-4 h-4" />
                  <span>{language === 'ur' ? 'ہاں، سارا ڈیٹا مٹا دیں' : 'Eradicate All Data Now'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
