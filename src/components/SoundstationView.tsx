import React, { useState, useEffect } from 'react';
import { AudioVisualizer } from './AudioVisualizer.tsx';
import { TRACK_LIST, musicEngine, TrackId } from '../utils/soundEngine.ts';
import { sfx } from '../utils/soundEngine.ts';
import { Radio, Music2, Disc, Play, Pause, Sparkles } from 'lucide-react';

export const SoundstationView: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(musicEngine.isPlaying);
  const [selectedTrack, setSelectedTrack] = useState<TrackId>(musicEngine.currentTrack);

  useEffect(() => {
    const unsub = musicEngine.subscribe((playing) => {
      setIsPlaying(playing);
      setSelectedTrack(musicEngine.currentTrack);
    });
    return () => unsub();
  }, []);

  const handleSelectTrack = (trackId: TrackId) => {
    sfx.playClick();
    setSelectedTrack(trackId);
    musicEngine.changeTrack(trackId);
    if (!musicEngine.isPlaying) {
      musicEngine.play();
    }
  };

  const handleTogglePlay = () => {
    musicEngine.togglePlay();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* TITLE BANNER */}
      <div className="pixel-box p-6 bg-synth-dark border-purple-500 text-center space-y-2 shadow-[6px_6px_0_#05d9e8]">
        <div className="flex items-center justify-center gap-3">
          <Disc className={`w-8 h-8 text-synth-cyan ${isPlaying ? 'animate-spin' : ''}`} />
          <h2 className="font-pixel text-xl sm:text-2xl text-synth-cyan uppercase tracking-widest">
            &gt; WINAMP SOUNDSTATION RIG &lt;
          </h2>
          <Disc className={`w-8 h-8 text-synth-cyan ${isPlaying ? 'animate-spin' : ''}`} />
        </div>
        <p className="font-vt text-2xl text-synth-yellow">
          Authentic real-time Web Audio chiptune synthesizer and multi-mode spectral visualizer. 100% offline procedural synthesis!
        </p>
      </div>

      {/* BIG VISUALIZER */}
      <AudioVisualizer />

      {/* TRACK VAULT */}
      <div className="space-y-4">
        <h3 className="font-pixel text-sm sm:text-base text-synth-magenta flex items-center gap-2 border-b-2 border-synth-magenta pb-2">
          <Music2 className="w-5 h-5 text-synth-magenta" />
          <span>SYNTHESIZER SOUNDBANK: SELECT TAPE</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TRACK_LIST.map((track) => {
            const isCurrent = selectedTrack === track.id;
            return (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track.id)}
                className={`pixel-box p-5 cursor-pointer transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'active border-synth-yellow shadow-[6px_6px_0_#ff2a6d] bg-synth-purple/60'
                    : 'bg-synth-dark hover:border-synth-cyan'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-pixel text-xs text-synth-yellow flex items-center gap-2">
                      <Disc className={`w-4 h-4 ${isCurrent && isPlaying ? 'animate-spin text-synth-magenta' : 'text-gray-500'}`} />
                      <span>{track.name.toUpperCase()}</span>
                    </h4>
                    <span className="bg-synth-cyan text-synth-dark font-pixel text-[8px] px-2 py-0.5 font-bold">
                      {track.bpm} BPM
                    </span>
                  </div>
                  <div className="font-pixel text-[9px] text-synth-magenta mb-2">
                    GENRE: {track.genre.toUpperCase()}
                  </div>
                  <p className="font-vt text-lg text-gray-300 leading-tight">
                    {track.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center">
                  <span className="font-pixel text-[8px] text-gray-400">
                    CHANNEL: 4-VOICE POLYPHONIC
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrent) {
                        handleTogglePlay();
                      } else {
                        handleSelectTrack(track.id);
                      }
                    }}
                    className={`pixel-btn px-3 py-1 font-pixel text-[8px] flex items-center gap-1 ${
                      isCurrent && isPlaying ? 'bg-synth-magenta' : 'bg-synth-yellow text-synth-dark'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <>
                        <Pause className="w-3 h-3 fill-current" />
                        <span>PAUSE</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>LOAD &amp; PLAY</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
