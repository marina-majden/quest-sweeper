import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { Download, Smartphone, X } from 'lucide-react';
import { sfx } from '../utils/soundEngine.ts';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = () => {
    sfx.playClick();
    install();
  };

  const handleIOSClick = () => {
    sfx.playClick();
    setShowIOSGuide(true);
  };

  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        className="pixel-btn px-3 py-1.5 font-pixel text-[9px] flex items-center gap-1.5 bg-synth-cyan text-synth-dark hover:bg-white"
        title="Install CleanQuest as offline desktop/mobile web app"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>INSTALL APP</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={handleIOSClick}
          className="pixel-btn px-3 py-1.5 font-pixel text-[9px] flex items-center gap-1.5 bg-synth-yellow text-synth-dark hover:bg-white"
          title="Install CleanQuest on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>INSTALL (IOS)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center retro-modal-overlay p-4">
            <div className="pixel-box p-6 max-w-sm w-full relative bg-synth-dark text-left space-y-4">
              <button
                onClick={() => {
                  sfx.playClick();
                  setShowIOSGuide(false);
                }}
                className="absolute -top-3 -right-3 bg-synth-magenta text-white border-2 border-white w-8 h-8 font-pixel flex items-center justify-center hover:bg-white hover:text-synth-magenta"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-pixel text-sm text-synth-yellow border-b-2 border-synth-yellow pb-2">
                INSTALL ON IOS HOME SCREEN
              </h3>
              <div className="font-vt text-xl text-gray-300 space-y-2">
                <p>1. Tap the <strong className="text-synth-cyan">Share</strong> icon at the bottom of Safari.</p>
                <p>2. Scroll down and tap <strong className="text-synth-magenta">"Add to Home Screen"</strong>.</p>
                <p>3. CleanQuest will run in full-screen offline arcade mode!</p>
              </div>
              <button
                onClick={() => {
                  sfx.playClick();
                  setShowIOSGuide(false);
                }}
                className="pixel-btn w-full py-2 font-pixel text-xs text-center"
              >
                GOT IT!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
