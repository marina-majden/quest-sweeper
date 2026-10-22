import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CompanionType,
  DifficultyType,
  GameModeType,
  HighscoreEntry,
} from '../types/index.ts';
import { COMPANIONS } from '../data/taskDatabase.ts';
import { calculateSpeedrunBonus, calculateMilitaryRank } from '../utils/cleaningLogic.ts';
import { sfx } from '../utils/soundEngine.ts';
import {
  Download,
  Share2,
  Trophy,
  RotateCcw,
  CheckCircle,
  Copy,
  ExternalLink,
  X,
} from 'lucide-react';
import { getBadgeTierIndex, getSingleBadgeLetter, loadBadgeImage, TrophyBadge } from './TrophyBadges.tsx';

interface QuestCelebrateViewProps {
  score: number;
  questName: string;
  difficulty: DifficultyType;
  gameMode: GameModeType;
  companion: CompanionType;
  timeElapsed: number;
  timeRemaining: number;
  allTasksCompleted: boolean;
  tasksCompletedCount?: number;
  totalTasksCount?: number;
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
  tasksCompletedCount,
  totalTasksCount,
  onReturnHome,
  onViewHallOfFame,
}) => {
  const [playerName, setPlayerName] = useState('OPERATIVE');
  const [hasSaved, setHasSaved] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const completedTasks = tasksCompletedCount ?? (allTasksCompleted ? 5 : 4);
  const totalTasks = totalTasksCount && totalTasksCount > 0 ? totalTasksCount : 5;

  // Speedrun calculations
  const speedBonusResult =
    gameMode === 'speedrun'
      ? calculateSpeedrunBonus(allTasksCompleted, timeRemaining, 1800)
      : { bonus: 0, label: 'N/A', isPenalty: false };

  const finalScore = Math.max(0, score + speedBonusResult.bonus);

  // New Military Ranking System with Tiers and percentage of completion
  const militaryRank = calculateMilitaryRank({
    difficulty,
    gameMode,
    completedTasks,
    totalTasks,
    timeRemainingSeconds: timeRemaining,
  });

  // Determine which of the 5 badge designs to use
  const badgeIndex = getBadgeTierIndex({
    difficulty,
    gameMode,
    completedTasks,
    totalTasks,
    isSpeedrunSuccess: militaryRank.isSuccess,
  });

  // Single big letter for badge: 'G' for General / Best completion, 'S' for Special forces / speedrun win, 'A'/'B'/'C' for grades
  const badgeLetter = getSingleBadgeLetter({
    badgeIndex,
    difficulty,
    gameMode,
    completedTasks,
    totalTasks,
    isSpeedrunSuccess: militaryRank.isSuccess,
  });

  const [badgeImage, setBadgeImage] = useState<HTMLImageElement | null>(null);

  // Load badge image asynchronously for canvas rendering
  useEffect(() => {
    let active = true;
    loadBadgeImage(badgeIndex, badgeLetter)
      .then((img) => {
        if (active) setBadgeImage(img);
      })
      .catch((err) => {
        console.error('Error loading badge image for canvas:', err);
      });
    return () => {
      active = false;
    };
  }, [badgeIndex, badgeLetter]);

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

  // Render the Social Accomplishment Certificate Card on HTML5 Canvas
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
    ctx.fillText('★ CLEANQUEST CERTIFICATE ★', w / 2, 58);

    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#ff2a6d';
    ctx.fillText(militaryRank.certificateSubtitle.toUpperCase(), w / 2, 82);

    // Player Badge Box
    ctx.fillStyle = '#120b1e';
    ctx.fillRect(36, 102, w - 72, 190);
    ctx.strokeStyle = '#fbe54f';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 102, w - 72, 190);

    // Quest Title & Operative info (supports up to 14 characters)
    ctx.textAlign = 'left';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = '#fbe54f';
    ctx.fillText(`OPERATIVE: ${(playerName.trim().toUpperCase() || 'OPERATIVE').slice(0, 14)}`, 52, 130);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`MISSION: ${questName.toUpperCase().slice(0, 22)}`, 52, 158);

    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#05d9e8';
    ctx.fillText(`TIER: ${militaryRank.tierName}`, 52, 184);

    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#05d9e8';
    ctx.fillText(`TASKS: ${completedTasks}/${totalTasks} | TIME: ${formatTime(timeElapsed)}`, 52, 210);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#ff2a6d';
    ctx.fillText(`RANK: ${militaryRank.rankTitle.slice(0, 24)}`, 52, 238);

    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = '#fbe54f';
    ctx.fillText(`SCORE: ${finalScore.toLocaleString()} PTS`, 52, 268);

    // Tier Badge Stamp on Right (SVG Badge)
    if (badgeImage) {
      const badgeW = badgeIndex === 5 ? 97 : 86;
      const badgeH = badgeIndex === 5 ? 114 : 115;
      const badgeX = w - 110 - badgeW / 2;
      const badgeY = 125;
      ctx.drawImage(badgeImage, badgeX, badgeY, badgeW, badgeH);

      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = '#fbe54f';
      ctx.textAlign = 'center';
      ctx.fillText(militaryRank.statusBadge.slice(0, 16), w - 110, 262);
    } else {
      // Fallback while image is rendering
      ctx.fillStyle = '#ff2a6d';
      ctx.beginPath();
      ctx.arc(w - 110, 185, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbe54f';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.font = '24px "Press Start 2P", monospace';
      ctx.fillStyle = '#fbe54f';
      ctx.textAlign = 'center';
      ctx.fillText(badgeLetter, w - 110, 192);

      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(militaryRank.statusBadge.slice(0, 14), w - 110, 224);
    }

    // Bottom Cleanquest Link & Date
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#05d9e8';
    ctx.textAlign = 'center';
    ctx.fillText('CLEANQUEST • questsweeper.netlify.app', w / 2, 335);

    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText(new Date().toLocaleDateString(undefined, { dateStyle: 'long' }), w / 2, 360);
  };

  useEffect(() => {
    drawAccomplishmentCard();
  }, [playerName, finalScore, militaryRank.rankTitle, completedTasks, totalTasks, badgeImage]);

  // Save to local storage highscores (14 characters name allowed)
  const handleSaveHighscore = () => {
    if (hasSaved) return;
    sfx.playCoin();
    const cleanName = (playerName.trim().toUpperCase() || 'OPERATIVE').slice(0, 14);

    const entry: HighscoreEntry = {
      id: `hs-${Date.now()}`,
      name: cleanName,
      score: finalScore,
      difficulty,
      mode: gameMode,
      companion,
      date: new Date().toLocaleDateString(),
      timeSeconds: timeElapsed,
      rank: militaryRank.rankAbbr,
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
      stats.bunniesVanished += completedTasks;
      localStorage.setItem('cleanquest_stats', JSON.stringify(stats));

      setHasSaved(true);
    } catch {}
  };

  // Download Accomplishment card (no PNG in button text)
  const handleDownloadCard = () => {
    sfx.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    const cleanName = (playerName.trim().toUpperCase() || 'OPERATIVE').slice(0, 14);
    a.href = url;
    a.download = `CleanQuest-Certificate-${cleanName}-${finalScore}PTS.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Direct image copy or Web Share
  const handleCopyOrShareBlob = async () => {
    sfx.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'cleanquest-certificate.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `CleanQuest Certificate: ${militaryRank.rankTitle}`,
            text: `I earned the rank of ${militaryRank.rankTitle} in Cleanquest (${finalScore} PTS)! Cleaned ${completedTasks}/${totalTasks} objectives. Play at https://questsweeper.netlify.app`,
            files: [file],
          });
        } else if (navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 3000);
        } else {
          handleDownloadCard();
        }
      });
    } catch {
      handleDownloadCard();
    }
  };

  const handleCopyGameLink = () => {
    sfx.playClick();
    try {
      navigator.clipboard.writeText('https://questsweeper.netlify.app');
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {}
  };

  const shareText = `I just completed a mission in Cleanquest with ${completedTasks}/${totalTasks} tasks cleared! Awarded rank: ${militaryRank.rankTitle} [${militaryRank.rankAbbr}] with ${finalScore.toLocaleString()} PTS!`;

  return (
    <div className="space-y-8 animate-fadeIn text-center py-4">
      {/* MISSION COMPLETE HEADER */}
      <div>
        <h2 className="font-pixel text-lg md:text-2xl sm:text-4xl text-synth-yellow blink-text mb-2">
          &gt; MISSION COMPLETE &lt;
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
          <span className="font-pixel text-xs text-gray-400">TASKS COMPLETED</span>
          <span className="font-pixel text-sm text-synth-yellow">
            {completedTasks} / {totalTasks} ({militaryRank.completionPercent}%)
          </span>
        </div>

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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t-2 border-gray-800">
          <div>
            <span className="font-pixel text-[10px] text-synth-cyan block">{militaryRank.tierName}</span>
            <span className="font-pixel text-xs sm:text-sm text-synth-magenta font-bold">
              {militaryRank.rankTitle}
            </span>
            <span className="font-vt text-lg text-synth-yellow block mt-0.5">
              {badgeIndex === 5 ? '★ DOUBLE RIBBON PINNACLE GRADE ★' : `TIER DESIGN #${badgeIndex}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <TrophyBadge badgeIndex={badgeIndex} letter={badgeLetter} />
          </div>
        </div>
      </div>

      {/* HIGHSCORE NAME INPUT (UP TO 14 CHARACTERS) */}
      <div className="max-w-lg mx-auto space-y-3">
        <h3 className="font-pixel text-xs sm:text-sm text-synth-cyan">
          {hasSaved ? 'NAME RECORDED IN ARCHIVES!' : 'ENTER YOUR NAME:'}
        </h3>

        {!hasSaved ? (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <input
              type="text"
              maxLength={14}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
              className="bg-synth-dark border-4 border-synth-magenta text-synth-yellow font-pixel text-base sm:text-xl p-3 w-64 sm:w-80 text-center uppercase focus:outline-none focus:border-synth-cyan"
              placeholder="ENTER YOUR NAME"
            />
            <button
              onClick={handleSaveHighscore}
              className="pixel-btn font-pixel text-sm px-6 py-3 cursor-pointer w-full sm:w-auto"
            >
              RECORD
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-400 font-pixel text-xs">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>RECORDED TO LOCAL STORAGE!</span>
          </div>
        )}
      </div>

      {/* CLEANQUEST CERTIFICATE TROPHY CARD */}
      <div className="max-w-2xl mx-auto space-y-4 pt-2">
        {/* The Live Rendered Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={380}
            className="w-full max-w-[640px] h-auto border-4 border-synth-cyan shadow-[6px_6px_0_#ff2a6d] rounded-sm bg-black"
          />
        </div>

        {/* Card Export Action Buttons: PNG removed, SHARE IMAGE opens social menu */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          <button
            onClick={handleDownloadCard}
            className="pixel-btn font-pixel text-xs px-5 py-3 flex items-center gap-2 bg-synth-cyan text-synth-dark hover:bg-white cursor-pointer"
            title="Download Certificate image to device"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>DOWNLOAD TROPHY CARD</span>
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              setShowShareModal(true);
            }}
            className="pixel-btn font-pixel text-xs px-5 py-3 flex items-center gap-2 bg-synth-yellow text-synth-dark hover:bg-white cursor-pointer"
            title="Share image to social media"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span>SHARE IMAGE</span>
          </button>
        </div>

        {copiedToast && (
          <div className="bg-synth-yellow text-synth-dark font-pixel text-[10px] px-3 py-2 inline-block rounded shadow">
            Certificate image copied to clipboard! Ready to paste into chat or socials!
          </div>
        )}
      </div>

      {/* SOCIAL MEDIA SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 retro-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="pixel-box p-6 max-w-lg w-full bg-synth-dark text-left space-y-5 shadow-[8px_8px_0_#ff2a6d] border-synth-magenta relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                sfx.playClick();
                setShowShareModal(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-pixel text-sm p-1 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b-2 border-synth-magenta pb-3">
              <h3 className="font-pixel text-sm sm:text-base text-synth-yellow flex items-center gap-2">
                <Share2 className="w-5 h-5 text-synth-magenta" />
                <span>SHARE CERTIFICATE</span>
              </h3>
              <p className="font-vt text-lg text-synth-cyan mt-1">
                Broadcast your {militaryRank.rankTitle} accomplishment!
              </p>
            </div>

            {/* Social media share links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent('https://questsweeper.netlify.app')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sfx.playClick()}
                className="pixel-btn-cyan font-pixel text-xs p-3 flex items-center justify-center gap-2 text-center"
              >
                <span>X / TWITTER</span>
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' https://questsweeper.netlify.app')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sfx.playClick()}
                className="pixel-btn font-pixel text-xs p-3 flex items-center justify-center gap-2 text-center bg-green-500 hover:bg-green-400 text-black border-green-300"
              >
                <span>WHATSAPP</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://questsweeper.netlify.app')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sfx.playClick()}
                className="pixel-btn font-pixel text-xs p-3 flex items-center justify-center gap-2 text-center bg-blue-600 hover:bg-blue-500 text-white border-blue-400"
              >
                <span>FACEBOOK</span>
              </a>

              <a
                href={`https://reddit.com/submit?url=${encodeURIComponent('https://questsweeper.netlify.app')}&title=${encodeURIComponent('Cleanquest Certificate: ' + militaryRank.rankTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sfx.playClick()}
                className="pixel-btn font-pixel text-xs p-3 flex items-center justify-center gap-2 text-center bg-orange-600 hover:bg-orange-500 text-white border-orange-400"
              >
                <span>REDDIT</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent('https://questsweeper.netlify.app')}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sfx.playClick()}
                className="pixel-btn font-pixel text-xs p-3 flex items-center justify-center gap-2 text-center bg-sky-500 hover:bg-sky-400 text-white border-sky-300 sm:col-span-2"
              >
                <span>TELEGRAM</span>
              </a>
            </div>

            {/* Direct Image Copy / Device Share Actions */}
            <div className="pt-2 border-t-2 border-gray-700 space-y-3">
              <button
                onClick={handleCopyOrShareBlob}
                className="pixel-btn font-pixel text-xs w-full py-3 flex items-center justify-center gap-2 bg-synth-yellow text-synth-dark hover:bg-white cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>COPY CERTIFICATE IMAGE TO CLIPBOARD</span>
              </button>

              <button
                onClick={handleCopyGameLink}
                className="pixel-btn font-pixel text-xs w-full py-2.5 flex items-center justify-center gap-2 bg-synth-gray text-synth-cyan hover:text-white cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{linkCopied ? 'GAME LINK COPIED!' : 'COPY GAME LINK (questsweeper.netlify.app)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN NAVIGATION BUTTONS */}
      <div className="flex flex-wrap justify-center items-center gap-4 pt-6">
        <button
          onClick={onReturnHome}
          className="pixel-btn font-pixel text-xs sm:text-sm px-6 py-3 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>NEW MISSION</span>
        </button>

        <button
          onClick={onViewHallOfFame}
          className="pixel-btn-cyan font-pixel text-xs sm:text-sm px-6 py-3 flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          <span>HALL OF FAME</span>
        </button>
      </div>
    </div>
  );
};
