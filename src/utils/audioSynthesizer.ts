import { AudioStyleType } from '../types';

// Real-time Web Audio Synthesizer & Sound Design Engine
class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private bpm = 120;
  private intervalId: number | null = null;
  private bassOsc: OscillatorNode | null = null;
  private masterGain: GainNode | null = null;
  private streamDestination: MediaStreamAudioDestinationNode | null = null;
  private step = 0;
  private currentStyle: AudioStyleType = 'synth_wave';
  private volume = 65; // 0 to 100

  constructor() {
    // Lazily initialized
  }

  public init(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    this.ctx = new AudioContextClass();
    
    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime((this.volume / 100) * 0.25, this.ctx.currentTime);
    
    // Connect to hardware speakers
    this.masterGain.connect(this.ctx.destination);

    // Create stream destination for video recorder multiplexing
    this.streamDestination = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(this.streamDestination);

    return this.ctx;
  }

  public getStreamDestination(): MediaStreamAudioDestinationNode | null {
    this.init();
    return this.streamDestination;
  }

  public getAudioContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  public start(style: AudioStyleType = 'synth_wave', volume: number = 65) {
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stop();
    this.isPlaying = true;
    this.currentStyle = style;
    this.volume = volume;
    this.updateVolume(volume);
    this.step = 0;

    switch (style) {
      case 'synth_wave':
        this.startSynthWaveLoop();
        break;
      case 'ambient_drone':
        this.startAmbientDroneLoop();
        break;
      case 'beat_loop':
      case 'tech_house':
        this.startBeatLoop(style === 'tech_house' ? 126 : 118);
        break;
      case '808_bass':
        this.start808BassLoop();
        break;
      case 'lofi_chill':
        this.startLofiLoop();
        break;
      case 'riser':
        this.startRiserLoop();
        break;
      default:
        this.startSynthWaveLoop();
        break;
    }
  }

  public updateVolume(val: number) {
    this.volume = val;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime((val / 100) * 0.25, this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.bassOsc) {
      try {
        this.bassOsc.stop();
      } catch (e) {}
      this.bassOsc = null;
    }
  }

  public playTone(freq: number, type: OscillatorType, duration: number, gainVal: number, attack = 0.02) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(gainVal, this.ctx.currentTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // SFX Generator for sound effects
  public playSFX(type: 'whoosh' | 'glitch' | 'impact' | 'click' | 'laser' | 'riser' | 'shutter') {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;

    if (type === 'whoosh') {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
    } else if (type === 'impact') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.6);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.7);
    } else if (type === 'glitch') {
      for (let i = 0; i < 4; i++) {
        const offset = i * 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400 + Math.random() * 1200, now + offset);
        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.03);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + offset);
        osc.stop(now + offset + 0.03);
      }
    } else if (type === 'laser') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // Click / Shutter
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  }

  private startSynthWaveLoop() {
    if (!this.ctx) return;
    const stepTime = 60 / 115 / 2;
    const melodyNotes = [110, 110, 130, 130, 146, 146, 165, 196];

    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const index = this.step % melodyNotes.length;
      const freq = melodyNotes[index];

      this.playTone(freq, 'sawtooth', stepTime * 1.4, 0.35, 0.01);
      if (this.step % 4 === 0) this.playKick();
      if (this.step % 4 === 2) this.playSnare();
      if (this.step % 2 === 1) this.playHiHat();
      this.step++;
    }, stepTime * 1000);
  }

  private startAmbientDroneLoop() {
    if (!this.ctx) return;
    const stepTime = 2.2;
    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [110.00, 130.81, 164.81, 196.00], // Am7
      [116.54, 146.83, 174.61, 220.00]  // Bbmaj7
    ];

    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const chordIndex = Math.floor(this.step / 2) % chords.length;
      const notes = chords[chordIndex];
      notes.forEach((freq) => {
        this.playTone(freq, 'sine', 4.0, 0.16, 0.6);
      });
      this.step++;
    }, stepTime * 1000);
  }

  private startBeatLoop(bpm = 124) {
    if (!this.ctx) return;
    const stepTime = 60 / bpm / 2;
    const bassPattern = [146.83, 164.81, 196.00, 220.00];

    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      if (this.step % 4 === 0) this.playKick();
      if (this.step % 4 === 2) this.playSnare();
      if (this.step % 2 === 1) this.playHiHat();
      if (this.step % 2 === 0) {
        const bassFreq = bassPattern[Math.floor(this.step / 4) % bassPattern.length] / 2;
        this.playTone(bassFreq, 'triangle', stepTime * 0.9, 0.45, 0.02);
      }
      this.step++;
    }, stepTime * 1000);
  }

  private start808BassLoop() {
    if (!this.ctx) return;
    const stepTime = 60 / 140 / 2;
    const bassNotes = [55, 55, 65.41, 73.42, 55, 49, 65.41, 82.41];

    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const freq = bassNotes[this.step % bassNotes.length];
      if (this.step % 4 === 0) {
        this.play808Kick(freq);
      }
      if (this.step % 4 === 2) this.playSnare();
      if (this.step % 2 === 1) this.playHiHat();
      this.step++;
    }, stepTime * 1000);
  }

  private startLofiLoop() {
    if (!this.ctx) return;
    const stepTime = 60 / 85 / 2;
    const lofiChords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23]  // G7
    ];

    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      if (this.step % 8 === 0) {
        const chord = lofiChords[Math.floor(this.step / 8) % lofiChords.length];
        chord.forEach(f => this.playTone(f, 'triangle', stepTime * 6, 0.12, 0.1));
      }
      if (this.step % 4 === 0) this.playKick();
      if (this.step % 4 === 2) this.playSnare();
      if (this.step % 2 === 1) this.playHiHat();
      this.step++;
    }, stepTime * 1000);
  }

  private startRiserLoop() {
    if (!this.ctx) return;
    const stepTime = 1.5;
    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 1.4);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 1.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.45);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 1.45);
      this.step++;
    }, stepTime * 1000);
  }

  private playKick() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.9, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  private play808Kick(freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  private playSnare() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.14;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 900;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    noise.stop(this.ctx.currentTime + 0.14);
  }

  private playHiHat() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.035;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    noise.stop(this.ctx.currentTime + 0.035);
  }
}

export const audioSynth = new AudioSynthesizer();
