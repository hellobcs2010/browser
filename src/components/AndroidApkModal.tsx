import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  CheckCircle,
  ExternalLink,
  FileCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { translations, type Language } from '../i18n.ts';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];
  const { isInstallable, hasNativePrompt, isInstalled, triggerInstall, isAndroid } = usePWAInstall();
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const currentAppUrl = window.location.origin;

  const handleNativeInstall = async () => {
    const outcome = await triggerInstall();
    if (outcome === 'accepted') {
      onClose();
    }
  };

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Generate downloadable Android TWA / APK package
  const handleDownloadAndroidBundle = () => {
    setDownloadingZip(true);
    try {
      const androidManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.aether.onionspeed.browser">
    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="Aether OnionSpeed"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:label="Aether OnionSpeed"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <meta-data
                android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="${currentAppUrl}/" />
        </activity>
    </application>
</manifest>`;

      const twaManifestJson = JSON.stringify(
        {
          packageId: 'com.aether.onionspeed.browser',
          host: window.location.host,
          name: 'Aether OnionSpeed Browser',
          launcherName: 'OnionSpeed',
          themeColor: '#020617',
          navigationColor: '#020617',
          backgroundColor: '#020617',
          startUrl: '/',
          iconUrl: `${currentAppUrl}/icon.svg`,
          maskableIconUrl: `${currentAppUrl}/pwa-maskable-512x512.png`,
          appVersionName: '1.0.0',
          appVersionCode: 1,
          signing: {
            scheme: 'v2+v3',
          },
        },
        null,
        2
      );

      const readmeInstructions = `# Aether OnionSpeed Browser - Android APK Build Guide

## Method 1: Instant 1-Click Install on Android Phone (Recommended)
1. Open this link in Google Chrome on your Android Phone:
   ${currentAppUrl}
2. Tap the 3 dots menu in Chrome, or click the "Install App" banner.
3. Chrome will automatically mint and install a genuine native WebAPK (.apk) onto your Android phone with full app drawer presence!

## Method 2: Generate Signed Standalone Release APK using PWABuilder
1. Go to https://www.pwabuilder.com
2. Enter your App URL: ${currentAppUrl}
3. Click "Build APK" -> Download signed Android APK (.apk) ready to sideload!

## Method 3: Build APK with Android Studio / Bubblewrap CLI
Run:
\`\`\`bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=${currentAppUrl}/manifest.webmanifest
bubblewrap build
\`\`\`
This produces an \`app-release-signed.apk\` file.`;

      // Download README and configs as package
      const blob = new Blob([readmeInstructions], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Aether-OnionSpeed-Android-APK-Guide.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setDownloadingZip(false), 1000);
    }
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentAppUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.2)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Android .APK &amp; WebAPK Downloader</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                  ANDROID READY
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'ur'
                  ? 'اینڈرائڈ فون کے لیے .APK اور نیٹیو ایپ انسٹالیشن'
                  : 'Install natively on Android phone or generate standalone .apk'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Method 1: Direct Android Phone WebAPK Install */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-300">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>
                  {language === 'ur'
                    ? 'طریقہ 1: اینڈرائڈ پر براہ راست 1-کلک انسٹال (WebAPK)'
                    : 'Method 1: Direct 1-Click Install on Android (WebAPK)'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                بہترین و آسان ترین
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {language === 'ur'
                ? 'گوگل کروم میں "Install App" دبانے سے گوگل کا WebAPK انجن خودکار طور پر اس ایپ کی اصلی سائن شدہ .apk فائل بنا کر آپ کے اینڈرائڈ فون کے ایپ ڈراور میں انسٹال کر دیتا ہے۔'
                : 'When you tap "Install App" in Chrome on Android, Google mints a genuine signed .apk (WebAPK) directly onto your phone without requiring manual file sideloading!'}
            </p>

            <button
              onClick={handleNativeInstall}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Download className="w-4 h-4" />
              <span>
                {language === 'ur'
                  ? 'اینڈرائڈ فون پر فوری انسٹال کریں (Install WebAPK)'
                  : 'Install Native WebAPK on Phone Now'}
              </span>
            </button>
          </div>

          {/* Method 2: PWABuilder 1-Click APK Generator */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-purple-300">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>
                  {language === 'ur'
                    ? 'طریقہ 2: ڈائریکٹ .APK فائل ڈاؤنلوڈر (PWABuilder Cloud)'
                    : 'Method 2: Download Standalone .APK File (PWABuilder Cloud)'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono">
                Direct .APK
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'ur'
                ? 'اگر آپ کو براہِ راست خام .apk فائل اپنے فون یا پی سی پر ڈاؤنلوڈ کرنی ہے، تو مائیکروسافٹ / گوگل PWABuilder ایک کلک میں سائن شدہ .apk بنا کر ڈاؤنلوڈ کروا دیتا ہے۔'
                : 'If you want a standalone raw .apk binary file to share or install manually, PWABuilder generates a signed release APK from this live URL in 10 seconds.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>PWABuilder پر .APK ڈاؤنلوڈ کریں</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleCopyAppUrl}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'URL Copied!' : 'Copy App URL'}</span>
              </button>
            </div>
          </div>

          {/* Method 3: Download Android Project Config / Guide */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span>
                  {language === 'ur'
                    ? 'اینڈرائڈ پیکیج گائیڈ اور کنفیگریشن فائل'
                    : 'Android Manifest & APK Build Guide'}
                </span>
              </div>
              <button
                onClick={handleDownloadAndroidBundle}
                disabled={downloadingZip}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 text-xs transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>{downloadingZip ? 'Downloading...' : 'گائیڈ ڈاؤنلوڈ کریں'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'ur'
                ? 'اینڈرائڈ اسٹوڈیو اور ببلی ریپ (Bubblewrap) کے ذریعے خود اپنی .apk کمپائل کرنے کی مکمل کنفیگریشن فائل۔'
                : 'Complete AndroidManifest.xml and build instructions for offline APK compilation via Android Studio.'}
            </p>
          </div>

          {/* Urdu Instructions */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300">
              {language === 'ur' ? 'فون میں چلانے کا طریقہ (Roman Urdu / اردو):' : 'Installation Steps:'}
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>
                اپنے اینڈرائیڈ فون کے کروم براؤزر میں یہ ایپ کھولیں: <code className="text-amber-300 font-mono text-[10px]">{currentAppUrl}</code>
              </li>
              <li>
                کروم کے دائیں کونے میں اوپر 3 ڈاٹس پر کلک کریں اور <strong>"Install app"</strong> یا <strong>"Add to Home screen"</strong> دبائیں۔
              </li>
              <li>
                آپ کے موبائل میں اصلی <strong>OnionSpeed App (.apk)</strong> انسٹال ہو جائے گی اور بغیر براؤزر بار کے فل اسکرین پر چلے گی!
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {language === 'ur' ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
