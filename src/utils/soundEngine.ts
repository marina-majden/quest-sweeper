/**
 * Web Audio Chiptune Synthesizer & Sound FX Engine
 * Completely offline, zero external audio asset dependencies!
 */

export class SoundFXEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playClick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  playCoin() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  playError() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  playBossHit() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Low rumble square
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);

      // Noise burst for impact
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      whiteNoise.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      whiteNoise.start(now);
    } catch {}
  }

  playLevelWin() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]; // C E G C E G C
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = this.ctx!.currentTime + idx * 0.08;
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch {}
  }

  playPowerup() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [330, 392, 659, 784, 1046, 1318]; // E G E G C E
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = this.ctx!.currentTime + idx * 0.06;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    } catch {}
  }

  playZenBell() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [440, 880, 1320].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.06 / (i + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 1.8);
      });
    } catch {}
  }

  playPipChirp() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1400, now + 0.05);
      osc.frequency.linearRampToValueAtTime(900, now + 0.1);
      osc.frequency.linearRampToValueAtTime(1600, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }
}

export const sfx = new SoundFXEngine();

export type TrackId = 'neon-sweeper' | 'midnight-lofi' | 'zen-ambient' | 'boss-battle';

export interface TrackMeta {
  id: TrackId;
  name: string;
  genre: string;
  bpm: number;
  description: string;
}

export const TRACK_LIST: TrackMeta[] = [
  {
    id: 'neon-sweeper',
    name: 'Neon Sweeper',
    genre: 'Synthwave 80s',
    bpm: 140,
    description: 'Energetic driving synthwave with punchy bassline & retro lead melody',
  },
  {
    id: 'midnight-lofi',
    name: 'Midnight Cleaners',
    genre: 'Lo-Fi Chillhop',
    bpm: 96,
    description: 'Relaxed cyber-lofi chords with gentle vinyl warmth & soft bells',
  },
  {
    id: 'zen-ambient',
    name: 'Zen Temple Vacuum',
    genre: 'Ambient Meditative',
    bpm: 72,
    description: 'Dreamy pentatonic atmosphere with soothing soundscape chords',
  },
  {
    id: 'boss-battle',
    name: 'Groutzilla Clash',
    genre: '8-Bit Fast Rock',
    bpm: 156,
    description: 'Adrenaline-packed combat chiptune for slaying stubborn dirt',
  },
];

export class MusicEngine {
  private ctx: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  public isPlaying: boolean = false;
  public currentTrack: TrackId = 'neon-sweeper';
  public volume: number = 0.4;
  private timer: number | null = null;
  private onStateChangeListeners: ((playing: boolean) => void)[] = [];

  constructor() {}

  public subscribe(cb: (playing: boolean) => void) {
    this.onStateChangeListeners.push(cb);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.onStateChangeListeners.forEach((cb) => cb(this.isPlaying));
  }

  private initAudio() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.8;
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public togglePlay() {
    this.initAudio();
    if (!this.ctx) return;
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  public changeTrack(trackId: TrackId) {
    this.currentTrack = trackId;
    if (this.isPlaying) {
      this.stop();
      this.play();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.notify();
  }

  public play() {
    this.initAudio();
    if (!this.ctx) return;
    this.isPlaying = true;
    this.notify();

    let step = 0;
    const meta = TRACK_LIST.find((t) => t.id === this.currentTrack) || TRACK_LIST[0];
    const msPer16th = (60000 / meta.bpm) / 4;

    this.timer = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      if (this.currentTrack === 'neon-sweeper') {
        // --- NEON SWEEPER (Synthwave) ---
        // Bassline pattern (A minor / F / G / Em arpeggio)
        const bassNotes = [
          110, 110, 220, 110,  87.31, 87.31, 174.61, 87.31,
          98.0, 98.0, 196.0, 98.0,  82.41, 82.41, 164.81, 130.81
        ];
        const bassFreq = bassNotes[step % bassNotes.length];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq, now);
        bassGain.gain.setValueAtTime(0.06, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.12);

        // Synth Lead Melody (syncopated retro riffs)
        const leadSequence = [
          440, 0, 523.25, 0,  659.25, 0, 587.33, 523.25,
          0, 440, 0, 659.25,  783.99, 0, 659.25, 523.25
        ];
        const leadFreq = leadSequence[step % leadSequence.length];
        if (leadFreq > 0) {
          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();
          leadOsc.type = 'square';
          leadOsc.frequency.setValueAtTime(leadFreq, now);
          leadGain.gain.setValueAtTime(0.05, now);
          leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          leadOsc.connect(leadGain);
          leadGain.connect(this.masterGain);
          leadOsc.start(now);
          leadOsc.stop(now + 0.2);
        }

        // 8-bit Drum: Kick on 0, 4, 8, 12. Snare on 4, 12.
        if (step % 4 === 0) {
          this.triggerKick(now);
        }
        if (step % 8 === 4) {
          this.triggerSnare(now);
        }
        if (step % 2 === 0) {
          this.triggerHiHat(now);
        }

      } else if (this.currentTrack === 'midnight-lofi') {
        // --- MIDNIGHT CLEANERS (Lo-Fi) ---
        // Warm 7th chord swells on bar starts
        if (step % 16 === 0 || step % 16 === 8) {
          const chord = step % 16 === 0 ? [220, 261.63, 329.63, 392.0] : [174.61, 220, 261.63, 329.63];
          chord.forEach((freq) => {
            const osc = this.ctx!.createOscillator();
            const g = this.ctx!.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            g.gain.setValueAtTime(0.04, now);
            g.gain.exponentialRampToValueAtTime(0.0005, now + 1.2);
            osc.connect(g);
            g.connect(this.masterGain!);
            osc.start(now);
            osc.stop(now + 1.2);
          });
        }

        // Gentle Lo-Fi bell melodies
        const bellNotes = [0, 523.25, 0, 659.25, 0, 783.99, 0, 523.25, 0, 440, 0, 587.33, 0, 523.25, 0, 392];
        const bFreq = bellNotes[step % 16];
        if (bFreq > 0) {
          const bOsc = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bOsc.type = 'sine';
          bOsc.frequency.setValueAtTime(bFreq, now);
          bGain.gain.setValueAtTime(0.035, now);
          bGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.4);
          bOsc.connect(bGain);
          bGain.connect(this.masterGain);
          bOsc.start(now);
          bOsc.stop(now + 0.4);
        }

        if (step % 8 === 0) this.triggerSoftKick(now);
        if (step % 8 === 4) this.triggerSnare(now, 0.05);

      } else if (this.currentTrack === 'zen-ambient') {
        // --- ZEN AMBIENT (Atmospheric) ---
        // Soft meditative singing bowl drones
        if (step % 8 === 0) {
          const pentatonic = [196.0, 220.0, 261.63, 293.66, 329.63, 392.0];
          const note = pentatonic[(step / 8) % pentatonic.length];
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, now);
          g.gain.setValueAtTime(0.045, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 2.2);
        }

      } else if (this.currentTrack === 'boss-battle') {
        // --- BOSS BATTLE: GROUTZILLA (Aggressive 8-Bit) ---
        const bossBass = [
          146.83, 146.83, 293.66, 146.83, 138.59, 138.59, 277.18, 138.59,
          130.81, 130.81, 261.63, 130.81, 123.47, 123.47, 246.94, 164.81
        ];
        const bFreq = bossBass[step % bossBass.length];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'sawtooth';
        bOsc.frequency.setValueAtTime(bFreq, now);
        bGain.gain.setValueAtTime(0.07, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        bOsc.connect(bGain);
        bGain.connect(this.masterGain);
        bOsc.start(now);
        bOsc.stop(now + 0.09);

        // Fast screaming chiptune arp
        const arpNotes = [587.33, 698.46, 880.0, 1174.66];
        const aFreq = arpNotes[step % arpNotes.length];
        const aOsc = this.ctx.createOscillator();
        const aGain = this.ctx.createGain();
        aOsc.type = 'square';
        aOsc.frequency.setValueAtTime(aFreq, now);
        aGain.gain.setValueAtTime(0.045, now);
        aGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        aOsc.connect(aGain);
        aGain.connect(this.masterGain);
        aOsc.start(now);
        aOsc.stop(now + 0.08);

        if (step % 4 === 0 || step % 8 === 2) this.triggerKick(now);
        if (step % 4 === 2) this.triggerSnare(now, 0.12);
        this.triggerHiHat(now);
      }

      step = (step + 1) % 32;
    }, msPer16th);
  }

  private triggerKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.1);
    g.gain.setValueAtTime(0.35, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private triggerSoftKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.14);
    g.gain.setValueAtTime(0.2, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.14);
  }

  private triggerSnare(time: number, vol = 0.09) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.09;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
    noise.connect(g);
    g.connect(this.masterGain);
    noise.start(time);
  }

  private triggerHiHat(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.035, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    noise.connect(g);
    g.connect(this.masterGain);
    noise.start(time);
  }
}

export const musicEngine = new MusicEngine();
