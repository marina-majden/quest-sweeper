import React from 'react';

export const SynthwaveHero: React.FC = () => {
  return (
    <div id="synthwave-container" className="my-2">
      <div id="synthwave">
        {/* Retro Stars Field */}
        <div id="stars">
          <div id="star0" />
          <div id="star1" />
          <div id="star2" />
          <div id="star3" />
          <div id="star4" />
          <div id="star5" />
          <div id="star6" />
          <div id="star7" />
          <div id="star8" />
          <div id="star9" />
          <div id="star10" />
          <div id="star11" />
          <div id="star12" />
          <div id="star13" />
        </div>

        {/* Synthwave Sunset Ball with Scanline Slices */}
        <div id="synth-sun">
          <div id="synth-ball" />
          <div id="stripe0" className="sun-stripe" />
          <div id="stripe1" className="sun-stripe" />
          <div id="stripe2" className="sun-stripe" />
          <div id="stripe3" className="sun-stripe" />
          <div id="stripe4" className="sun-stripe" />
          <div id="stripe5" className="sun-stripe" />
          <div id="stripe6" className="sun-stripe" />
        </div>

        {/* Atmospheric Fog */}
        <div id="synth-fog" />
        <div id="synth-land" />

        {/* Perspective Road & Moving Road Lines */}
        <div id="roadLines">
          <div id="lines">
            <div id="line0" className="synth-line" />
            <div className="synth-line" />
            <div className="synth-line" />
            <div className="synth-line" />
            <div className="synth-line" />
            <div className="synth-line" />
            <div className="synth-line" />
            <div className="synth-line" />
          </div>
        </div>

        {/* ALIVE VACUUM CLEANER DRIVING ON ROAD TOWARDS THE SUNSET */}
        <div className="vacuum-cleaner-container">
          <div className="relative flex flex-col items-center">
            {/* Cute antenna with blinking light */}
            <div className="w-1 h-3 bg-synth-yellow relative">
              <span className="w-2.5 h-2.5 rounded-full bg-synth-magenta absolute -top-2 -left-0.5 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-synth-magenta absolute -top-2 -left-0.5" />
            </div>

            {/* Living Vacuum Main Chassis */}
            <div className="w-24 h-20 bg-synth-cyan border-3 border-synth-magenta rounded-xl relative shadow-[0_0_12px_#05d9e8] flex flex-col items-center justify-between p-1.5 overflow-hidden">
              {/* Chrome ventilation grille */}
              <div className="w-full flex justify-center gap-1">
                <span className="w-3 h-1 bg-synth-dark rounded-sm" />
                <span className="w-3 h-1 bg-synth-dark rounded-sm" />
                <span className="w-3 h-1 bg-synth-dark rounded-sm" />
              </div>

              {/* Expressive Pixel Eyes Screen */}
              <div className="w-20 h-9 bg-synth-dark border-2 border-synth-yellow rounded-md flex items-center justify-around px-2 relative">
                {/* Left Eye blinking */}
                <div className="w-4 h-4 bg-synth-cyan rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 bg-white rounded-full -mt-1 -ml-1" />
                </div>
                {/* Cheerful mouth */}
                <div className="w-2 h-1 bg-synth-magenta rounded-full" />
                {/* Right Eye */}
                <div className="w-4 h-4 bg-synth-cyan rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 bg-white rounded-full -mt-1 -ml-1" />
                </div>
              </div>

              {/* Front bumper bar */}
              <div className="w-full h-2.5 bg-synth-magenta flex items-center justify-around px-1 rounded-sm">
                <span className="w-1.5 h-1.5 bg-synth-yellow rounded-full animate-ping" />
                <span className="w-8 h-1 bg-synth-cyan rounded" />
                <span className="w-1.5 h-1.5 bg-synth-yellow rounded-full animate-ping" />
              </div>
            </div>

            {/* Bottom Vacuum Wheels (Spinning on the road!) */}
            <div className="w-28 flex justify-between -mt-2 z-20 px-1">
              {/* Left Wheel */}
              <div className="w-7 h-7 rounded-full bg-synth-dark border-2 border-synth-yellow wheel-spin flex items-center justify-center shadow-[0_0_8px_#fbe54f]">
                <div className="w-3 h-3 rounded-full bg-synth-magenta border border-white" />
              </div>
              {/* Center Suction Glow Nozzle */}
              <div className="w-8 h-2 bg-synth-yellow mt-3 rounded-full shadow-[0_0_10px_#fcff1a] animate-pulse" />
              {/* Right Wheel */}
              <div className="w-7 h-7 rounded-full bg-synth-dark border-2 border-synth-yellow wheel-spin flex items-center justify-center shadow-[0_0_8px_#fbe54f]">
                <div className="w-3 h-3 rounded-full bg-synth-magenta border border-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Fog Horizon Layer */}
        <div id="synth-fog2" />
      </div>
      <div className="cutout-frame" />
    </div>
  );
};
