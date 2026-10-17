import React, { useState, useEffect } from 'react';
import {
  CleaningTask,
  CompanionType,
  DifficultyType,
  GameModeType,
} from '../types/index.ts';
import { COMPANIONS, BONUS_QUESTS } from '../data/taskDatabase.ts';
import { AudioVisualizer } from './AudioVisualizer.tsx';
import { calculatePipProgress, filterVisibleTasksForMystery } from '../utils/cleaningLogic.ts';
import { sfx } from '../utils/soundEngine.ts';
import {
  Check,
  PlusCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Bot,
  Skull,
  Timer,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

interface QuestActiveViewProps {
  difficulty: DifficultyType;
  gameMode: GameModeType;
  companion: CompanionType;
  questName: string;
  tasks: CleaningTask[];
  setTasks: React.Dispatch<React.SetStateAction<CleaningTask[]>>;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  timeElapsed: number;
  timeRemaining: number;
  onAbort: () => void;
  onFinish: () => void;
}

export const QuestActiveView: React.FC<QuestActiveViewProps> = ({
  difficulty,
  gameMode,
  companion,
  questName,
  tasks,
  setTasks,
  score,
  setScore,
  timeElapsed,
  timeRemaining,
  onAbort,
  onFinish,
}) => {
  const compInfo = COMPANIONS[companion];
  const [currentQuote, setCurrentQuote] = useState<string>(compInfo.quotes[0]);
  const [activeTip, setActiveTip] = useState<string | null>(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [abortModalOpen, setAbortModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customMicro, setCustomMicro] = useState('');
  const [bonusCompleted, setBonusCompleted] = useState<Record<string, boolean>>({});

  // Periodic companion dialogue updates
  useEffect(() => {
    const timer = setInterval(() => {
      const isTip = Math.random() > 0.5 && compInfo.tips.length > 0;
      if (isTip) {
        const rTip = compInfo.tips[Math.floor(Math.random() * compInfo.tips.length)];
        setCurrentQuote(rTip);
      } else {
        const rQuote = compInfo.quotes[Math.floor(Math.random() * compInfo.quotes.length)];
        setCurrentQuote(rQuote);
      }
    }, 12000);
    return () => clearInterval(timer);
  }, [compInfo]);

  const handleCompanionClick = () => {
    if (companion === 'robot') sfx.playPipChirp();
    else if (companion === 'bunny') sfx.playZenBell();
    else sfx.playCoin();

    const pool = [...compInfo.quotes, ...compInfo.tips];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuote(pick);
  };

  // Toggle whole task
  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const willComplete = !t.completed;
        let deltaScore = 0;

        if (willComplete) {
          sfx.playCoin();
          // Mark all microsteps complete
          const updatedMicro = t.microSteps.map((m) => {
            if (!m.completed) {
              deltaScore += m.points;
              return { ...m, completed: true };
            }
            return m;
          });
          if (t.microSteps.length === 0) {
            deltaScore += t.points;
          }
          setScore((s) => s + deltaScore);
          return { ...t, completed: true, microSteps: updatedMicro };
        } else {
          sfx.playClick();
          // Mark all microsteps incomplete
          const updatedMicro = t.microSteps.map((m) => {
            if (m.completed) {
              deltaScore -= m.points;
              return { ...m, completed: false };
            }
            return m;
          });
          if (t.microSteps.length === 0) {
            deltaScore -= t.points;
          }
          setScore((s) => Math.max(0, s + deltaScore));
          return { ...t, completed: false, microSteps: updatedMicro };
        }
      })
    );
  };

  // Toggle single micro step
  const toggleMicroStep = (taskId: string, microId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        let deltaScore = 0;
        const newMicro = t.microSteps.map((m) => {
          if (m.id !== microId) return m;
          const willComplete = !m.completed;
          if (willComplete) {
            sfx.playCoin();
            deltaScore += m.points;
          } else {
            sfx.playClick();
            deltaScore -= m.points;
          }
          return { ...m, completed: willComplete };
        });

        const allMicroDone = newMicro.every((m) => m.completed);
        setScore((s) => Math.max(0, s + deltaScore));
        return {
          ...t,
          completed: allMicroDone,
          microSteps: newMicro,
        };
      })
    );
  };

  // Toggle micro step expansion
  const toggleMicroVisibility = (taskId: string) => {
    sfx.playClick();
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, showMicro: !t.showMicro } : t))
    );
  };

  // Toggle optional bonus quest
  const toggleBonus = (bonusId: string, pts: number) => {
    const isDone = !!bonusCompleted[bonusId];
    if (!isDone) {
      sfx.playCoin();
      setScore((s) => s + pts);
      setBonusCompleted((prev) => ({ ...prev, [bonusId]: true }));
    } else {
      sfx.playClick();
      setScore((s) => Math.max(0, s - pts));
      setBonusCompleted((prev) => ({ ...prev, [bonusId]: false }));
    }
  };

  // Add custom task
  const handleSaveCustomTask = () => {
    if (!customTitle.trim()) {
      sfx.playError();
      return;
    }
    const microRaw = customMicro.trim();
    const microList = microRaw
      ? microRaw
          .split(',')
          .map((m) => m.trim())
          .filter((m) => m.length > 0)
          .map((title, i) => ({
            id: `cm-${Date.now()}-${i}`,
            title,
            completed: false,
            points: 100,
          }))
      : [];

    const newTask: CleaningTask = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      desc: 'Player Custom Side-Quest',
      type: 'wipe',
      points: microList.length > 0 ? microList.length * 100 : 500,
      completed: false,
      showMicro: false,
      microSteps: microList,
      proTip: 'Custom task designed by you! Break it down and conquer it!',
    };

    sfx.playCoin();
    setTasks((prev) => [...prev, newTask]);
    setCustomTitle('');
    setCustomMicro('');
    setCustomModalOpen(false);
  };

  // Formatted timer string
  const timerSeconds = gameMode === 'speedrun' ? timeRemaining : timeElapsed;
  const mins = Math.floor(timerSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (timerSeconds % 60).toString().padStart(2, '0');
  const timerWarning = gameMode === 'speedrun' && timeRemaining < 60;

  // Total completed counts
  const completedTaskCount = tasks.filter((t) => t.completed).length;
  const totalTaskCount = tasks.length;
  const isBossMode = difficulty === 'deep';

  // Calculate Boss remaining HP
  const bossRemainingHP =
    totalTaskCount > 0
      ? Math.max(0, Math.round(((totalTaskCount - completedTaskCount) / totalTaskCount) * 100))
      : 0;

  // Calculate Pip's rival progress if companion is robot
  const pipInfo =
    companion === 'robot'
      ? calculatePipProgress(timeElapsed, 1200, completedTaskCount, totalTaskCount)
      : null;

  // Visible tasks based on mode
  const visibleTasks =
    gameMode === 'shuffle' ? filterVisibleTasksForMystery(tasks) : tasks;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* TOP HEADS UP DISPLAY (HUD) */}
      <div className="pixel-box p-2 md:p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0e001e]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
            <h2 className="font-pixel text-xs sm:text-base text-synth-cyan uppercase tracking-wider">
              {questName.toUpperCase()}
            </h2>
          </div>
        
          <div className="flex items-center gap-2 font-pixel text-[6px] sm:text-[8px]">
            <div className="flex flex-col items-start justify-evenly">
            <span className="bg-synth-magenta text-white px-2 py-0.5">
              {difficulty.toUpperCase()}
            </span>
            <span className="bg-synth-yellow text-synth-dark px-2 py-0.5">
              {gameMode.toUpperCase()}
            </span>
            </div>
            <span className="bg-synth-dark border border-synth-cyan text-synth-cyan px-2 py-0.5">
              QUESTS: {completedTaskCount}/{totalTaskCount}
            </span>
          </div>
        </div>

        {/* Score Display and Time Display*/}
        <div className="flex items-center space-between gap-1">
           {/* Score Display */}
        <div className="shrink text-center md:bg-synth-dark md:border-2 md:border-synth-yellow md:px-4 md:py-2 md:shadow-[2px_2px_0_#ff2a6d]">
          <div className="font-pixel text-[7px] md:text-[9px] text-gray-400 mb-0.5">TOTAL SCORE</div>
          <div className="font-pixel text-sm md:text-xl sm:text-2xl text-synth-yellow tracking-widest">
            {score.toString().padStart(6, '0')}
          </div>
        </div>

        {/* Timer Display */}
        <div className="shrink text-center md:bg-synth-dark md:border-2 md:border-synth-cyan md:px-4 md:py-2 md:shadow-[2px_2px_0_#05d9e8]">
          <div className="font-pixel text-[7px] md:text-[9px] text-gray-400 mb-0.5 flex items-center justify-evenly gap-1">
           
            <span>{gameMode === 'speedrun' ? 'TIME REMAINING' : 'TIME ELAPSED'}</span> <Timer className="w-3 h-3 text-synth-cyan" />
          </div>
          <div
            className={`font-pixel text-xs md:text-2xl lg:text-3xl tracking-widest ${
              timerWarning ? 'text-synth-magenta blink-text' : 'text-synth-cyan'
            }`}
          >
            {mins}:{secs}
          </div>
        </div>
        </div>
      </div>

      {/* BOSS HEALTH BAR (IF BOSS FIGHT MODE) */}
      {isBossMode && (
        <div className="pixel-box p-4 bg-synth-dark border-synth-magenta space-y-2">
          <div className="flex justify-between items-center font-pixel text-xs">
            <span className="text-synth-magenta flex items-center gap-1.5">
              <Skull className="w-4 h-4 animate-bounce" />
              <span>BOSS HP: {bossRemainingHP}%</span>
            </span>
            <span className="text-synth-yellow">
              {bossRemainingHP === 0 ? 'STATUS: VANQUISHED!' : 'STATUS: COMBAT ENGAGED'}
            </span>
          </div>
          <div className="w-full bg-synth-gray h-5 border-2 border-white p-0.5 relative overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                bossRemainingHP > 50
                  ? 'bg-synth-magenta'
                  : bossRemainingHP > 20
                  ? 'bg-synth-yellow'
                  : 'bg-green-400'
              }`}
              style={{ width: `${bossRemainingHP}%` }}
            />
          </div>
        </div>
      )}

      {/* PIP'S ROBOT RIVAL BAR (IF COMPANION IS PIP) */}
      {pipInfo && (
        <div className="pixel-box p-2 sm:p-4 bg-synth-dark border-synth-yellow space-y-2">
          <div className="flex justify-between items-center font-pixel text-[8px] md:text-[10px]">
            <span className="text-synth-yellow flex items-center gap-1.5">
              <Bot className="w-4 h-4 animate-pulse text-synth-yellow" />
              <span>PIP'S CLEANING PROGRESS: {pipInfo.progress}%</span>
            </span>
            <span className={pipInfo.isAhead ? 'text-synth-magenta' : 'text-green-400'}>
              {pipInfo.isAhead ? 'RIVAL IS AHEAD!' : 'YOU ARE LEADING!'}
            </span>
          </div>
          <div className="w-full bg-synth-gray h-4 border border-synth-yellow p-0.5">
            <div
              className="h-full bg-synth-yellow transition-all duration-300"
              style={{ width: `${pipInfo.progress}%` }}
            />
          </div>
          <p className="font-vt text-xs md:text-lg text-synth-cyan italic">"{pipInfo.statusText}"</p>
        </div>
      )}

      {/* COMPANION & AUDIO VISUALIZER (50 / 50 RESPONSIVE GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COMPANION INTERACTIVE BOX */}
        <div className="pixel-box p-2 md:p-4 flex flex-col items-center justify-between min-h-[240px] relative bg-synth-gray/40">
          <div className="w-full flex justify-between items-center mb-2">
            <div className="flex items-center justify-between gap-1.5">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <span className="font-pixel text-[8px] text-synth-cyan uppercase font-bold tracking-wider">
                PLAYER TWO
              </span>
            </div>
            <span className="font-pixel text-[8px] text-synth-cyan text-right">
              CLICK FOR ADVICE
            </span>
          </div>

          {/* Clickable Companion Avatar */}
          <div
            onClick={handleCompanionClick}
            className={`text-6xl sm:text-7xl cursor-pointer hover:scale-125 transition-transform duration-200 select-none my-1 ${
              companion === 'sponge'
                ? 'animate-sponge-clean'
                : companion === 'robot'
                ? 'animate-robot-mimic'
                : 'animate-bunny-wiggle'
            }`}
            title="Click to interact with your companion!"
            role="button"
            aria-label={`Interact with ${compInfo.name}`}
          >
            {compInfo.emoji}
          </div>

          <div className="text-center mb-2">
            <span className="font-pixel text-[8px] text-synth-cyan uppercase block tracking-wider mb-0.5">
              {compInfo.title}
            </span>
            <span className="font-pixel text-xs text-synth-yellow uppercase font-bold">
              {compInfo.name}
            </span>
          </div>

          {/* Speech Bubble */}
          <div className="bg-synth-dark border-2 border-synth-cyan p-3 w-full relative min-h-[75px] flex items-center justify-center">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-synth-cyan" />
            <p className="font-vt text-md sm:text-2xl text-synth-cyan text-center leading-none md:leading-tight">
              "{currentQuote}"
            </p>
          </div>
        </div>

        {/* WINAMP RETRO AUDIO VISUALIZER */}
        <AudioVisualizer />
      </div>

      {/* MINIGAMES FOR HP BOOST */}
      <div className="pixel-box p-4 bg-synth-dark/70 border-synth-yellow/60 space-y-3">
        <h4 className="font-pixel text-xs text-synth-yellow flex items-center gap-2 uppercase">
          <Sparkles className="w-4 h-4 text-synth-yellow" />
          <span>MINIGAMES FOR HP BOOST</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BONUS_QUESTS.map((bq) => {
            const done = !!bonusCompleted[bq.id];
            return (
              <button
                key={bq.id}
                onClick={() => toggleBonus(bq.id, bq.points)}
                className={`p-2.5 border-2 text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  done
                    ? 'bg-synth-yellow/20 border-synth-yellow text-synth-yellow'
                    : 'bg-synth-gray/40 border-gray-700 text-gray-300 hover:border-synth-cyan'
                }`}
              >
                <div
                  className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    done
                      ? 'bg-synth-yellow border-synth-yellow text-synth-dark'
                      : 'border-gray-500 bg-synth-dark'
                  }`}
                >
                  {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="font-pixel text-[9px] mb-0.5">{bq.title}</div>
                  <div className="font-vt text-base leading-tight opacity-80">{bq.desc}</div>
                  <span className="font-pixel text-[8px] text-synth-cyan mt-1 inline-block">
                    +{bq.points} PTS
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* QUEST LOG WITH STEPPED PROGRESS BAR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-4 border-synth-magenta pb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-pixel text-base sm:text-lg text-synth-magenta tracking-wide">
              &gt; QUEST LOG &lt;
            </h3>
            <span className="font-pixel text-[9px] text-synth-cyan bg-synth-dark px-2 py-0.5 border border-synth-cyan">
              {completedTaskCount}/{totalTaskCount}
            </span>
          </div>

          {/* Stepped progress bar with 5 steps which fill out as player checks them */}
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="flex items-center gap-1.5 w-full">
              {Array.from({ length: totalTaskCount || 5 }).map((_, idx) => {
                const isStepFilled = idx < completedTaskCount;
                return (
                  <div
                    key={idx}
                    className={`flex-1 h-5 border-2 transition-all duration-300 relative flex items-center justify-center ${
                      isStepFilled
                        ? 'bg-synth-cyan border-synth-cyan shadow-[0_0_8px_#05d9e8]'
                        : 'bg-synth-dark border-gray-700'
                    }`}
                    title={`Step ${idx + 1} of ${totalTaskCount || 5}: ${isStepFilled ? 'Completed' : 'Remaining'}`}
                  >
                    {isStepFilled && (
                      <span className="font-pixel text-[8px] text-synth-dark font-bold">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="font-pixel text-[8px] text-synth-yellow whitespace-nowrap">
              {Math.round((completedTaskCount / (totalTaskCount || 1)) * 100)}%
            </span>
          </div>

          {gameMode === 'shuffle' && (
            <span className="font-pixel text-[9px] text-synth-yellow bg-synth-dark px-2 py-1 border border-synth-yellow">
              MYSTERY MODE
            </span>
          )}
        </div>

        <div className="space-y-4">
          {visibleTasks.map((task) => {
            const microTotal = task.microSteps.length;
            const microDone = task.microSteps.filter((m) => m.completed).length;

            return (
              <div
                key={task.id}
                className={`pixel-box py-3 md:py-4 px-3 md:px-4 transition-all ${
                  task.completed ? 'opacity-60 border-gray-700 bg-synth-dark' : 'bg-synth-gray/60'
                }`}
              >
                {/* Top Row: Checkbox, Title, and Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {/* Task Checkbox */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 md:w-6 md:h-6 border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                        task.completed
                          ? 'bg-synth-cyan border-synth-cyan text-synth-dark'
                          : 'border-gray-400 bg-synth-dark hover:border-synth-yellow'
                      }`}
                      title={task.completed ? 'Mark incomplete' : 'Complete task'}
                      aria-label={`Toggle task ${task.title}`}
                    >
                      {task.completed && <Check className="w-4 h-4 md:w-5 md:h-5 stroke-[3]" />}
                    </button>

                    {task.bossPhase && (
                      <span className="bg-synth-magenta text-white font-pixel text-[8px] px-1.5 py-0.5 flex-shrink-0">
                        PHASE {task.bossPhase}
                      </span>
                    )}

                    <h4
                      className={`font-pixel text-xs sm:text-sm ${
                        task.completed ? 'line-through text-gray-500' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                    {microTotal > 0 && (
                      <button
                        onClick={() => toggleMicroVisibility(task.id)}
                        className="bg-synth-dark border border-synth-cyan/60 hover:border-synth-cyan text-synth-cyan hover:text-white px-2 py-1 font-pixel text-[8px] flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={task.showMicro ? 'Collapse steps' : 'Expand step-by-step guidance'}
                      >
                        <span>
                          {microDone}/{microTotal} steps [{task.showMicro ? 'collapse' : 'expand'}]
                        </span>
                        {task.showMicro ? (
                          <ChevronUp className="w-3 h-3 text-synth-magenta" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-synth-yellow animate-bounce" />
                        )}
                      </button>
                    )}

                    <span className="font-pixel text-[9px] text-synth-yellow bg-synth-dark px-2 py-0.5 border border-synth-yellow">
                      {task.points} PTS
                    </span>
                  </div>
                </div>

                {/* Sibling Div: Full Width Content (Description, Pro Tips, Microsteps) */}
                <div className="w-full mt-2.5">
                  <p className="font-vt md:text-lg leading-snug text-gray-300">{task.desc}</p>

                  {/* Educational Pro Tip Accordion / Callout */}
                  {task.proTip && (
                    <div className="mt-2.5 p-2 bg-synth-dark border border-synth-cyan/40 rounded flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-synth-yellow flex-shrink-0 mt-0.5" />
                      <p className="font-vt text-lg text-synth-cyan leading-none md:leading-snug">
                        {task.proTip}
                      </p>
                    </div>
                  )}

                  {/* Expandable Microsteps List */}
                  {task.showMicro && microTotal > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700 space-y-1.5 md:space-y-2.5 pl-1 sm:pl-2">
                      {task.microSteps.map((m) => (
                        <div key={m.id} className="flex items-start gap-2 md:gap-3">
                          <button
                            onClick={() => toggleMicroStep(task.id, m.id)}
                            className={`w-4 h-4 md:w-5 md:h-5 border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors cursor-pointer ${
                              m.completed
                                ? 'bg-synth-magenta border-synth-magenta text-white'
                                : 'bg-synth-dark border-gray-500 hover:border-synth-magenta'
                            }`}
                            aria-label={`Toggle microstep ${m.title}`}
                          >
                            {m.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <span
                            className={`font-vt leading-none md:leading-tight text-lg md:text-xl ${
                              m.completed ? 'line-through text-gray-500' : 'text-gray-200'
                            }`}
                          >
                            {m.title}
                            <span className="text-synth-magenta text-[7px] md:text-sm ml-2 font-pixel">
                              +{m.points} PTS
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ADD CUSTOM TASK BUTTON */}
        <button
          onClick={() => {
            sfx.playClick();
            setCustomModalOpen(true);
          }}
          className="pixel-btn font-pixel text-xs px-4 py-3 w-full flex items-center justify-center gap-2 mt-4 bg-synth-gray hover:bg-synth-dark"
        >
          <PlusCircle className="w-4 h-4 text-synth-cyan" />
          <span>+ ADD SIDE-QUEST</span>
        </button>
      </div>

      {/* FOOTER CONTROLS: ABORT & FINISH LEVEL */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t-4 border-synth-dark pt-6 gap-4">
        <button
          onClick={() => {
            sfx.playClick();
            setAbortModalOpen(true);
          }}
          className="font-pixel text-xs text-gray-400 hover:text-synth-magenta uppercase cursor-pointer transition-colors"
        >
          &gt; ABORT MISSION &lt;
        </button>

        <button
          onClick={() => {
            sfx.playLevelWin();
            onFinish();
          }}
          className="pixel-btn font-pixel text-base sm:text-lg px-8 py-4 uppercase w-full sm:w-auto"
        >
          &gt; FINISH QUEST &lt;
        </button>
      </div>

      {/* CUSTOM TASK MODAL */}
      {customModalOpen && (
        <div className="fixed inset-0 retro-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="pixel-box p-6 max-w-lg w-full relative bg-synth-dark space-y-4">
            <button
              onClick={() => {
                sfx.playClick();
                setCustomModalOpen(false);
              }}
              className="absolute -top-3 -right-3 bg-synth-magenta text-white border-2 border-white w-8 h-8 font-pixel flex items-center justify-center hover:bg-white hover:text-synth-magenta cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-pixel text-sm text-synth-cyan border-b-2 border-synth-cyan pb-2">
              &gt; CRAFT NEW CUSTOM CLEANING QUEST &lt;
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-pixel text-[9px] text-synth-yellow block mb-1">
                  QUEST NAME (REQUIRED):
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Clean cat litter station, Organize hallway coat closet"
                  className="w-full bg-synth-gray border-2 border-synth-cyan text-white font-vt text-xl p-2.5 focus:outline-none focus:border-synth-yellow"
                />
              </div>

              <div>
                <label className="font-pixel text-[9px] text-synth-magenta block mb-1">
                  STEPS (COMMA SEPARATED, OPTIONAL):
                </label>
                <textarea
                  rows={3}
                  value={customMicro}
                  onChange={(e) => setCustomMicro(e.target.value)}
                  placeholder="e.g. Scoop box, Wipe edges with pet-safe cleaner, Pour fresh litter, Sweep mat"
                  className="w-full bg-synth-gray border-2 border-synth-magenta text-white font-vt text-xl p-2.5 focus:outline-none focus:border-synth-yellow"
                />
              </div>

              <button
                onClick={handleSaveCustomTask}
                className="pixel-btn font-pixel text-xs w-full py-3 uppercase mt-2"
              >
                COMMIT QUEST TO LOG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABORT MISSION CONFIRMATION MODAL */}
      {abortModalOpen && (
        <div className="fixed inset-0 retro-modal-overlay z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="pixel-box p-6 sm:p-8 max-w-md w-full relative bg-synth-dark border-4 border-synth-magenta shadow-[0_0_30px_rgba(255,42,109,0.5)] text-center space-y-5">
            <button
              onClick={() => {
                sfx.playClick();
                setAbortModalOpen(false);
              }}
              className="absolute -top-3 -right-3 bg-synth-magenta text-white border-2 border-white w-8 h-8 font-pixel flex items-center justify-center hover:bg-white hover:text-synth-magenta cursor-pointer"
              title="Close"
              aria-label="Close dialogue"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 mx-auto bg-synth-gray border-2 border-synth-magenta flex items-center justify-center text-synth-magenta">
              <AlertTriangle className="w-9 h-9 animate-bounce text-synth-magenta" />
            </div>

            <div>
              <h3 className="font-pixel text-sm sm:text-base text-synth-magenta mb-2 uppercase">
                &gt; ABORT MISSION? &lt;
              </h3>
              <p className="font-vt text-xl text-gray-200 leading-snug">
                Are you sure you want to cancel the current cleaning mission and return to headquarters?
              </p>
              <p className="font-vt text-lg text-synth-yellow mt-1">
                All unsaved mission progress and streak for this session will be lost.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  sfx.playClick();
                  setAbortModalOpen(false);
                  onAbort();
                }}
                className="flex-1 bg-synth-magenta hover:bg-[#ff5c8d] text-white border-2 border-white py-3 px-4 font-pixel text-xs uppercase shadow-[3px_3px_0_#05d9e8] cursor-pointer transition-all"
              >
                YES, ABORT
              </button>
              <button
                onClick={() => {
                  sfx.playClick();
                  setAbortModalOpen(false);
                }}
                className="flex-1 pixel-btn-cyan py-3 px-4 font-pixel text-xs uppercase shadow-[3px_3px_0_#ff2a6d] cursor-pointer transition-all"
              >
                KEEP CLEANING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
