import React, { useState } from 'react';
import { 
  X, 
  User, 
  Crown, 
  HardDrive, 
  Sparkles, 
  Settings, 
  ShieldCheck, 
  Cpu, 
  Check, 
  Camera, 
  Sliders, 
  LogOut, 
  RefreshCw,
  Globe,
  Bell,
  Key
} from 'lucide-react';
import { getAssetUrl } from '../utils/assetUrl';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const [userName, setUserName] = useState('Forhad Alpha');
  const [userHandle, setUserHandle] = useState('@forhadalpha');
  const [userEmail, setUserEmail] = useState('creator@vidocine.pro');
  const [defaultRes, setDefaultRes] = useState<'1080p' | '4K'>('1080p');
  const [defaultFps, setDefaultFps] = useState<30 | 60>(60);
  const [hardwareAccel, setHardwareAccel] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);
  const [themeMode, setThemeMode] = useState<'cosmic' | 'deep_navy' | 'cyber'>('cosmic');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-[#04081c] border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with gradient banner */}
        <div className="relative p-5 bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border-b border-indigo-500/20 flex items-start justify-between">
          
          <div className="flex items-center gap-3.5">
            {/* Avatar with Pro Badge */}
            <div className="relative group">
              <div className="w-14 h-14 rounded-full border-2 border-indigo-400 p-0.5 shadow-xl overflow-hidden bg-slate-900">
                <img
                  src={getAssetUrl('logomax.png')}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = getAssetUrl('logo.png');
                  }}
                />
              </div>
              <button 
                className="absolute bottom-0 right-0 p-1 bg-indigo-600 rounded-full text-white hover:scale-110 transition-transform shadow"
                title="Change Avatar"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">{userName}</h2>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-purple-500/30 border border-amber-400/50 text-[10px] font-black text-amber-300 flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-amber-300" />
                  PRO
                </span>
              </div>
              <span className="text-xs text-indigo-300 font-mono">{userHandle}</span>
              <span className="text-[11px] text-slate-400">{userEmail}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Settings Form */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4 text-xs text-slate-300">
          
          {/* Cloud Storage & Quota Stats */}
          <div className="p-3.5 bg-[#030617] rounded-2xl border border-indigo-500/20 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-[11px]">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cloud Storage & Compute</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 font-bold">48.2 GB / 100 GB</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full w-[48%]" />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>GPU AI Credits: <strong>1,450 / 2,000</strong></span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Synced
              </span>
            </div>
          </div>

          {/* Profile Identity Inputs */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider">Account Details</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Display Name</span>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#030617] border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-xs outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Username Handle</span>
                <input
                  type="text"
                  value={userHandle}
                  onChange={(e) => setUserHandle(e.target.value)}
                  className="w-full bg-[#030617] border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Editor Preferences */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-900">
            <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider">Editor Preferences</span>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Default Resolution</span>
                <select
                  value={defaultRes}
                  onChange={(e) => setDefaultRes(e.target.value as any)}
                  className="w-full bg-[#030617] border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-xs outline-none"
                >
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="4K">4K (Ultra HD)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Default Frame Rate</span>
                <select
                  value={defaultFps}
                  onChange={(e) => setDefaultFps(parseInt(e.target.value) as any)}
                  className="w-full bg-[#030617] border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-xs outline-none"
                >
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS (Pro Smooth)</option>
                </select>
              </div>
            </div>

            {/* Hardware acceleration toggle */}
            <div className="flex items-center justify-between p-3 bg-[#030617] rounded-xl border border-slate-850 mt-1">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>WebGL Hardware Acceleration</span>
                </div>
                <span className="text-[10px] text-slate-500">Accelerate 60FPS timeline and color grading shaders</span>
              </div>
              <button
                type="button"
                onClick={() => setHardwareAccel(!hardwareAccel)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  hardwareAccel ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${hardwareAccel ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-indigo-500/20 bg-[#030617] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="btn-cosmic-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
