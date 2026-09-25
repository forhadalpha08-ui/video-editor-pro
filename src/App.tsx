import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Project, 
  VideoClip, 
  AudioClip, 
  TextClip, 
  CaptionItem, 
  MediaAsset, 
  TransitionType, 
  VideoEffectType, 
  FilterPresetType 
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

// Initial Demo Assets matching mockup
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

// Initial Demo Project matching reference layout
const DEMO_PROJECT: Project = {
  id: 'proj_01',
  name: 'Project 01 - Cinematic Journey',
  resolution: '1080p',
  fps: 60,
  aspectRatio: '16:9',
  duration: 236, // 03:56
  videoClips: [
    {
      id: 'v_mountain',
      name: 'mountain.mp4',
      type: 'video',
      startTime: 0,
      duration: 75,
      sourceStart: 0,
      sourceDuration: 90,
      speed: 1.0,
      volume: 100,
      trackId: 'v1',
      videoUrl: '/1.mp4',
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
        temperature: 0,
        tint: 0,
        sharpness: 0,
        vignette: 15,
        filterPreset: 'cinematic_teal_orange',
        filterIntensity: 100,
      },
    },
    {
      id: 'v_city',
      name: 'city.mp4',
      type: 'video',
      startTime: 0,
      duration: 48,
      sourceStart: 0,
      sourceDuration: 60,
      speed: 1.0,
      volume: 100,
      trackId: 'v2',
      videoUrl: '/2.mp4',
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
        temperature: 0,
        tint: 0,
        sharpness: 0,
        vignette: 20,
        filterPreset: 'none',
        filterIntensity: 100,
      },
    },
    {
      id: 'v_forest',
      name: 'forest.mp4',
      type: 'video',
      startTime: 50,
      duration: 65,
      sourceStart: 0,
      sourceDuration: 80,
      speed: 1.0,
      volume: 100,
      trackId: 'v2',
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
        temperature: -5,
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
      id: 'a_background',
      name: 'background.mp3',
      type: 'audio',
      startTime: 0,
      duration: 200,
      sourceStart: 0,
      volume: 100,
      pan: 0,
      audioStyle: 'cinematic_score',
      trackId: 'a1',
    },
    {
      id: 'a_voiceover',
      name: 'voiceover.mp3',
      type: 'audio',
      startTime: 35,
      duration: 40,
      sourceStart: 0,
      volume: 100,
      pan: 0,
      audioStyle: 'voiceover',
      trackId: 'a2',
    },
  ],
  textClips: [
    {
      id: 't_cinematic',
      name: 'Cinematic Journey',
      type: 'text',
      startTime: 0,
      duration: 45,
      text: 'CINEMATIC JOURNEY',
      color: '#F8FAFC',
      fontSize: 44,
      fontFamily: 'Plus Jakarta Sans',
      positionX: 50,
      positionY: 50,
      opacity: 100,
      animation: 'cinematic',
      trackId: 't1',
    },
  ],
  captions: [
    { id: 'c1', startTime: 2, endTime: 6, text: 'Across the mist of the morning mountains...' },
    { id: 'c2', startTime: 7, endTime: 12, text: 'A new cinematic horizon awakens in 4K resolution.' },
  ],
  transitions: [
    { id: 'trans_1', atTime: 48, type: 'cross_dissolve', duration: 1.0, fromClipId: 'v_city', toClipId: 'v_forest' }
  ],
};

export default function App() {
  // Main Project State
  const [project, setProject] = useState<Project>(DEMO_PROJECT);
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_ASSETS);
  
  // History Stacks for Real Undo / Redo
  const [historyStack, setHistoryStack] = useState<Project[]>([]);
  const [redoStack, setRedoStack] = useState<Project[]>([]);

  // Push new state to history stack
  const recordHistory = useCallback((current: Project) => {
    setHistoryStack((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(current))]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(project))]);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setProject(previous);
  }, [historyStack, project]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistoryStack((prev) => [...prev, JSON.parse(JSON.stringify(project))]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setProject(next);
  }, [redoStack, project]);

  // Current Active Tool & Navigation
  const [activeTool, setActiveTool] = useState<ToolType>('media');
  const [selectedClip, setSelectedClip] = useState<{ id: string; type: 'video' | 'audio' | 'text' } | null>({
    id: 'v_mountain',
    type: 'video',
  });

  // Playback State
  const [currentTime, setCurrentTime] = useState(24);
  const [isPlaying, setIsPlaying] = useState(false);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

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

  // Clip Selection Helpers
  const activeVideoClip = selectedClip?.type === 'video' 
    ? project.videoClips.find(c => c.id === selectedClip.id) 
    : null;

  const activeAudioClip = selectedClip?.type === 'audio' 
    ? project.audioClips.find(c => c.id === selectedClip.id) 
    : null;

  const activeTextClip = selectedClip?.type === 'text' 
    ? project.textClips.find(c => c.id === selectedClip.id) 
    : null;

  // Project Mutations with History
  const updateProject = (mutator: (prev: Project) => Project) => {
    recordHistory(project);
    setProject((prev) => mutator(prev));
  };

  const handleUpdateVideoClips = (clips: VideoClip[]) => {
    updateProject(prev => ({ ...prev, videoClips: clips }));
  };

  const handleUpdateAudioClips = (clips: AudioClip[]) => {
    updateProject(prev => ({ ...prev, audioClips: clips }));
  };

  const handleUpdateTextClips = (clips: TextClip[]) => {
    updateProject(prev => ({ ...prev, textClips: clips }));
  };

  // Split Clip Action
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

  // Delete Clip Action
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

  // Duplicate Clip Action
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

  // File Upload Handler
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

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050712] text-[#F8FAFC] overflow-hidden select-none font-sans">
      
      {/* 1. Top Navigation Bar */}
      <TopNav
        project={project}
        onUpdateProjectName={(name) => updateProject(prev => ({ ...prev, name }))}
        onUpdateResolution={(res) => updateProject(prev => ({ ...prev, resolution: res }))}
        onUpdateFps={(fps) => updateProject(prev => ({ ...prev, fps }))}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyStack.length > 0}
        canRedo={redoStack.length > 0}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* 2. Main Middle Workspace: Toolbar + Drawer + Preview + Inspector */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Toolbar (Dock) */}
        <LeftToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
        />

        {/* Left Tool Drawer Panel */}
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
                updateProject(prev => ({ ...prev, transitions: [...prev.transitions, newTrans] }));
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
            onAddCaption={(cap) => updateProject(prev => ({ ...prev, captions: [...(prev.captions || []), cap] }))}
            onUpdateCaption={(id, text) => updateProject(prev => ({
              ...prev,
              captions: (prev.captions || []).map(c => c.id === id ? { ...c, text } : c)
            }))}
            onDeleteCaption={(id) => updateProject(prev => ({
              ...prev,
              captions: (prev.captions || []).filter(c => c.id !== id)
            }))}
            onAutoGenerateCaptions={() => {
              updateProject(prev => ({
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
              // Load template
              setProject({ ...DEMO_PROJECT, id, name: id === 'proj_01' ? 'Project 01 - Cinematic Journey' : 'Cyberpunk Tokyo Nights' });
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
            onChangeAspectRatio={(ratio) => updateProject(prev => ({ ...prev, aspectRatio: ratio }))}
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

      {/* 4. Export Master Modal */}
      <ExportModal
        project={project}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* 5. Keyboard Shortcuts Cheat Sheet */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

    </div>
  );
}
