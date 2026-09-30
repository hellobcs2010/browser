import React, { useState } from 'react';
import { X, ShieldCheck, Activity, Search, CheckCircle2, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import type { DnsQueryResponse } from '../types.ts';
import { translations, type Language } from '../i18n.ts';

interface DnsInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentDnsResult?: DnsQueryResponse | null;
}

export const DnsInspectorModal: React.FC<DnsInspectorModalProps> = ({
  isOpen,
  onClose,
  language,
  currentDnsResult,
}) => {
  const t = translations[language];
  const [testDomain, setTestDomain] = useState('cloudflare.com');
  const [recordType, setRecordType] = useState('A');
  const [queryResult, setQueryResult] = useState<DnsQueryResponse | null>(currentDnsResult || null);
  const [isQuerying, setIsQuerying] = useState(false);

  if (!isOpen) return null;

  const handleTestQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testDomain.trim()) return;

    setIsQuerying(true);
    try {
      const res = await fetch(`/api/dns-query?name=${encodeURIComponent(testDomain.trim())}&type=${recordType}`);
      const data = await res.json();
      setQueryResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <span>{t.dnsInspector}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  1.1.1.1 DoH Strict
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t.dohStrictDesc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Strict Security Guard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1">Primary Anycast IP</div>
              <div className="text-sm font-mono font-bold text-amber-400">1.1.1.1 / 1.0.0.1</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Zero ISP DNS Leaks</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1">DoH Transport</div>
              <div className="text-sm font-mono font-bold text-sky-400">RFC 8484 (TLS 1.3)</div>
              <div className="text-[10px] text-sky-300 flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3" />
                <span>Encrypted Queries</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1">Privacy Guarantee</div>
              <div className="text-sm font-mono font-bold text-purple-400">Zero IP Logging</div>
              <div className="text-[10px] text-purple-300 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3 h-3" />
                <span>KPMG Audited</span>
              </div>
            </div>
          </div>

          {/* Live Query Tester */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90">
            <div className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>{t.testDomain} (1.1.1.1 Anycast Test)</span>
            </div>

            <form onSubmit={handleTestQuery} className="flex flex-wrap gap-2">
              <input
                type="text"
                value={testDomain}
                onChange={(e) => setTestDomain(e.target.value)}
                placeholder="e.g. cloudflare.com or wikipedia.org"
                className="flex-1 min-w-[180px] px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 font-mono outline-none focus:border-amber-500"
              />

              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono outline-none cursor-pointer"
              >
                <option value="A">A (IPv4)</option>
                <option value="AAAA">AAAA (IPv6)</option>
                <option value="TXT">TXT</option>
                <option value="MX">MX</option>
                <option value="NS">NS</option>
              </select>

              <button
                type="submit"
                disabled={isQuerying}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isQuerying ? (
                  <span>Querying...</span>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>{t.dnsQueryBtn}</span>
                  </>
                )}
              </button>
            </form>

            {/* Query Result Display */}
            {queryResult && (
              <div className="mt-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Target:</span>
                    <span className="text-sky-300 font-bold">{queryResult.domain}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {queryResult.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {queryResult.latencyMs}ms
                    </span>
                    {queryResult.isDNSSEC && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        DNSSEC
                      </span>
                    )}
                  </div>
                </div>

                {queryResult.answers && queryResult.answers.length > 0 ? (
                  <div className="space-y-1 pt-1">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider font-sans">
                      Resolved IP Records via Cloudflare 1.1.1.1:
                    </div>
                    {queryResult.answers.map((ans, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-200 bg-slate-950 px-2 py-1 rounded">
                        <span className="text-slate-400">{ans.name}</span>
                        <span className="text-amber-300 font-semibold">{ans.data}</span>
                        <span className="text-slate-500 text-[10px]">TTL {ans.TTL}s</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 py-1 flex items-center gap-2">
                    {queryResult.isOnion ? (
                      <div className="text-purple-300">
                        🧅 <strong>.onion Special Domain:</strong> Onion addresses are RFC 7686 hidden service hashes. Cloudflare 1.1.1.1 DoH verifies no clearnet DNS leak occurred, and routes seamlessly through your selected Fast Gateway!
                      </div>
                    ) : (
                      <span>No direct records returned (Status: {queryResult.status})</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Urdu / English Security Note */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-slate-300 space-y-1">
            <div className="font-semibold text-amber-300 text-xs">
              {language === 'ur' ? 'کلاؤڈ فلیر 1.1.1.1 سخت سیکیورٹی پالیسی:' : 'Cloudflare 1.1.1.1 Strict Enforcement Policy:'}
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {language === 'ur'
                ? 'براؤزر نے آپ کے تمام انٹرنیٹ ڈومین لک اپس کو 100% انکرپٹڈ Cloudflare DoH (1.1.1.1) پر لاک کیا ہوا ہے۔ آپ کا لوکل آئی ایس پی، لوکل وائی فائی راؤٹر، یا کوئی بھی جاسوس یہ نہیں دیکھ سکتا کہ آپ کون سی ویب سائٹ وزٹ کر رہے ہیں۔'
                : 'All internet queries in this browser are strictly anchored to Cloudflare 1.1.1.1 DNS over HTTPS. Your local ISP, public Wi-Fi, or network observers cannot intercept or log which websites or onion gateways you visit.'}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            {language === 'ur' ? 'بند کریں' : 'Close Inspector'}
          </button>
        </div>
      </div>
    </div>
  );
};
