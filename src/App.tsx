import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Smartphone,
  Tablet,
  Laptop,
  Plus,
  Play,
  Settings,
  Sliders,
  Type,
  Music,
  Download,
  RotateCcw,
  BookOpen,
  Info,
  Folder,
  Layers,
  Cloud,
  History,
  Home,
  Crown,
  Menu,
  X
} from 'lucide-react';
import { Project, VideoClip, AudioClip, TextClip, TimelineTransition, ProceduralType } from './types';
import { projectPresets, createDefaultGrading } from './utils/projectPresets';
import PreviewPlayer from './components/PreviewPlayer';
import Timeline from './components/Timeline';
import ColorGrading from './components/ColorGrading';
import ClipControls from './components/ClipControls';
import TransitionsDrawer from './components/TransitionsDrawer';
import ExportModal from './components/ExportModal';
import InstallModal from './components/InstallModal';
import Dashboard from './components/Dashboard';
import UserProfileModal from './components/UserProfileModal';

export default function App() {
  // Device layout viewer choices: 'mobile' | 'tablet' | 'desktop'
  const [deviceLayout, setDeviceLayout] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Sidebar Tab Navigation: 'home' (the beautiful mockup dashboard) | 'editor' (interactive multi-track tool)
  const [activeSidebarTab, setActiveSidebarTab] = useState<'home' | 'editor'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Active projects list
  const [projects, setProjects] = useState<Project[]>(projectPresets);
  const [activeProjectId, setActiveProjectId] = useState<string>('template_1');
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Active play state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Selections
  const [selectedClip, setSelectedClip] = useState<{ id: string; type: 'video' | 'audio' | 'text' } | null>(null);
  const [activeTransitionId, setActiveTransitionId] = useState<string | null>(null);

  // Gestural HUD factors passed down to player
  const [brightnessOverride, setBrightnessOverride] = useState<number>(0);
  const [globalVolume, setGlobalVolume] = useState<number>(55);
  const [globalMotionBlur, setGlobalMotionBlur] = useState<boolean>(true);

  // Track settings (Mute, Lock)
  const [mutedTracks, setMutedTracks] = useState<Record<string, boolean>>({ v2: false, v1: false, t1: false, a1: false });
  const [lockedTracks, setLockedTracks] = useState<Record<string, boolean>>({ v2: false, v1: false, t1: false, a1: false });

  const handleToggleMuteTrack = (trackId: any) => {
    setMutedTracks((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  const handleToggleLockTrack = (trackId: any) => {
    setLockedTracks((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  // UI state toggles
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'grading' | 'inspector' | 'tutorials'>('grading');

  // Retrieve active project details
  const project = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Auto-select first clip of active project on boot
  useEffect(() => {
    if (project.videoClips.length > 0) {
      setSelectedClip({ id: project.videoClips[0].id, type: 'video' });
    }
    setCurrentTime(0);
    setIsPlaying(false);
  }, [activeProjectId]);

  // Handle template selection
  const handleSelectTemplate = (id: string) => {
    setActiveProjectId(id);
    setSelectedClip(null);
    setActiveTransitionId(null);
  };

  // Safe clip retrieval helpers
  const getSelectedClipDetails = () => {
    if (!selectedClip) return null;
    if (selectedClip.type === 'video') {
      return project.videoClips.find((c) => c.id === selectedClip.id) || null;
    }
    if (selectedClip.type === 'audio') {
      return project.audioClips.find((c) => c.id === selectedClip.id) || null;
    }
    if (selectedClip.type === 'text') {
      return project.textClips.find((c) => c.id === selectedClip.id) || null;
    }
    return null;
  };

  const activeClipDetails = getSelectedClipDetails();

  // History undo / redo stacks for professional editing workflow
  const [historyStack, setHistoryStack] = useState<Project[]>([]);
  const [redoStack, setRedoStack] = useState<Project[]>([]);

  const pushHistorySnapshot = (prevProject: Project) => {
    setHistoryStack((prev) => [...prev.slice(-40), JSON.parse(JSON.stringify(prevProject))]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(project))]);
    setHistoryStack((prev) => prev.slice(0, -1));
    setProjects((prev) => prev.map((p) => (p.id === previous.id ? previous : p)));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistoryStack((prev) => [...prev, JSON.parse(JSON.stringify(project))]);
    setRedoStack((prev) => prev.slice(0, -1));
    setProjects((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  };

  // Multi-track setters
  const updateVideoClips = (updated: VideoClip[]) => {
    pushHistorySnapshot(project);
    const updatedProjects = projects.map((p) =>
      p.id === project.id ? { ...p, videoClips: updated } : p
    );
    setProjects(updatedProjects);
  };

  const updateAudioClips = (updated: AudioClip[]) => {
    pushHistorySnapshot(project);
    const updatedProjects = projects.map((p) =>
      p.id === project.id ? { ...p, audioClips: updated } : p
    );
    setProjects(updatedProjects);
  };

  const updateTextClips = (updated: TextClip[]) => {
    pushHistorySnapshot(project);
    const updatedProjects = projects.map((p) =>
      p.id === project.id ? { ...p, textClips: updated } : p
    );
    setProjects(updatedProjects);
  };

  const handleUpdateMarkers = (updatedMarkers: any[]) => {
    const updatedProjects = projects.map((p) =>
      p.id === project.id ? { ...p, markers: updatedMarkers } : p
    );
    setProjects(updatedProjects);
  };

  // One-click Aspect Ratio changer on active video clip
  const handleUpdateClipAspectRatio = (aspectRatio: '16:9' | '9:16' | '1:1' | '4:3' | '2.39:1' | 'free') => {
    if (selectedClip && selectedClip.type === 'video') {
      const updated = project.videoClips.map((c) =>
        c.id === selectedClip.id ? { ...c, aspectRatio } : c
      );
      updateVideoClips(updated);
    } else if (project.videoClips.length > 0) {
      const activeClip = project.videoClips.find(
        (c) => currentTime >= c.startTime && currentTime < c.startTime + c.duration
      ) || project.videoClips[0];
      const updated = project.videoClips.map((c) =>
        c.id === activeClip.id ? { ...c, aspectRatio } : c
      );
      updateVideoClips(updated);
    }
  };

  // One-click Speed changer on active video clip
  const handleUpdateClipSpeed = (speed: number) => {
    if (selectedClip && selectedClip.type === 'video') {
      const updated = project.videoClips.map((c) =>
        c.id === selectedClip.id ? { ...c, speed } : c
      );
      updateVideoClips(updated);
    } else if (project.videoClips.length > 0) {
      const activeClip = project.videoClips.find(
        (c) => currentTime >= c.startTime && currentTime < c.startTime + c.duration
      ) || project.videoClips[0];
      const updated = project.videoClips.map((c) =>
        c.id === activeClip.id ? { ...c, speed } : c
      );
      updateVideoClips(updated);
    }
  };

  // Add caption text overlay at playhead
  const handleAddTextOverlay = () => {
    const newText: TextClip = {
      id: `text_${Date.now()}`,
      name: 'Dynamic Title',
      type: 'text',
      startTime: currentTime,
      duration: 3.5,
      text: 'EDIT TITLE',
      color: '#00ffea',
      fontSize: 26,
      positionY: 50,
      style: 'neon',
    };

    const updatedText = [...project.textClips, newText];
    updateTextClips(updatedText);
    setSelectedClip({ id: newText.id, type: 'text' });
    setActiveWorkspaceTab('inspector');
  };

  // Add random B-roll video clip at playhead
  const handleAddVideoClip = (proceduralType: ProceduralType) => {
    // Look for last clip end time
    let start = currentTime;
    if (project.videoClips.length > 0) {
      const lastClip = project.videoClips[project.videoClips.length - 1];
      start = lastClip.startTime + lastClip.duration;
    }

    const names: Record<ProceduralType, string> = {
      vaporwave_sunset: 'Alpine Mountain Clip (2.mp4)',
      cyberpunk_grid: 'Cyberpunk Tokyo Scene (1.mp4)',
      geometric_warp: 'Velocity Street Drift (3.mp4)',
      nebula_ocean: 'Cosmic Deep Space (12.mp4)',
    };

    const videoUrls: Record<ProceduralType, string> = {
      vaporwave_sunset: '/2.mp4',
      cyberpunk_grid: '/1.mp4',
      geometric_warp: '/3.mp4',
      nebula_ocean: '/12.mp4',
    };

    const thumbnailUrls: Record<ProceduralType, string> = {
      vaporwave_sunset: '/bg2.png',
      cyberpunk_grid: '/bg99.png',
      geometric_warp: '/bg2-1.png',
      nebula_ocean: '/bg2.png',
    };

    const newVideo: VideoClip = {
      id: `v_clip_${Date.now()}`,
      name: names[proceduralType],
      type: 'video',
      proceduralType,
      startTime: start,
      duration: 6.0,
      sourceStart: 0,
      sourceDuration: 30,
      speed: 1.0,
      colorGrading: createDefaultGrading(),
      volume: 100,
      videoUrl: videoUrls[proceduralType],
      thumbnailUrl: thumbnailUrls[proceduralType],
    };

    const updatedVideo = [...project.videoClips, newVideo].sort((a, b) => a.startTime - b.startTime);
    const maxEnd = Math.max(...updatedVideo.map((c) => c.startTime + c.duration), project.duration);
    
    pushHistorySnapshot(project);
    const updatedProjects = projects.map((p) =>
      p.id === project.id
        ? { ...p, videoClips: updatedVideo, duration: Math.round(maxEnd) }
        : p
    );
    setProjects(updatedProjects);
    setSelectedClip({ id: newVideo.id, type: 'video' });
    setActiveWorkspaceTab('inspector');
  };

  // Add Transition settings
  const handleAddTransition = (fromClipId: string, toClipId: string) => {
    const fromClip = project.videoClips.find((c) => c.id === fromClipId);
    if (!fromClip) return;

    const boundaryTime = fromClip.startTime + fromClip.duration;

    const newTrans: TimelineTransition = {
      id: `trans_${Date.now()}`,
      atTime: boundaryTime,
      type: 'cross_dissolve',
      duration: 0.8,
      fromClipId,
      toClipId,
    };

    pushHistorySnapshot(project);
    const updatedProjects = projects.map((p) =>
      p.id === project.id ? { ...p, transitions: [...p.transitions, newTrans] } : p
    );
    setProjects(updatedProjects);
    setActiveTransitionId(newTrans.id);
  };

  // Split/Cut selected clip at playhead (CapCut smart split)
  const handleSplitClip = () => {
    let targetClip = selectedClip;
    if (!targetClip) {
      const activeVid = project.videoClips.find(
        (c) => currentTime > c.startTime && currentTime < c.startTime + c.duration
      );
      if (activeVid) {
        targetClip = { id: activeVid.id, type: 'video' };
      } else {
        const activeAud = project.audioClips.find(
          (c) => currentTime > c.startTime && currentTime < c.startTime + c.duration
        );
        if (activeAud) targetClip = { id: activeAud.id, type: 'audio' };
      }
    }

    if (!targetClip) return;

    if (targetClip.type === 'video') {
      const clip = project.videoClips.find((c) => c.id === targetClip.id);
      if (!clip) return;

      if (currentTime > clip.startTime && currentTime < clip.startTime + clip.duration) {
        const firstPartDuration = currentTime - clip.startTime;
        const secondPartDuration = clip.duration - firstPartDuration;

        const firstPart: VideoClip = {
          ...clip,
          duration: firstPartDuration,
        };

        const secondPart: VideoClip = {
          ...clip,
          id: `v_clip_split_${Date.now()}`,
          name: `${clip.name} (Part 2)`,
          startTime: currentTime,
          duration: secondPartDuration,
          sourceStart: (clip.sourceStart || 0) + (firstPartDuration * (clip.speed || 1.0)),
        };

        const filtered = project.videoClips.filter((c) => c.id !== clip.id);
        const updated = [...filtered, firstPart, secondPart].sort((a, b) => a.startTime - b.startTime);
        updateVideoClips(updated);
        setSelectedClip({ id: secondPart.id, type: 'video' });
      }
    } else if (targetClip.type === 'audio') {
      const clip = project.audioClips.find((c) => c.id === targetClip.id);
      if (!clip) return;

      if (currentTime > clip.startTime && currentTime < clip.startTime + clip.duration) {
        const firstPartDuration = currentTime - clip.startTime;
        const secondPartDuration = clip.duration - firstPartDuration;

        const firstPart: AudioClip = {
          ...clip,
          duration: firstPartDuration,
        };

        const secondPart: AudioClip = {
          ...clip,
          id: `a_clip_split_${Date.now()}`,
          startTime: currentTime,
          duration: secondPartDuration,
        };

        const filtered = project.audioClips.filter((c) => c.id !== clip.id);
        const updated = [...filtered, firstPart, secondPart].sort((a, b) => a.startTime - b.startTime);
        updateAudioClips(updated);
        setSelectedClip({ id: secondPart.id, type: 'audio' });
      }
    } else if (targetClip.type === 'text') {
      const clip = project.textClips.find((c) => c.id === targetClip.id);
      if (!clip) return;

      if (currentTime > clip.startTime && currentTime < clip.startTime + clip.duration) {
        const firstPartDuration = currentTime - clip.startTime;
        const secondPartDuration = clip.duration - firstPartDuration;

        const firstPart: TextClip = {
          ...clip,
          duration: firstPartDuration,
        };

        const secondPart: TextClip = {
          ...clip,
          id: `t_clip_split_${Date.now()}`,
          startTime: currentTime,
          duration: secondPartDuration,
        };

        const filtered = project.textClips.filter((c) => c.id !== clip.id);
        updateTextClips([...filtered, firstPart, secondPart]);
        setSelectedClip({ id: secondPart.id, type: 'text' });
      }
    }
  };

  // Duplicate Selected clip
  const handleDuplicateClip = () => {
    if (!selectedClip || !activeClipDetails) return;

    if (selectedClip.type === 'video') {
      const clip = activeClipDetails as VideoClip;
      const copy: VideoClip = {
        ...clip,
        id: `v_clip_copy_${Date.now()}`,
        name: `${clip.name} Copy`,
        startTime: clip.startTime + clip.duration,
      };
      const updated = [...project.videoClips, copy].sort((a, b) => a.startTime - b.startTime);
      updateVideoClips(updated);
      setSelectedClip({ id: copy.id, type: 'video' });
    } else if (selectedClip.type === 'text') {
      const clip = activeClipDetails as TextClip;
      const copy: TextClip = {
        ...clip,
        id: `t_clip_copy_${Date.now()}`,
        startTime: clip.startTime + clip.duration,
      };
      const updated = [...project.textClips, copy];
      updateTextClips(updated);
      setSelectedClip({ id: copy.id, type: 'text' });
    }
  };

  // Delete Selected clip
  const handleDeleteClip = () => {
    if (!selectedClip) return;

    if (selectedClip.type === 'video') {
      const filtered = project.videoClips.filter((c) => c.id !== selectedClip.id);
      updateVideoClips(filtered);
    } else if (selectedClip.type === 'audio') {
      const filtered = project.audioClips.filter((c) => c.id !== selectedClip.id);
      updateAudioClips(filtered);
    } else if (selectedClip.type === 'text') {
      const filtered = project.textClips.filter((c) => c.id !== selectedClip.id);
      updateTextClips(filtered);
    }

    setSelectedClip(null);
  };

  // CapCut Pro Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleSplitClip();
      } else if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleSplitClip();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClip) {
          e.preventDefault();
          handleDeleteClip();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateClip();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? 1.0 : 0.05;
        setCurrentTime((prev) => Math.max(0, parseFloat((prev - step).toFixed(2))));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 1.0 : 0.05;
        setCurrentTime((prev) => Math.min(project.duration, parseFloat((prev + step).toFixed(2))));
      } else if (e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setCurrentTime((prev) => Math.max(0, prev - 1.5));
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setCurrentTime((prev) => Math.min(project.duration, prev + 1.5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClip, project, historyStack, redoStack]);

  // Handle user uploaded video or image file for custom editing and downloading
  const handleUploadVideoFile = (file: File) => {
    const videoUrl = URL.createObjectURL(file);
    const isImage = file.type.startsWith('image/');

    const createAndSetProject = (clipDuration: number) => {
      const newProject: Project = {
        id: `custom_proj_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        duration: Math.max(5, Math.ceil(clipDuration)),
        videoClips: [
          {
            id: `custom_v_${Date.now()}`,
            name: file.name,
            type: 'video',
            proceduralType: 'cyberpunk_grid',
            startTime: 0,
            duration: clipDuration,
            sourceStart: 0,
            sourceDuration: clipDuration,
            speed: 1.0,
            colorGrading: createDefaultGrading(),
            volume: 100,
            videoUrl: videoUrl,
            thumbnailUrl: isImage ? videoUrl : '/bg2.png',
          },
        ],
        audioClips: [
          {
            id: `custom_a_${Date.now()}`,
            name: 'Background Rhythm',
            type: 'audio',
            startTime: 0,
            duration: Math.max(5, Math.ceil(clipDuration)),
            sourceStart: 0,
            volume: 75,
            audioStyle: 'beat_loop',
          },
        ],
        textClips: [
          {
            id: `custom_t_${Date.now()}`,
            name: 'Title Overlay',
            type: 'text',
            startTime: 0.5,
            duration: Math.min(5.0, clipDuration),
            text: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
            color: '#00ffea',
            fontSize: 28,
            positionY: 40,
            style: 'neon',
          },
        ],
        transitions: [],
      };

      setProjects((prev) => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
      setActiveSidebarTab('editor');
      setSelectedClip({ id: newProject.videoClips[0].id, type: 'video' });
      setActiveWorkspaceTab('grading');
    };

    if (!isImage) {
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = videoUrl;
      tempVideo.onloadedmetadata = () => {
        const dur = Number.isFinite(tempVideo.duration) && tempVideo.duration > 0 ? parseFloat(tempVideo.duration.toFixed(1)) : 15.0;
        createAndSetProject(dur);
      };
      tempVideo.onerror = () => {
        createAndSetProject(15.0);
      };
    } else {
      createAndSetProject(6.0);
    }
  };

  return (
    <div className="min-h-screen bg-[#020306] text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col md:flex-row antialiased relative overflow-hidden">
      
      {/* 0. GLORIOUS COSMIC BACKGROUND PLANET - Blended with starry space for high visual fidelity */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Starry deep space background layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen" 
          style={{ backgroundImage: "url('/bg99.png')" }} 
        />
        {/* Glowing Planet Earth / Cosmic sphere in top right */}
        <div 
          className="absolute -top-[15%] -right-[15%] w-[850px] h-[850px] rounded-full bg-cover bg-center opacity-[0.22] mix-blend-screen filter blur-[0.5px] animate-pulse" 
          style={{ 
            backgroundImage: "url('/bg2.png')",
            boxShadow: '0 0 120px rgba(139, 92, 246, 0.25), inset 0 0 100px rgba(0, 0, 0, 0.9)'
          }} 
        />
        {/* Ambient colored nebulas */}
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] rounded-full bg-pink-500/5 blur-[140px]" />
        {/* Radial vignette overlay to protect text legibility and contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,3,6,0.15)_0%,rgba(2,3,6,0.92)_100%)]" />
      </div>

      {/* 1. MOBILE HEADER BAR - Styled exactly like the premium dark-neon mockup theme */}
      <div className="flex md:hidden items-center justify-between p-3.5 bg-[#030616]/90 border-b border-indigo-500/20 backdrop-blur-2xl z-40 sticky top-0 w-full shrink-0 shadow-xl shadow-black/80">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 shrink-0 relative flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]"
              onError={(e) => {
                e.currentTarget.src = '/logo.svg';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-wider text-white leading-none">
              VidoEdit<span className="text-cyan-400 font-black">Pro</span>
            </span>
            <span className="text-[6.5px] font-mono font-bold text-slate-400 tracking-[1.5px] mt-1 uppercase leading-none">
              TURN IDEAS INTO VIDEOS
            </span>
          </div>
        </div>

        {/* Mobile Right Controls: Bell, Avatar & Menu */}
        <div className="flex items-center gap-2">
          {/* Notification bell with red dot */}
          <button className="relative p-2 bg-[#050711] border border-indigo-500/20 rounded-full text-slate-400 hover:text-white transition-all">
            <div className="w-3.5 h-3.5 flex items-center justify-center">🔔</div>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse ring-1 ring-black" />
          </button>

          {/* User profile avatar with circular neon halo ring */}
          <div className="w-7 h-7 rounded-full border border-cyan-400 p-0.5 shadow-[0_0_10px_rgba(34,211,238,0.5)] shrink-0 overflow-hidden bg-slate-900">
            <img
              src="/logomax.png"
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Menu Drawer Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-slate-900 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY & DIALOG */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Dark backdrop overlay with soft blur */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Floating Drawer matching left sidebar exactly */}
          <div className="relative w-72 bg-[#040614]/95 border-r border-indigo-500/30 flex flex-col p-5 h-full z-10 justify-between overflow-y-auto shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 shrink-0 relative flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="Logo"
                      className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                      onError={(e) => {
                        e.currentTarget.src = '/logo.svg';
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold tracking-wider text-white leading-none">
                      VidoEdit<span className="text-cyan-400 font-black">Pro</span>
                    </span>
                    <span className="text-[6.5px] font-mono font-bold text-slate-400 tracking-[1.5px] mt-1 uppercase leading-none">
                      TURN IDEAS INTO VIDEOS
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links match desktop */}
              <nav className="flex flex-col gap-1.5 mt-2">
                <button
                  onClick={() => {
                    setActiveSidebarTab('home');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-2xl cursor-pointer transition-all ${
                    activeSidebarTab === 'home'
                      ? 'btn-sidebar-active'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSidebarTab('editor');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-2xl cursor-pointer transition-all ${
                    activeSidebarTab === 'editor'
                      ? 'btn-sidebar-active'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>My Projects</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSidebarTab('home');
                    setIsMobileMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-2xl cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900/30 transition-all"
                >
                  <Layers className="w-4 h-4" />
                  <span>Templates</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSidebarTab('editor');
                    setActiveWorkspaceTab('tutorials');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-2xl cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900/30 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Tools</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSidebarTab('editor');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-2xl cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900/30 transition-all"
                >
                  <Film className="w-4 h-4" />
                  <span>Media Library</span>
                </button>

                <button 
                  onClick={() => {
                    setShowInstallModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-2xl text-slate-400 hover:text-white hover:bg-slate-900/30 transition-all cursor-pointer"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Cloud Storage</span>
                </button>

                <button
                  onClick={() => {
                    setShowExportModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-2xl cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900/30 transition-all"
                >
                  <History className="w-4 h-4" />
                  <span>Export History</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSidebarTab('editor');
                    setActiveWorkspaceTab('inspector');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-2xl cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900/30 transition-all"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </nav>
            </div>

            {/* Bottom area matching mockup with planet */}
            <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-indigo-500/20">
              {/* Mini Cosmic planet sphere */}
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden flex items-center justify-center shadow-xl">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#020108] via-[#4d0c7b] to-[#ea00d9] shadow-[inset_-6px_-6px_20px_rgba(0,0,0,0.95),_0_0_25px_rgba(234,0,217,0.4)]" />
                <div className="absolute inset-0 rounded-full opacity-60 mix-blend-screen bg-cover animate-planet-clouds" style={{ backgroundImage: "url('/bg2.png')" }} />
              </div>

              <div className="flex flex-col gap-0.5 text-left">
                <h4 className="text-xs font-extrabold text-white leading-tight">
                  Create <br />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Edit</span> <br />
                  Inspire
                </h4>
                <span className="text-[8.5px] text-slate-400 leading-normal mt-0.5">
                  Professional video editing tools for creators.
                </span>
              </div>

              <button 
                onClick={() => {
                  setShowInstallModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 btn-cosmic-primary text-[10px] font-extrabold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span>Upgrade to Pro</span>
              </button>

              <span className="text-[8.5px] text-slate-500 font-mono text-center block tracking-wide select-none">
                v2.8.0
              </span>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP STUNNING SIDEBAR SHELL - Matches Mockup 100% */}
      <aside className="hidden md:flex w-64 sidebar-capsule m-4 h-[calc(100vh-2rem)] flex-col p-5 shrink-0 z-30 relative justify-between overflow-y-auto max-h-screen">
        
        <div className="flex flex-col gap-6">
          {/* Glowing Play Triangle Logo beside label ("VidoEdit Pro") */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 relative flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                onError={(e) => {
                  e.currentTarget.src = '/logo.svg';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-wider text-white leading-none">
                VidoEdit<span className="text-cyan-400 font-black">Pro</span>
              </span>
              <span className="text-[7.5px] font-mono font-bold text-slate-400 tracking-[2px] mt-1 uppercase leading-none">
                TURN IDEAS INTO VIDEOS
              </span>
            </div>
          </div>

          {/* Navigation Links matching mockup */}
          <nav className="flex flex-col gap-1.5 mt-1">
            <button
              onClick={() => setActiveSidebarTab('home')}
              className={`flex items-center gap-3 px-3.5 py-3 text-xs font-bold rounded-2xl cursor-pointer transition-all ${
                activeSidebarTab === 'home'
                  ? 'btn-sidebar-active'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('editor')}
              className={`flex items-center gap-3 px-3.5 py-3 text-xs font-bold rounded-2xl cursor-pointer transition-all ${
                activeSidebarTab === 'editor'
                  ? 'btn-sidebar-active'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>My Projects</span>
            </button>

            <button
              onClick={() => {
                setActiveSidebarTab('home');
                setTimeout(() => {
                  document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-2xl cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900/40 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => {
                setActiveSidebarTab('editor');
                setActiveWorkspaceTab('tutorials');
              }}
              className="flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-2xl cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900/40 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Tools</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('editor')}
              className="flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-2xl cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900/40 transition-all"
            >
              <Film className="w-4 h-4" />
              <span>Media Library</span>
            </button>

            <button 
              onClick={() => setShowInstallModal(true)}
              className="flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-2xl text-slate-400 hover:text-white hover:bg-slate-900/40 transition-all cursor-pointer"
            >
              <Cloud className="w-4 h-4" />
              <span>Cloud Storage</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-2xl cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900/40 transition-all"
            >
              <History className="w-4 h-4" />
              <span>Export History</span>
            </button>

            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-2xl cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900/40 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* BOTTOM SIDEBAR AREA MATCHING MOCKUP */}
        <div className="flex flex-col gap-3.5 mt-6 relative z-10 pt-4 border-t border-indigo-500/20">
          
          {/* Cosmic planet sphere */}
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden flex items-center justify-center group cursor-pointer shadow-2xl">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#020108] via-[#4d0c7b] to-[#ea00d9] shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.95),_0_0_35px_rgba(234,0,217,0.5)]" />
            <div className="absolute inset-0 rounded-full opacity-60 mix-blend-screen bg-cover animate-planet-clouds" style={{ backgroundImage: "url('/bg2.png')" }} />
            <div className="absolute w-52 h-4 border-t-2 border-b-2 border-indigo-400/50 rounded-full rotate-[-12deg] scale-y-[0.25] blur-[0.5px] pointer-events-none" />
          </div>
          
          <div className="flex flex-col gap-0.5 text-left">
            <h4 className="text-sm font-extrabold text-white leading-tight">
              Create <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Edit</span> <br />
              Inspire
            </h4>
            <span className="text-[9px] text-slate-400 leading-normal mt-1">
              Professional video editing tools for creators, by creators.
            </span>
          </div>

          {/* Glowing Upgrade to Pro button */}
          <button 
            onClick={() => setShowInstallModal(true)}
            className="w-full py-3 btn-cosmic-primary text-[11px] font-extrabold rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span>Upgrade to Pro</span>
          </button>

          <span className="text-[9px] text-slate-500 font-mono text-center block tracking-wide select-none">
            v2.8.0
          </span>
        </div>

      </aside>

      {/* 2. MAIN LAYOUT AND PREVIEW DEVICE WRAPPER PANEL */}
      <main className="flex-1 overflow-y-auto max-h-screen p-3 md:p-6 flex flex-col">
        
        {/* Device Layout & Workspace control bar - ONLY visible when in Editor Workspace */}
        {activeSidebarTab === 'editor' && (
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-indigo-500/20">
            
            {/* Quick Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <button
                onClick={() => setActiveSidebarTab('home')}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-indigo-400"
              >
                <span>← Back to Home</span>
              </button>
              <span className="text-slate-600">/</span>
              <span className="text-white">{project.name}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Layout frame switcher */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900/60 shadow">
                <button
                  onClick={() => setDeviceLayout('desktop')}
                  className={`p-1.5 rounded-lg transition-all ${
                    deviceLayout === 'desktop' ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 shadow-inner' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Desktop Dashboard"
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceLayout('tablet')}
                  className={`p-1.5 rounded-lg transition-all ${
                    deviceLayout === 'tablet' ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 shadow-inner' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Tablet Workspace"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceLayout('mobile')}
                  className={`p-1.5 rounded-lg transition-all ${
                    deviceLayout === 'mobile' ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 shadow-inner' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Mobile UI Mode"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setShowProfileModal(true)}
                className="w-8 h-8 rounded-full border border-indigo-500/50 overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all p-0.5"
                title="Profile Settings"
              >
                <img src="/logo.png" alt="Profile" className="w-full h-full object-cover rounded-full" onError={(e) => { e.currentTarget.src = '/logomax.png'; }} />
              </button>

              <button
                onClick={() => setShowInstallModal(true)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Install</span>
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Video</span>
              </button>
            </div>
          </div>
        )}

        {/* Real-time responsive framing */}
        <div className="flex-1 flex items-center justify-center p-1">
          <div
            className={`w-full h-full transition-all duration-300 flex items-center justify-center ${
              deviceLayout === 'mobile'
                ? 'max-w-[390px] aspect-[9/19.5] border-[10px] border-slate-800 rounded-[44px] shadow-2xl shadow-black p-4 bg-[#030408] overflow-y-auto'
                : deviceLayout === 'tablet'
                ? 'max-w-[800px] aspect-[4/3] border-[12px] border-slate-800 rounded-[32px] shadow-2xl p-6 bg-[#030408] overflow-y-auto'
                : 'w-full'
            }`}
          >
            {/* View Dispatcher */}
            {activeSidebarTab === 'home' ? (
              <Dashboard
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={(id) => {
                  handleSelectTemplate(id);
                  setActiveSidebarTab('editor');
                }}
                onLaunchEditor={(tab) => {
                  setActiveSidebarTab('editor');
                  if (tab) setActiveWorkspaceTab(tab);
                }}
                onAddVideoClip={handleAddVideoClip}
                onUploadVideoFile={handleUploadVideoFile}
                onOpenInstallModal={() => setShowInstallModal(true)}
                onOpenProfileModal={() => setShowProfileModal(true)}
              />
            ) : (
              <div className="w-full flex flex-col gap-4 animate-fade-in">
                
                {/* Professional Media Pool & Template Loader Bins */}
                <div className="bg-slate-950/70 border border-indigo-500/10 p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl backdrop-blur-md">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-indigo-400 tracking-widest uppercase flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" />
                      <span>Professional Media Bins</span>
                    </span>
                    <span className="text-[10px] text-slate-500 leading-normal mt-0.5">
                      Select a professional demo template preset to instantly seed multi-track sequences & grade templates.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => handleSelectTemplate(proj.id)}
                        className={`px-3 py-2 text-[10.5px] font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                          proj.id === project.id
                            ? 'bg-indigo-950/50 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500'
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        <span>{proj.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Workspace Row: Player on Left, Controls on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* Left Column: Player & Add Tracks Area */}
                  <div className="lg:col-span-7 flex flex-col gap-3">
                    <PreviewPlayer
                      project={project}
                      currentTime={currentTime}
                      isPlaying={isPlaying}
                      onTimeUpdate={setCurrentTime}
                      onTogglePlay={setIsPlaying}
                      brightnessOverride={brightnessOverride}
                      onBrightnessChange={setBrightnessOverride}
                      onVolumeChange={setGlobalVolume}
                      globalVolume={globalVolume}
                      onSelectProject={handleSelectTemplate}
                      mutedTracks={mutedTracks}
                      globalMotionBlur={globalMotionBlur}
                      onUpdateClipAspectRatio={handleUpdateClipAspectRatio}
                      onUpdateClipSpeed={handleUpdateClipSpeed}
                      onSplitClip={handleSplitClip}
                    />

                    {/* Quick actions for adding tracks overlayed on Canvas */}
                    <div className="flex flex-wrap items-center gap-2 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-900/60 justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1.5">Add Media:</span>
                        <label className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-600/30 via-indigo-600/30 to-purple-600/30 hover:from-cyan-600/50 hover:to-purple-600/50 border border-cyan-500/40 hover:border-cyan-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-cyan-300 shadow-sm">
                          <Plus className="w-3 h-3 text-cyan-400" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="video/*,image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadVideoFile(file);
                            }}
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => handleAddVideoClip('vaporwave_sunset')}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-orange-400"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          2.mp4
                        </button>
                        <button
                          onClick={() => handleAddVideoClip('cyberpunk_grid')}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-pink-400"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          1.mp4
                        </button>
                        <button
                          onClick={() => handleAddVideoClip('geometric_warp')}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-emerald-400"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          3.mp4
                        </button>
                        <button
                          onClick={() => handleAddVideoClip('nebula_ocean')}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-cyan-400"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          12.mp4
                        </button>
                        <button
                          onClick={handleAddTextOverlay}
                          className="px-3 py-1.5 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-800/40 hover:border-indigo-700 text-[10px] font-bold rounded-lg text-indigo-400 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Type className="w-3 h-3" />
                          <span>Caption</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Workspaces */}
                  <div className="lg:col-span-5 flex flex-col bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md h-full min-h-[350px]">
                    <div className="flex border-b border-slate-900 bg-slate-950/40 p-1 shrink-0">
                      <button
                        onClick={() => setActiveWorkspaceTab('grading')}
                        className={`flex-1 py-2 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          activeWorkspaceTab === 'grading'
                            ? 'bg-slate-900 text-indigo-400 shadow-inner'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Color grading</span>
                      </button>

                      <button
                        onClick={() => setActiveWorkspaceTab('inspector')}
                        className={`flex-1 py-2 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          activeWorkspaceTab === 'inspector'
                            ? 'bg-slate-900 text-indigo-400 shadow-inner'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Settings className="w-3 h-3" />
                        <span>Inspector</span>
                      </button>

                      <button
                        onClick={() => setActiveWorkspaceTab('tutorials')}
                        className={`flex-1 py-2 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          activeWorkspaceTab === 'tutorials'
                            ? 'bg-slate-900 text-indigo-400 shadow-inner'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Tutorials</span>
                      </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto max-h-[360px] lg:max-h-[420px]">
                      {activeWorkspaceTab === 'grading' && (
                        <div className="animate-fade-in">
                          {selectedClip && selectedClip.type === 'video' && activeClipDetails ? (
                            <ColorGrading
                              params={(activeClipDetails as VideoClip).colorGrading}
                              onChange={(updatedGrading) => {
                                const updatedClips = project.videoClips.map((c) =>
                                  c.id === selectedClip.id ? { ...c, colorGrading: updatedGrading } : c
                                );
                                updateVideoClips(updatedClips);
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center py-12 text-slate-500">
                              <Sliders className="w-8 h-8 text-slate-650 mb-3" />
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">No Video Clip Selected</span>
                              <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                                Tap any video clip block on the timeline track below to unlock high-fidelity multi-way color wheels and grading parameters.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeWorkspaceTab === 'inspector' && (
                        <div className="animate-fade-in">
                          {selectedClip && activeClipDetails ? (
                            <ClipControls
                              selectedClip={activeClipDetails}
                              currentTime={currentTime}
                              onUpdateVideoClip={(updated) => {
                                const updatedList = project.videoClips.map((c) =>
                                  c.id === updated.id ? updated : c
                                );
                                updateVideoClips(updatedList);
                              }}
                              onUpdateAudioClip={(updated) => {
                                const updatedList = project.audioClips.map((c) =>
                                  c.id === updated.id ? updated : c
                                );
                                updateAudioClips(updatedList);
                              }}
                              onUpdateTextClip={(updated) => {
                                const updatedList = project.textClips.map((c) =>
                                  c.id === updated.id ? updated : c
                                );
                                updateTextClips(updatedList);
                              }}
                            />
                          ) : (
                            <div className="flex flex-col gap-4 animate-fade-in text-xs text-slate-300">
                              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-900 shadow-xl flex flex-col gap-4">
                                <div className="flex items-center gap-2 border-b border-slate-900/60 pb-2">
                                  <Settings className="w-4 h-4 text-indigo-400" />
                                  <span className="font-extrabold uppercase tracking-widest text-[11px] text-white">
                                    Global Project Settings
                                  </span>
                                </div>

                                {/* Global Motion Blur Toggle */}
                                <div className="flex flex-col gap-2 p-3 bg-[#03050a] rounded-xl border border-slate-900/60">
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-200">Global Motion Blur</span>
                                      <span className="text-[9.5px] text-slate-500 leading-normal mt-0.5">
                                        For fast-paced speed ramps & velocity changes
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setGlobalMotionBlur(!globalMotionBlur)}
                                      className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
                                        globalMotionBlur ? 'bg-indigo-600' : 'bg-slate-800'
                                      }`}
                                    >
                                      <div
                                        className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                                          globalMotionBlur ? 'translate-x-4.5' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                                    When enabled, CineMotion applies high-fidelity directional pixel-blur to video clips whose playback speed exceeds <strong className="text-indigo-400">1.0x</strong>.
                                  </p>
                                </div>

                                {/* Other settings indicators */}
                                <div className="flex flex-col gap-1 text-[10px] text-slate-500 bg-[#03050a] p-3 rounded-xl border border-slate-900/60">
                                  <div className="flex justify-between py-1 border-b border-slate-950">
                                    <span>Render Sample Rate</span>
                                    <span className="font-bold text-slate-400">60 FPS</span>
                                  </div>
                                  <div className="flex justify-between py-1 border-b border-slate-950">
                                    <span>Viewport Engine</span>
                                    <span className="font-bold text-slate-400">GPU Canvas 2D</span>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <span>Safe Area Margins</span>
                                    <span className="font-bold text-slate-400">Active</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-center text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed mt-2 bg-slate-950/20 p-3 rounded-xl border border-slate-900/40">
                                💡 <strong>Tip:</strong> Tap any video, text, or background audio block inside the timeline to inspect and edit block-specific properties in this panel.
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeWorkspaceTab === 'tutorials' && (
                        <div className="flex flex-col gap-4 text-xs leading-relaxed animate-fade-in">
                          <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl">
                            <span className="font-bold text-indigo-400 flex items-center gap-1 text-[11px] uppercase tracking-wider mb-1">
                              <Info className="w-3.5 h-3.5" />
                              <span>Interactive Touch Gestures</span>
                            </span>
                            <p className="text-slate-400 text-[11px]">
                              CineMotion Pro features mobile-inspired gestures that run seamlessly on both phones and desktops.
                            </p>
                            <ul className="list-disc pl-4 mt-2 space-y-1.5 text-[10.5px] text-slate-400">
                              <li><strong>Tap Player:</strong> Toggle play/pause state instantly.</li>
                              <li><strong>Swipe Left Side:</strong> Slide vertically on left side of active preview to dynamically modify background synthesizer Volume.</li>
                              <li><strong>Swipe Right Side:</strong> Slide vertically on right side of preview to adjust Exposure grading in real-time.</li>
                              <li><strong>Double Tap Sliders:</strong> Instantly resets slider offsets to 0.</li>
                            </ul>
                          </div>

                          <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl">
                            <span className="font-bold text-indigo-400 flex items-center gap-1 text-[11px] uppercase tracking-wider mb-1">
                              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                              <span>Transition Overlays</span>
                            </span>
                            <p className="text-slate-400 text-[11px]">
                              Transitions are automatically generated between adjacent video clips. Tap the <span className="text-indigo-400 font-bold">⋈</span> or <span className="text-slate-400 font-bold">+</span> node between blocks to trigger transitions configurations.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active Transition settings */}
                    {activeTransitionId && (
                      <div className="border-t border-slate-900 bg-slate-950 p-3 shrink-0">
                        {(() => {
                          const t = project.transitions.find((trans) => trans.id === activeTransitionId);
                          if (!t) return null;
                          return (
                            <TransitionsDrawer
                              transitionId={t.id}
                              activeType={t.type}
                              duration={t.duration}
                              onUpdateType={(type) => {
                                const updatedTrans = project.transitions.map((trans) =>
                                  trans.id === t.id ? { ...trans, type } : trans
                                );
                                const updatedProjects = projects.map((p) =>
                                  p.id === project.id ? { ...p, transitions: updatedTrans } : p
                                );
                                setProjects(updatedProjects);
                              }}
                              onUpdateDuration={(duration) => {
                                const updatedTrans = project.transitions.map((trans) =>
                                  trans.id === t.id ? { ...trans, duration } : trans
                                );
                                const updatedProjects = projects.map((p) =>
                                  p.id === project.id ? { ...p, transitions: updatedTrans } : p
                                );
                                setProjects(updatedProjects);
                              }}
                              onClose={() => setActiveTransitionId(null)}
                            />
                          );
                        })()}
                      </div>
                    )}
                  </div>

                </div>

                {/* Bottom Timeline Section */}
                <div className="w-full shrink-0">
                  <Timeline
                    project={project}
                    currentTime={currentTime}
                    onTimeUpdate={setCurrentTime}
                    selectedClipId={selectedClip?.id || null}
                    selectedClipType={selectedClip?.type || null}
                    onSelectClip={(id, type) => {
                      setSelectedClip(id ? { id, type } : null);
                      if (id) {
                        setActiveWorkspaceTab(type === 'video' ? 'grading' : 'inspector');
                      }
                    }}
                    onUpdateVideoClips={updateVideoClips}
                    onUpdateAudioClips={updateAudioClips}
                    onUpdateTextClips={updateTextClips}
                    onAddTransition={handleAddTransition}
                    onOpenTransitionSettings={setActiveTransitionId}
                    onSplitClip={handleSplitClip}
                    onDeleteClip={handleDeleteClip}
                    onDuplicateClip={handleDuplicateClip}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={historyStack.length > 0}
                    canRedo={redoStack.length > 0}
                    mutedTracks={mutedTracks}
                    lockedTracks={lockedTracks}
                    onToggleMuteTrack={handleToggleMuteTrack}
                    onToggleLockTrack={handleToggleLockTrack}
                    onUpdateMarkers={handleUpdateMarkers}
                  />
                </div>

              </div>
            )}

          </div>
        </div>

      </main>

      {/* FLOATING MOBILE BOTTOM NAVIGATION BAR - For on-the-go quick access */}
      <nav className="fixed bottom-3 left-4 right-4 z-40 md:hidden bg-slate-950/85 backdrop-blur-2xl border border-indigo-500/25 rounded-2xl px-3 py-2 flex items-center justify-around shadow-2xl shadow-black/80">
        <button
          onClick={() => setActiveSidebarTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeSidebarTab === 'home' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px] tracking-wide">Home</span>
        </button>

        <button
          onClick={() => setActiveSidebarTab('editor')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeSidebarTab === 'editor' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[9px] tracking-wide">Editor</span>
        </button>

        <button
          onClick={() => {
            setActiveSidebarTab('editor');
            setActiveWorkspaceTab('grading');
          }}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-[9px] tracking-wide">AI Tools</span>
        </button>

        <button
          onClick={() => setShowExportModal(true)}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all"
        >
          <Download className="w-4 h-4 text-pink-400" />
          <span className="text-[9px] tracking-wide">Export</span>
        </button>

        <button
          onClick={() => setShowInstallModal(true)}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all"
        >
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-[9px] tracking-wide">Install</span>
        </button>
      </nav>

      {/* Exporting & Render Modal */}
      {showExportModal && (
        <ExportModal
          project={project}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Install App / GitHub Download Modal */}
      {showInstallModal && (
        <InstallModal
          onClose={() => setShowInstallModal(false)}
          deferredPrompt={deferredPrompt}
        />
      )}

      {/* User Profile & Preferences Modal */}
      {showProfileModal && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}

    </div>
  );
}

