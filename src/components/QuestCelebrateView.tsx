import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CompanionType,
  DifficultyType,
  GameModeType,
  HighscoreEntry,
} from '../types/index.ts';
import { COMPANIONS } from '../data/taskDatabase.ts';
import { calculateSpeedrunBonus, calculateRank } from '../utils/cleaningLogic.ts';
import { sfx } from '../utils/soundEngine.ts';
import { Download, Share2, Trophy, RotateCcw, Award, CheckCircle, Copy } from 'lucide-react';

interface QuestCelebrateViewProps {
  score: number;
  questName: string;
  difficulty: DifficultyType;
  gameMode: GameModeType;
  companion: CompanionType;
  timeElapsed: number;
  timeRemaining: number;
  allTasksCompleted: boolean;
  onReturnHome: () => void;
  onViewHallOfFame: () => void;
}

export const QuestCelebrateView: React.FC<QuestCelebrateViewProps> = ({
  score,
  questName,
  difficulty,
  gameMode,
  companion,
  timeElapsed,
  timeRemaining,
  allTasksCompleted,
  onReturnHome,
  onViewHallOfFame,
}) => {
  const [initials, setInitials] = useState('ACE');
  const [hasSaved, setHasSaved] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Speedrun calculations
  const speedBonusResult =
    gameMode === 'speedrun'
      ? calculateSpeedrunBonus(allTasksCompleted, timeRemaining, 1800)
      : { bonus: 0, label: 'N/A', isPenalty: false };

  const finalScore = Math.max(0, score + speedBonusResult.bonus);
  const rank = calculateRank(finalScore, allTasksCompleted ? 5 : 4, 5, gameMode === 'speedrun' && allTasksCompleted);

  // Trigger confetti burst on mount
  useEffect(() => {
    sfx.playLevelWin();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#05d9e8', '#ff2a6d', '#fbe54f', '#ffffff'],
      });
    } catch {}
  }, []);

  // Format time taken
  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}m ${s}s`;
  };

  // Render the Social Accomplishment Card on HTML5 Canvas
  const drawAccomplishmentCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0a0015');
    bgGrad.addColorStop(0.5, '#1a0033');
    bgGrad.addColorStop(1, '#0a0015');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Synthwave grid lines in bottom half
    ctx.strokeStyle = 'rgba(5, 217, 232, 0.2)';
    ctx.lineWidth = 1;
    for (let y = h / 2; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Outer double neon border
    ctx.strokeStyle = '#05d9e8';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    ctx.strokeStyle = '#ff2a6d';
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    // Corner pixel decorations
    ctx.fillStyle = '#fbe54f';
    const corners = [
      [24, 24],
      [w - 38, 24],
      [24, h - 38],
      [w - 38, h - 38],
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillRect(cx, cy, 14, 14);
    });

    // Top Header Banner
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillStyle = '#05d9e8';
    ctx.textAlign = 'center';
    ctx.fillText('★ CLEANQUEST ARCADE CERTIFIED ★', w / 2, 60);

    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#ff2a6d';
    ctx.fillText('MISSION ACCOMPLISHED & DUST DEFEATED', w / 2, 85);

    // Player Badge Box
    ctx.fillStyle = '#120b1e';
    ctx.fillRect(40, 110, w - 80, 180);
    ctx.strokeStyle = '#fbe54f';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 110, w - 80, 180);

    // Quest Title
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = '#fbe54f';
    ctx.textAlign = 'left';
    ctx.fillText(`OPERATIVE: ${initials.toUpperCase() || 'PLAYER'}`, 60, 145);

    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`QUEST: ${questName.toUpperCase().slice(0, 26)}`, 60, 175);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#05d9e8';
    ctx.fillText(`MODE: ${gameMode.toUpperCase()} | TIME: ${formatTime(timeElapsed)}`, 60, 205);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#ff2a6d';
    ctx.fillText(`COMPANION: ${COMPANIONS[companion].name.toUpperCase()} ${COMPANIONS[companion].emoji}`, 60, 235);

    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillStyle = '#fbe54f';
    ctx.fillText(`SCORE: ${finalScore.toLocaleString()} PTS`, 60, 268);

    // Big Rank Badge Stamp on Right
    ctx.fillStyle = '#ff2a6d';
    ctx.beginPath();
    ctx.arc(w - 120, 200, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fbe54f';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.font = '34px "Press Start 2P", monospace';
    ctx.fillStyle = '#fbe54f';
    ctx.textAlign = 'center';
    ctx.fillText(rank, w - 120, 212);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('RANK TIER', w - 120, 234);

    // Bottom Synthwave signature
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#05d9e8';
    ctx.textAlign = 'center';
    ctx.fillText('CLEANQUEST 8-BIT SYNTHWAVE • HOME HYGIENE PROTOCOL', w / 2, 335);

    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText(new Date().toLocaleDateString(undefined, { dateStyle: 'long' }), w / 2, 360);
  };

  useEffect(() => {
    drawAccomplishmentCard();
  }, [initials, finalScore, rank]);

  // Save to local storage highscores
  const handleSaveHighscore = () => {
    if (hasSaved) return;
    sfx.playCoin();
    const cleanInitials = (initials.trim().toUpperCase() || 'ACE').slice(0, 3);

    const entry: HighscoreEntry = {
      id: `hs-${Date.now()}`,
      name: cleanInitials,
      score: finalScore,
      difficulty,
      mode: gameMode,
      companion,
      date: new Date().toLocaleDateString(),
      timeSeconds: timeElapsed,
      rank,
      questName,
    };

    try {
      const existing: HighscoreEntry[] = JSON.parse(
        localStorage.getItem('cleanquest_highscores') || '[]'
      );
      existing.push(entry);
      existing.sort((a, b) => b.score - a.score);
      const topScores = existing.slice(0, 20);
      localStorage.setItem('cleanquest_highscores', JSON.stringify(topScores));

      // Also record stats in ritual tracker
      const stats = JSON.parse(
        localStorage.getItem('cleanquest_stats') ||
          '{"totalCleanedMinutes":0,"sessionsCompleted":0,"bunniesVanished":0}'
      );
      stats.totalCleanedMinutes += Math.round(timeElapsed / 60);
      stats.sessionsCompleted += 1;
      stats.bunniesVanished += allTasksCompleted ? 5 : 3;
      localStorage.setItem('cleanquest_stats', JSON.stringify(stats));

      setHasSaved(true);
    } catch {}
  };

  // Download Accomplishment card as PNG
  const handleDownloadCard = () => {
    sfx.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `CleanQuest-${initials.toUpperCase() || 'Score'}-${finalScore}PTS.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Share card via Web Share API or copy image to clipboard
  const handleShareCard = async () => {
    sfx.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'cleanquest-trophy.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `CleanQuest Trophy: ${finalScore} PTS (Rank ${rank})`,
            text: `I just vanquished the mess in CleanQuest with a score of ${finalScore} PTS (Rank ${rank})! Powered by 8-bit Synthwave!`,
            files: [file],
          });
        } else if (navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 3000);
        } else {
          // Fallback download
          handleDownloadCard();
        }
      });
    } catch {
      handleDownloadCard();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-center py-4">
      {/* LEVEL COMPLETE HEADER */}
      <div>
        <h2 className="font-pixel text-2xl sm:text-4xl text-synth-yellow blink-text mb-2">
          &gt; LEVEL COMPLETE &lt;
        </h2>
        <p className="font-vt text-2xl text-synth-cyan">
          Dust bunnies banished. Sanctuary restored to pristine optical order.
        </p>
      </div>

      {/* SCORE BREAKDOWN BOX */}
      <div className="pixel-box p-6 max-w-lg mx-auto bg-synth-dark text-left space-y-4 shadow-[8px_8px_0_#ff2a6d]">
        <div className="flex justify-between items-center border-b-2 border-gray-700 pb-2">
          <span className="font-pixel text-xs text-gray-400">BASE QUEST SCORE</span>
          <span className="font-pixel text-lg text-synth-cyan">
            {score.toString().padStart(6, '0')}
          </span>
        </div>

        {gameMode === 'speedrun' && (
          <div className="flex justify-between items-center border-b-2 border-gray-700 pb-2">
            <span className="font-pixel text-xs text-synth-magenta">
              {speedBonusResult.label}
            </span>
            <span
              className={`font-pixel text-lg ${
                speedBonusResult.isPenalty ? 'text-red-500' : 'text-synth-magenta'
              }`}
            >
              {speedBonusResult.bonus > 0 ? `+${speedBonusResult.bonus}` : speedBonusResult.bonus}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center border-b-2 border-gray-700 pb-2">
          <span className="font-pixel text-xs text-gray-400">TIME TAKEN</span>
          <span className="font-pixel text-sm text-white">{formatTime(timeElapsed)}</span>
        </div>

        <div className="flex justify-between items-center border-b-4 border-synth-yellow pb-2 pt-2">
          <span className="font-pixel text-sm sm:text-base text-white">FINAL SCORE</span>
          <span className="font-pixel text-2xl sm:text-3xl text-synth-yellow neon-text">
            {finalScore.toString().padStart(6, '0')}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="font-pixel text-xs text-synth-cyan">CLEANING RANK AWARDED</span>
          <span className="font-pixel text-2xl text-synth-magenta font-bold bg-synth-gray px-3 py-1 border-2 border-synth-magenta">
            {rank}-RANK
          </span>
        </div>
      </div>

      {/* HIGHSCORE INITIALS INPUT */}
      <div className="max-w-lg mx-auto space-y-3">
        <h3 className="font-pixel text-xs sm:text-sm text-synth-cyan">
          {hasSaved ? 'HIGHSCORE RECORDED IN ARCHIVES!' : 'ENTER 3-LETTER INITIALS TO SAVE:'}
        </h3>

        {!hasSaved ? (
          <div className="flex justify-center items-center gap-3">
            <input
              type="text"
              maxLength={3}
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase())}
              className="bg-synth-dark border-4 border-synth-magenta text-synth-yellow font-pixel text-2xl sm:text-3xl p-3 w-28 text-center uppercase focus:outline-none focus:border-synth-cyan"
              placeholder="ACE"
            />
            <button
              onClick={handleSaveHighscore}
              className="pixel-btn font-pixel text-sm px-6 py-4"
            >
              RECORD
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-400 font-pixel text-xs">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>SAVED TO LOCAL STORAGE!</span>
          </div>
        )}
      </div>

      {/* SHAREABLE ACCOMPLISHMENT TROPHY CARD */}
      <div className="max-w-2xl mx-auto space-y-4 pt-4">
        <div className="flex items-center justify-center gap-2">
          <Award className="w-5 h-5 text-synth-yellow animate-bounce" />
          <h3 className="font-pixel text-sm text-synth-yellow uppercase">
            SHAREABLE ARCADE TROPHY CARD (INSTANT SOCIAL EXPORT)
          </h3>
        </div>

        {/* The Live Rendered Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={380}
            className="w-full max-w-[640px] h-auto border-4 border-synth-cyan shadow-[6px_6px_0_#ff2a6d] rounded-sm bg-black"
          />
        </div>

        {/* Card Export Action Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          <button
            onClick={handleDownloadCard}
            className="pixel-btn font-pixel text-xs px-5 py-3 flex items-center gap-2 bg-synth-cyan text-synth-dark hover:bg-white"
            title="Download Trophy Card image to camera roll / desktop"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>DOWNLOAD TROPHY CARD (PNG)</span>
          </button>

          <button
            onClick={handleShareCard}
            className="pixel-btn font-pixel text-xs px-5 py-3 flex items-center gap-2 bg-synth-yellow text-synth-dark hover:bg-white"
            title="Share directly or copy card image to clipboard"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span>SHARE / COPY IMAGE</span>
          </button>
        </div>

        {copiedToast && (
          <div className="bg-synth-yellow text-synth-dark font-pixel text-[10px] px-3 py-2 inline-block rounded shadow">
            Trophy Card image copied to clipboard! Ready to paste into chat or socials!
          </div>
        )}
      </div>

      {/* RETURN NAVIGATION BUTTONS */}
      <div className="flex flex-wrap justify-center items-center gap-4 pt-6">
        <button
          onClick={onReturnHome}
          className="pixel-btn font-pixel text-xs sm:text-sm px-6 py-3 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>START NEW MISSION</span>
        </button>

        <button
          onClick={onViewHallOfFame}
          className="pixel-btn-cyan font-pixel text-xs sm:text-sm px-6 py-3 flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          <span>VIEW HALL OF FAME</span>
        </button>
      </div>
    </div>
  );
};
