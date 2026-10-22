import React, { useEffect, useRef, useState } from 'react';
import { musicEngine, TRACK_LIST, TRACK_AUDIO_MAP, TrackId, sfx } from '../utils/soundEngine.ts';
import { Play, Pause, Maximize2, Minimize2, Volume2, Music, Sparkles, X, Disc } from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        ctx.lineWidth = 6;
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
        <div className="flex items-center gap-2 flex-wrap">
          <Music className="w-4 h-4 text-synth-cyan animate-spin" />
          <span className="font-pixel text-[10px] text-synth-cyan tracking-wider">
            MUSIC PLAYER
          </span>
          <button
            onClick={() => {
              sfx.playClick();
              setIsModalOpen(true);
            }}
            className="pixel-btn px-2 py-0.5 font-pixel text-[8px] flex items-center gap-1 bg-synth-magenta text-white hover:bg-synth-yellow hover:text-synth-dark transition-all cursor-pointer ml-1"
            title="Open Whole Player Modal"
          >
            <Maximize2 className="w-2.5 h-2.5" />
            <span>OPEN PLAYER</span>
          </button>
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
      <div className="p-2.5 bg-synth-gray flex flex-col gap-2 border-t-2 border-synth-magenta">
        <div className="w-full flex items-center gap-2">
          <label htmlFor="track-select" className="sr-only">Select Track</label>
          <select
            id="track-select"
            value={currentTrack}
            onChange={handleTrackChange}
            className="flex-1 min-w-0 w-full bg-synth-dark text-synth-yellow font-pixel text-[9px] p-2 border-2 border-synth-yellow focus:outline-none truncate"
          >
            {TRACK_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.bpm} BPM)
              </option>
            ))}
          </select>

          <button
            onClick={handleTogglePlay}
            className={`pixel-btn px-4 py-2 font-pixel text-[10px] flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
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
        <div className="w-full flex items-center justify-end gap-2 pt-0.5">
          <Volume2 className="w-4 h-4 text-synth-cyan shrink-0" />
          <label htmlFor="volume-slider" className="sr-only">Volume Slider</label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 sm:w-32 accent-synth-magenta cursor-pointer"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
          <span className="font-pixel text-[8px] text-gray-400 w-8 text-right shrink-0">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* WHOLE PLAYER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 retro-modal-overlay z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="pixel-box p-4 sm:p-6 max-w-2xl w-full bg-synth-dark border-synth-cyan relative space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b-2 border-synth-magenta pb-3">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-synth-cyan animate-spin" />
                <h3 className="font-pixel text-xs sm:text-sm text-synth-cyan tracking-wider">
                  &gt; MUSIC PLAYER // CHIPTUNE SOUNDBANK &lt;
                </h3>
              </div>
              <button
                onClick={() => {
                  sfx.playClick();
                  setIsModalOpen(false);
                }}
                className="bg-synth-magenta text-white border-2 border-white w-7 h-7 font-pixel flex items-center justify-center hover:bg-white hover:text-synth-magenta cursor-pointer"
                title="Close Player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Playing Status */}
            <div className="p-3 bg-synth-purple/50 border-2 border-synth-yellow flex flex-wrap justify-between items-center gap-3">
              <div>
                <div className="font-pixel text-[8px] text-gray-400 mb-1">NOW SPINNING:</div>
                <div className="font-pixel text-xs sm:text-sm text-synth-yellow flex items-center gap-2">
                  <Disc className={`w-4 h-4 text-synth-magenta ${isPlaying ? 'animate-spin' : ''}`} />
                  <span>{TRACK_LIST.find((t) => t.id === currentTrack)?.name.toUpperCase()}</span>
                </div>
              </div>

              {/* Quick Play/Pause & Mode */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePlay}
                  className={`pixel-btn px-4 py-2 font-pixel text-xs flex items-center gap-1.5 ${
                    isPlaying ? 'bg-synth-magenta text-white' : 'bg-synth-yellow text-synth-dark font-bold'
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
            </div>

            {/* Volume & Equalizer mode controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-synth-gray border border-gray-700">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-synth-cyan" />
                <span className="font-pixel text-[8px] text-gray-300">VOLUME:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 sm:w-36 accent-synth-magenta cursor-pointer"
                />
                <span className="font-pixel text-[8px] text-synth-cyan">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-pixel text-[8px] text-gray-300 mr-1">VISUALIZER:</span>
                <button
                  onClick={() => setMode('winamp')}
                  className={`px-2 py-1 font-pixel text-[8px] border transition-colors ${
                    mode === 'winamp' ? 'bg-synth-magenta text-white border-white' : 'border-gray-700 text-gray-400 bg-synth-dark'
                  }`}
                >
                  BARS
                </button>
                <button
                  onClick={() => setMode('oscilloscope')}
                  className={`px-2 py-1 font-pixel text-[8px] border transition-colors ${
                    mode === 'oscilloscope' ? 'bg-synth-cyan text-synth-dark border-white' : 'border-gray-700 text-gray-400 bg-synth-dark'
                  }`}
                >
                  WAVE
                </button>
                <button
                  onClick={() => setMode('starburst')}
                  className={`px-2 py-1 font-pixel text-[8px] border transition-colors ${
                    mode === 'starburst' ? 'bg-synth-yellow text-synth-dark border-white' : 'border-gray-700 text-gray-400 bg-synth-dark'
                  }`}
                >
                  STAR
                </button>
              </div>
            </div>

            {/* Complete Track Vault / Soundbank */}
            <div className="space-y-2">
              <div className="font-pixel text-[9px] text-synth-magenta flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-synth-yellow" />
                <span>SOUNDBANK CASSETTE TAPES (SELECT TRACK TO LOAD):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TRACK_LIST.map((t) => {
                  const isCurrent = currentTrack === t.id;
                  const isThisPlaying = isCurrent && isPlaying;

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        sfx.playClick();
                        setCurrentTrack(t.id);
                        musicEngine.changeTrack(t.id);
                        if (!musicEngine.isPlaying) {
                          musicEngine.play();
                        }
                      }}
                      className={`relative rounded-md p-3.5 transition-all flex flex-col justify-between cursor-pointer select-none bg-[#14121d] border-t-2 border-l-2 border-zinc-600 border-b-4 border-r-4 border-black shadow-[4px_4px_0px_#0a0015] ${
                        isCurrent
                          ? 'ring-2 ring-synth-yellow shadow-[0_0_14px_rgba(251,229,79,0.35)]'
                          : 'hover:border-zinc-400'
                      }`}
                    >
                      {/* Corner Screws */}
                      <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-900 flex items-center justify-center text-[7px] text-zinc-400 font-mono leading-none">
                        +
                      </div>
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-900 flex items-center justify-center text-[7px] text-zinc-400 font-mono leading-none">
                        +
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-900 flex items-center justify-center text-[7px] text-zinc-400 font-mono leading-none">
                        +
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-900 flex items-center justify-center text-[7px] text-zinc-400 font-mono leading-none">
                        +
                      </div>

                      {/* Top Cassette Ridge / Header */}
                      <div className="flex justify-between items-center px-2 mb-1.5 text-[8px] font-pixel text-zinc-400">
                        <span className="tracking-widest">SIDE A</span>
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${isThisPlaying ? 'bg-synth-magenta animate-pulse' : 'bg-zinc-600'}`} />
                          <span className="text-zinc-500 font-mono">C-60</span>
                        </div>
                      </div>

                      {/* Cassette Tape Sticker with Written Song Name */}
                      <div className="bg-[#f2ece2] rounded-xs border-2 border-zinc-400 p-2 shadow-inner relative overflow-hidden">
                        {/* Retro 80s stripes on sticker */}
                        <div className="h-1 w-full bg-gradient-to-r from-synth-magenta via-synth-yellow to-synth-cyan mb-1.5" />
                        
                        {/* Written Song Name */}
                        <div className="border-b border-dashed border-zinc-400 pb-1 text-center">
                          <span className="font-pixel text-[11px] sm:text-xs text-zinc-900 font-bold tracking-wider uppercase block truncate drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                            {t.name}
                          </span>
                        </div>
                      </div>

                      {/* Cassette Tape Reel Window with Two Circle Spools */}
                      <div className="bg-zinc-950 border-2 border-zinc-800 rounded-sm py-2 px-3 flex items-center justify-between my-2.5 relative shadow-inner overflow-hidden">
                        {/* Left Reel Spool */}
                        <div
                          className={`w-9 h-9 rounded-full bg-zinc-200 border-2 border-zinc-700 flex items-center justify-center relative shadow-md shrink-0 ${
                            isThisPlaying ? 'animate-spin' : ''
                          }`}
                          style={{ animationDuration: '3s' }}
                        >
                          <div className="w-6 h-6 rounded-full border-2 border-dashed border-zinc-900 bg-zinc-300 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-600" />
                          </div>
                        </div>

                        {/* Center Magnetic Tape Strip with Ruler Scale */}
                        <div className="flex-1 mx-2 h-4 bg-[#2b180d] rounded-xs relative flex items-center justify-center border-y border-zinc-800">
                          <div className="text-[7px] font-mono text-zinc-500 tracking-widest select-none opacity-70">
                            |&bull;|&bull;|&bull;|
                          </div>
                        </div>

                        {/* Right Reel Spool */}
                        <div
                          className={`w-9 h-9 rounded-full bg-zinc-200 border-2 border-zinc-700 flex items-center justify-center relative shadow-md shrink-0 ${
                            isThisPlaying ? 'animate-spin' : ''
                          }`}
                          style={{ animationDuration: '3s' }}
                        >
                          <div className="w-6 h-6 rounded-full border-2 border-dashed border-zinc-900 bg-zinc-300 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-600" />
                          </div>
                        </div>
                      </div>

                      {/* Old-School 3D Play & Pause Buttons */}
                      <div className="flex items-center justify-center gap-3 pt-1 border-t border-zinc-800">
                        {/* 3D PLAY Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            sfx.playClick();
                            if (isThisPlaying) return;
                            setCurrentTrack(t.id);
                            musicEngine.changeTrack(t.id);
                            musicEngine.play();
                          }}
                          className={`px-3 py-1 font-pixel text-[9px] flex items-center gap-1.5 transition-all cursor-pointer ${
                            isThisPlaying
                              ? 'bg-zinc-950 text-synth-cyan border-t-2 border-l-2 border-black border-b border-r border-zinc-700 shadow-inner translate-y-0.5'
                              : 'bg-gradient-to-b from-zinc-600 to-zinc-800 text-white border-t-2 border-l-2 border-zinc-400 border-b-2 border-r-2 border-black shadow-[2px_2px_0px_#000] hover:brightness-110 active:translate-y-0.5'
                          }`}
                          title="Play Cassette"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>PLAY</span>
                        </button>

                        {/* 3D PAUSE Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            sfx.playClick();
                            if (isThisPlaying) {
                              musicEngine.stop();
                            }
                          }}
                          className={`px-3 py-1 font-pixel text-[9px] flex items-center gap-1.5 transition-all cursor-pointer ${
                            isCurrent && !isPlaying
                              ? 'bg-zinc-950 text-synth-yellow border-t-2 border-l-2 border-black border-b border-r border-zinc-700 shadow-inner translate-y-0.5'
                              : 'bg-gradient-to-b from-zinc-600 to-zinc-800 text-white border-t-2 border-l-2 border-zinc-400 border-b-2 border-r-2 border-black shadow-[2px_2px_0px_#000] hover:brightness-110 active:translate-y-0.5'
                          }`}
                          title="Pause Cassette"
                        >
                          <Pause className="w-3 h-3 fill-current" />
                          <span>PAUSE</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                sfx.playClick();
                setIsModalOpen(false);
              }}
              className="pixel-btn-cyan w-full font-pixel text-xs py-3 uppercase"
            >
              &gt; CLOSE PLAYER &amp; RETURN TO QUEST &lt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
