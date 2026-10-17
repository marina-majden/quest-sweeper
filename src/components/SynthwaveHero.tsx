import React from 'react';

export const SynthwaveHero: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden pixel-box p-1 sm:p-2 bg-synth-dark border-4 border-synth-magenta shadow-[0_0_25px_rgba(255,42,109,0.45)] my-3 rounded-sm">
      <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#0a0015]">
   <picture>
  <source srcSet="/images/cleanquest-hero-wide.png" media='(min-width: 1024px)' />
  <source srcSet='/images/cleanquest-hero.png' media='(min-width: 768px)' />
  <img src='/images/Cleanquest-mobile.png' alt='Responsive image' />
</picture>
        {/* Subtle retro scanline and atmospheric bottom shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0015]/40 via-transparent to-transparent pointer-events-none" />
        <div className="scanlines opacity-20 pointer-events-none" />
      </div>
    </div>
  );
};
