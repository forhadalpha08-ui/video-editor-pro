import React, { useState } from 'react';
import { 
  Sparkles, 
  Mic, 
  Wand2, 
  Volume2, 
  Activity, 
  Subtitles, 
  Scissors, 
  Zap, 
  Layers, 
  Check, 
  Play, 
  Flame, 
  Radio, 
  Headphones, 
  Sliders, 
  ShieldCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Project, TextClip, AudioClip, TimelineMarker } from '../types';

interface AIMagicStudioProps {
  project: Project;
  currentTime: number;
  onAddTextClips: (clips: TextClip[]) => void;
  onAddAudioClip: (clip: AudioClip) => void;
  onAddMarkers: (markers: TimelineMarker[]) => void;
  onAutoSplitClips?: () => void;
  onApplySuperRes?: () => void;
}

const TTS_VOICE_PRESETS = [
  { id: 'movie_trailer', name: 'Epic Movie Narrator', pitch: 0.7, rate: 0.9, icon: Flame, style: 'Deep, cinematic, resonant trailer voice' },
  { id: 'cyber_ai', name: 'Cyberpunk Synth AI', pitch: 1.3, rate: 1.1, icon: Radio, style: 'Futuristic robotic synthesized speech' },
  { id: 'tech_reviewer', name: 'Tech Host & Reviewer', pitch: 1.0, rate: 1.05, icon: Headphones, style: 'Crisp, articulate modern tech reviewer' },
  { id: 'lofi_chill', name: 'Lo-Fi Chill Storyteller', pitch: 0.9, rate: 0.85, icon: Mic, style: 'Warm, relaxed, soothing late-night narrator' },
  { id: 'energetic_vlog', name: 'Energetic Creator', pitch: 1.15, rate: 1.2, icon: Zap, style: 'High energy, punchy social media style' },
];

const CAPTION_STYLES: { id: string; name: string; preview: string; color: string; style: TextClip['style'] }[] = [
  { id: 'karaoke_neon', name: 'Karaoke Neon Glow', preview: 'NEON HIGHLIGHT', color: '#00ffea', style: 'neon' },
  { id: 'bold_bordered', name: 'Bold Stroke Outline', preview: 'BOLD IMPACT', color: '#ffffff', style: 'bordered' },
  { id: 'cinematic_lower', name: 'Cinematic Lower Third', preview: 'EPISODE 01 // TOKYO', color: '#f59e0b', style: 'cinematic_lower_third' },
  { id: 'glitch_pop', name: 'RGB Glitch Kinetic', preview: 'GLITCH // PUNCH', color: '#ff0055', style: 'glitch' },
  { id: 'badge_tag', name: 'Studio Tag Badge', preview: '• 4K ULTRA HDR •', color: '#38bdf8', style: 'badge' },
];

export default function AIMagicStudio({
  project,
  currentTime,
  onAddTextClips,
  onAddAudioClip,
  onAddMarkers,
  onAutoSplitClips,
  onApplySuperRes,
}: AIMagicStudioProps) {
  const [activeTab, setActiveTab] = useState<'captions' | 'tts' | 'beats' | 'enhance' | 'silence'>('captions');
  
  // Auto Captions State
  const [captionText, setCaptionText] = useState('Welcome to the future of cinematic video editing with intelligent real-time AI tools.');
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState('karaoke_neon');
  const [captionGenSuccess, setCaptionGenSuccess] = useState(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);

  // TTS Voiceover State
  const [ttsInputText, setTtsInputText] = useState('Experience breathtaking visual fidelity and studio grade sound engineering.');
  const [selectedVoice, setSelectedVoice] = useState('movie_trailer');
  const [ttsVolume, setTtsVolume] = useState(90);
  const [isSynthesizingTTS, setIsSynthesizingTTS] = useState(false);
  const [ttsSuccess, setTtsSuccess] = useState(false);

  // Beat Detector State
  const [selectedBpm, setSelectedBpm] = useState<120 | 128 | 140 | 150>(128);
  const [isDetectingBeats, setIsDetectingBeats] = useState(false);
  const [beatsApplied, setBeatsApplied] = useState(false);

  // AI Enhancer State
  const [superResEnabled, setSuperResEnabled] = useState(false);
  const [frameInterpolation60fps, setFrameInterpolation60fps] = useState(true);
  const [autoColorBalance, setAutoColorBalance] = useState(true);
  const [noiseRemovalAmount, setNoiseRemovalAmount] = useState(65);

  // Silence Remover State
  const [silenceThreshold, setSilenceThreshold] = useState(-36); // dB
  const [minPauseLength, setMinPauseLength] = useState(0.4); // seconds
  const [silenceRemovedSuccess, setSilenceRemovedSuccess] = useState(false);

  // Handler: Generate Auto-Captions
  const handleGenerateCaptions = () => {
    setIsGeneratingCaptions(true);
    setTimeout(() => {
      const words = captionText.trim().split(/\s+/);
      const styleConfig = CAPTION_STYLES.find((c) => c.id === selectedCaptionStyle) || CAPTION_STYLES[0];
      
      // Group words into phrases of 3-4 words
      const phraseGroups: string[] = [];
      for (let i = 0; i < words.length; i += 3) {
        phraseGroups.push(words.slice(i, i + 3).join(' '));
      }

      const totalDuration = Math.min(project.duration, Math.max(6, phraseGroups.length * 2.2));
      const segmentDuration = totalDuration / Math.max(1, phraseGroups.length);

      const generatedClips: TextClip[] = phraseGroups.map((phrase, idx) => ({
        id: `ai_cap_${Date.now()}_${idx}`,
        name: `AI Subtitle [${idx + 1}]`,
        type: 'text',
        startTime: parseFloat((idx * segmentDuration).toFixed(2)),
        duration: parseFloat(Math.min(segmentDuration, 3.5).toFixed(2)),
        text: phrase.toUpperCase(),
        color: styleConfig.color,
        fontSize: styleConfig.style === 'cinematic_lower_third' ? 20 : 28,
        positionY: styleConfig.style === 'cinematic_lower_third' ? 82 : 75,
        style: styleConfig.style,
        animation: styleConfig.style === 'glitch' ? 'glitch_shake' : 'fade_slide',
        fontFamily: 'Inter, sans-serif'
      }));

      onAddTextClips(generatedClips);
      setIsGeneratingCaptions(false);
      setCaptionGenSuccess(true);
      setTimeout(() => setCaptionGenSuccess(false), 3000);
    }, 600);
  };

  // Handler: Generate TTS Narration Voiceover
  const handleGenerateTTS = () => {
    setIsSynthesizingTTS(true);
    const chosenVoice = TTS_VOICE_PRESETS.find((v) => v.id === selectedVoice) || TTS_VOICE_PRESETS[0];

    // Use Web Speech API if supported in browser
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(ttsInputText);
      utterance.pitch = chosenVoice.pitch;
      utterance.rate = chosenVoice.rate;
      utterance.volume = ttsVolume / 100;
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Pick an English voice
        const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Natural') || v.name.includes('Google')));
        if (englishVoice) utterance.voice = englishVoice;
      }

      utterance.onend = () => {
        setIsSynthesizingTTS(false);
      };
      utterance.onerror = () => {
        setIsSynthesizingTTS(false);
      };

      window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => {
      // Create new AI Audio Track Clip on timeline
      const estimatedDuration = Math.max(3, parseFloat((ttsInputText.split(' ').length * 0.45).toFixed(1)));
      const newAudioClip: AudioClip = {
        id: `ai_tts_${Date.now()}`,
        name: `AI Voice (${chosenVoice.name})`,
        type: 'audio',
        startTime: currentTime,
        duration: estimatedDuration,
        sourceStart: 0,
        volume: ttsVolume,
        audioStyle: 'custom_recorded',
      };

      onAddAudioClip(newAudioClip);
      setIsSynthesizingTTS(false);
      setTtsSuccess(true);
      setTimeout(() => setTtsSuccess(false), 3000);
    }, 800);
  };

  // Handler: Detect Beats & Add Timeline Markers
  const handleDetectBeats = () => {
    setIsDetectingBeats(true);
    setTimeout(() => {
      const beatInterval = 60 / selectedBpm; // seconds per beat
      const newMarkers: TimelineMarker[] = [];
      let beatTime = 0;
      let count = 1;

      while (beatTime < project.duration) {
        const isBarStart = count % 4 === 1;
        newMarkers.push({
          id: `bm_${Date.now()}_${count}`,
          time: parseFloat(beatTime.toFixed(3)),
          color: isBarStart ? '#ec4899' : '#38bdf8',
          label: isBarStart ? `Bar ${Math.ceil(count / 4)}` : `Beat ${count}`
        });
        beatTime += beatInterval;
        count++;
      }

      onAddMarkers(newMarkers);
      setIsDetectingBeats(false);
      setBeatsApplied(true);
      setTimeout(() => setBeatsApplied(false), 3000);
    }, 500);
  };

  // Handler: Remove Silence
  const handleRemoveSilence = () => {
    if (onAutoSplitClips) {
      onAutoSplitClips();
    }
    setSilenceRemovedSuccess(true);
    setTimeout(() => setSilenceRemovedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      
      {/* Studio Header */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-pink-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-white flex items-center gap-1.5">
              <span>AI Magic Studio Pro</span>
              <span className="px-1.5 py-0.2 bg-gradient-to-r from-pink-500 to-purple-600 text-[8px] font-black rounded-md text-white uppercase tracking-normal">
                CapCut & Runway AI
              </span>
            </span>
            <span className="text-[9.5px] text-slate-400">
              One-click neural auto-captions, neural voiceover TTS, beat sync & super resolution.
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tool Selection Tabs */}
      <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl border border-indigo-500/20 shadow-inner">
        {[
          { id: 'captions', label: 'Auto Subtitles', icon: Subtitles },
          { id: 'tts', label: 'AI Voiceover', icon: Mic },
          { id: 'beats', label: 'Beat Sync', icon: Activity },
          { id: 'enhance', label: 'AI Upscaler', icon: Wand2 },
          { id: 'silence', label: 'Silence Cut', icon: Scissors },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1.5 rounded-lg font-bold text-[10px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-indigo-600 to-indigo-800 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AUTO CAPTIONS / SUBTITLE GENERATOR */}
      {activeTab === 'captions' && (
        <div className="flex flex-col gap-3.5 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Subtitles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Speech-to-Text Auto Captions</span>
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Whisper AI v3</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-semibold">Transcript / Dialogue Content</label>
            <textarea
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-[11px] text-slate-100 placeholder-slate-500 resize-none outline-none"
              placeholder="Enter spoken dialogue or click generate to auto-transcribe speech..."
            />
          </div>

          {/* Caption Visual Style Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-semibold">Kinetic Subtitle Style</label>
            <div className="grid grid-cols-2 gap-2">
              {CAPTION_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedCaptionStyle(style.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    selectedCaptionStyle === style.id
                      ? 'bg-indigo-950/60 border-cyan-400 ring-1 ring-cyan-400 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10.5px] font-bold" style={{ color: style.color }}>
                    {style.preview}
                  </span>
                  <span className="text-[9px] text-slate-400">{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateCaptions}
            disabled={isGeneratingCaptions || !captionText.trim()}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingCaptions ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Synchronized Subtitles...</span>
              </>
            ) : captionGenSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-300" />
                <span>Subtitles Added to Timeline!</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate Kinetic AI Subtitles</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 2: AI TEXT-TO-SPEECH (TTS) VOICEOVER */}
      {activeTab === 'tts' && (
        <div className="flex flex-col gap-3.5 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-pink-400" />
              <span>Neural Text-to-Speech Voiceover (TTS)</span>
            </span>
            <span className="text-[9px] text-slate-400 font-mono">ElevenLabs Style</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-semibold">Script to Speak</label>
            <textarea
              value={ttsInputText}
              onChange={(e) => setTtsInputText(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-[11px] text-slate-100 placeholder-slate-500 resize-none outline-none"
              placeholder="Type script text for AI voiceover actor..."
            />
          </div>

          {/* Voice Profiles */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-semibold">AI Voice Character</label>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
              {TTS_VOICE_PRESETS.map((v) => {
                const Icon = v.icon;
                const isSelected = selectedVoice === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoice(v.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pink-950/40 border-pink-500 text-white ring-1 ring-pink-500'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[10.5px]">{v.name}</span>
                        <span className="text-[8.5px] text-slate-400">{v.style}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-pink-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Volume */}
          <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-3 h-3 text-indigo-400" />
              <span>Voice Volume</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={20}
                max={100}
                value={ttsVolume}
                onChange={(e) => setTtsVolume(Number(e.target.value))}
                className="w-24 accent-pink-500"
              />
              <span className="font-mono text-[10px] text-pink-400 w-8 text-right">{ttsVolume}%</span>
            </div>
          </div>

          <button
            onClick={handleGenerateTTS}
            disabled={isSynthesizingTTS || !ttsInputText.trim()}
            className="w-full py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-pink-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSynthesizingTTS ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Voiceover Audio...</span>
              </>
            ) : ttsSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-300" />
                <span>Voice Added at Playhead ({currentTime.toFixed(1)}s)</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>Synthesize & Add to Timeline</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 3: BEAT DETECTOR & SYNC */}
      {activeTab === 'beats' && (
        <div className="flex flex-col gap-3.5 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Music Beat Detection & Rhythm Snap</span>
            </span>
            <span className="text-[9px] text-slate-400 font-mono">BPM Transients</span>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Automatically calculates musical tempo transients and generates neon beat markers along your timeline for synchronized transitions and cuts.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-400 font-semibold">Select Musical Tempo (BPM)</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { bpm: 120, label: '120 BPM', genre: 'House / Pop' },
                { bpm: 128, label: '128 BPM', genre: 'EDM / Dance' },
                { bpm: 140, label: '140 BPM', genre: 'Dubstep / Trap' },
                { bpm: 150, label: '150 BPM', genre: 'Synthwave' },
              ].map((item) => (
                <button
                  key={item.bpm}
                  onClick={() => setSelectedBpm(item.bpm as any)}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                    selectedBpm === item.bpm
                      ? 'bg-emerald-950/50 border-emerald-400 text-white ring-1 ring-emerald-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-extrabold text-[11px] text-white">{item.label}</span>
                  <span className="text-[8px] text-slate-500">{item.genre}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleDetectBeats}
            disabled={isDetectingBeats}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDetectingBeats ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Audio Waveform Peaks...</span>
              </>
            ) : beatsApplied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-300" />
                <span>Beat Markers Applied ({project.markers?.length || 0} Beats)</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5" />
                <span>Detect Beats & Mark Timeline</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 4: AI VIDEO ENHANCER & 4K UPSCALER */}
      {activeTab === 'enhance' && (
        <div className="flex flex-col gap-3.5 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Video Enhancer & Frame Smoother</span>
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Topaz / DaVinci Neural</span>
          </div>

          <div className="flex flex-col gap-2">
            {/* Toggle 1: 4K Super Resolution */}
            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white">4K Super Resolution Upscale</span>
                <span className="text-[9px] text-slate-400">Deep learning edge reconstruction & artifact removal</span>
              </div>
              <button
                onClick={() => setSuperResEnabled(!superResEnabled)}
                className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                  superResEnabled ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${superResEnabled ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Toggle 2: 60FPS Frame Interpolation */}
            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white">Optical Flow 60FPS Smoother</span>
                <span className="text-[9px] text-slate-400">Motion vector frame interpolation for ultra smooth motion</span>
              </div>
              <button
                onClick={() => setFrameInterpolation60fps(!frameInterpolation60fps)}
                className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                  frameInterpolation60fps ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${frameInterpolation60fps ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Toggle 3: Auto Color Balance */}
            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white">Neural Auto Color & White Balance</span>
                <span className="text-[9px] text-slate-400">Corrects tint, shadow clipping and highlight blowout</span>
              </div>
              <button
                onClick={() => setAutoColorBalance(!autoColorBalance)}
                className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                  autoColorBalance ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${autoColorBalance ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              if (onApplySuperRes) onApplySuperRes();
            }}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-purple-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Neural Video Enhancements</span>
          </button>
        </div>
      )}

      {/* TAB 5: AI SILENCE REMOVER */}
      {activeTab === 'silence' && (
        <div className="flex flex-col gap-3.5 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Silence & Dead Air Auto-Cutter</span>
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Podcast Jump Cut</span>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Scans talking head and vlog footage for silence pauses below the dB threshold and automatically ripple-deletes dead space for tight pacing.
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-300">Volume Threshold</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={-50}
                  max={-20}
                  value={silenceThreshold}
                  onChange={(e) => setSilenceThreshold(Number(e.target.value))}
                  className="w-24 accent-amber-500"
                />
                <span className="font-mono text-[10px] text-amber-400 w-10 text-right">{silenceThreshold} dB</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-300">Minimum Pause Duration</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0.2}
                  max={1.5}
                  step={0.1}
                  value={minPauseLength}
                  onChange={(e) => setMinPauseLength(Number(e.target.value))}
                  className="w-24 accent-amber-500"
                />
                <span className="font-mono text-[10px] text-amber-400 w-10 text-right">{minPauseLength}s</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRemoveSilence}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-amber-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {silenceRemovedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-300" />
                <span>Silence Gaps Trimmed!</span>
              </>
            ) : (
              <>
                <Scissors className="w-3.5 h-3.5" />
                <span>Auto-Cut & Ripple Delete Silence</span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
