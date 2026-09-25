import React, { useState, useEffect } from 'react';
import { Download, Github, Monitor, Smartphone, Check, Copy, Sparkles, X, Terminal, Globe, ArrowRight, Laptop, ShieldCheck } from 'lucide-react';

interface InstallModalProps {
  onClose: () => void;
  deferredPrompt?: any;
}

export default function InstallModal({ onClose, deferredPrompt }: InstallModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'github' | 'desktop'>('pwa');
  const [isInstalled, setIsInstalled] = useState(false);

  const gitCloneCmd = 'git clone https://github.com/vidoedit-pro/video-editor-pro.git';

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(gitCloneCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    } else {
      // If browser doesn't expose prompt, give friendly guide
      alert('To install CineMotion Pro on your device: \n\n1. In Chrome/Edge: Click the (Install) icon in the address bar or menu (⋮) -> "Install App".\n2. On Mac/Safari: File -> Add to Dock.\n3. On iOS Safari: Share -> "Add to Home Screen".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-[#04060c] border border-indigo-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-indigo-500/10 blur-[50px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-pink-500/10 blur-[50px] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Install CineMotion Pro App</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold rounded-full">
                  FREE / OPEN SOURCE
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Install as a standalone desktop app or download directly from GitHub Web.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-900 gap-1">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Install Web App (PWA)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'github'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Web / Source</span>
          </button>
        </div>

        {/* Tab 1: PWA Standalone App */}
        {activeTab === 'pwa' && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-600 p-0.5 shrink-0 shadow-lg shadow-indigo-500/20">
                  <div className="w-full h-full bg-[#030408] rounded-[14px] flex items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" onError={(e) => { e.currentTarget.src = '/logo.svg'; }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white">Standalone Desktop App</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    Runs offline in dedicated full-screen window with GPU video hardware acceleration, zero browser tabs clutter, and local file access.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900/80 text-center">
                <div className="bg-slate-900/60 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block font-mono">Windows / Mac / Linux</span>
                  <span className="text-xs font-bold text-emerald-400">100% Compatible</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block font-mono">Hardware Video</span>
                  <span className="text-xs font-bold text-indigo-400">GPU Canvas 4K</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block font-mono">Offline Ready</span>
                  <span className="text-xs font-bold text-pink-400">Instant Launch</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePwaInstall}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalled ? 'App Installed Successfully!' : 'Click to Install Desktop App'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: GitHub Web / Download Code */}
        {activeTab === 'github' && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span>Clone or Run Locally</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Node.js / Vite</span>
              </div>

              {/* Code Box */}
              <div className="flex items-center justify-between bg-black/60 border border-slate-850 rounded-xl px-3.5 py-2.5 font-mono text-xs text-indigo-300">
                <span className="truncate">{gitCloneCmd}</span>
                <button
                  onClick={handleCopyCmd}
                  className="ml-2 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-[10px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-sans">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="font-sans">Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Includes all 12 professional video templates, multi-track timeline, and hardware video rendering engine.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Github className="w-4 h-4" />
                <span>Open in GitHub Web</span>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
              >
                <Download className="w-4 h-4" />
                <span>Download Release ZIP</span>
              </a>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900/60 pt-3">
          <span>CineMotion Pro Video Suite v2.8.0</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Globe className="w-3 h-3 text-indigo-400" />
            <span>Open Source • Apache 2.0</span>
          </span>
        </div>

      </div>
    </div>
  );
}
