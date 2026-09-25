import React, { useRef, useState, useEffect } from 'react';
import { 
  Scissors, 
  Trash2, 
  Copy, 
  RotateCcw, 
  RotateCw, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Volume2, 
  VolumeX, 
  Type, 
  Video, 
  Music, 
  Magnet, 
  ZoomIn, 
  ZoomOut, 
  Pin,
  Sparkles,
  Layers
} from 'lucide-react';
import { Project, VideoClip, AudioClip, TextClip, TrackId } from '../../types';

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
  onSplitClip: () => void;
  onDeleteClip: () => void;
  onDuplicateClip: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

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
  onSplitClip,
  onDeleteClip,
  onDuplicateClip,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: TimelineProps) {
  const [zoomScale, setZoomScale] = useState(6); // pixels per second
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [mutedTracks, setMutedTracks] = useState<Record<string, boolean>>({});
  const [lockedTracks, setLockedTracks] = useState<Record<string, boolean>>({});
  
  // Dragging / Trimming state
  const [draggingClip, setDraggingClip] = useState<{
    id: string;
    type: 'video' | 'audio' | 'text';
    mode: 'move' | 'trim-start' | 'trim-end';
    startX: number;
    initialStartTime: number;
    initialDuration: number;
  } | null>(null);

  const timelineTracksRef = useRef<HTMLDivElement>(null);

  // Time ruler tick marks (every 15s)
  const totalSeconds = Math.max(project.duration, 240);
  const rulerTicks = [];
  for (let s = 0; s <= totalSeconds; s += 15) {
    rulerTicks.push(s);
  }

  const formatRulerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineTracksRef.current) return;
    const rect = timelineTracksRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineTracksRef.current.scrollLeft;
    const clickedTime = Math.max(0, Math.min(project.duration, clickX / zoomScale));
    onTimeUpdate(clickedTime);
  };

  // Drag and trim handler
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingClip) return;
      const deltaX = e.clientX - draggingClip.startX;
      const deltaTime = deltaX / zoomScale;

      if (draggingClip.mode === 'move') {
        const newStart = Math.max(0, draggingClip.initialStartTime + deltaTime);
        if (draggingClip.type === 'video') {
          onUpdateVideoClips(project.videoClips.map(c => c.id === draggingClip.id ? { ...c, startTime: newStart } : c));
        } else if (draggingClip.type === 'audio') {
          onUpdateAudioClips(project.audioClips.map(c => c.id === draggingClip.id ? { ...c, startTime: newStart } : c));
        } else if (draggingClip.type === 'text') {
          onUpdateTextClips(project.textClips.map(c => c.id === draggingClip.id ? { ...c, startTime: newStart } : c));
        }
      } else if (draggingClip.mode === 'trim-end') {
        const newDuration = Math.max(0.5, draggingClip.initialDuration + deltaTime);
        if (draggingClip.type === 'video') {
          onUpdateVideoClips(project.videoClips.map(c => c.id === draggingClip.id ? { ...c, duration: newDuration } : c));
        } else if (draggingClip.type === 'audio') {
          onUpdateAudioClips(project.audioClips.map(c => c.id === draggingClip.id ? { ...c, duration: newDuration } : c));
        } else if (draggingClip.type === 'text') {
          onUpdateTextClips(project.textClips.map(c => c.id === draggingClip.id ? { ...c, duration: newDuration } : c));
        }
      }
    };

    const handlePointerUp = () => {
      setDraggingClip(null);
    };

    if (draggingClip) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingClip, zoomScale, project, onUpdateVideoClips, onUpdateAudioClips, onUpdateTextClips]);

  return (
    <div className="h-68 bg-[#090D1C] border-t border-white/8 flex flex-col select-none shrink-0 overflow-hidden">
      
      {/* Top Timeline Toolbar */}
      <div className="h-10 bg-[#0D1224] border-b border-white/8 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5">
          {/* History Undo / Redo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-700 rounded hover:bg-white/5 cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-700 rounded hover:bg-white/5 cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Cut / Split */}
          <button
            onClick={onSplitClip}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer flex items-center gap-1"
            title="Split Clip at Playhead (S)"
          >
            <Scissors className="w-3.5 h-3.5 text-[#A78BFA]" />
          </button>

          {/* Duplicate */}
          <button
            onClick={onDuplicateClip}
            disabled={!selectedClipId}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-40 rounded transition-colors cursor-pointer"
            title="Duplicate Clip (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Delete */}
          <button
            onClick={onDeleteClip}
            disabled={!selectedClipId}
            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 disabled:opacity-40 rounded transition-colors cursor-pointer"
            title="Delete Clip (Delete / Backspace)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Magnet Snapping Toggle */}
          <button
            onClick={() => setSnapEnabled(!snapEnabled)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              snapEnabled ? 'text-[#38BDF8] bg-[#38BDF8]/15' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Snap to Edges"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomScale(Math.max(2, zoomScale - 1))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min={2}
            max={15}
            value={zoomScale}
            onChange={(e) => setZoomScale(parseInt(e.target.value))}
            className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <button
            onClick={() => setZoomScale(Math.min(15, zoomScale + 1))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Multi-Track Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Track Headers Column on Left */}
        <div className="w-32 bg-[#090D1C] border-r border-white/8 flex flex-col select-none z-10 shrink-0">
          
          {/* Header Spacer matching Ruler height */}
          <div className="h-6 border-b border-white/8 bg-[#0D1224]" />

          {/* Track 1: Video 1 */}
          <div className="h-12 px-2.5 flex items-center justify-between border-b border-white/8 bg-[#090D1C]">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-300">Video 1</span>
            </div>
            <Lock className="w-3 h-3 text-slate-500" />
          </div>

          {/* Track 2: Video 2 */}
          <div className="h-12 px-2.5 flex items-center justify-between border-b border-white/8 bg-[#090D1C]">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-300">Video 2</span>
            </div>
            <Lock className="w-3 h-3 text-slate-500" />
          </div>

          {/* Track 3: Audio 1 */}
          <div className="h-10 px-2.5 flex items-center justify-between border-b border-white/8 bg-[#090D1C]">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3 h-3 text-[#38BDF8]" />
              <span className="text-[11px] font-bold text-slate-300">Audio 1</span>
            </div>
            <Lock className="w-3 h-3 text-slate-500" />
          </div>

          {/* Track 4: Audio 2 */}
          <div className="h-10 px-2.5 flex items-center justify-between border-b border-white/8 bg-[#090D1C]">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3 h-3 text-[#A78BFA]" />
              <span className="text-[11px] font-bold text-slate-300">Audio 2</span>
            </div>
            <Lock className="w-3 h-3 text-slate-500" />
          </div>

          {/* Track 5: Text 1 */}
          <div className="h-10 px-2.5 flex items-center justify-between border-b border-white/8 bg-[#090D1C]">
            <div className="flex items-center gap-1.5">
              <Type className="w-3 h-3 text-purple-400" />
              <span className="text-[11px] font-bold text-slate-300">Text 1</span>
            </div>
            <Lock className="w-3 h-3 text-slate-500" />
          </div>

        </div>

        {/* Scrollable Tracks Canvas on Right */}
        <div 
          ref={timelineTracksRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#050712]"
        >
          {/* Timeline Tracks Width Container */}
          <div 
            className="h-full relative"
            style={{ width: `${totalSeconds * zoomScale}px` }}
          >
            
            {/* Time Ruler */}
            <div 
              onClick={handleRulerClick}
              className="h-6 bg-[#0D1224] border-b border-white/8 relative cursor-pointer"
            >
              {rulerTicks.map((tick) => (
                <div
                  key={tick}
                  className="absolute top-0 bottom-0 flex flex-col justify-end pb-1 border-l border-white/10 pl-1"
                  style={{ left: `${tick * zoomScale}px` }}
                >
                  <span className="text-[9px] font-mono text-slate-400">
                    {formatRulerTime(tick)}
                  </span>
                </div>
              ))}
            </div>

            {/* Glowing Violet Playhead Line */}
            <div 
              className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
              style={{ left: `${currentTime * zoomScale}px` }}
            >
              {/* Playhead Top Marker */}
              <div className="w-3.5 h-4 bg-[#7C3AED] rounded-b-md shadow-md shadow-purple-900/60 flex items-center justify-center -translate-y-0.5">
                <div className="w-1 h-2 bg-white rounded-full" />
              </div>
              {/* Vertical Playhead Needle */}
              <div className="w-[1.5px] flex-1 bg-[#7C3AED] shadow-[0_0_8px_#7C3AED]" />
            </div>

            {/* Track 1 Rows (Video 1) */}
            <div className="h-12 border-b border-white/5 relative p-1">
              {project.videoClips.filter(c => !c.trackId || c.trackId === 'v1').map((clip) => {
                const isSelected = selectedClipId === clip.id;
                const leftPos = clip.startTime * zoomScale;
                const widthPos = Math.max(20, clip.duration * zoomScale);

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id, 'video');
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id, 'video');
                      setDraggingClip({
                        id: clip.id,
                        type: 'video',
                        mode: 'move',
                        startX: e.clientX,
                        initialStartTime: clip.startTime,
                        initialDuration: clip.duration,
                      });
                    }}
                    className={`absolute top-1 bottom-1 rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing flex items-center transition-shadow select-none group ${
                      isSelected 
                        ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/80 shadow-lg shadow-purple-900/40 z-20' 
                        : 'border-white/15 hover:border-white/40'
                    }`}
                    style={{
                      left: `${leftPos}px`,
                      width: `${widthPos}px`,
                      backgroundImage: clip.thumbnailUrl ? `url(${clip.thumbnailUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Semi-transparent filmstrip overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />

                    {/* Clip Title Badge */}
                    <div className="relative z-10 px-2 flex items-center gap-1.5 truncate">
                      <span className="text-[10px] font-bold text-white drop-shadow">
                        {clip.name}
                      </span>
                    </div>

                    {/* Trim Handles */}
                    <div
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDraggingClip({
                          id: clip.id,
                          type: 'video',
                          mode: 'trim-end',
                          startX: e.clientX,
                          initialStartTime: clip.startTime,
                          initialDuration: clip.duration,
                        });
                      }}
                      className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-[#7C3AED] cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                );
              })}
            </div>

            {/* Track 2 Rows (Video 2 / Overlay) */}
            <div className="h-12 border-b border-white/5 relative p-1">
              {project.videoClips.filter(c => c.trackId === 'v2').map((clip) => {
                const isSelected = selectedClipId === clip.id;
                const leftPos = clip.startTime * zoomScale;
                const widthPos = Math.max(20, clip.duration * zoomScale);

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id, 'video');
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id, 'video');
                      setDraggingClip({
                        id: clip.id,
                        type: 'video',
                        mode: 'move',
                        startX: e.clientX,
                        initialStartTime: clip.startTime,
                        initialDuration: clip.duration,
                      });
                    }}
                    className={`absolute top-1 bottom-1 rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing flex items-center select-none group ${
                      isSelected 
                        ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/80 shadow-lg shadow-purple-900/40 z-20' 
                        : 'border-white/15 hover:border-white/40'
                    }`}
                    style={{
                      left: `${leftPos}px`,
                      width: `${widthPos}px`,
                      backgroundImage: clip.thumbnailUrl ? `url(${clip.thumbnailUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
                    <div className="relative z-10 px-2 flex items-center gap-1.5 truncate">
                      <span className="text-[10px] font-bold text-white drop-shadow">
                        {clip.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Track 3 Rows (Audio 1 - Cyan Waveform) */}
            <div className="h-10 border-b border-white/5 relative p-1">
              {project.audioClips.filter(c => !c.trackId || c.trackId === 'a1').map((clip) => {
                const isSelected = selectedClipId === clip.id;
                const leftPos = clip.startTime * zoomScale;
                const widthPos = Math.max(20, clip.duration * zoomScale);

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id, 'audio');
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id, 'audio');
                      setDraggingClip({
                        id: clip.id,
                        type: 'audio',
                        mode: 'move',
                        startX: e.clientX,
                        initialStartTime: clip.startTime,
                        initialDuration: clip.duration,
                      });
                    }}
                    className={`absolute top-1 bottom-1 rounded-lg border bg-[#042f2e]/80 border-teal-500/40 overflow-hidden cursor-grab flex items-center px-2 select-none group ${
                      isSelected ? 'ring-2 ring-teal-400 z-20' : ''
                    }`}
                    style={{
                      left: `${leftPos}px`,
                      width: `${widthPos}px`,
                    }}
                  >
                    <Music className="w-3 h-3 text-teal-400 mr-1.5 shrink-0" />
                    <span className="text-[10px] font-bold text-teal-200 truncate">
                      {clip.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Track 4 Rows (Audio 2 - Purple Waveform) */}
            <div className="h-10 border-b border-white/5 relative p-1">
              {project.audioClips.filter(c => c.trackId === 'a2').map((clip) => {
                const isSelected = selectedClipId === clip.id;
                const leftPos = clip.startTime * zoomScale;
                const widthPos = Math.max(20, clip.duration * zoomScale);

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id, 'audio');
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id, 'audio');
                      setDraggingClip({
                        id: clip.id,
                        type: 'audio',
                        mode: 'move',
                        startX: e.clientX,
                        initialStartTime: clip.startTime,
                        initialDuration: clip.duration,
                      });
                    }}
                    className={`absolute top-1 bottom-1 rounded-lg border bg-[#3b0764]/80 border-purple-500/40 overflow-hidden cursor-grab flex items-center px-2 select-none group ${
                      isSelected ? 'ring-2 ring-purple-400 z-20' : ''
                    }`}
                    style={{
                      left: `${leftPos}px`,
                      width: `${widthPos}px`,
                    }}
                  >
                    <Music className="w-3 h-3 text-purple-400 mr-1.5 shrink-0" />
                    <span className="text-[10px] font-bold text-purple-200 truncate">
                      {clip.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Track 5 Rows (Text 1) */}
            <div className="h-10 border-b border-white/5 relative p-1">
              {project.textClips.map((clip) => {
                const isSelected = selectedClipId === clip.id;
                const leftPos = clip.startTime * zoomScale;
                const widthPos = Math.max(20, clip.duration * zoomScale);

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id, 'text');
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id, 'text');
                      setDraggingClip({
                        id: clip.id,
                        type: 'text',
                        mode: 'move',
                        startX: e.clientX,
                        initialStartTime: clip.startTime,
                        initialDuration: clip.duration,
                      });
                    }}
                    className={`absolute top-1 bottom-1 rounded-lg border bg-[#4c1d95]/80 border-purple-400/50 overflow-hidden cursor-grab flex items-center px-2 select-none group ${
                      isSelected ? 'ring-2 ring-purple-300 z-20' : ''
                    }`}
                    style={{
                      left: `${leftPos}px`,
                      width: `${widthPos}px`,
                    }}
                  >
                    <Type className="w-3 h-3 text-purple-300 mr-1.5 shrink-0" />
                    <span className="text-[10px] font-bold text-purple-100 truncate">
                      {clip.text || clip.name}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
