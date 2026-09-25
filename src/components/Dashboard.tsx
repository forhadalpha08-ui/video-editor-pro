import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Scissors,
  Sliders,
  Music,
  Type,
  Folder,
  Layers,
  ArrowRight,
  TrendingUp,
  HardDrive,
  Clock,
  Crown,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Bell,
  Search,
  ExternalLink,
  Github,
  Monitor,
  Cloud,
  Download,
  ShieldCheck,
  Video,
  Wand2,
  Mic,
  Palette,
  ChevronDown,
  Apple
} from 'lucide-react';
import { Project, ProceduralType } from '../types';
import { getAssetUrl } from '../utils/assetUrl';

interface DashboardProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onLaunchEditor: (tab?: 'grading' | 'inspector' | 'ai_magic' | 'audio' | 'motion' | 'scopes' | 'tutorials') => void;
  onAddVideoClip: (type: ProceduralType) => void;
  onUploadVideoFile?: (file: File) => void;
  onOpenInstallModal?: () => void;
  onOpenProfileModal?: () => void;
}

// Interactive Video Thumbnail Component that plays real video on hover
function VideoThumb({ videoFile, className }: { videoFile: string; className?: string }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const src = getAssetUrl(videoFile);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      preload="auto"
      loop
      onLoadedMetadata={() => {
        if (videoRef.current && videoRef.current.currentTime === 0) {
          videoRef.current.currentTime = 0.001;
        }
      }}
      onLoadedData={() => {
        if (videoRef.current && videoRef.current.currentTime === 0) {
          videoRef.current.currentTime = 0.001;
        }
      }}
      onMouseEnter={() => {
        videoRef.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0.001;
        }
      }}
      className={className || "w-full h-full object-cover"}
    />
  );
}

// 6 Recent Projects matching mockup image
const RECENT_PROJECTS_LIST = [
  {
    id: 'template_2',
    name: 'Cinematic Travel Vlog',
    duration: '03:24',
    timeAgo: '2 days ago',
    videoFile: '2.mp4'
  },
  {
    id: 'template_1',
    name: 'Neon City Edit',
    duration: '01:56',
    timeAgo: '4 days ago',
    videoFile: '1.mp4'
  },
  {
    id: 'template_4',
    name: 'Product Promo',
    duration: '00:48',
    timeAgo: '5 days ago',
    videoFile: '4.mp4'
  },
  {
    id: 'template_5',
    name: 'Nature Documentary',
    duration: '05:12',
    timeAgo: '1 week ago',
    videoFile: '5.mp4'
  },
  {
    id: 'template_3',
    name: 'Gaming Montage',
    duration: '02:37',
    timeAgo: '1 week ago',
    videoFile: '3.mp4'
  },
  {
    id: 'template_6',
    name: 'Fashion Reel',
    duration: '01:21',
    timeAgo: '1 week ago',
    videoFile: '6.mp4'
  }
];

// 4 Category Showcase Cards matching mockup image
const CATEGORY_CARDS = [
  {
    category: 'Cinematic',
    name: 'Cinematic',
    count: '12 templates',
    templateId: 'template_1',
    videoFile: '1.mp4'
  },
  {
    category: 'Gaming',
    name: 'Gaming',
    count: '18 templates',
    templateId: 'template_3',
    videoFile: '3.mp4'
  },
  {
    category: 'Vlog',
    name: 'Vlog',
    count: '15 templates',
    templateId: 'template_2',
    videoFile: '2.mp4'
  },
  {
    category: 'Lifestyle',
    name: 'Lifestyle',
    count: '20 templates',
    templateId: 'template_6',
    videoFile: '6.mp4'
  }
];

// All 12 Video Files Templates Data (1.mp4 to 12.mp4)
const ALL_12_TEMPLATES = [
  {
    id: 'template_1',
    category: 'Cinematic',
    name: 'Cyberpunk Tokyo Awakening',
    description: 'Neon sci-fi sequence with cyberpunk LUT, glowing animated titles, and heavy synthwave audio.',
    duration: '18.0s',
    tracks: '1 Video · 1 Audio · 2 Texts',
    videoFile: '1.mp4'
  },
  {
    id: 'template_2',
    category: 'Vlog',
    name: 'Epic Mountain Expedition',
    description: 'Alpine ridge travel exploration with warm gold LUT, elevation badges, and ambient winds.',
    duration: '16.0s',
    tracks: '1 Video · 1 Audio · 1 Text',
    videoFile: '2.mp4'
  },
  {
    id: 'template_3',
    category: 'Gaming',
    name: 'Neon Velocity Street Drift',
    description: 'High-speed street car drifting with teal & orange grading, speed ramp keyframes, and punchy bass.',
    duration: '15.0s',
    tracks: '1 Video · 1 Audio · 1 Text',
    videoFile: '3.mp4'
  },
  {
    id: 'template_4',
    category: 'Lifestyle',
    name: 'Minimalist Tech Product Launch',
    description: 'Clean hardware showcase for luxury tech gadgets with sleek titanium branding overlays.',
    duration: '14.0s',
    tracks: '1 Video · 1 Audio · 2 Texts',
    videoFile: '4.mp4'
  },
  {
    id: 'template_5',
    category: 'Cinematic',
    name: 'Cinematic Golden Horizons',
    description: 'Sweeping anamorphic horizon views with dramatic film glow, deep shadows, and cinematic titles.',
    duration: '15.0s',
    tracks: '1 Video · 1 Audio · 1 Text',
    videoFile: '5.mp4'
  },
  {
    id: 'template_6',
    category: 'Lifestyle',
    name: 'Urban Streetwear & Culture',
    description: 'Fashion lookbook featuring fast cuts, vivid street colors, VHS vintage filters, and pop titles.',
    duration: '14.0s',
    tracks: '1 Video · 1 Audio · 1 Text',
    videoFile: '6.mp4'
  },
  {
    id: 'template_7',
    category: 'Vlog',
    name: 'Content Creator Masterclass',
    description: 'Polished studio talking head & tutorial edit with crystal-clear color grading and dynamic lower thirds.',
    duration: '16.0s',
    tracks: '1 Video · 1 Audio · 1 Text',
    videoFile: '7.mp4'
  },
  {
    id: 'template_8',
    category: 'Gaming',
    name: 'Extreme Sports Action Showcase',
    description: 'Adrenaline-packed motion edit with intense color grade, RGB split, and dramatic speed ramping.',
    duration: '18.0s',
    tracks: '1 Video · 1 Audio · 1 Text',
    videoFile: '8.mp4'
  },
  {
    id: 'template_9',
    category: 'Cinematic',
    name: 'Retro 80s Synthwave Aesthetic',
    description: 'Nostalgic retro wave universe with CRT scanlines, chromatic aberration, and neon purple palettes.',
    duration: '15.0s',
    tracks: '1 Video · 1 Audio · 1 Text',
    videoFile: '9.mp4'
  },
  {
    id: 'template_10',
    category: 'Cinematic',
    name: 'Film Noir Documentary Story',
    description: 'High-contrast monochrome film noir aesthetic with authentic silver-halide grain and poetic title cards.',
    duration: '16.0s',
    tracks: '1 Video · 1 Audio · 1 Text',
    videoFile: '10.mp4'
  },
  {
    id: 'template_11',
    category: 'Vlog',
    name: 'Metropolis City Hyperlapse',
    description: 'High-speed urban traffic and architectural hyperlapse with vibrant daylight grading and modern dynamic badges.',
    duration: '14.0s',
    tracks: '1 Video · 1 Audio · 1 Text',
    videoFile: '11.mp4'
  },
  {
    id: 'template_12',
    category: 'Cinematic',
    name: 'Cosmic Deep Space Voyage',
    description: 'Interstellar planetary journey with deep space nebulas, glowing starry auras, futuristic title cards and ambient sound.',
    duration: '18.0s',
    tracks: '1 Video · 1 Audio · 1 Text',
    videoFile: '12.mp4'
  }
];

export default function Dashboard({
  projects,
  activeProjectId,
  onSelectProject,
  onLaunchEditor,
  onAddVideoClip,
  onUploadVideoFile,
  onOpenInstallModal,
}: DashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Cinematic' | 'Gaming' | 'Vlog' | 'Lifestyle'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabSection, setActiveTabSection] = useState<'categories' | 'all12'>('categories');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const filtered12Templates = ALL_12_TEMPLATES.filter((tmpl) => {
    const matchesCategory = selectedCategory === 'All' || tmpl.category === selectedCategory;
    const matchesSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tmpl.videoFile.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 w-full flex flex-col gap-6 pb-12 animate-fade-in text-slate-100 selection:bg-indigo-500/30">
      
      {/* 1. TOP HEADER NAVIGATION BAR MATCHING MOCKUP */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900/60 pb-4">
        
        {/* Search Bar matching mockup with command shortcut */}
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates, projects..."
            className="w-full bg-[#050711]/90 hover:bg-[#070a16] border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-full pl-11 pr-16 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#0b0f1d] px-2 py-0.5 rounded-md border border-slate-800 text-[9px] font-mono font-semibold text-slate-400 pointer-events-none select-none">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        {/* Global Controls matching mockup */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          
          {/* Global Language / Region Pill */}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#050711]/90 hover:bg-[#090d1f] border border-slate-850 rounded-full text-xs text-slate-300 font-semibold hover:text-white transition-all shadow-sm">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Global</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Glowing Notification bell */}
          <button className="relative p-2.5 bg-[#050711]/90 hover:bg-[#090d1f] border border-slate-850 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-[#050711] animate-pulse" />
          </button>

          {/* User profile avatar with circular neon halo ring */}
          <button
            onClick={() => onOpenProfileModal && onOpenProfileModal()}
            className="w-10 h-10 rounded-full border-2 border-indigo-500/60 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0 overflow-hidden bg-slate-900 cursor-pointer hover:ring-2 hover:ring-cyan-400 hover:scale-105 transition-all"
            title="User Profile & Settings"
          >
            <img
              src={getAssetUrl('logo.png')}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.currentTarget.src = getAssetUrl('logomax.png');
              }}
            />
          </button>

          {/* Install App / GitHub Download Button */}
          <button
            onClick={() => onOpenInstallModal && onOpenInstallModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs rounded-full shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>

        </div>
      </div>

      {/* 2. MAIN HERO BANNER BLOCK MATCHING MOCKUP */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#070b1e] via-[#0f0d2c] to-[#080718] border border-indigo-500/20 rounded-[28px] p-6 md:p-8 flex flex-col lg:flex-row justify-between items-center shadow-2xl shadow-indigo-950/20 gap-8">
        
        {/* Glowing cosmic flares */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-600/15 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />

        {/* Left Hero Content */}
        <div className="flex-1 flex flex-col items-start gap-4 z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-sky-500/10 border border-sky-500/25 rounded-full text-[10.5px] font-extrabold text-sky-400 tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>AI-Powered Editing</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Turn Your Ideas <br />
            <span className="bg-gradient-to-r from-white via-indigo-200 to-pink-400 bg-clip-text text-transparent">
              Into Stunning Videos
            </span>
          </h1>

          <p className="text-slate-400 text-xs md:text-sm max-w-md leading-relaxed">
            Edit, enhance, and create professional videos with powerful tools and AI magic.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-1">
            <button
              onClick={() => onLaunchEditor()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/35 hover:shadow-indigo-600/50 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 rotate-[-90deg]" />
              <span>Start Creating</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-3 bg-[#0a0d20]/80 hover:bg-[#0f1430] border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold rounded-2xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>Upload Video</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onUploadVideoFile) {
                  onUploadVideoFile(file);
                }
              }}
            />
          </div>
        </div>

        {/* Right Hero Video Card with Real Video Playback */}
        <div className="relative w-full lg:w-[460px] aspect-[16/10] rounded-2xl overflow-hidden border border-indigo-500/30 shadow-2xl shadow-indigo-600/20 group">
          {/* Main Background Video Preview */}
          <video
            src={getAssetUrl('1.mp4')}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Big Glowing Play Button in Center */}
          <div 
            onClick={() => onLaunchEditor()}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600/90 to-purple-600/90 border-2 border-white/60 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.8)] group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white fill-white translate-x-[1px]" />
            </div>
          </div>

          {/* Floating AI Features Panel on Right */}
          <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md border border-indigo-500/30 rounded-xl p-2 flex flex-col gap-1.5 shadow-xl text-[9px] font-bold text-slate-200">
            <div className="flex items-center gap-1.5 text-indigo-400">
              <Wand2 className="w-3 h-3" />
              <span>AI Auto Edit</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Scissors className="w-3 h-3" />
              <span>Smart Cut</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Palette className="w-3 h-3" />
              <span>Color Enhance</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-400">
              <Mic className="w-3 h-3" />
              <span>Audio Clean</span>
            </div>
          </div>

          {/* Video Timeline Scrubber Bar below */}
          <div className="absolute bottom-2 left-2 right-2 bg-black/85 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 flex items-center gap-1 overflow-hidden">
            <div className="w-8 h-5 rounded bg-indigo-900/60 border border-indigo-400 shrink-0 flex items-center justify-center text-[7px] font-mono text-cyan-300">01</div>
            <div className="w-8 h-5 rounded bg-slate-900 border border-slate-800 shrink-0" />
            <div className="w-8 h-5 rounded bg-slate-900 border border-slate-800 shrink-0" />
            <div className="w-8 h-5 rounded bg-purple-900/60 border border-purple-400 shrink-0 flex items-center justify-center text-[7px] font-mono text-pink-300">04</div>
            <div className="w-8 h-5 rounded bg-slate-900 border border-slate-800 shrink-0" />
            <div className="w-8 h-5 rounded bg-slate-900 border border-slate-800 shrink-0" />
            <div className="flex-1 text-right text-[8px] font-mono text-slate-400 pr-1">00:18.0</div>
          </div>
        </div>

      </div>

      {/* 3. QUICK TOOLS ROW (5 GLOWING CARDS MATCHING MOCKUP) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-1.5 h-3 bg-indigo-500 rounded-full" />
            <span>Quick Tools</span>
          </h2>
          <button
            onClick={() => onLaunchEditor()}
            className="text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>View All</span>
            <span>→</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          
          {/* Card 1: AI Auto Edit (Purple glow) */}
          <div
            onClick={() => onLaunchEditor('ai_magic')}
            className="quick-tool-card quick-tool-purple cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              <Sparkles className="w-4 h-4 text-purple-300" />
            </div>
            <div className="flex items-end justify-between gap-1 mt-3">
              <div className="min-w-0">
                <span className="text-[11.5px] font-bold text-white block">AI Auto Studio</span>
                <span className="text-[9px] text-slate-400 block leading-normal mt-0.5">Captions & TTS voice</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-purple-950/80 group-hover:bg-purple-600 group-hover:text-white border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 transition-all shadow-md">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 2: Cut & Trim (Blue glow) */}
          <div
            onClick={() => onLaunchEditor('inspector')}
            className="quick-tool-card quick-tool-blue cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-300 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(59,130,246,0.3)]">
              <Scissors className="w-4 h-4 text-blue-300" />
            </div>
            <div className="flex items-end justify-between gap-1 mt-3">
              <div className="min-w-0">
                <span className="text-[11.5px] font-bold text-white block">Cut & Trim</span>
                <span className="text-[9px] text-slate-400 block leading-normal mt-0.5">Split, speed & crop</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-950/80 group-hover:bg-blue-600 group-hover:text-white border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0 transition-all shadow-md">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 3: Color Grading (Emerald/Cyan glow) */}
          <div
            onClick={() => onLaunchEditor('grading')}
            className="quick-tool-card quick-tool-teal cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(20,184,166,0.3)]">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-indigo-500 animate-[spin_4s_linear_infinite]" />
            </div>
            <div className="flex items-end justify-between gap-1 mt-3">
              <div className="min-w-0">
                <span className="text-[11.5px] font-bold text-white block">Color Grading</span>
                <span className="text-[9px] text-slate-400 block leading-normal mt-0.5">DaVinci 3-Way wheels</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-teal-950/80 group-hover:bg-teal-600 group-hover:text-white border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 transition-all shadow-md">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 4: Audio Studio (Magenta glow) */}
          <div
            onClick={() => onLaunchEditor('audio')}
            className="quick-tool-card quick-tool-pink cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/40 flex items-center justify-center text-pink-300 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(236,72,153,0.3)]">
              <Music className="w-4 h-4 text-pink-300" />
            </div>
            <div className="flex items-end justify-between gap-1 mt-3">
              <div className="min-w-0">
                <span className="text-[11.5px] font-bold text-white block">Audio Studio</span>
                <span className="text-[9px] text-slate-400 block leading-normal mt-0.5">10-Band EQ & Ducking</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-pink-950/80 group-hover:bg-pink-600 group-hover:text-white border border-pink-500/40 flex items-center justify-center text-pink-300 shrink-0 transition-all shadow-md">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 5: Motion & PiP (Cyan glow) */}
          <div
            onClick={() => onLaunchEditor('motion')}
            className="quick-tool-card quick-tool-cyan cursor-pointer group col-span-2 sm:col-span-1"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Type className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="flex items-end justify-between gap-1 mt-3">
              <div className="min-w-0">
                <span className="text-[11.5px] font-bold text-white block">Motion & PiP</span>
                <span className="text-[9px] text-slate-400 block leading-normal mt-0.5">Keyframes & Blending</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-cyan-950/80 group-hover:bg-cyan-600 group-hover:text-white border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 transition-all shadow-md">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. RECENT PROJECTS & STATS & GO PRO (EXACT GRID MATCHING MOCKUP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: RECENT PROJECTS (Col-Span 7/8) */}
        <div className="lg:col-span-8 flex flex-col gap-3.5 cosmic-card p-5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-900/70">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-400" />
              <span>Recent Projects</span>
            </h3>
            <button
              onClick={() => onLaunchEditor()}
              className="text-[10px] font-bold text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          <div className="flex flex-col gap-2.5 mt-1">
            {RECENT_PROJECTS_LIST.map((proj) => (
              <div
                key={proj.name}
                onClick={() => {
                  onSelectProject(proj.id);
                  onLaunchEditor();
                }}
                className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-[#060817]/90 hover:bg-[#0d1330] border border-slate-900/80 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-sm"
              >
                <div className="relative w-16 h-10 rounded-xl overflow-hidden shrink-0 bg-black shadow-inner border border-slate-800">
                  <VideoThumb videoFile={proj.videoFile} />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <div className="w-5 h-5 rounded-full bg-indigo-600/90 text-white flex items-center justify-center border border-white/40">
                      <Play className="w-2.5 h-2.5 text-white fill-white translate-x-[0.5px]" />
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[11.5px] font-bold text-white block truncate group-hover:text-indigo-400 transition-colors leading-tight">
                    {proj.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500">
                    <span className="font-mono text-slate-400">{proj.duration}</span>
                    <span>•</span>
                    <span>{proj.timeAgo}</span>
                    <span className="text-indigo-400/80 font-mono text-[8px] bg-slate-900 px-1 rounded">({proj.videoFile})</span>
                  </div>
                </div>

                <button className="text-slate-500 hover:text-white p-1.5 shrink-0 hover:bg-slate-900 rounded-lg transition-colors">
                  •••
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: STATS & GO PRO (Col-Span 4/5) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Stats details card */}
          <div className="bg-[#040612]/70 border border-slate-850 rounded-[28px] p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-900/70">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Your Stats</span>
              </h3>
              <span className="text-xs text-slate-400">→</span>
            </div>

            <div className="flex flex-col gap-3.5">
              
              {/* Stat 1: Total Projects */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-400/50 flex items-center justify-center text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                    <Folder className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block leading-none mb-0.5">Total Projects</span>
                    <span className="text-xs font-extrabold text-white">24</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </span>
              </div>

              {/* Stat 2: Total Exports */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-600 border border-pink-400/50 flex items-center justify-center text-white shadow-[0_0_10px_rgba(236,72,153,0.4)]">
                    <Download className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block leading-none mb-0.5">Total Exports</span>
                    <span className="text-xs font-extrabold text-white">18</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +25%
                </span>
              </div>

              {/* Stat 3: Storage Used */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 border border-cyan-400/50 flex items-center justify-center text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                    <HardDrive className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block leading-none mb-0.5">Storage Used</span>
                    <span className="text-xs font-extrabold text-white">4.8 GB</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +10%
                </span>
              </div>

              {/* Stat 4: Active this Month */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 border border-purple-400/50 flex items-center justify-center text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                    <Clock className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block leading-none mb-0.5">This Month</span>
                    <span className="text-xs font-extrabold text-white">12</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +33%
                </span>
              </div>

            </div>
          </div>

          {/* Go Pro Box matching image */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/80 via-purple-950/60 to-slate-950 border border-indigo-500/20 rounded-[28px] p-5 shadow-2xl flex items-center justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-pink-500/20 blur-[30px] pointer-events-none" />

            <div className="flex flex-col gap-1 z-10">
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 mb-1">
                <Crown className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <span className="text-sm font-extrabold text-white block">Go Pro</span>
              <span className="text-[9.5px] text-slate-300 block leading-relaxed max-w-[150px]">
                Unlock premium templates, AI features and more.
              </span>
            </div>

            <button
              onClick={() => onOpenInstallModal && onOpenInstallModal()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-[10px] font-bold rounded-xl transition-all shadow-md shadow-indigo-600/35 active:scale-95 shrink-0 z-10 cursor-pointer flex items-center gap-1"
            >
              <span>Upgrade Now</span>
              <span>→</span>
            </button>
          </div>

        </div>
      </div>

      {/* 5. TEMPLATES SECTION (CATEGORY CARDS & ALL 12 VIDEOS GRID) */}
      <div className="flex flex-col gap-4" id="templates-section">
        
        {/* Header with Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900/60 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Templates</span>
            </h2>
            <div className="flex bg-[#050711] p-1 rounded-xl border border-slate-850">
              <button
                onClick={() => setActiveTabSection('categories')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeTabSection === 'categories' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Featured Categories
              </button>
              <button
                onClick={() => setActiveTabSection('all12')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeTabSection === 'all12' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                All 12 Video Clips (1-12.mp4)
              </button>
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="flex bg-[#050711] p-1 rounded-xl border border-slate-850 shadow">
            {(['All', 'Cinematic', 'Gaming', 'Vlog', 'Lifestyle'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-900/40 text-indigo-300 shadow ring-1 ring-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* View 1: 4 Featured Category Showcase Cards matching mockup */}
        {activeTabSection === 'categories' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORY_CARDS
              .filter((c) => selectedCategory === 'All' || c.category === selectedCategory)
              .map((card) => (
                <div
                  key={card.category}
                  onClick={() => {
                    onSelectProject(card.templateId);
                    onLaunchEditor();
                  }}
                  className="template-category-card group relative flex flex-col justify-between h-44 bg-[#050711] cursor-pointer"
                >
                  <div className="absolute inset-0 w-full h-full">
                    <VideoThumb
                      videoFile={card.videoFile}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-85 transition-all duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                  {/* Play Button Icon */}
                  <div className="relative z-10 p-3 flex justify-start pointer-events-none">
                    <div className="w-7 h-7 rounded-full bg-indigo-600/90 text-white flex items-center justify-center border border-white/40 shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-3 h-3 text-white fill-white translate-x-[0.5px]" />
                    </div>
                  </div>

                  {/* Title & Count */}
                  <div className="relative z-10 p-3.5 pt-0 pointer-events-none">
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {card.name}
                    </h4>
                    <span className="text-[9.5px] text-slate-400 block font-mono">
                      {card.count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* View 2: All 12 Video Templates Grid (1-12.mp4) */}
        {activeTabSection === 'all12' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered12Templates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => {
                  onSelectProject(tmpl.id);
                  onLaunchEditor();
                }}
                className="group relative flex flex-col justify-between h-48 rounded-2xl overflow-hidden border border-slate-850 hover:border-indigo-500/50 bg-[#050711] transition-all cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] hover:-translate-y-1"
              >
                <div className="absolute inset-0 w-full h-full">
                  <VideoThumb
                    videoFile={tmpl.videoFile}
                    className="w-full h-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

                {/* Top Badge Overlay */}
                <div className="relative z-10 flex items-center justify-between p-3.5 pointer-events-none">
                  <span className="px-2 py-0.5 bg-black/80 rounded border border-slate-800 text-[8px] font-extrabold text-indigo-400 uppercase tracking-wider">
                    {tmpl.category}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-black/80 px-2 py-0.5 rounded border border-slate-800">
                    {tmpl.videoFile}
                  </span>
                </div>

                {/* Bottom Title area */}
                <div className="relative z-10 p-3.5 pt-0 flex flex-col gap-1 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center border border-white/40 shadow group-hover:scale-110 transition-transform">
                      <Play className="w-2.5 h-2.5 fill-white text-white translate-x-[0.5px]" />
                    </div>
                    <span className="text-xs font-bold text-white block group-hover:text-indigo-400 transition-colors leading-none truncate">
                      {tmpl.name}
                    </span>
                  </div>

                  <span className="text-[9px] text-slate-400 leading-normal line-clamp-1">
                    {tmpl.description}
                  </span>

                  <div className="flex items-center justify-between mt-1 border-t border-slate-900 pt-1.5 text-[8.5px] font-mono text-slate-500">
                    <span className="text-indigo-400 font-semibold">{tmpl.tracks}</span>
                    <span>{tmpl.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 6. MOBILE-ONLY COSMIC PLANET CAPSULE (Matches Mockup left sidebar on mobile screen) */}
      <div className="flex md:hidden flex-col items-center gap-3 p-6 sidebar-capsule text-center relative overflow-hidden">
        <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden flex items-center justify-center shadow-2xl">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#020108] via-[#4d0c7b] to-[#ea00d9] shadow-[inset_-8px_-8px_24px_rgba(0,0,0,0.95),_0_0_30px_rgba(234,0,217,0.5)]" />
          <div className="absolute inset-0 rounded-full opacity-60 mix-blend-screen bg-cover animate-planet-clouds" style={{ backgroundImage: `url('${getAssetUrl('bg2.png')}')` }} />
          <div className="absolute w-40 h-3 border-t-2 border-b-2 border-indigo-400/50 rounded-full rotate-[-12deg] scale-y-[0.25] blur-[0.5px] pointer-events-none" />
        </div>

        <div className="flex flex-col gap-0.5 mt-1">
          <h4 className="text-base font-extrabold text-white leading-tight">
            Create <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Edit</span> <br />
            Inspire
          </h4>
          <span className="text-[10px] text-slate-400 leading-normal max-w-xs mt-1">
            Professional video editing tools for creators, by creators.
          </span>
        </div>

        <button 
          onClick={() => onOpenInstallModal && onOpenInstallModal()}
          className="w-full max-w-xs py-3 btn-cosmic-primary text-xs font-extrabold rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg mt-1"
        >
          <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
          <span>Upgrade to Pro</span>
        </button>

        <span className="text-[9px] text-slate-500 font-mono tracking-wide select-none">
          v2.8.0
        </span>
      </div>

      {/* 7. EDIT ANYWHERE LAPTOP FOOTER BANNER MATCHING MOCKUP */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#050711] via-[#090e24] to-[#050711] border border-slate-850 rounded-[28px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex flex-col gap-2 z-10 text-center md:text-left">
          <h3 className="text-base font-extrabold text-white">Edit Anywhere</h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Your projects, always with you. On any device, anytime.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-3 text-slate-400 mt-2">
            <Monitor className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
            <Apple className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
            <Smartphone className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
            <Cloud className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>

        {/* Laptop asset visual wrapper with real video playback */}
        <div className="relative w-full md:w-80 aspect-video rounded-xl overflow-hidden shadow-2xl shrink-0 group border border-slate-800">
          <video
            src={getAssetUrl('1.mp4')}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-indigo-950/20 pointer-events-none" />
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 border border-slate-800 rounded text-[9px] font-bold text-indigo-400">
            Realtime Sync
          </div>
        </div>
      </div>

    </div>
  );
}
