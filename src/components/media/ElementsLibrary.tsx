import React from 'react';
import { Shapes, ArrowRight, Circle, Square, Bell, Heart, ThumbsUp, Sparkles, MessageCircle, Share2, Plus } from 'lucide-react';
import { TextClip } from '../../types';

interface ElementsLibraryProps {
  onAddElement: (element: Omit<TextClip, 'id'>) => void;
}

interface ElementItem {
  id: string;
  name: string;
  category: 'Social' | 'Shapes' | 'Badges';
  icon: React.ElementType;
  text: string;
  bgColor: string;
}

const ELEMENTS: ElementItem[] = [
  { id: 'sub_btn', name: 'Subscribe Button', category: 'Social', icon: Bell, text: '🔔 SUBSCRIBE', bgColor: '#EF4444' },
  { id: 'like_badge', name: 'Like & Share Pill', category: 'Social', icon: ThumbsUp, text: '👍 LIKE & SHARE', bgColor: '#3B82F6' },
  { id: 'follow_btn', name: 'Follow Creator', category: 'Social', icon: Heart, text: '❤️ FOLLOW', bgColor: '#EC4899' },
  { id: 'comment_btn', name: 'Leave a Comment', category: 'Social', icon: MessageCircle, text: '💬 COMMENT', bgColor: '#10B981' },
  { id: 'cinema_badge', name: '4K Ultra HD Badge', category: 'Badges', icon: Sparkles, text: '4K ULTRA HD', bgColor: '#F59E0B' },
  { id: 'pro_badge', name: 'Director Cut Badge', category: 'Badges', icon: Sparkles, text: 'DIRECTOR CUT', bgColor: '#7C3AED' },
];

export default function ElementsLibrary({ onAddElement }: ElementsLibraryProps) {
  const handleAdd = (item: ElementItem) => {
    onAddElement({
      name: item.name,
      type: 'text',
      startTime: 0,
      duration: 4,
      text: item.text,
      color: '#FFFFFF',
      fontSize: 20,
      fontFamily: 'Plus Jakarta Sans',
      positionX: 50,
      positionY: 85,
      opacity: 100,
      style: 'badge',
      animation: 'pop',
      backgroundColor: item.bgColor,
      trackId: 't1',
    });
  };

  return (
    <div className="w-80 bg-[#090D1C] border-r border-white/8 flex flex-col h-full select-none shrink-0">
      <div className="p-3.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shapes className="w-4 h-4 text-[#A78BFA]" />
          <h2 className="text-sm font-bold text-white">Elements & Badges</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        {ELEMENTS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => handleAdd(item)}
              className="p-3 bg-[#0D1224] rounded-xl border border-white/8 hover:border-[#7C3AED]/50 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: item.bgColor }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-500">{item.category}</span>
                </div>
              </div>

              <button className="p-1.5 rounded-lg bg-white/5 group-hover:bg-[#7C3AED] text-slate-400 group-hover:text-white transition-all">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
