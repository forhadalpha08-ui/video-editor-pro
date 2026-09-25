import React from 'react';
import { SlidersHorizontal, Check } from 'lucide-react';
import { FilterPresetType } from '../../types';

interface FiltersLibraryProps {
  activeFilter: FilterPresetType;
  onSelectFilter: (filter: FilterPresetType) => void;
}

interface FilterItem {
  id: FilterPresetType;
  name: string;
  category: 'Cinematic' | 'Mood' | 'Vintage' | 'Cyber';
  colorPreview: string;
}

const FILTERS: FilterItem[] = [
  { id: 'none', name: 'Original (No Filter)', category: 'Cinematic', colorPreview: 'linear-gradient(135deg, #334155, #475569)' },
  { id: 'cinematic_teal_orange', name: 'Teal & Orange Blockbuster', category: 'Cinematic', colorPreview: 'linear-gradient(135deg, #0284c7, #f97316)' },
  { id: 'moody_dark', name: 'Moody Dark Forest', category: 'Mood', colorPreview: 'linear-gradient(135deg, #064e3b, #0f172a)' },
  { id: 'vintage_70s', name: 'Vintage 70s Kodachrome', category: 'Vintage', colorPreview: 'linear-gradient(135deg, #b45309, #78350f)' },
  { id: 'bw_high_contrast', name: 'Black & White Noir', category: 'Mood', colorPreview: 'linear-gradient(135deg, #ffffff, #000000)' },
  { id: 'warm_sunset', name: 'Golden Hour Sunset', category: 'Cinematic', colorPreview: 'linear-gradient(135deg, #e11d48, #f59e0b)' },
  { id: 'cool_arctic', name: 'Cool Arctic Blue', category: 'Mood', colorPreview: 'linear-gradient(135deg, #38bdf8, #1e293b)' },
  { id: 'cyberpunk_neon', name: 'Cyberpunk Neo Purple', category: 'Cyber', colorPreview: 'linear-gradient(135deg, #a855f7, #06b6d4)' },
];

export default function FiltersLibrary({ activeFilter, onSelectFilter }: FiltersLibraryProps) {
  return (
    <div className="w-80 bg-[#090D1C] border-r border-white/8 flex flex-col h-full select-none shrink-0">
      <div className="p-3.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#A78BFA]" />
          <h2 className="text-sm font-bold text-white">Color Filters (LUTs)</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5">
        {FILTERS.map((filter) => {
          const isSelected = activeFilter === filter.id;
          return (
            <div
              key={filter.id}
              onClick={() => onSelectFilter(filter.id)}
              className={`p-2.5 bg-[#0D1224] rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                isSelected 
                  ? 'border-[#7C3AED] ring-1 ring-[#7C3AED] shadow-lg shadow-purple-900/30' 
                  : 'border-white/8 hover:border-white/20'
              }`}
            >
              <div 
                className="w-full h-14 rounded-lg flex items-center justify-center relative overflow-hidden"
                style={{ background: filter.colorPreview }}
              >
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-white/90 text-[#7C3AED] flex items-center justify-center shadow">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  {filter.name}
                </span>
                <span className="text-[10px] text-slate-500">{filter.category}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
