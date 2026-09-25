import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause Preview' },
    { key: 'S / Ctrl + B', desc: 'Split Clip at Playhead' },
    { key: 'Delete / Backspace', desc: 'Delete Selected Clip' },
    { key: 'Ctrl + Z', desc: 'Undo' },
    { key: 'Ctrl + Y / Ctrl + Shift + Z', desc: 'Redo' },
    { key: 'Ctrl + D', desc: 'Duplicate Selected Clip' },
    { key: '← / →', desc: 'Step 1 Frame' },
    { key: 'Shift + ← / →', desc: 'Jump 1 Second' },
    { key: 'J / K / L', desc: 'Shuttle (Reverse / Pause / Forward)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-md bg-[#090D1C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/8 flex items-center justify-between bg-[#0D1224]/80">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#A78BFA]" />
            <h2 className="text-sm font-bold text-white">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto text-xs text-slate-300">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-300">{s.desc}</span>
              <kbd className="px-2 py-0.5 bg-[#0D1224] border border-white/10 rounded text-[11px] font-mono text-[#A78BFA]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
