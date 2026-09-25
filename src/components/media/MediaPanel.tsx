import React, { useState, useRef } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Film, 
  Image as ImageIcon, 
  Music, 
  Heart, 
  MoreVertical, 
  Grid, 
  List, 
  Play, 
  Trash2, 
  Copy,
  Sparkles
} from 'lucide-react';
import { MediaAsset } from '../../types';

interface MediaPanelProps {
  assets: MediaAsset[];
  onAddAssetToTimeline: (asset: MediaAsset) => void;
  onImportFiles: (files: FileList) => void;
  onDeleteAsset: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function MediaPanel({
  assets,
  onAddAssetToTimeline,
  onImportFiles,
  onDeleteAsset,
  onToggleFavorite,
}: MediaPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'videos' | 'images' | 'audio' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'videos', label: 'Videos' },
    { id: 'images', label: 'Images' },
    { id: 'audio', label: 'Audio' },
    { id: 'favorites', label: 'Favorites' },
  ];

  const filteredAssets = assets.filter((asset) => {
    // Search filter
    if (searchQuery.trim() && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Category filter
    if (activeCategory === 'videos' && asset.type !== 'video') return false;
    if (activeCategory === 'images' && asset.type !== 'image') return false;
    if (activeCategory === 'audio' && asset.type !== 'audio') return false;
    if (activeCategory === 'favorites' && !asset.favorite) return false;
    return true;
  });

  const handleDragStart = (e: React.DragEvent, asset: MediaAsset) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImportFiles(e.dataTransfer.files);
    }
  };

  return (
    <div 
      className="w-80 bg-[#090D1C] border-r border-white/8 flex flex-col h-full select-none shrink-0"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="p-3.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white tracking-tight">Media</h2>
          <span className="text-[11px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
            {filteredAssets.length}
          </span>
        </div>

        {/* View Mode & Upload Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-vedit-primary p-1.5 rounded-lg text-white hover:scale-105 transition-all cursor-pointer"
            title="Import Media (MP4, MOV, PNG, MP3, etc.)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,audio/*,image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onImportFiles(e.target.files);
              }
            }}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-3 flex flex-col gap-2.5 border-b border-white/8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media, images, videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 bg-[#0D1224] border border-white/8 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED] transition-colors"
          />
          <button 
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            title="Advanced Filters"
          >
            <SlidersHorizontal className="w-3 h-3" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-900/30'
                  : 'bg-[#0D1224] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Grid / List Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredAssets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <Film className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-300">No media found</p>
            <p className="text-[11px] text-slate-500 mt-1">Drag files here or click + to import</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => handleDragStart(e, asset)}
                onClick={() => onAddAssetToTimeline(asset)}
                className="group relative bg-[#0D1224] rounded-xl border border-white/8 overflow-hidden hover:border-[#7C3AED]/60 hover:shadow-lg hover:shadow-purple-900/20 transition-all cursor-pointer flex flex-col"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-black/40 overflow-hidden">
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Audio waveform overlay for audio files */}
                  {asset.type === 'audio' && (
                    <div className="absolute inset-0 bg-[#090D1C]/80 flex items-center justify-center">
                      <Music className="w-5 h-5 text-[#38BDF8]" />
                    </div>
                  )}

                  {/* Duration Badge */}
                  {asset.duration > 0 && (
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] font-mono font-bold text-white leading-none">
                      {Math.floor(asset.duration / 60).toString().padStart(2, '0')}:
                      {Math.floor(asset.duration % 60).toString().padStart(2, '0')}
                    </span>
                  )}

                  {/* Hover Play / Add overlay */}
                  <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button 
                      className="p-1 rounded-full bg-white/20 text-white hover:scale-110 transition-transform"
                      title="Add to Timeline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer details */}
                <div className="p-1.5 flex items-center justify-between bg-[#0D1224] gap-1">
                  <span className="text-[10px] font-medium text-slate-300 truncate group-hover:text-white" title={asset.name}>
                    {asset.name}
                  </span>

                  {/* More Menu Dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === asset.id ? null : asset.id);
                      }}
                      className="text-slate-500 hover:text-slate-300 p-0.5 rounded hover:bg-white/5"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>

                    {activeMenuId === asset.id && (
                      <div 
                        className="absolute right-0 bottom-full mb-1 w-32 bg-[#090D1C] border border-white/10 rounded-lg shadow-2xl py-1 z-50 text-[11px] text-slate-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            onToggleFavorite(asset.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-2.5 py-1 text-left hover:bg-white/5 flex items-center gap-1.5"
                        >
                          <Heart className={`w-3 h-3 ${asset.favorite ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                          <span>{asset.favorite ? 'Unfavorite' : 'Favorite'}</span>
                        </button>
                        <button
                          onClick={() => {
                            onAddAssetToTimeline(asset);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-2.5 py-1 text-left hover:bg-white/5 flex items-center gap-1.5"
                        >
                          <Plus className="w-3 h-3 text-[#A78BFA]" />
                          <span>Add to Track</span>
                        </button>
                        <button
                          onClick={() => {
                            onDeleteAsset(asset.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-2.5 py-1 text-left hover:bg-rose-950/30 text-rose-400 flex items-center gap-1.5 border-t border-white/5 mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drag & drop dropzone hint footer */}
      <div className="p-2.5 border-t border-white/8 bg-[#0D1224]/50 text-center">
        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-[#7C3AED]" />
          <span>Drag media directly onto timeline tracks</span>
        </p>
      </div>
    </div>
  );
}
