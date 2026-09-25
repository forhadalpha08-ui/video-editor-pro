import React from 'react';
import { 
  FolderOpen, 
  Music, 
  Type, 
  Shapes, 
  Sparkles, 
  Wand2, 
  SlidersHorizontal, 
  Sliders, 
  Smile, 
  Subtitles, 
  LayoutTemplate, 
  Settings 
} from 'lucide-react';

export type ToolType = 
  | 'media' 
  | 'audio' 
  | 'text' 
  | 'elements' 
  | 'transitions' 
  | 'effects' 
  | 'filters' 
  | 'adjust' 
  | 'stickers' 
  | 'captions' 
  | 'templates' 
  | 'settings';

interface LeftToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

interface ToolItem {
  id: ToolType;
  label: string;
  icon: React.ElementType;
}

const TOOLS: ToolItem[] = [
  { id: 'media', label: 'Media', icon: FolderOpen },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'elements', label: 'Elements', icon: Shapes },
  { id: 'transitions', label: 'Transitions', icon: Sparkles },
  { id: 'effects', label: 'Effects', icon: Wand2 },
  { id: 'filters', label: 'Filters', icon: SlidersHorizontal },
  { id: 'adjust', label: 'Adjust', icon: Sliders },
  { id: 'stickers', label: 'Stickers', icon: Smile },
  { id: 'captions', label: 'Captions', icon: Subtitles },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function LeftToolbar({ activeTool, onSelectTool }: LeftToolbarProps) {
  return (
    <aside className="w-18 bg-[#090D1C] border-r border-white/8 flex flex-col items-center py-3 select-none z-20 shrink-0 overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer group relative ${
                isActive
                  ? 'dock-item-active text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title={tool.label}
            >
              <Icon 
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-[#A78BFA]' : 'text-slate-400 group-hover:text-slate-200'
                }`} 
              />
              <span className={`text-[10px] tracking-tight font-medium ${isActive ? 'font-bold text-white' : ''}`}>
                {tool.label}
              </span>

              {/* Active Indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#7C3AED] rounded-r-full shadow-[0_0_8px_#7C3AED]" />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
