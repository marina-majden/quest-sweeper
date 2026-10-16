import React, { useEffect, useRef, useState } from 'react';
import { musicEngine, TRACK_LIST, TrackId } from '../utils/soundEngine.ts';
import { Play, Pause, Maximize2, Minimize2, Volume2, Music, Sparkles } from 'lucide-react';

export type VisualizerMode = 'winamp' | 'oscilloscope' | 'starburst';

interface AudioVisualizerProps {
  onTogglePlay?: () => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(musicEngine.isPlaying);
  const [currentTrack, setCurrentTrack] = useState<TrackId>(musicEngine.currentTrack);
  const [mode, setMode] = useState<VisualizerMode>('winamp');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(musicEngine.volume);
  const animFrameRef = useRef<number | null>(null);
  const peaksRef = useRef<number[]>([]);

  useEffect(() => {
    const unsub = musicEngine.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return () => unsub();
  }, []);

  const handleTogglePlay = () => {
    musicEngine.togglePlay();
    setIsPlaying(musicEngine.isPlaying);
  };

  const handleTrackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTrack = e.target.value as TrackId;
    setCurrentTrack(newTrack);
    musicEngine.changeTrack(newTrack);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    musicEngine.setVolume(val);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDisposed = false;

    const render = () => {
      if (isDisposed) return;
      animFrameRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;

      // Dark synth background trail
      ctx.fillStyle = 'rgba(10, 0, 21, 0.28)';
      ctx.fillRect(0, 0, width, height);

      const analyser = musicEngine.analyser;
      if (!analyser || !musicEngine.isPlaying) {
        // Render idle gentle pulse line
        ctx.strokeStyle = '#05d9e8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const midY = height / 2;
        ctx.moveTo(0, midY);
        for (let x = 0; x < width; x += 10) {
          const y = midY + Math.sin((x + Date.now() * 0.05) * 0.04) * 3;
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillStyle = '#ff2a6d';
        ctx.textAlign = 'center';
        ctx.fillText('WINAMP SOUNDSTATION [STANDBY]', width / 2, midY - 14);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const freqData = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(freqData);

      if (mode === 'winamp') {
        // --- MODE 1: WINAMP SPECTRAL BARS WITH FALLING PEAK CAPS ---
        const barCount = 32;
        const barWidth = Math.floor(width / barCount);
        const gap = 2;
        const actualWidth = barWidth - gap;

        // Initialize peaks array if needed
        if (peaksRef.current.length !== barCount) {
          peaksRef.current = new Array(barCount).fill(0);
        }

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (bufferLength * 0.75));
          const val = freqData[dataIndex] || 0;
          const barHeight = (val / 255) * (height - 20);

          // Update peak
          if (barHeight > (peaksRef.current[i] || 0)) {
            peaksRef.current[i] = barHeight;
          } else {
            peaksRef.current[i] = Math.max(0, (peaksRef.current[i] || 0) - 1.2);
          }

          const x = i * barWidth;
          const y = height - barHeight;

          // Classic Winamp Green to Yellow to Red / Synth Magenta Gradient
          const grad = ctx.createLinearGradient(0, height, 0, 0);
          grad.addColorStop(0, '#05d9e8');
          grad.addColorStop(0.5, '#fbe54f');
          grad.addColorStop(1, '#ff2a6d');

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, actualWidth, barHeight);

          // Peak Cap (Winamp yellow/white floating pill)
          const peakY = height - (peaksRef.current[i] || 0) - 4;
          ctx.fillStyle = '#fcff1a';
          ctx.fillRect(x, Math.max(4, peakY), actualWidth, 3);
        }

      } else if (mode === 'oscilloscope') {
        // --- MODE 2: NEON OSCILLOSCOPE WAVEFORM ---
        const timeData = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(timeData);

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#05d9e8';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff2a6d';

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

      } else if (mode === 'starburst') {
        // --- MODE 3: SYNTHWAVE STARBURST ---
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.18;
        const rays = 28;

        for (let i = 0; i < rays; i++) {
          const angle = (i / rays) * Math.PI * 2;
          const dataIndex = Math.floor((i / rays) * (bufferLength * 0.6));
          const val = freqData[dataIndex] || 0;
          const rayLength = radius + (val / 255) * (Math.min(width, height) * 0.35);

          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * rayLength;
          const y2 = centerY + Math.sin(angle) * rayLength;

          ctx.strokeStyle = i % 2 === 0 ? '#ff2a6d' : '#fbe54f';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Center spinning badge
        ctx.fillStyle = '#0a0015';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#05d9e8';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = '#05d9e8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', centerX, centerY);
      }
    };

    render();

    return () => {
      isDisposed = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode]);

  return (
    <div
      ref={wrapperRef}
      id="visualizer-wrapper"
      className={`pixel-box overflow-hidden relative flex flex-col ${
        isFullscreen ? 'is-fullscreen' : ''
      }`}
    >
      {/* Top Winamp Title Bar */}
      <div className="bg-[#0a0015] border-b-2 border-synth-magenta px-3 py-2 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-synth-cyan animate-spin" />
          <span className="font-pixel text-[10px] text-synth-cyan tracking-wider">
            WINAMP AUDIO RIG: {TRACK_LIST.find((t) => t.id === currentTrack)?.name.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher Buttons */}
          <div className="flex border border-gray-700 p-0.5 rounded bg-synth-dark">
            <button
              onClick={() => setMode('winamp')}
              className={`px-2 py-0.5 font-pixel text-[8px] transition-colors ${
                mode === 'winamp' ? 'bg-synth-magenta text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Winamp EQ Bars with Falling Peaks"
            >
              BARS
            </button>
            <button
              onClick={() => setMode('oscilloscope')}
              className={`px-2 py-0.5 font-pixel text-[8px] transition-colors ${
                mode === 'oscilloscope' ? 'bg-synth-cyan text-synth-dark' : 'text-gray-400 hover:text-white'
              }`}
              title="Neon Oscilloscope Waveform"
            >
              WAVE
            </button>
            <button
              onClick={() => setMode('starburst')}
              className={`px-2 py-0.5 font-pixel text-[8px] transition-colors ${
                mode === 'starburst' ? 'bg-synth-yellow text-synth-dark' : 'text-gray-400 hover:text-white'
              }`}
              title="Synthwave Starburst"
            >
              STAR
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="text-synth-cyan hover:text-white font-pixel text-[9px] flex items-center gap-1 border border-synth-cyan/50 px-2 py-1 bg-synth-gray/40"
            title="Toggle Fullscreen Visualizer"
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span>{isFullscreen ? 'EXIT' : 'EXPAND'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Display */}
      <div className="relative flex-1 bg-[#0a0015] min-h-[140px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          className="w-full h-full block cursor-pointer"
          onClick={toggleFullscreen}
          title="Click to toggle fullscreen mode"
        />
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 pixel-btn px-4 py-2 font-pixel text-xs z-50"
          >
            CLOSE FULLSCREEN [X]
          </button>
        )}
      </div>

      {/* Bottom Transport Controls */}
      <div className="p-2.5 bg-synth-gray flex flex-wrap justify-between items-center gap-3 border-t-2 border-synth-magenta">
        <div className="flex items-center gap-2">
          <label htmlFor="track-select" className="sr-only">Select Track</label>
          <select
            id="track-select"
            value={currentTrack}
            onChange={handleTrackChange}
            className="bg-synth-dark text-synth-yellow font-pixel text-[9px] p-2 border-2 border-synth-yellow focus:outline-none"
          >
            {TRACK_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.bpm} BPM)
              </option>
            ))}
          </select>

          <button
            onClick={handleTogglePlay}
            className={`pixel-btn px-4 py-1.5 font-pixel text-[10px] flex items-center gap-1.5 ${
              isPlaying ? 'bg-synth-magenta text-white' : 'bg-synth-yellow text-synth-dark'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY</span>
              </>
            )}
          </button>
        </div>

        {/* Volume slider */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-synth-cyan" />
          <label htmlFor="volume-slider" className="sr-only">Volume Slider</label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-synth-magenta cursor-pointer"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
          <span className="font-pixel text-[8px] text-gray-400 w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
