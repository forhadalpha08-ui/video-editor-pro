import React from 'react';
import { LayoutTemplate, Sparkles, Check } from 'lucide-react';
import { Project } from '../../types';

interface TemplatesPanelProps {
  currentProjectId: string;
  onSelectTemplate: (templateId: string) => void;
}

interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  duration: string;
  thumbnail: string;
}

const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'proj_01',
    name: 'Project 01 - Cinematic Journey',
    category: 'Cinematic',
    duration: '03:56',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj_02',
    name: 'Cyberpunk Tokyo Nights',
    category: 'Cyberpunk',
    duration: '01:45',
    thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj_03',
    name: 'Nordic Alpine Wilderness',
    category: 'Nature',
    duration: '02:30',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj_04',
    name: 'Sunset Golden Hour Vlog',
    category: 'Vlog',
    duration: '02:10',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
  },
];

export default function TemplatesPanel({ currentProjectId, onSelectTemplate }: TemplatesPanelProps) {
  return (
    <div className="w-80 bg-[#090D1C] border-r border-white/8 flex flex-col h-full select-none shrink-0">
      <div className="p-3.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-[#A78BFA]" />
          <h2 className="text-sm font-bold text-white">Project Templates</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {TEMPLATES.map((tmpl) => {
          const isSelected = currentProjectId === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`group bg-[#0D1224] rounded-xl border overflow-hidden cursor-pointer transition-all ${
                isSelected 
                  ? 'border-[#7C3AED] ring-1 ring-[#7C3AED] shadow-lg shadow-purple-900/30' 
                  : 'border-white/8 hover:border-white/20'
              }`}
            >
              <div className="aspect-video relative overflow-hidden bg-black/50">
                <img
                  src={tmpl.thumbnail}
                  alt={tmpl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono font-bold text-white">
                  {tmpl.duration}
                </span>
                {isSelected && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#7C3AED] rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
                    <Check className="w-3 h-3" />
                    <span>Active</span>
                  </div>
                )}
              </div>

              <div className="p-2.5 flex flex-col">
                <span className="text-xs font-bold text-white group-hover:text-[#A78BFA] transition-colors truncate">
                  {tmpl.name}
                </span>
                <span className="text-[10px] text-slate-400">{tmpl.category}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
