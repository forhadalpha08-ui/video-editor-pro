import React, { useRef, useEffect, useState } from 'react';
import { Scissors, Trash, Trash2, Plus, Copy, ZoomIn, ZoomOut, MoveRight, Layers, FileText, Music, Lock, Unlock, VolumeX, Volume2, Eye, EyeOff, Undo2, Redo2 } from 'lucide-react';
import { Project, VideoClip, AudioClip, TextClip, TrackId, TimelineMarker } from '../types';

interface TimelineProps {
  project: Project;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  selectedClipId: string | null;
  selectedClipType: 'video' | 'audio' | 'text' | null;
  onSelectClip: (id: string | null, type: 'video' | 'audio' | 'text') => void;
  onUpdateVideoClips: (clips: VideoClip[]) => void;
  onUpdateAudioClips: (clips: AudioClip[]) => void;
  onUpdateTextClips: (clips: TextClip[]) => void;
  onAddTransition: (fromId: string, toId: string) => void;
  onOpenTransitionSettings: (transitionId: string) => void;
  onSplitClip: () => void;
  onDeleteClip: () => void;
  onDuplicateClip: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  
  // Track mute / lock states
  mutedTracks: Record<TrackId, boolean>;
  lockedTracks: Record<TrackId, boolean>;
  onToggleMuteTrack: (trackId: TrackId) => void;
  onToggleLockTrack: (trackId: TrackId) => void;
  onUpdateMarkers?: (markers: TimelineMarker[]) => void;
}

const renderAudioWaveform = (clip: AudioClip, clipWidth: number) => {
  const SAMPLES = 45;
  const h = 20; // height of waveform container
  const pointsTop: string[] = [];
  const pointsBottom: string[] = [];

  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const x = t * clipWidth;
    let amp = 0.1; // floor

    if (clip.audioStyle === 'beat_loop') {
      // Periodic sharp high-impact beat spikes (like 4/4 kicks)
      const beatProgress = (t * 6) % 1;
      amp = Math.pow(Math.sin(beatProgress * Math.PI), 6) * 0.92 + 0.08;
      // minor hi-hat flutter noise
      amp += Math.abs(Math.sin(t * Math.PI * 40)) * 0.12;
    } else if (clip.audioStyle === 'synth_wave') {
      // Syncopated wave swells
      amp = (Math.sin(t * Math.PI * 10) * 0.45 + Math.sin(t * Math.PI * 20) * 0.35 + 0.4) * 0.8;
      // high freq sub-pulses
      amp += Math.abs(Math.sin(t * Math.PI * 80)) * 0.08;
    } else {
      // ambient_drone: slow rolling atmospheric curves
      amp = (Math.sin(t * Math.PI * 3) * 0.55 + Math.cos(t * Math.PI * 1.2) * 0.3 + 0.45) * 0.8;
      amp += (Math.sin(t * Math.PI * 30) * 0.06); // micro textures
    }

    amp = Math.max(0.08, Math.min(1.0, amp));

    // Calculate vertical mirrored points
    const yTop = (h / 2) - (amp * (h / 2) * 0.85);
    const yBottom = (h / 2) + (amp * (h / 2) * 0.85);

    pointsTop.push(`${x.toFixed(1)},${yTop.toFixed(1)}`);
    pointsBottom.unshift(`${x.toFixed(1)},${yBottom.toFixed(1)}`);
  }

  const pathData = `M 0,${(h/2).toFixed(1)} L ` + pointsTop.join(' L ') + ' L ' + pointsBottom.join(' L ') + ' Z';

  return (
    <svg className="w-full h-5 opacity-55 pointer-events-none mt-1 select-none" viewBox={`0 0 ${clipWidth} ${h}`} preserveAspectRatio="none">
      <path d={pathData} fill="url(#waveGrad)" stroke="none" />
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default function Timeline({
  project,
  currentTime,
  onTimeUpdate,
  selectedClipId,
  selectedClipType,
  onSelectClip,
  onUpdateVideoClips,
  onUpdateAudioClips,
  onUpdateTextClips,
  onAddTransition,
  onOpenTransitionSettings,
  onSplitClip,
  onDeleteClip,
  onDuplicateClip,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  mutedTracks,
  lockedTracks,
  onToggleMuteTrack,
  onToggleLockTrack,
  onUpdateMarkers,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const trackContainerRef = useRef<HTMLDivElement | null>(null);

  const [zoomScale, setZoomScale] = useState<number>(18);
  const minZoom = 8;
  const maxZoom = 60;

  // Multi-select state
  const [selectedClips, setSelectedClips] = useState<{ id: string; type: 'video' | 'audio' | 'text' }[]>([]);

  // Marker creation state
  const [showMarkerForm, setShowMarkerForm] = useState(false);
  const [markerLabel, setMarkerLabel] = useState('Beat Drop');
  const [markerColor, setMarkerColor] = useState('#f43f5e');

  // Sync selectedClips with selectedClipId from props
  useEffect(() => {
    if (selectedClipId && selectedClipType) {
      const exists = selectedClips.some(sc => sc.id === selectedClipId && sc.type === selectedClipType);
      if (!exists && selectedClips.length <= 1) {
        setSelectedClips([{ id: selectedClipId, type: selectedClipType }]);
      }
    } else if (!selectedClipId) {
      setSelectedClips([]);
    }
  }, [selectedClipId, selectedClipType]);

  const isClipSelected = (clipId: string, type: 'video' | 'audio' | 'text') => {
    return selectedClips.some(sc => sc.id === clipId && sc.type === type);
  };

  const handleClipClick = (e: React.MouseEvent, clipId: string, type: 'video' | 'audio' | 'text') => {
    e.stopPropagation();
    
    let nextSelection = [...selectedClips];
    const exists = selectedClips.some(sc => sc.id === clipId && sc.type === type);
    
    if (e.shiftKey) {
      if (exists) {
        // Remove from selection
        nextSelection = selectedClips.filter(sc => !(sc.id === clipId && sc.type === type));
      } else {
        // Add to selection
        nextSelection.push({ id: clipId, type });
      }
    } else {
      // Single select
      nextSelection = [{ id: clipId, type }];
    }
    
    setSelectedClips(nextSelection);
    
    if (nextSelection.length > 0) {
      const lastSelected = nextSelection[nextSelection.length - 1];
      onSelectClip(lastSelected.id, lastSelected.type);
    } else {
      onSelectClip(null, type);
    }
  };

  // Drag states
  const [dragMode, setDragMode] = useState<'move' | 'trim-start' | 'trim-end' | 'seek' | null>(null);
  const [dragClip, setDragClip] = useState<{ id: string; type: 'video' | 'audio' | 'text'; originalStart: number; originalDuration: number; track: TrackId } | null>(null);
  const dragStartPosRef = useRef<{ x: number; time: number }>({ x: 0, time: 0 });
  const dragGroupRef = useRef<{ id: string; type: 'video' | 'audio' | 'text'; originalStart: number; duration: number; track: TrackId }[]>([]);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [activeSnapLine, setActiveSnapLine] = useState<number | null>(null);

  const triggerWarning = (msg: string) => {
    setWarningMessage(msg);
    setTimeout(() => setWarningMessage(null), 3000);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.05;
      setZoomScale(prev => Math.max(minZoom, Math.min(maxZoom, prev + zoomDelta)));
    }
  };

  const handleRulerMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    // Calculate click offset (accounting for the track headers width on the left: 96px)
    const headersWidth = 96;
    const x = e.clientX - rect.left + scrollLeft - headersWidth;
    const clickedTime = Math.max(0, Math.min(project.duration, x / zoomScale));
    onTimeUpdate(clickedTime);
    setDragMode('seek');
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragMode || !timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const scrollLeft = timelineRef.current.scrollLeft;
      const headersWidth = 96;
      const currentX = e.clientX - rect.left + scrollLeft - headersWidth;
      const deltaX = e.clientX - dragStartPosRef.current.x;
      const deltaTime = deltaX / zoomScale;

      if (dragMode === 'seek') {
        const targetTime = Math.max(0, Math.min(project.duration, currentX / zoomScale));
        onTimeUpdate(targetTime);
      } else if (dragClip) {
        // Prevent editing if track is locked
        if (lockedTracks[dragClip.track]) {
          triggerWarning(`Track [${dragClip.track.toUpperCase()}] is locked. Unlock it in the header to modify.`);
          setDragMode(null);
          setDragClip(null);
          return;
        }

        if (dragMode === 'move') {
          let newStart = dragClip.originalStart + deltaTime;

          const snapThreshold = 0.25;
          const snapPoints = [0, currentTime, project.duration];

          const isIdInGroup = (id: string, type: 'video' | 'audio' | 'text') => {
            return dragGroupRef.current.some(item => item.id === id && item.type === type);
          };

          // Gather snap points from ALL clips across ALL tracks that are NOT part of the dragged group!
          project.videoClips.forEach(c => {
            if (!isIdInGroup(c.id, 'video')) {
              snapPoints.push(c.startTime);
              snapPoints.push(c.startTime + c.duration);
            }
          });
          project.audioClips.forEach(c => {
            if (!isIdInGroup(c.id, 'audio')) {
              snapPoints.push(c.startTime);
              snapPoints.push(c.startTime + c.duration);
            }
          });
          project.textClips.forEach(c => {
            if (!isIdInGroup(c.id, 'text')) {
              snapPoints.push(c.startTime);
              snapPoints.push(c.startTime + c.duration);
            }
          });

          let snapped = false;
          let snapTimeVal = null;

          for (const snap of snapPoints) {
            if (Math.abs(newStart - snap) < snapThreshold) {
              newStart = snap;
              snapped = true;
              snapTimeVal = snap;
              break;
            }
            if (Math.abs((newStart + dragClip.originalDuration) - snap) < snapThreshold) {
              newStart = snap - dragClip.originalDuration;
              snapped = true;
              snapTimeVal = snap;
              break;
            }
          }

          if (snapped && snapTimeVal !== null) {
            setActiveSnapLine(snapTimeVal);
          } else {
            setActiveSnapLine(null);
          }

          // Bound newStart so no clip in the group slides left of 0
          const minOriginalStart = Math.min(...dragGroupRef.current.map(item => item.originalStart), dragClip.originalStart);
          let effectiveDelta = newStart - dragClip.originalStart;
          if (minOriginalStart + effectiveDelta < 0) {
            effectiveDelta = -minOriginalStart;
          }

          // Update each clip in the dragGroup using effectiveDelta
          const updatedVideo = project.videoClips.map(c => {
            const item = dragGroupRef.current.find(g => g.id === c.id && g.type === 'video');
            if (item) {
              return { ...c, startTime: Math.max(0, item.originalStart + effectiveDelta) };
            }
            return c;
          });
          onUpdateVideoClips(updatedVideo);

          const updatedAudio = project.audioClips.map(c => {
            const item = dragGroupRef.current.find(g => g.id === c.id && g.type === 'audio');
            if (item) {
              return { ...c, startTime: Math.max(0, item.originalStart + effectiveDelta) };
            }
            return c;
          });
          onUpdateAudioClips(updatedAudio);

          const updatedText = project.textClips.map(c => {
            const item = dragGroupRef.current.find(g => g.id === c.id && g.type === 'text');
            if (item) {
              return { ...c, startTime: Math.max(0, item.originalStart + effectiveDelta) };
            }
            return c;
          });
          onUpdateTextClips(updatedText);
        } 
        
        else if (dragMode === 'trim-start') {
          let newStart = dragClip.originalStart + deltaTime;

          const snapThreshold = 0.25;
          const snapPoints = [0, currentTime, project.duration];
          project.videoClips.forEach(c => {
            if (dragClip.type !== 'video' || c.id !== dragClip.id) {
              snapPoints.push(c.startTime);
              snapPoints.push(c.startTime + c.duration);
            }
          });
          project.audioClips.forEach(c => {
            if (dragClip.type !== 'audio' || c.id !== dragClip.id) {
              snapPoints.push(c.startTime);
              snapPoints.push(c.startTime + c.duration);
            }
          });
          project.textClips.forEach(c => {
            if (dragClip.type !== 'text' || c.id !== dragClip.id) {
              snapPoints.push(c.startTime);
              snapPoints.push(c.startTime + c.duration);
            }
          });

          let snapped = false;
          let snapTimeVal = null;
          for (const snap of snapPoints) {
            if (Math.abs(newStart - snap) < snapThreshold) {
              newStart = snap;
              snapped = true;
              snapTimeVal = snap;
              break;
            }
          }

          if (snapped && snapTimeVal !== null) {
            setActiveSnapLine(snapTimeVal);
          } else {
            setActiveSnapLine(null);
          }

          newStart = Math.max(0, Math.min(dragClip.originalStart + dragClip.originalDuration - 0.5, newStart));
          const newDuration = dragClip.originalDuration - (newStart - dragClip.originalStart);

          if (dragClip.type === 'video') {
            const updated = project.videoClips.map(c => 
              c.id === dragClip.id ? { ...c, startTime: newStart, duration: newDuration } : c
            );
            onUpdateVideoClips(updated);
          } else if (dragClip.type === 'audio') {
            const updated = project.audioClips.map(c => 
              c.id === dragClip.id ? { ...c, startTime: newStart, duration: newDuration } : c
            );
            onUpdateAudioClips(updated);
          } else if (dragClip.type === 'text') {
            const updated = project.textClips.map(c => 
              c.id === dragClip.id ? { ...c, startTime: newStart, duration: newDuration } : c
            );
            onUpdateTextClips(updated);
          }
        } 
        
        else if (dragMode === 'trim-end') {
          let newEnd = dragClip.originalStart + dragClip.originalDuration + deltaTime;

          const snapThreshold = 0.25;
          const snapPoints = [0, currentTime, project.duration];
          project.videoClips.forEach(c => {
            if (dragClip.type !== 'video' || c.id !== dragClip.id) {
              snapPoints.push(c.startTime);
              snapPoints.push(c.startTime + c.duration);
            }
          });
          project.audioClips.forEach(c => {
            if (dragClip.type !== 'audio' || c.id !== dragClip.id) {
              snapPoints.push(c.startTime);
              snapPoints.push(c.startTime + c.duration);
            }
          });
          project.textClips.forEach(c => {
            if (dragClip.type !== 'text' || c.id !== dragClip.id) {
              snapPoints.push(c.startTime);
              snapPoints.push(c.startTime + c.duration);
            }
          });

          let snapped = false;
          let snapTimeVal = null;
          for (const snap of snapPoints) {
            if (Math.abs(newEnd - snap) < snapThreshold) {
              newEnd = snap;
              snapped = true;
              snapTimeVal = snap;
              break;
            }
          }

          if (snapped && snapTimeVal !== null) {
            setActiveSnapLine(snapTimeVal);
          } else {
            setActiveSnapLine(null);
          }

          let newDuration = newEnd - dragClip.originalStart;
          newDuration = Math.max(0.5, Math.min(project.duration - dragClip.originalStart, newDuration));

          if (dragClip.type === 'video') {
            const updated = project.videoClips.map(c => 
              c.id === dragClip.id ? { ...c, duration: newDuration } : c
            );
            onUpdateVideoClips(updated);
          } else if (dragClip.type === 'audio') {
            const updated = project.audioClips.map(c => 
              c.id === dragClip.id ? { ...c, duration: newDuration } : c
            );
            onUpdateAudioClips(updated);
          } else if (dragClip.type === 'text') {
            const updated = project.textClips.map(c => 
              c.id === dragClip.id ? { ...c, duration: newDuration } : c
            );
            onUpdateTextClips(updated);
          }
        }
      }
    };

    const handlePointerUp = () => {
      setDragMode(null);
      setDragClip(null);
      setActiveSnapLine(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragMode, dragClip, zoomScale, currentTime, project, lockedTracks]);

  const startClipDrag = (
    e: React.MouseEvent, 
    id: string, 
    type: 'video' | 'audio' | 'text', 
    mode: 'move' | 'trim-start' | 'trim-end',
    startTime: number,
    duration: number,
    track: TrackId
  ) => {
    e.stopPropagation();
    
    if (lockedTracks[track]) {
      triggerWarning(`Track [${track.toUpperCase()}] is locked. Unlock it on the left to modify.`);
      return;
    }

    // Set select state if not already selected
    const inGroup = selectedClips.some(sc => sc.id === id && sc.type === type);
    if (!inGroup) {
      setSelectedClips([{ id, type }]);
      onSelectClip(id, type);
    }

    setDragMode(mode);
    setDragClip({ id, type, originalStart: startTime, originalDuration: duration, track });
    dragStartPosRef.current = { x: e.clientX, time: startTime };

    if (mode === 'move') {
      const activeGroup = inGroup ? selectedClips : [{ id, type }];
      dragGroupRef.current = activeGroup.map(sc => {
        let originalStart = 0;
        let originalDuration = 0;
        let tId: TrackId = 'v1';
        if (sc.type === 'video') {
          const c = project.videoClips.find(vc => vc.id === sc.id);
          originalStart = c?.startTime || 0;
          originalDuration = c?.duration || 0;
          tId = 'v1';
        } else if (sc.type === 'audio') {
          const c = project.audioClips.find(ac => ac.id === sc.id);
          originalStart = c?.startTime || 0;
          originalDuration = c?.duration || 0;
          tId = 'a1';
        } else if (sc.type === 'text') {
          const c = project.textClips.find(tc => tc.id === sc.id);
          originalStart = c?.startTime || 0;
          originalDuration = c?.duration || 0;
          tId = 't1';
        }
        return { id: sc.id, type: sc.type, originalStart, duration: originalDuration, track: tId };
      });
    } else {
      dragGroupRef.current = [{ id, type, originalStart: startTime, duration, track }];
    }
  };

  const renderRulerMarkings = () => {
    const ticks = [];
    const step = zoomScale < 12 ? 5 : (zoomScale < 25 ? 2 : 1);
    for (let t = 0; t <= project.duration; t += step) {
      ticks.push(
        <div
          key={t}
          className="absolute h-full flex flex-col justify-between border-l border-slate-900 pointer-events-none"
          style={{ left: `${t * zoomScale}px` }}
        >
          <span className="text-[8px] font-mono font-bold tracking-tighter text-slate-500 pl-1 pt-1 select-none">
            {Math.floor(t / 60)}:{(t % 60).toString().padStart(2, '0')}:00
          </span>
          <div className="w-[1px] h-1.5 bg-slate-900" />
        </div>
      );
    }
    return ticks;
  };

  const getClipBgClass = (clip: VideoClip) => {
    const isSelected = isClipSelected(clip.id, 'video');
    const base = isSelected 
      ? 'ring-2 ring-indigo-500 shadow-[0_0_18px_rgba(99,102,241,0.85)] shadow-indigo-500/50 hover:scale-[1.03] active:scale-[1.01] active:shadow-[0_0_25px_rgba(99,102,241,0.95)] transition-all duration-300 ease-out transform-gpu' 
      : 'hover:brightness-115 hover:scale-[1.03] active:scale-[0.98] active:shadow-[0_0_12px_rgba(99,102,241,0.4)] transition-all duration-300 ease-out transform-gpu';
    
    switch (clip.proceduralType) {
      case 'vaporwave_sunset': return `${base} bg-gradient-to-r from-pink-800 to-orange-700 border-orange-500`;
      case 'cyberpunk_grid': return `${base} bg-gradient-to-r from-purple-900 to-indigo-800 border-indigo-400`;
      case 'geometric_warp': return `${base} bg-gradient-to-r from-emerald-900 to-teal-800 border-teal-400`;
      case 'nebula_ocean': return `${base} bg-gradient-to-r from-blue-900 to-cyan-800 border-cyan-400`;
    }
  };

  // Safe split/duplicate/delete wrap with locks
  const safeSplit = () => {
    const track = selectedClipType === 'video' ? 'v1' : selectedClipType === 'audio' ? 'a1' : 't1';
    if (lockedTracks[track]) {
      triggerWarning(`Cannot split clip. Track [${track.toUpperCase()}] is locked.`);
      return;
    }
    onSplitClip();
  };

  const safeDuplicate = () => {
    if (selectedClips.length > 0) {
      // Check locked tracks
      const tracksToMutate = new Set(
        selectedClips.map(sc => sc.type === 'video' ? 'v1' : sc.type === 'audio' ? 'a1' : 't1')
      );
      for (const track of Array.from(tracksToMutate)) {
        if (lockedTracks[track]) {
          triggerWarning(`Cannot duplicate. One of the selected tracks [${track.toUpperCase()}] is locked.`);
          return;
        }
      }

      let nextVideo = [...project.videoClips];
      let nextAudio = [...project.audioClips];
      let nextText = [...project.textClips];
      const newSelectedClips: { id: string; type: 'video' | 'audio' | 'text' }[] = [];

      selectedClips.forEach(sc => {
        if (sc.type === 'video') {
          const c = project.videoClips.find(vc => vc.id === sc.id);
          if (c) {
            const copy: VideoClip = {
              ...c,
              id: `v_clip_copy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              name: `${c.name} Copy`,
              startTime: c.startTime + c.duration,
            };
            nextVideo.push(copy);
            newSelectedClips.push({ id: copy.id, type: 'video' });
          }
        } else if (sc.type === 'audio') {
          const c = project.audioClips.find(ac => ac.id === sc.id);
          if (c) {
            const copy: AudioClip = {
              ...c,
              id: `a_clip_copy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              startTime: c.startTime + c.duration,
            };
            nextAudio.push(copy);
            newSelectedClips.push({ id: copy.id, type: 'audio' });
          }
        } else if (sc.type === 'text') {
          const c = project.textClips.find(tc => tc.id === sc.id);
          if (c) {
            const copy: TextClip = {
              ...c,
              id: `t_clip_copy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              startTime: c.startTime + c.duration,
            };
            nextText.push(copy);
            newSelectedClips.push({ id: copy.id, type: 'text' });
          }
        }
      });

      if (newSelectedClips.length > 0) {
        onUpdateVideoClips(nextVideo.sort((a, b) => a.startTime - b.startTime));
        onUpdateAudioClips(nextAudio.sort((a, b) => a.startTime - b.startTime));
        onUpdateTextClips(nextText);
        setSelectedClips(newSelectedClips);
        const lastSelected = newSelectedClips[newSelectedClips.length - 1];
        onSelectClip(lastSelected.id, lastSelected.type);
      }
    } else {
      const track = selectedClipType === 'video' ? 'v1' : selectedClipType === 'audio' ? 'a1' : 't1';
      if (lockedTracks[track]) {
        triggerWarning(`Cannot duplicate clip. Track [${track.toUpperCase()}] is locked.`);
        return;
      }
      onDuplicateClip();
    }
  };

  const safeDelete = () => {
    if (selectedClips.length > 0) {
      // Check if any of the tracks of selected clips are locked
      const tracksToMutate = new Set(
        selectedClips.map(sc => sc.type === 'video' ? 'v1' : sc.type === 'audio' ? 'a1' : 't1')
      );
      for (const track of Array.from(tracksToMutate)) {
        if (lockedTracks[track]) {
          triggerWarning(`Cannot delete. One of the selected tracks [${track.toUpperCase()}] is locked.`);
          return;
        }
      }
      
      // Filter out all selected clips from the project
      const selectedVideoIds = selectedClips.filter(sc => sc.type === 'video').map(sc => sc.id);
      const selectedAudioIds = selectedClips.filter(sc => sc.type === 'audio').map(sc => sc.id);
      const selectedTextIds = selectedClips.filter(sc => sc.type === 'text').map(sc => sc.id);
      
      if (selectedVideoIds.length > 0 || selectedAudioIds.length > 0 || selectedTextIds.length > 0) {
        onUpdateVideoClips(project.videoClips.filter(c => !selectedVideoIds.includes(c.id)));
        onUpdateAudioClips(project.audioClips.filter(c => !selectedAudioIds.includes(c.id)));
        onUpdateTextClips(project.textClips.filter(c => !selectedTextIds.includes(c.id)));
      }
      
      setSelectedClips([]);
      onSelectClip(null, 'video');
    } else {
      const track = selectedClipType === 'video' ? 'v1' : selectedClipType === 'audio' ? 'a1' : 't1';
      if (lockedTracks[track]) {
        triggerWarning(`Cannot delete clip. Track [${track.toUpperCase()}] is locked.`);
        return;
      }
      onDeleteClip();
    }
  };

  const safeRippleDelete = () => {
    if (selectedClips.length === 0) {
      if (selectedClipId && selectedClipType) {
        const track = selectedClipType === 'video' ? 'v1' : selectedClipType === 'audio' ? 'a1' : 't1';
        if (lockedTracks[track]) {
          triggerWarning(`Cannot ripple delete. Track [${track.toUpperCase()}] is locked.`);
          return;
        }
        
        if (selectedClipType === 'video') {
          const deleted = project.videoClips.find(c => c.id === selectedClipId);
          if (deleted) {
            const deletedStart = deleted.startTime;
            const shiftAmount = deleted.duration;
            const nextVideo = project.videoClips
              .filter(c => c.id !== deleted.id)
              .map(c => c.startTime > deletedStart ? { ...c, startTime: Math.max(0, c.startTime - shiftAmount) } : c);
            onUpdateVideoClips(nextVideo);
          }
        } else if (selectedClipType === 'audio') {
          const deleted = project.audioClips.find(c => c.id === selectedClipId);
          if (deleted) {
            const deletedStart = deleted.startTime;
            const shiftAmount = deleted.duration;
            const nextAudio = project.audioClips
              .filter(c => c.id !== deleted.id)
              .map(c => c.startTime > deletedStart ? { ...c, startTime: Math.max(0, c.startTime - shiftAmount) } : c);
            onUpdateAudioClips(nextAudio);
          }
        } else if (selectedClipType === 'text') {
          const deleted = project.textClips.find(c => c.id === selectedClipId);
          if (deleted) {
            const deletedStart = deleted.startTime;
            const shiftAmount = deleted.duration;
            const nextText = project.textClips
              .filter(c => c.id !== deleted.id)
              .map(c => c.startTime > deletedStart ? { ...c, startTime: Math.max(0, c.startTime - shiftAmount) } : c);
            onUpdateTextClips(nextText);
          }
        }
        onSelectClip(null, 'video');
      }
      return;
    }

    const tracksToMutate = new Set(
      selectedClips.map(sc => sc.type === 'video' ? 'v1' : sc.type === 'audio' ? 'a1' : 't1')
    );
    for (const track of Array.from(tracksToMutate)) {
      if (lockedTracks[track]) {
        triggerWarning(`Cannot ripple delete. One of the selected tracks [${track.toUpperCase()}] is locked.`);
        return;
      }
    }

    const selectedVideoIds = selectedClips.filter(sc => sc.type === 'video').map(sc => sc.id);
    const selectedAudioIds = selectedClips.filter(sc => sc.type === 'audio').map(sc => sc.id);
    const selectedTextIds = selectedClips.filter(sc => sc.type === 'text').map(sc => sc.id);

    let nextVideo = [...project.videoClips].sort((a, b) => a.startTime - b.startTime);
    const sortedDeletedClips = nextVideo.filter(c => selectedVideoIds.includes(c.id)).reverse();
    sortedDeletedClips.forEach(deleted => {
      const deletedStart = deleted.startTime;
      const shiftAmount = deleted.duration;
      nextVideo = nextVideo.filter(c => c.id !== deleted.id);
      nextVideo = nextVideo.map(c => c.startTime > deletedStart ? { ...c, startTime: Math.max(0, c.startTime - shiftAmount) } : c);
    });

    let nextAudio = [...project.audioClips].sort((a, b) => a.startTime - b.startTime);
    const sortedDeletedAudio = nextAudio.filter(c => selectedAudioIds.includes(c.id)).reverse();
    sortedDeletedAudio.forEach(deleted => {
      const deletedStart = deleted.startTime;
      const shiftAmount = deleted.duration;
      nextAudio = nextAudio.filter(c => c.id !== deleted.id);
      nextAudio = nextAudio.map(c => c.startTime > deletedStart ? { ...c, startTime: Math.max(0, c.startTime - shiftAmount) } : c);
    });

    let nextText = [...project.textClips].sort((a, b) => a.startTime - b.startTime);
    const sortedDeletedText = nextText.filter(c => selectedTextIds.includes(c.id)).reverse();
    sortedDeletedText.forEach(deleted => {
      const deletedStart = deleted.startTime;
      const shiftAmount = deleted.duration;
      nextText = nextText.filter(c => c.id !== deleted.id);
      nextText = nextText.map(c => c.startTime > deletedStart ? { ...c, startTime: Math.max(0, c.startTime - shiftAmount) } : c);
    });

    onUpdateVideoClips(nextVideo);
    onUpdateAudioClips(nextAudio);
    onUpdateTextClips(nextText);

    setSelectedClips([]);
    onSelectClip(null, 'video');
  };

  const handleDeleteMarker = (markerId: string) => {
    if (onUpdateMarkers) {
      onUpdateMarkers((project.markers || []).filter(m => m.id !== markerId));
    }
  };

  // Left Track Header controls column component
  const TrackHeader = ({ id, label, icon: Icon, colorClass }: { id: TrackId; label: string; icon: any; colorClass: string }) => {
    const isMuted = mutedTracks[id];
    const isLocked = lockedTracks[id];
    return (
      <div className="w-24 shrink-0 bg-slate-950 border-r border-slate-900 flex flex-col justify-center px-2 py-1 select-none z-20 absolute left-0 h-full">
        <div className="flex items-center gap-1">
          <Icon className={`w-2.5 h-2.5 ${colorClass}`} />
          <span className="text-[8.5px] font-extrabold text-white tracking-wider truncate uppercase">{label}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <button
            onClick={() => onToggleMuteTrack(id)}
            className={`p-1 rounded text-[8px] font-bold cursor-pointer transition-colors ${
              isMuted
                ? 'bg-rose-950/40 text-rose-400 border border-rose-900/60'
                : 'bg-slate-900 text-slate-500 hover:text-white border border-slate-850'
            }`}
            title={isMuted ? "Unmute Track" : "Mute Track"}
          >
            {id === 'a1' ? <VolumeX className="w-2.5 h-2.5" /> : (isMuted ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />)}
          </button>
          
          <button
            onClick={() => onToggleLockTrack(id)}
            className={`p-1 rounded text-[8px] font-bold cursor-pointer transition-colors ${
              isLocked
                ? 'bg-amber-950/40 text-amber-400 border border-amber-900/60'
                : 'bg-slate-900 text-slate-500 hover:text-white border border-slate-850'
            }`}
            title={isLocked ? "Unlock Track" : "Lock Track"}
          >
            {isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 shadow-xl backdrop-blur-md relative">
      
      {/* Toast Warning overlay */}
      {warningMessage && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-rose-950/90 border border-rose-500/40 text-rose-200 text-[10px] font-bold px-3 py-1.5 rounded-xl z-50 shadow-lg animate-bounce select-none">
          ⚠️ {warningMessage}
        </div>
      )}

      {/* Dynamic Action Bar (Undo, Redo, Cut, Delete, Duplicate) */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800/50 relative">
          {onUndo && (
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline text-[11px]">Undo</span>
            </button>
          )}

          {onRedo && (
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline text-[11px]">Redo</span>
            </button>
          )}

          {(onUndo || onRedo) && <div className="w-[1px] h-5 bg-slate-800 self-center mx-0.5" />}

          <button
            onClick={safeSplit}
            disabled={!selectedClipId}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Split selected clip at playhead (Ctrl+B / S)"
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span>Split</span>
          </button>
          
          <button
            onClick={safeDuplicate}
            disabled={selectedClips.length === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Duplicate selected clip(s)"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>Duplicate {selectedClips.length > 0 ? `(${selectedClips.length})` : ''}</span>
          </button>

          <button
            onClick={safeDelete}
            disabled={selectedClips.length === 0 && !selectedClipId}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Delete selected clip(s)"
          >
            <Trash className="w-3.5 h-3.5" />
            <span>Delete {selectedClips.length > 0 ? `(${selectedClips.length})` : ''}</span>
          </button>

          <button
            onClick={safeRippleDelete}
            disabled={selectedClips.length === 0 && !selectedClipId}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-pink-400 hover:text-pink-300 hover:bg-pink-950/25 border border-pink-900/20 rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_10px_rgba(244,114,182,0.1)]"
            title="Delete clip and shift all subsequent clips on that track to close the gap"
          >
            <Trash2 className="w-3.5 h-3.5 animate-pulse" />
            <span>Ripple Delete</span>
          </button>

          <div className="w-[1px] h-5 bg-slate-800 self-center mx-1" />

          {/* Add Marker Button */}
          <button
            onClick={() => setShowMarkerForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/25 rounded-lg transition-colors cursor-pointer"
            title="Place a marker pin at playhead"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <span>Add Marker</span>
          </button>

          {/* Beautiful in-app inline marker input popup */}
          {showMarkerForm && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-950/95 border border-slate-800 p-2.5 rounded-xl absolute top-12 left-4 z-50 shadow-2xl animate-fade-in text-xs text-white backdrop-blur-md">
              <span className="font-bold text-slate-400">Marker at {currentTime.toFixed(1)}s:</span>
              <input
                type="text"
                value={markerLabel}
                onChange={(e) => setMarkerLabel(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-[11px] w-28 focus:outline-none focus:border-indigo-500"
                placeholder="Beat Drop / Scene Cut"
                autoFocus
              />
              <div className="flex gap-1">
                {['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#a855f7'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setMarkerColor(c)}
                    className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${markerColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  const newMarker: TimelineMarker = {
                    id: `marker_${Date.now()}`,
                    time: parseFloat(currentTime.toFixed(2)),
                    color: markerColor,
                    label: markerLabel || "Marker",
                  };
                  const updatedMarkers = [...(project.markers || []), newMarker].sort((a, b) => a.time - b.time);
                  if (onUpdateMarkers) {
                    onUpdateMarkers(updatedMarkers);
                  }
                  setShowMarkerForm(false);
                  setMarkerLabel('Beat Drop');
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-2.5 py-1 rounded text-[10px] cursor-pointer active:scale-95 transition-all"
              >
                Add
              </button>
              <button
                onClick={() => setShowMarkerForm(false)}
                className="text-slate-500 hover:text-white px-1 py-1 text-[10px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2 text-slate-400">
          <button
            onClick={() => setZoomScale(prev => Math.max(minZoom, prev - 4))}
            className="p-1.5 hover:text-white hover:bg-slate-800/40 rounded-md transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            value={zoomScale}
            onChange={(e) => setZoomScale(Number(e.target.value))}
            className="w-20 md:w-28 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <button
            onClick={() => setZoomScale(prev => Math.min(maxZoom, prev + 4))}
            className="p-1.5 hover:text-white hover:bg-slate-800/40 rounded-md transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-Track Editor Viewport */}
      <div
        ref={timelineRef}
        onWheel={handleWheel}
        className="relative w-full h-[220px] overflow-x-auto overflow-y-hidden bg-slate-950/80 rounded-xl border border-slate-850 select-none cursor-default"
      >
        {/* Timeline Width Container with padded room at end */}
        <div
          ref={trackContainerRef}
          className="relative h-full pl-24"
          style={{ width: `${project.duration * zoomScale + 160}px` }}
        >
          {/* 1. Time Ruler Segment */}
          <div
            onMouseDown={handleRulerMouseDown}
            className="relative w-full h-8 bg-[#030408] border-b border-slate-900 cursor-ew-resize select-none"
          >
            {renderRulerMarkings()}

            {/* Marker Pins on Time Ruler */}
            {(project.markers || []).map((marker) => {
              const markerX = marker.time * zoomScale;
              return (
                <div
                  key={marker.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTimeUpdate(marker.time);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMarker(marker.id);
                  }}
                  className="absolute top-1 h-6 w-5 flex flex-col items-center justify-start cursor-pointer group/marker"
                  style={{ left: `${markerX - 10}px`, zIndex: 40 }}
                  title={`${marker.label || 'Marker'} (${marker.time.toFixed(2)}s) - Double click to delete`}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-md border border-slate-950 flex items-center justify-center transition-all hover:scale-125 hover:rotate-12 active:scale-95"
                    style={{ backgroundColor: marker.color }}
                  >
                    <span className="text-[7px] text-white font-extrabold uppercase select-none">
                      {marker.label ? marker.label[0] : 'M'}
                    </span>
                  </div>
                  <div className="w-[1.5px] flex-1 opacity-60" style={{ backgroundColor: marker.color }} />
                  
                  {/* Hover label tooltip */}
                  <div className="absolute top-7 bg-slate-950/95 border border-slate-800 text-[10px] font-bold text-white px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap z-50">
                    <span className="font-extrabold" style={{ color: marker.color }}>{marker.label || 'Marker'}: </span>
                    <span>{marker.time.toFixed(1)}s</span>
                    <span className="block text-[8px] text-slate-500 mt-0.5 font-normal">Double click to delete</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tracks Background grid lanes */}
          <div className="absolute inset-0 top-8 pointer-events-none flex flex-col justify-between py-1 opacity-20">
            <div className="h-[44px] border-b border-slate-800" />
            <div className="h-[44px] border-b border-slate-800" />
            <div className="h-[44px] border-b border-slate-800" />
          </div>

          {/* TRACKS CONTAINER */}
          <div className="flex flex-col gap-2 p-1 pt-2 w-full h-[180px] justify-between relative">
            
            {/* Vertical Marker Lines crossing all tracks */}
            {(project.markers || []).map((marker) => {
              const markerX = marker.time * zoomScale;
              return (
                <div
                  key={`guide-${marker.id}`}
                  className="absolute top-0 bottom-0 pointer-events-none z-30 w-[1px]"
                  style={{
                    left: `${markerX}px`,
                    borderLeft: `1px dashed ${marker.color || '#ef4444'}`,
                    boxShadow: `0 0 4px ${marker.color || '#ef4444'}`,
                    opacity: 0.75,
                  }}
                />
              );
            })}
            
            {/* Track 1: Text Overlays (T1) */}
            <div className="relative h-[32px] flex items-center group">
              <TrackHeader id="t1" label="Texts T1" icon={FileText} colorClass="text-amber-400" />

              {/* Clip Track area (offset to avoid covering headers) */}
              <div className="absolute inset-0 left-24 right-0 h-full">
                {project.textClips.map((clip) => {
                  const isLocked = lockedTracks['t1'];
                  const isMuted = mutedTracks['t1'];
                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => handleClipClick(e, clip.id, 'text')}
                      onMouseDown={(e) => startClipDrag(e, clip.id, 'text', 'move', clip.startTime, clip.duration, 't1')}
                      className={`absolute h-full rounded-md border text-slate-200 text-[10px] font-semibold flex items-center px-2 cursor-grab transition-all duration-300 ease-out transform-gpu select-none overflow-hidden ${
                        isClipSelected(clip.id, 'text')
                          ? 'bg-amber-600/30 border-amber-500 ring-2 ring-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.85)] shadow-amber-500/50 hover:scale-[1.03] active:scale-[1.01] active:shadow-[0_0_25px_rgba(245,158,11,0.95)]'
                          : 'bg-amber-950/20 border-amber-900 hover:bg-amber-900/30 hover:scale-[1.03] active:scale-[0.98] active:shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      } ${isLocked ? 'opacity-55 cursor-not-allowed' : ''} ${isMuted ? 'opacity-40 line-through decoration-slate-500' : ''}`}
                      style={{
                        left: `${clip.startTime * zoomScale}px`,
                        width: `${clip.duration * zoomScale}px`,
                      }}
                    >
                      <FileText className="w-3 h-3 text-amber-400 mr-1 shrink-0" />
                      <span className="truncate">{clip.text}</span>
                      
                      {!isLocked && (
                        <>
                          {/* Trim Handles */}
                          <div
                            onMouseDown={(e) => startClipDrag(e, clip.id, 'text', 'trim-start', clip.startTime, clip.duration, 't1')}
                            className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 cursor-ew-resize rounded-l-md hover:w-2.5 transition-all z-10"
                          />
                          <div
                            onMouseDown={(e) => startClipDrag(e, clip.id, 'text', 'trim-end', clip.startTime, clip.duration, 't1')}
                            className="absolute right-0 top-0 bottom-0 w-1.5 bg-amber-500 cursor-ew-resize rounded-r-md hover:w-2.5 transition-all z-10"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Track 2: Video Track Primary (V1) */}
            <div className="relative h-[48px] flex items-center group">
              <TrackHeader id="v1" label="Video V1" icon={Layers} colorClass="text-indigo-400" />

              <div className="absolute inset-0 left-24 right-0 h-full">
                {project.videoClips.map((clip) => {
                  const isLocked = lockedTracks['v1'];
                  const isMuted = mutedTracks['v1'];
                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => handleClipClick(e, clip.id, 'video')}
                      onMouseDown={(e) => startClipDrag(e, clip.id, 'video', 'move', clip.startTime, clip.duration, 'v1')}
                      className={`absolute h-full rounded-lg border flex flex-col justify-between p-1 cursor-grab select-none overflow-hidden ${getClipBgClass(clip)} ${
                        isLocked ? 'opacity-55 cursor-not-allowed' : ''
                      } ${isMuted ? 'opacity-30' : ''}`}
                      style={{
                        left: `${clip.startTime * zoomScale}px`,
                        width: `${clip.duration * zoomScale}px`,
                      }}
                    >
                      {/* Thumbnail / Info header */}
                      <div className="flex items-center justify-between text-[10px] text-white/90 font-bold tracking-tight">
                        <span className="truncate">{clip.name}</span>
                        <span className="text-[8px] opacity-75 font-mono">{clip.speed}x</span>
                      </div>

                      {/* Tiny procedural visual preview */}
                      <div className="w-full h-3 bg-black/40 rounded flex items-center justify-between px-1.5">
                        <Layers className="w-2.5 h-2.5 text-indigo-300" />
                        {isLocked && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                        <div className="flex gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                          <span className="w-1 h-1 rounded-full bg-cyan-400" />
                        </div>
                      </div>

                      {!isLocked && (
                        <>
                          {/* Trim Handles */}
                          <div
                            onMouseDown={(e) => startClipDrag(e, clip.id, 'video', 'trim-start', clip.startTime, clip.duration, 'v1')}
                            className="absolute left-0 top-0 bottom-0 w-2 bg-white/40 cursor-ew-resize rounded-l-lg hover:bg-white/80 transition-all z-10 flex items-center justify-center"
                          >
                            <div className="w-[1px] h-3 bg-slate-900" />
                          </div>
                          <div
                            onMouseDown={(e) => startClipDrag(e, clip.id, 'video', 'trim-end', clip.startTime, clip.duration, 'v1')}
                            className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 cursor-ew-resize rounded-r-lg hover:bg-white/80 transition-all z-10 flex items-center justify-center"
                          >
                            <div className="w-[1px] h-3 bg-slate-900" />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Render Transition trigger pins */}
                {project.videoClips.map((clip, idx) => {
                  if (idx === project.videoClips.length - 1) return null;
                  const nextClip = project.videoClips[idx + 1];
                  const gap = nextClip.startTime - (clip.startTime + clip.duration);
                  if (Math.abs(gap) < 0.2) {
                    const boundaryTime = clip.startTime + clip.duration;
                    const activeTrans = project.transitions.find(t => Math.abs(t.atTime - boundaryTime) < 0.3);

                    return (
                      <button
                        key={`trans-trigger-${clip.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (lockedTracks['v1']) {
                            triggerWarning("Video V1 track is locked. Cannot add transitions.");
                            return;
                          }
                          if (activeTrans) {
                            onOpenTransitionSettings(activeTrans.id);
                          } else {
                            onAddTransition(clip.id, nextClip.id);
                          }
                        }}
                        className={`absolute -translate-x-1/2 w-5 h-5 rounded-full z-20 flex items-center justify-center border text-[9px] font-bold shadow-lg transition-transform hover:scale-110 active:scale-95 ${
                          activeTrans
                            ? 'bg-indigo-600 border-indigo-400 text-white hover:bg-indigo-500'
                            : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white hover:border-slate-400'
                        }`}
                        style={{ left: `${boundaryTime * zoomScale}px` }}
                        title={activeTrans ? `Transition: ${activeTrans.type}` : 'Add Transition'}
                      >
                        {activeTrans ? '⋈' : '+'}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Track 3: Audio Track background (A1) */}
            <div className="relative h-[32px] flex items-center group">
              <TrackHeader id="a1" label="Audio A1" icon={Music} colorClass="text-emerald-400" />

              <div className="absolute inset-0 left-24 right-0 h-full">
                {project.audioClips.map((clip) => {
                  const isLocked = lockedTracks['a1'];
                  const isMuted = mutedTracks['a1'];
                  const isSelected = isClipSelected(clip.id, 'audio');
                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => handleClipClick(e, clip.id, 'audio')}
                      onMouseDown={(e) => startClipDrag(e, clip.id, 'audio', 'move', clip.startTime, clip.duration, 'a1')}
                      className={`absolute h-full rounded-md border text-slate-200 text-[10px] font-semibold flex flex-col justify-center px-3 cursor-grab transition-all duration-300 ease-out transform-gpu select-none overflow-hidden ${
                        isSelected
                          ? 'bg-emerald-600/35 border-emerald-400 ring-2 ring-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.85)] shadow-emerald-500/50 hover:scale-[1.03] active:scale-[1.01] active:shadow-[0_0_25px_rgba(16,185,129,0.95)]'
                          : 'bg-emerald-950/20 border-emerald-900 hover:bg-emerald-900/30 hover:scale-[1.03] active:scale-[0.98] active:shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      } ${isLocked ? 'opacity-55 cursor-not-allowed' : ''} ${isMuted ? 'opacity-30' : ''}`}
                      style={{
                        left: `${clip.startTime * zoomScale}px`,
                        width: `${clip.duration * zoomScale}px`,
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <Music className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate text-[9px]">{clip.name}</span>
                      </div>
                      
                      {/* Visual Waveform Simulation */}
                      <div className="flex gap-[1px] items-end h-2 mt-0.5 w-full opacity-65">
                        <div className="h-full w-[2.5px] bg-emerald-400/80" />
                        <div className="h-1/2 w-[2.5px] bg-emerald-400/80" />
                        <div className="h-3/4 w-[2.5px] bg-emerald-400/80" />
                        <div className="h-1/3 w-[2.5px] bg-emerald-400/80" />
                        <div className="h-full w-[2.5px] bg-emerald-400/80 animate-pulse" />
                        <div className="h-1/2 w-[2.5px] bg-emerald-400/80" />
                      </div>

                      {!isLocked && (
                        <>
                          {/* Trim Handles */}
                          <div
                            onMouseDown={(e) => startClipDrag(e, clip.id, 'audio', 'trim-start', clip.startTime, clip.duration, 'a1')}
                            className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 cursor-ew-resize rounded-l-md hover:w-2.5 transition-all z-10"
                          />
                          <div
                            onMouseDown={(e) => startClipDrag(e, clip.id, 'audio', 'trim-end', clip.startTime, clip.duration, 'a1')}
                            className="absolute right-0 top-0 bottom-0 w-1.5 bg-emerald-500 cursor-ew-resize rounded-r-md hover:w-2.5 transition-all z-10"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 4. Active Red Playhead Cursor */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-pink-500 shadow-md shadow-pink-500/50 z-30 pointer-events-none"
            style={{ left: `${currentTime * zoomScale}px` }}
          >
            <div className="absolute -top-1 -left-2 w-4.5 h-4.5 rounded-full bg-pink-500 border-2 border-white shadow-md shadow-pink-500/40" />
          </div>

        </div>
      </div>

      <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-4">
        <span>💡 Lock tracks (L) to prevent modifications. Mute tracks (M/Eye) to toggle output streams.</span>
      </div>
    </div>
  );
}
