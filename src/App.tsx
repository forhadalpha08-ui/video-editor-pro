import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Project, 
  VideoClip, 
  AudioClip, 
  TextClip, 
  CaptionItem, 
  MediaAsset, 
  ProceduralType 
} from './types';

// Layout & Navigation
import TopNav from './components/layout/TopNav';
import LeftToolbar, { ToolType } from './components/layout/LeftToolbar';
import ShortcutsModal from './components/layout/ShortcutsModal';

// Media & Drawer Panels
import MediaPanel from './components/media/MediaPanel';
import AudioLibrary from './components/media/AudioLibrary';
import TextLibrary from './components/media/TextLibrary';
import ElementsLibrary from './components/media/ElementsLibrary';
import TransitionsLibrary from './components/media/TransitionsLibrary';
import EffectsLibrary from './components/media/EffectsLibrary';
import FiltersLibrary from './components/media/FiltersLibrary';
import CaptionsPanel from './components/media/CaptionsPanel';
import TemplatesPanel from './components/media/TemplatesPanel';
import SettingsPanel from './components/media/SettingsPanel';

// Main Center & Right Workspaces
import VideoPreview from './components/preview/VideoPreview';
import InspectorPanel from './components/inspector/InspectorPanel';
import Timeline from './components/timeline/Timeline';
import ExportModal from './components/export/ExportModal';
import Dashboard from './components/Dashboard';

import { 
  Home, 
  Sliders, 
  Sparkles, 
  Download, 
  Crown, 
  Compass, 
  Folder, 
  Film, 
  BookOpen,
  Plus
} from 'lucide-react';

// Real Template Projects
const ALL_PROJECTS: Project[] = [
  {
    id: 'template_1',
    name: 'Neon City Night Edit',
    category: 'Cinematic',
    resolution: '1080p',
    fps: 60,
    aspectRatio: '16:9',
    duration: 116,
    videoClips: [
      {
        id: 'v1_1',
        name: 'Neon Skyline (1.mp4)',
        type: 'video',
        startTime: 0,
        duration: 35,
        sourceStart: 0,
        sourceDuration: 60,
        speed: 1.0,
        volume: 100,
        trackId: 'v1',
        videoUrl: '/1.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80',
        scale: 100,
        positionX: 50,
        positionY: 50,
        rotation: 0,
        opacity: 100,
        colorGrading: {
          exposure: 0,
          brightness: 0,
          contrast: 10,
          highlights: 0,
          shadows: 0,
          saturation: 15,
          temperature: 5,
          tint: 0,
          sharpness: 0,
          vignette: 15,
          filterPreset: 'cyberpunk_neon',
          filterIntensity: 100,
        },
      },
      {
        id: 'v1_2',
        name: 'Cyber Streets (7.mp4)',
        type: 'video',
        startTime: 35,
        duration: 45,
        sourceStart: 0,
        sourceDuration: 55,
        speed: 1.0,
        volume: 100,
        trackId: 'v1',
        videoUrl: '/7.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
        scale: 100,
        positionX: 50,
        positionY: 50,
        rotation: 0,
        opacity: 100,
        colorGrading: {
          exposure: 0,
          brightness: 0,
          contrast: 5,
          highlights: 0,
          shadows: 0,
          saturation: 10,
          temperature: 0,
          tint: 0,
          sharpness: 0,
          vignette: 10,
          filterPreset: 'cinematic_teal_orange',
          filterIntensity: 100,
        },
      },
    ],
    audioClips: [
      {
        id: 'a1_1',
        name: 'Synthwave Odyssey',
        type: 'audio',
        startTime: 0,
        duration: 110,
        sourceStart: 0,
        volume: 100,
        pan: 0,
        audioStyle: 'synth_wave',
        trackId: 'a1',
      },
    ],
    textClips: [
      {
        id: 't1_1',
        name: 'Title Neon',
        type: 'text',
        startTime: 0,
        duration: 25,
        text: 'NEON HORIZON',
        color: '#00FFFF',
        fontSize: 48,
        fontFamily: 'JetBrains Mono',
        positionX: 50,
        positionY: 50,
        opacity: 100,
        animation: 'pop',
        trackId: 't1',
      },
    ],
    captions: [],
    transitions: [],
  },
  {
    id: 'template_2',
    name: 'Cinematic Travel Vlog',
    category: 'Vlog',
    resolution: '1080p',
    fps: 60,
    aspectRatio: '16:9',
    duration: 204,
    videoClips: [
      {
        id: 'v2_1',
        name: 'Alpine Vista (2.mp4)',
        type: 'video',
        startTime: 0,
        duration: 55,
        sourceStart: 0,
        sourceDuration: 70,
        speed: 1.0,
        volume: 100,
        trackId: 'v1',
        videoUrl: '/2.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
        scale: 100,
        positionX: 50,
        positionY: 50,
        rotation: 0,
        opacity: 100,
        colorGrading: {
          exposure: 0,
          brightness: 0,
          contrast: 5,
          highlights: 0,
          shadows: 0,
          saturation: 10,
          temperature: -5,
          tint: 0,
          sharpness: 0,
          vignette: 15,
          filterPreset: 'cinematic_teal_orange',
          filterIntensity: 100,
        },
      },
      {
        id: 'v2_2',
        name: 'Forest Trail (3.mp4)',
        type: 'video',
        startTime: 55,
        duration: 65,
        sourceStart: 0,
        sourceDuration: 80,
        speed: 1.0,
        volume: 100,
        trackId: 'v1',
        videoUrl: '/3.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
        scale: 100,
        positionX: 50,
        positionY: 50,
        rotation: 0,
        opacity: 100,
        colorGrading: {
          exposure: 0,
          brightness: 0,
          contrast: 0,
          highlights: 0,
          shadows: 0,
          saturation: 5,
          temperature: 0,
          tint: 0,
          sharpness: 0,
          vignette: 10,
          filterPreset: 'moody_dark',
          filterIntensity: 100,
        },
      },
    ],
    audioClips: [
      {
        id: 'a2_1',
        name: 'Acoustic Wanderer',
        type: 'audio',
        startTime: 0,
        duration: 180,
        sourceStart: 0,
        volume: 100,
        pan: 0,
        audioStyle: 'cinematic_score',
        trackId: 'a1',
      },
    ],
    textClips: [
      {
        id: 't2_1',
        name: 'Vlog Title',
        type: 'text',
        startTime: 0,
        duration: 30,
        text: 'THE WILDERNESS AWAITS',
        color: '#F8FAFC',
        fontSize: 42,
        fontFamily: 'Plus Jakarta Sans',
        positionX: 50,
        positionY: 50,
        opacity: 100,
        animation: 'cinematic',
        trackId: 't1',
      },
    ],
    captions: [],
    transitions: [],
  },
  {
    id: 'template_4',
    name: 'Product Commercial Promo',
    category: 'Lifestyle',
    resolution: '1080p',
    fps: 60,
    aspectRatio: '16:9',
    duration: 48,
    videoClips: [
      {
        id: 'v4_1',
        name: 'Product Hero (4.mp4)',
        type: 'video',
        startTime: 0,
        duration: 48,
        sourceStart: 0,
        sourceDuration: 60,
        speed: 1.0,
        volume: 100,
        trackId: 'v1',
        videoUrl: '/4.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        scale: 100,
        positionX: 50,
        positionY: 50,
        rotation: 0,
        opacity: 100,
        colorGrading: {
          exposure: 0,
          brightness: 0,
          contrast: 10,
          highlights: 0,
          shadows: 0,
          saturation: 10,
          temperature: 0,
          tint: 0,
          sharpness: 0,
          vignette: 10,
          filterPreset: 'portrait_soft',
          filterIntensity: 100,
        },
      },
    ],
    audioClips: [
      {
        id: 'a4_1',
        name: 'Upbeat Modern Groove',
        type: 'audio',
        startTime: 0,
        duration: 48,
        sourceStart: 0,
        volume: 100,
        pan: 0,
        audioStyle: 'beat_loop',
        trackId: 'a1',
      },
    ],
    textClips: [
      {
        id: 't4_1',
        name: 'Commercial Tag',
        type: 'text',
        startTime: 0,
        duration: 20,
        text: 'INNOVATION REDEFINED',
        color: '#F8FAFC',
        fontSize: 44,
        fontFamily: 'Plus Jakarta Sans',
        positionX: 50,
        positionY: 80,
        opacity: 100,
        animation: 'slide',
        trackId: 't1',
      },
    ],
    captions: [],
    transitions: [],
  },
];

// Initial Media Assets
const INITIAL_ASSETS: MediaAsset[] = [
  {
    id: 'asset_mountain',
    name: 'mountain.mp4',
    type: 'video',
    url: '/1.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
    duration: 24,
    format: 'MP4',
  },
  {
    id: 'asset_city',
    name: 'city.mp4',
    type: 'video',
    url: '/2.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80',
    duration: 18,
    format: 'MP4',
  },
  {
    id: 'asset_forest',
    name: 'forest.mp4',
    type: 'video',
    url: '/3.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
    duration: 32,
    format: 'MP4',
  },
  {
    id: 'asset_girl',
    name: 'girl.mp4',
    type: 'video',
    url: '/4.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    duration: 12,
    format: 'MP4',
  },
  {
    id: 'asset_sunset',
    name: 'sunset.mp4',
    type: 'video',
    url: '/5.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
    duration: 20,
    format: 'MP4',
  },
  {
    id: 'asset_space',
    name: 'space.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&auto=format&fit=crop&q=80',
    duration: 15,
    format: 'JPG',
  },
  {
    id: 'asset_bg_music',
    name: 'background.mp3',
    type: 'audio',
    url: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    duration: 165,
    format: 'MP3',
  },
  {
    id: 'asset_texture',
    name: 'texture.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&auto=format&fit=crop&q=80',
    duration: 10,
    format: 'JPG',
  },
  {
    id: 'asset_car',
    name: 'car.mp4',
    type: 'video',
    url: '/6.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80',
    duration: 10,
    format: 'MP4',
  },
];

export default function App() {
  // Main View Navigation: 'home' (Dashboard) | 'editor' (VEdit Pro Workspace)
  const [activeMainTab, setActiveMainTab] = useState<'home' | 'editor' | 'templates' | 'tutorials'>('home');
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>(ALL_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState<string>(ALL_PROJECTS[0].id);
  const project = projects.find(p => p.id === currentProjectId) || projects[0];

  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_ASSETS);
  
  // History Stacks for Undo / Redo
  const [historyStack, setHistoryStack] = useState<Project[]>([]);
  const [redoStack, setRedoStack] = useState<Project[]>([]);

  const recordHistory = useCallback((current: Project) => {
    setHistoryStack((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(current))]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(project))]);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setProjects(prev => prev.map(p => p.id === previous.id ? previous : p));
  }, [historyStack, project]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistoryStack((prev) => [...prev, JSON.parse(JSON.stringify(project))]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setProjects(prev => prev.map(p => p.id === next.id ? next : p));
  }, [redoStack, project]);

  // Editor Internal Tool
  const [activeTool, setActiveTool] = useState<ToolType>('media');
  const [selectedClip, setSelectedClip] = useState<{ id: string; type: 'video' | 'audio' | 'text' } | null>(
    project.videoClips[0] ? { id: project.videoClips[0].id, type: 'video' } : null
  );

  // Playback State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Project Mutations
  const updateCurrentProject = (mutator: (prev: Project) => Project) => {
    recordHistory(project);
    const updated = mutator(project);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleUpdateVideoClips = (clips: VideoClip[]) => {
    updateCurrentProject(prev => ({ ...prev, videoClips: clips }));
  };

  const handleUpdateAudioClips = (clips: AudioClip[]) => {
    updateCurrentProject(prev => ({ ...prev, audioClips: clips }));
  };

  const handleUpdateTextClips = (clips: TextClip[]) => {
    updateCurrentProject(prev => ({ ...prev, textClips: clips }));
  };

  // Split Clip
  const handleSplitClip = () => {
    if (!selectedClip) return;
    const { id, type } = selectedClip;

    if (type === 'video') {
      const clip = project.videoClips.find(c => c.id === id);
      if (!clip || currentTime <= clip.startTime || currentTime >= clip.startTime + clip.duration) return;

      const firstPartDuration = currentTime - clip.startTime;
      const secondPartDuration = clip.duration - firstPartDuration;

      const clip1: VideoClip = { ...clip, duration: firstPartDuration };
      const clip2: VideoClip = {
        ...clip,
        id: `v_${Date.now()}`,
        name: `${clip.name} (Part 2)`,
        startTime: currentTime,
        duration: secondPartDuration,
        sourceStart: clip.sourceStart + firstPartDuration * clip.speed,
      };

      const updated = project.videoClips.map(c => c.id === id ? clip1 : c).concat(clip2);
      handleUpdateVideoClips(updated.sort((a, b) => a.startTime - b.startTime));
      setSelectedClip({ id: clip2.id, type: 'video' });
    }
  };

  // Delete Clip
  const handleDeleteClip = () => {
    if (!selectedClip) return;
    const { id, type } = selectedClip;

    if (type === 'video') {
      handleUpdateVideoClips(project.videoClips.filter(c => c.id !== id));
    } else if (type === 'audio') {
      handleUpdateAudioClips(project.audioClips.filter(c => c.id !== id));
    } else if (type === 'text') {
      handleUpdateTextClips(project.textClips.filter(c => c.id !== id));
    }
    setSelectedClip(null);
  };

  // Duplicate Clip
  const handleDuplicateClip = () => {
    if (!selectedClip) return;
    const { id, type } = selectedClip;

    if (type === 'video') {
      const clip = project.videoClips.find(c => c.id === id);
      if (clip) {
        const copy: VideoClip = {
          ...clip,
          id: `v_copy_${Date.now()}`,
          name: `${clip.name} Copy`,
          startTime: clip.startTime + clip.duration,
        };
        handleUpdateVideoClips([...project.videoClips, copy].sort((a, b) => a.startTime - b.startTime));
        setSelectedClip({ id: copy.id, type: 'video' });
      }
    }
  };

  // Add Asset directly to Timeline
  const handleAddAssetToTimeline = (asset: MediaAsset) => {
    if (asset.type === 'video' || asset.type === 'image') {
      const newClip: VideoClip = {
        id: `v_${Date.now()}`,
        name: asset.name,
        type: 'video',
        startTime: currentTime,
        duration: asset.duration || 10,
        sourceStart: 0,
        sourceDuration: asset.duration || 10,
        speed: 1.0,
        volume: 100,
        trackId: 'v1',
        videoUrl: asset.type === 'video' ? asset.url : undefined,
        thumbnailUrl: asset.thumbnailUrl || asset.url,
        scale: 100,
        positionX: 50,
        positionY: 50,
        rotation: 0,
        opacity: 100,
        colorGrading: {
          exposure: 0,
          brightness: 0,
          contrast: 0,
          highlights: 0,
          shadows: 0,
          saturation: 0,
          temperature: 0,
          tint: 0,
          sharpness: 0,
          vignette: 0,
          filterPreset: 'none',
          filterIntensity: 100,
        },
      };
      handleUpdateVideoClips([...project.videoClips, newClip].sort((a, b) => a.startTime - b.startTime));
      setSelectedClip({ id: newClip.id, type: 'video' });
    } else if (asset.type === 'audio') {
      const newAudio: AudioClip = {
        id: `a_${Date.now()}`,
        name: asset.name,
        type: 'audio',
        startTime: currentTime,
        duration: asset.duration || 60,
        sourceStart: 0,
        volume: 100,
        pan: 0,
        audioStyle: 'cinematic_score',
        audioUrl: asset.url,
        trackId: 'a1',
      };
      handleUpdateAudioClips([...project.audioClips, newAudio].sort((a, b) => a.startTime - b.startTime));
      setSelectedClip({ id: newAudio.id, type: 'audio' });
    }
  };

  // File Upload
  const handleImportFiles = (fileList: FileList) => {
    const newAssets: MediaAsset[] = [];
    Array.from(fileList).forEach((file) => {
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      const url = URL.createObjectURL(file);

      newAssets.push({
        id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
        url,
        thumbnailUrl: isVideo 
          ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80'
          : isAudio 
            ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'
            : url,
        duration: 15,
        format: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      });
    });

    setAssets((prev) => [...newAssets, ...prev]);
  };

  const handleSelectProjectAndEdit = (projectId: string) => {
    setCurrentProjectId(projectId);
    const p = projects.find(item => item.id === projectId);
    if (p && p.videoClips[0]) {
      setSelectedClip({ id: p.videoClips[0].id, type: 'video' });
    }
    setActiveMainTab('editor');
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 's' || e.key === 'S' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        handleSplitClip();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteClip();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateClip();
      } else if (e.key === '?') {
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const activeVideoClip = selectedClip?.type === 'video' 
    ? project.videoClips.find(c => c.id === selectedClip.id) 
    : null;

  const activeAudioClip = selectedClip?.type === 'audio' 
    ? project.audioClips.find(c => c.id === selectedClip.id) 
    : null;

  const activeTextClip = selectedClip?.type === 'text' 
    ? project.textClips.find(c => c.id === selectedClip.id) 
    : null;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050712] text-[#F8FAFC] overflow-hidden select-none font-sans">
      
      {/* If Home / Dashboard view is active */}
      {activeMainTab !== 'editor' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Bar for Dashboard View */}
          <header className="h-16 bg-[#090D1C] border-b border-white/8 px-6 flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#3B82F6] p-[1.5px] shadow-lg shadow-purple-900/40 flex items-center justify-center">
                <div className="w-full h-full bg-[#090D1C] rounded-[10px] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current text-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4l8 16 8-16" className="text-white" />
                    <path d="M12 20l3-6h-6l3 6" className="text-[#38BDF8]" fill="#38BDF8" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">VEdit</span>
                <span className="px-2 py-0.5 text-[10.5px] font-black uppercase tracking-wider rounded bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40">
                  Pro Suite
                </span>
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-[#0D1224] p-1 rounded-xl border border-white/8">
              <button
                onClick={() => setActiveMainTab('home')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMainTab === 'home' ? 'bg-[#7C3AED] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveMainTab('templates')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMainTab === 'templates' ? 'bg-[#7C3AED] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveMainTab('editor')}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Open Project Editor</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveMainTab('editor')}
                className="btn-vedit-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xl active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
          </header>

          {/* Scrollable Dashboard Body */}
          <div className="flex-1 overflow-y-auto">
            <Dashboard
              projects={projects}
              activeProjectId={currentProjectId}
              onSelectProject={handleSelectProjectAndEdit}
              onLaunchEditor={() => setActiveMainTab('editor')}
              onAddVideoClip={() => {
                handleSelectProjectAndEdit(currentProjectId);
              }}
              onUploadVideoFile={(file) => {
                const url = URL.createObjectURL(file);
                const newAsset: MediaAsset = {
                  id: `asset_${Date.now()}`,
                  name: file.name,
                  type: 'video',
                  url,
                  thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
                  duration: 20,
                  format: file.name.split('.').pop()?.toUpperCase() || 'MP4',
                };
                setAssets(prev => [newAsset, ...prev]);
                handleSelectProjectAndEdit(currentProjectId);
              }}
            />
          </div>

        </div>
      ) : (
        /* VEdit Pro Dedicated Project Editor Workspace */
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* 1. Top Navigation Bar */}
          <TopNav
            project={project}
            onUpdateProjectName={(name) => updateCurrentProject(prev => ({ ...prev, name }))}
            onUpdateResolution={(res) => updateCurrentProject(prev => ({ ...prev, resolution: res }))}
            onUpdateFps={(fps) => updateCurrentProject(prev => ({ ...prev, fps }))}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyStack.length > 0}
            canRedo={redoStack.length > 0}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            onGoHome={() => setActiveMainTab('home')}
          />

          {/* 2. Main Middle Workspace: Left Toolbar + Drawer + Video Preview + Inspector */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Vertical Dock */}
            <LeftToolbar
              activeTool={activeTool}
              onSelectTool={setActiveTool}
            />

            {/* Tool Drawer Panel */}
            {activeTool === 'media' && (
              <MediaPanel
                assets={assets}
                onAddAssetToTimeline={handleAddAssetToTimeline}
                onImportFiles={handleImportFiles}
                onDeleteAsset={(id) => setAssets(prev => prev.filter(a => a.id !== id))}
                onToggleFavorite={(id) => setAssets(prev => prev.map(a => a.id === id ? { ...a, favorite: !a.favorite } : a))}
              />
            )}
            {activeTool === 'audio' && (
              <AudioLibrary
                onAddAudioClip={(clip) => {
                  const newClip: AudioClip = { ...clip, id: `a_${Date.now()}` };
                  handleUpdateAudioClips([...project.audioClips, newClip]);
                }}
              />
            )}
            {activeTool === 'text' && (
              <TextLibrary
                onAddTextClip={(clip) => {
                  const newClip: TextClip = { ...clip, id: `t_${Date.now()}` };
                  handleUpdateTextClips([...project.textClips, newClip]);
                }}
              />
            )}
            {activeTool === 'elements' && (
              <ElementsLibrary
                onAddElement={(clip) => {
                  const newClip: TextClip = { ...clip, id: `el_${Date.now()}` };
                  handleUpdateTextClips([...project.textClips, newClip]);
                }}
              />
            )}
            {activeTool === 'transitions' && (
              <TransitionsLibrary
                onSelectTransition={(type) => {
                  if (project.videoClips.length >= 2) {
                    const newTrans = {
                      id: `trans_${Date.now()}`,
                      atTime: currentTime,
                      type,
                      duration: 0.8,
                      fromClipId: project.videoClips[0].id,
                      toClipId: project.videoClips[1].id,
                    };
                    updateCurrentProject(prev => ({ ...prev, transitions: [...prev.transitions, newTrans] }));
                  }
                }}
              />
            )}
            {activeTool === 'effects' && (
              <EffectsLibrary
                onApplyEffect={(effect) => {
                  if (activeVideoClip) {
                    handleUpdateVideoClips(project.videoClips.map(c => c.id === activeVideoClip.id ? { ...c, effect } : c));
                  }
                }}
              />
            )}
            {activeTool === 'filters' && (
              <FiltersLibrary
                activeFilter={activeVideoClip?.colorGrading?.filterPreset || 'none'}
                onSelectFilter={(preset) => {
                  if (activeVideoClip) {
                    const newCg = { ...activeVideoClip.colorGrading, filterPreset: preset };
                    handleUpdateVideoClips(project.videoClips.map(c => c.id === activeVideoClip.id ? { ...c, colorGrading: newCg } : c));
                  }
                }}
              />
            )}
            {activeTool === 'captions' && (
              <CaptionsPanel
                captions={project.captions || []}
                onAddCaption={(cap) => updateCurrentProject(prev => ({ ...prev, captions: [...(prev.captions || []), cap] }))}
                onUpdateCaption={(id, text) => updateCurrentProject(prev => ({
                  ...prev,
                  captions: (prev.captions || []).map(c => c.id === id ? { ...c, text } : c)
                }))}
                onDeleteCaption={(id) => updateCurrentProject(prev => ({
                  ...prev,
                  captions: (prev.captions || []).filter(c => c.id !== id)
                }))}
                onAutoGenerateCaptions={() => {
                  updateCurrentProject(prev => ({
                    ...prev,
                    captions: [
                      { id: 'c1', startTime: 0, endTime: 4.5, text: 'Welcome to VEdit Pro video suite.' },
                      { id: 'c2', startTime: 5, endTime: 10, text: 'Experience smooth 60FPS timeline editing.' },
                    ]
                  }));
                }}
              />
            )}
            {activeTool === 'templates' && (
              <TemplatesPanel
                currentProjectId={project.id}
                onSelectTemplate={(id) => {
                  handleSelectProjectAndEdit(id);
                }}
              />
            )}
            {activeTool === 'settings' && (
              <SettingsPanel
                project={project}
                onClearCache={() => {}}
              />
            )}

            {/* Center: Video Preview */}
            <div className="flex-1 p-3 flex flex-col overflow-hidden bg-[#050712]">
              <VideoPreview
                project={project}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onTimeUpdate={setCurrentTime}
                onTogglePlay={setIsPlaying}
                aspectRatio={project.aspectRatio}
                onChangeAspectRatio={(ratio) => updateCurrentProject(prev => ({ ...prev, aspectRatio: ratio }))}
              />
            </div>

            {/* Right: Inspector Panel */}
            <InspectorPanel
              selectedVideoClip={activeVideoClip}
              selectedAudioClip={activeAudioClip}
              selectedTextClip={activeTextClip}
              onUpdateVideoClip={(updated) => handleUpdateVideoClips(project.videoClips.map(c => c.id === updated.id ? updated : c))}
              onUpdateAudioClip={(updated) => handleUpdateAudioClips(project.audioClips.map(c => c.id === updated.id ? updated : c))}
              onUpdateTextClip={(updated) => handleUpdateTextClips(project.textClips.map(c => c.id === updated.id ? updated : c))}
            />

          </div>

          {/* 3. Bottom Multi-Track Timeline */}
          <Timeline
            project={project}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            selectedClipId={selectedClip?.id || null}
            selectedClipType={selectedClip?.type || null}
            onSelectClip={(id, type) => setSelectedClip(id ? { id, type } : null)}
            onUpdateVideoClips={handleUpdateVideoClips}
            onUpdateAudioClips={handleUpdateAudioClips}
            onUpdateTextClips={handleUpdateTextClips}
            onSplitClip={handleSplitClip}
            onDeleteClip={handleDeleteClip}
            onDuplicateClip={handleDuplicateClip}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyStack.length > 0}
            canRedo={redoStack.length > 0}
          />

        </div>
      )}

      {/* Floating Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-3 left-4 right-4 z-40 md:hidden bg-[#090D1C]/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-3 py-2 flex items-center justify-around shadow-2xl shadow-black/80">
        <button
          onClick={() => setActiveMainTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeMainTab === 'home' ? 'text-[#A78BFA] font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px]">Home</span>
        </button>

        <button
          onClick={() => setActiveMainTab('editor')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeMainTab === 'editor' ? 'text-[#A78BFA] font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[9px]">Editor</span>
        </button>

        <button
          onClick={() => setIsExportOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all"
        >
          <Download className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-[9px]">Export</span>
        </button>
      </nav>

      {/* Export Master Modal */}
      <ExportModal
        project={project}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Keyboard Shortcuts Cheat Sheet */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

    </div>
  );
}
