import React, { useState } from 'react';
import { Subtitles, Sparkles, Plus, Trash2, Wand2 } from 'lucide-react';
import { CaptionItem } from '../../types';

interface CaptionsPanelProps {
  captions: CaptionItem[];
  onAddCaption: (caption: CaptionItem) => void;
  onUpdateCaption: (id: string, text: string) => void;
  onDeleteCaption: (id: string) => void;
  onAutoGenerateCaptions: () => void;
}

export default function CaptionsPanel({
  captions,
  onAddCaption,
  onUpdateCaption,
  onDeleteCaption,
  onAutoGenerateCaptions,
}: CaptionsPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onAutoGenerateCaptions();
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="w-80 bg-[#090D1C] border-r border-white/8 flex flex-col h-full select-none shrink-0">
      <div className="p-3.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Subtitles className="w-4 h-4 text-[#A78BFA]" />
          <h2 className="text-sm font-bold text-white">Auto Captions</h2>
        </div>
      </div>

      <div className="p-3 border-b border-white/8 flex flex-col gap-2">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn-vedit-primary w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
        >
          <Wand2 className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Transcribing speech AI...' : 'Auto-Generate Captions'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {captions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <Subtitles className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-300">No Captions Yet</p>
            <p className="text-[11px] text-slate-500 mt-1">Generate AI captions from speech or add lines manually</p>
          </div>
        ) : (
          captions.map((cap) => (
            <div
              key={cap.id}
              className="p-2.5 bg-[#0D1224] rounded-xl border border-white/8 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{cap.startTime.toFixed(1)}s → {cap.endTime.toFixed(1)}s</span>
                <button
                  onClick={() => onDeleteCaption(cap.id)}
                  className="text-slate-500 hover:text-rose-400 p-0.5 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <input
                type="text"
                value={cap.text}
                onChange={(e) => onUpdateCaption(cap.id, e.target.value)}
                className="w-full px-2 py-1 bg-black/40 border border-white/5 rounded text-xs text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
