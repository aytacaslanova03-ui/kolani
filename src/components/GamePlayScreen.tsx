import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Eraser,
  Flame,
  HelpCircle,
  LogOut,
  Search,
  Sparkles,
  Undo2,
  Users,
  XCircle,
} from 'lucide-react';
import {
  DIFFICULTY_LABELS,
  Difficulty,
  GameMode,
  Grade,
  MysteryCase,
  PlayerAnswerRecord,
  PlayerState,
  QUESTION_TYPE_LABELS,
  QuestionItem,
} from '../types/game';
import { soundEngine } from '../utils/sound';

interface GamePlayScreenProps {
  grade: Grade;
  difficulty: Difficulty;
  mode: GameMode;
  mysteryCase: MysteryCase;
  questions: QuestionItem[];
  players: PlayerState[];
  onUpdatePlayers: (players: PlayerState[]) => void;
  collectedClues: string[];
  onCollectClue: (clue: string) => void;
  onFinishRound: (finalPlayers: PlayerState[], finalClues: string[]) => void;
  onExitToMenu: () => void;
}

type TurnPhase = 'handoff' | 'answering' | 'feedback' | 'compare';

export function GamePlayScreen({
  grade,
  difficulty,
  mode,
  mysteryCase,
  questions,
  players,
  onUpdatePlayers,
  collectedClues,
  onCollectClue,
  onFinishRound,
  onExitToMenu,
}: GamePlayScreenProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [phase, setPhase] = useState<TurnPhase>('answering');

  // Timer tracking per player turn
  const turnStartRef = useRef<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState<number>(0);

  // Choice question state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Match pairs state
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [matchErrorMsg, setMatchErrorMsg] = useState<string | null>(null);
  const [matchMistakes, setMatchMistakes] = useState<number>(0);

  // Unscramble state
  const [placedTileIds, setPlacedTileIds] = useState<string[]>([]);
  const [showUnscrambleHint, setShowUnscrambleHint] = useState(false);

  // Feedback / comparison snapshot
  const [lastRecord, setLastRecord] = useState<PlayerAnswerRecord | null>(null);
  const [latestClueUnlocked, setLatestClueUnlocked] = useState<string | null>(null);

  const currentQuestion = questions[questionIndex];
  const activePlayer = players[activePlayerIndex];

  // Reset per-turn interactive state cleanly
  const resetQuestionInputs = () => {
    setSelectedOptionId(null);
    setSelectedLeftId(null);
    setMatchedPairIds([]);
    setMatchErrorMsg(null);
    setMatchMistakes(0);
    setPlacedTileIds([]);
    setShowUnscrambleHint(false);
    setLastRecord(null);
    turnStartRef.current = Date.now();
    setElapsedSec(0);
  };

  // Live timer while answering
  useEffect(() => {
    if (phase !== 'answering') return;
    turnStartRef.current = Date.now();
    const interval = window.setInterval(() => {
      setElapsedSec((Date.now() - turnStartRef.current) / 1000);
    }, 100);
    return () => window.clearInterval(interval);
  }, [phase, questionIndex, activePlayerIndex]);

  // Keyboard shortcuts 1-4 for choice questions
  useEffect(() => {
    if (phase !== 'answering' || !currentQuestion) return;
    if (
      currentQuestion.type !== 'en_to_az' &&
      currentQuestion.type !== 'az_to_en' &&
      currentQuestion.type !== 'fill_blank' &&
      currentQuestion.type !== 'clue_guess'
    ) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = ['1', '2', '3', '4'].indexOf(e.key);
      if (idx !== -1 && currentQuestion.options[idx]) {
        handleChoiceSelect(currentQuestion.options[idx].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!currentQuestion || !activePlayer) return null;

  const calculateScoreRecord = (
    isCorrect: boolean,
    timeMs: number,
    chosenLabel?: string,
    overrideBasePoints?: number
  ): PlayerAnswerRecord => {
    const basePoints =
      overrideBasePoints !== undefined
        ? overrideBasePoints
        : isCorrect
          ? 100
          : 0;

    // Speed bonus in competition mode (up to +50 for fast correct answers <= 15s)
    const speedBonus =
      mode === 'competition' && isCorrect
        ? Math.max(5, Math.round(Math.max(0, 15000 - timeMs) / 300))
        : 0;

    // Streak bonus for consecutive correct answers
    const nextStreak = isCorrect ? activePlayer.streak + 1 : 0;
    const streakBonus = isCorrect && nextStreak >= 2 ? Math.min(75, (nextStreak - 1) * 25) : 0;

    return {
      questionId: currentQuestion.id,
      correct: isCorrect,
      basePoints,
      speedBonus,
      streakBonus,
      totalPoints: basePoints + speedBonus + streakBonus,
      timeMs,
      chosenLabel,
    };
  };

  const commitPlayerAnswer = (record: PlayerAnswerRecord) => {
    const updatedPlayers = players.map((p, idx) => {
      if (idx !== activePlayerIndex) return p;
      const nextStreak = record.correct ? p.streak + 1 : 0;
      return {
        ...p,
        score: p.score + record.totalPoints,
        correctCount: p.correctCount + (record.correct ? 1 : 0),
        streak: nextStreak,
        maxStreak: Math.max(p.maxStreak, nextStreak),
        totalTimeMs: p.totalTimeMs + record.timeMs,
        answers: [...p.answers, record],
      };
    });

    onUpdatePlayers(updatedPlayers);
    setLastRecord(record);

    if (mode === 'single') {
      if (record.correct) {
        soundEngine.playCorrect(activePlayer.streak + 1 >= 2);
        const clueText =
          mysteryCase.cluesAz[
            currentQuestion.clueIndex % mysteryCase.cluesAz.length
          ];
        if (clueText && !collectedClues.includes(clueText)) {
          onCollectClue(clueText);
          setLatestClueUnlocked(clueText);
        } else {
          setLatestClueUnlocked(null);
        }
      } else {
        soundEngine.playWrong();
        setLatestClueUnlocked(null);
      }
      setPhase('feedback');
    } else {
      // Competition mode
      soundEngine.playClick();
      const isLastPlayer = activePlayerIndex === players.length - 1;
      if (!isLastPlayer) {
        setPhase('handoff');
      } else {
        // All players answered this question! Unlock clue if anyone got it right
        const anyCorrect = updatedPlayers.some(
          (p) => p.answers[questionIndex]?.correct
        );
        if (anyCorrect) {
          soundEngine.playClueFound();
          const clueText =
            mysteryCase.cluesAz[
              currentQuestion.clueIndex % mysteryCase.cluesAz.length
            ];
          if (clueText && !collectedClues.includes(clueText)) {
            onCollectClue(clueText);
            setLatestClueUnlocked(clueText);
          } else {
            setLatestClueUnlocked(null);
          }
        } else {
          soundEngine.playWrong();
          setLatestClueUnlocked(null);
        }
        setPhase('compare');
      }
    }
  };

  const handleChoiceSelect = (optionId: string) => {
    if (phase !== 'answering') return;
    if (
      currentQuestion.type !== 'en_to_az' &&
      currentQuestion.type !== 'az_to_en' &&
      currentQuestion.type !== 'fill_blank' &&
      currentQuestion.type !== 'clue_guess'
    ) {
      return;
    }

    const option = currentQuestion.options.find((o) => o.id === optionId);
    if (!option) return;

    setSelectedOptionId(optionId);
    const timeMs = Math.max(300, Date.now() - turnStartRef.current);
    const record = calculateScoreRecord(option.isCorrect, timeMs, option.label);
    commitPlayerAnswer(record);
  };

  const handleMatchLeftClick = (id: string) => {
    if (phase !== 'answering' || matchedPairIds.includes(id)) return;
    soundEngine.playClick();
    setMatchErrorMsg(null);
    setSelectedLeftId((prev) => (prev === id ? null : id));
  };

  const handleMatchRightClick = (rightId: string) => {
    if (
      phase !== 'answering' ||
      currentQuestion.type !== 'match_pairs' ||
      !selectedLeftId ||
      matchedPairIds.includes(rightId)
    ) {
      return;
    }

    if (selectedLeftId === rightId) {
      const nextMatched = [...matchedPairIds, rightId];
      setMatchedPairIds(nextMatched);
      setSelectedLeftId(null);
      setMatchErrorMsg(null);
      soundEngine.playCorrect(false);

      if (nextMatched.length === currentQuestion.pairs.length) {
        const timeMs = Math.max(500, Date.now() - turnStartRef.current);
        const isCleanSuccess = matchMistakes <= 1;
        const base = isCleanSuccess
          ? Math.max(75, 100 - matchMistakes * 15)
          : 50;
        const record = calculateScoreRecord(
          isCleanSuccess,
          timeMs,
          `${nextMatched.length}/4 uyğunlaşdırma`,
          base
        );
        commitPlayerAnswer(record);
      }
    } else {
      soundEngine.playWrong();
      setMatchMistakes((m) => m + 1);
      setMatchErrorMsg('Bu cüt uyğun gəlmədi, yenidən yoxla.');
      setSelectedLeftId(null);
    }
  };

  const handleUnscrambleTileClick = (tileId: string) => {
    if (phase !== 'answering' || placedTileIds.includes(tileId)) return;
    soundEngine.playClick();
    setPlacedTileIds((prev) => [...prev, tileId]);
  };

  const handleUnscrambleRemoveAt = (slotIdx: number) => {
    if (phase !== 'answering') return;
    soundEngine.playClick();
    setPlacedTileIds((prev) => prev.filter((_, idx) => idx !== slotIdx));
  };

  const handleUnscrambleUndo = () => {
    if (phase !== 'answering' || placedTileIds.length === 0) return;
    soundEngine.playClick();
    setPlacedTileIds((prev) => prev.slice(0, -1));
  };

  const handleUnscrambleClear = () => {
    if (phase !== 'answering' || placedTileIds.length === 0) return;
    soundEngine.playClick();
    setPlacedTileIds([]);
  };

  const handleUnscrambleSubmit = () => {
    if (phase !== 'answering' || currentQuestion.type !== 'unscramble') return;
    const assembled = placedTileIds
      .map(
        (id) =>
          currentQuestion.scrambledLetters.find((t) => t.id === id)?.char ?? ''
      )
      .join('')
      .toLowerCase();

    const isCorrect = assembled === currentQuestion.targetEntry.en.toLowerCase();
    const timeMs = Math.max(500, Date.now() - turnStartRef.current);
    const record = calculateScoreRecord(isCorrect, timeMs, assembled);
    commitPlayerAnswer(record);
  };

  const handleStartNextPlayerTurn = () => {
    soundEngine.playClick();
    setActivePlayerIndex((idx) => idx + 1);
    resetQuestionInputs();
    setPhase('answering');
  };

  const handleAdvanceQuestion = () => {
    soundEngine.playClick();
    setLatestClueUnlocked(null);

    if (questionIndex + 1 >= questions.length) {
      soundEngine.playVictory();
      onFinishRound(players, collectedClues);
      return;
    }

    setQuestionIndex((idx) => idx + 1);
    setActivePlayerIndex(0);
    resetQuestionInputs();
    setPhase('answering');
  };

  const progressPercent = Math.round(
    ((questionIndex + (phase === 'feedback' || phase === 'compare' ? 1 : 0)) /
      questions.length) *
      100
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* Unobtrusive Top Game HUD */}
      <div className="bg-white border border-[#E5DEC9] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-[#64748B]">
              {mysteryCase.titleAz} · {grade}-ci sinif · {DIFFICULTY_LABELS[difficulty]}
            </div>
            <div className="font-display font-bold text-base sm:text-lg text-[#162A45]">
              Sual {questionIndex + 1} / {questions.length}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-sm">
            {mode === 'single' ? (
              <>
                <div className="flex items-center gap-1.5 font-semibold text-[#162A45]">
                  <Sparkles className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                  <span>Xal:</span>
                  <span className="font-mono-num font-bold text-[#2563EB]">
                    {activePlayer.score}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-[#162A45]">
                  <Flame className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
                  <span>Seriya:</span>
                  <span className="font-mono-num font-bold">{activePlayer.streak}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 font-semibold text-[#162A45]">
                <Users className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                <span>Növbə:</span>
                <span className="font-display font-bold text-[#2563EB]">
                  {activePlayer.name}
                </span>
                {phase === 'answering' && (
                  <span className="inline-flex items-center gap-1 ml-1 font-mono-num text-xs text-[#475569]">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {elapsedSec.toFixed(1)} s
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-1.5 font-semibold text-[#162A45]">
              <Search className="w-4 h-4 text-[#059669]" aria-hidden="true" />
              <span>İpucu:</span>
              <span className="font-mono-num font-bold">
                {collectedClues.length}/{questions.length}
              </span>
            </div>

            <button
              type="button"
              onClick={onExitToMenu}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg border border-[#E5DEC9] bg-[#FAF7F0] hover:bg-[#F3EDE0] text-xs font-bold text-[#475569] hover:text-[#162A45] transition-colors whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Çıxış</span>
            </button>
          </div>
        </div>

        {/* Clean progress bar */}
        <div
          className="w-full h-2.5 bg-[#EFE9D8] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* COMPETITION HANDOFF SCREEN */}
      {phase === 'handoff' && mode === 'competition' && (
        <div className="bg-white border border-[#E5DEC9] rounded-2xl p-6 sm:p-10 text-center space-y-5 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FEF9C3] border border-[#FDE047] flex items-center justify-center text-[#B45309]">
            <Users className="w-7 h-7" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#64748B]">
              {activePlayer.name} cavabını gizli şəkildə qeydə aldı
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#162A45]">
              Növbə: {players[activePlayerIndex + 1]?.name}
            </h2>
            <p className="text-sm sm:text-base text-[#475569] max-w-md mx-auto">
              Eyni sual ({questionIndex + 1}/{questions.length}) sənin üçün hazırdır. Digər oyunçular ekrana baxmasın!
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartNextPlayerTurn}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 min-h-[54px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-display font-bold text-lg transition-colors whitespace-nowrap"
          >
            <span>Hazıram, sualı göstər</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ACTIVE QUESTION CARD (ANSWERING OR SINGLE FEEDBACK) */}
      {(phase === 'answering' || phase === 'feedback') && (
        <div className="bg-white border border-[#E5DEC9] rounded-2xl p-5 sm:p-8 space-y-6 shadow-xs">
          {/* Question Header */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#64748B]">
              {QUESTION_TYPE_LABELS[currentQuestion.type]} · Mövzu:{' '}
              {currentQuestion.targetEntry.topic}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#162A45] leading-snug">
              {currentQuestion.promptAz}
            </h2>
          </div>

          {/* 1. CHOICE-BASED GAMES (en_to_az, az_to_en, fill_blank, clue_guess) */}
          {(currentQuestion.type === 'en_to_az' ||
            currentQuestion.type === 'az_to_en' ||
            currentQuestion.type === 'fill_blank' ||
            currentQuestion.type === 'clue_guess') && (
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2">
                <div
                  className={`font-display font-extrabold text-[#162A45] ${
                    currentQuestion.type === 'en_to_az' ||
                    currentQuestion.type === 'az_to_en'
                      ? 'text-2xl sm:text-3xl'
                      : 'text-lg sm:text-xl leading-relaxed'
                  }`}
                >
                  {currentQuestion.displayMain}
                </div>
                {currentQuestion.displaySub &&
                  (currentQuestion.type === 'clue_guess' ||
                    currentQuestion.type === 'fill_blank' ||
                    phase === 'feedback') && (
                    <div className="text-sm text-[#475569]">
                      {currentQuestion.type === 'clue_guess'
                        ? `İpucu (AZ): ${currentQuestion.displaySub}`
                        : currentQuestion.type === 'fill_blank'
                          ? `Məna: ${currentQuestion.displaySub}`
                          : currentQuestion.displaySub}
                    </div>
                  )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentQuestion.options.map((opt, idx) => {
                  const isChosen = selectedOptionId === opt.id;
                  const showState = phase === 'feedback';

                  let btnStyle =
                    'bg-white border-[#CBD5E1] text-[#162A45] hover:border-[#2563EB] hover:bg-[#EFF6FF]';
                  if (showState) {
                    if (opt.isCorrect) {
                      btnStyle =
                        'bg-[#ECFDF5] border-[#059669] text-[#065F46]';
                    } else if (isChosen && !opt.isCorrect) {
                      btnStyle =
                        'bg-[#FEF2F2] border-[#DC2626] text-[#991B1B]';
                    } else {
                      btnStyle =
                        'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] opacity-75';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={phase !== 'answering'}
                      onClick={() => handleChoiceSelect(opt.id)}
                      className={`min-h-[60px] p-4 rounded-xl border-2 text-left flex items-center justify-between gap-3 transition-all ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-[#E5DEC9] font-mono-num text-xs font-bold text-[#475569] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-display font-bold text-base sm:text-lg">
                          {opt.label}
                        </span>
                      </div>

                      {showState && opt.isCorrect && (
                        <CheckCircle2
                          className="w-5 h-5 text-[#059669] shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {showState && isChosen && !opt.isCorrect && (
                        <XCircle
                          className="w-5 h-5 text-[#DC2626] shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. MATCH PAIRS GAME */}
          {currentQuestion.type === 'match_pairs' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-[#475569]">
                <span>
                  Sol sütundan ingilis sözünü, sağ sütundan onun Azərbaycan dilində mənasını seç.
                </span>
                <span className="font-mono-num font-bold text-[#162A45]">
                  Uyğunlaşdırılıb: {matchedPairIds.length}/4
                </span>
              </div>

              {matchErrorMsg && (
                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-sm font-semibold text-[#991B1B] flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{matchErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left Column: English */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-[#64748B] px-1">
                    İngilis sözləri
                  </div>
                  {currentQuestion.pairs.map((pair) => {
                    const isMatched = matchedPairIds.includes(pair.id);
                    const isSelected = selectedLeftId === pair.id;
                    return (
                      <button
                        key={pair.id}
                        type="button"
                        disabled={isMatched || phase !== 'answering'}
                        onClick={() => handleMatchLeftClick(pair.id)}
                        className={`w-full min-h-[54px] px-4 py-3 rounded-xl border-2 text-left font-display font-bold text-base flex items-center justify-between gap-2 transition-all ${
                          isMatched
                            ? 'bg-[#ECFDF5] border-[#059669] text-[#065F46]'
                            : isSelected
                              ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]'
                              : 'bg-[#FAF7F0] border-[#E5DEC9] text-[#162A45] hover:border-[#2563EB]'
                        }`}
                      >
                        <span>{pair.en}</span>
                        {isMatched && (
                          <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Column: Azerbaijani */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-[#64748B] px-1">
                    Azərbaycan dilində mənalar
                  </div>
                  {currentQuestion.shuffledAz.map((item) => {
                    const isMatched = matchedPairIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isMatched || !selectedLeftId || phase !== 'answering'}
                        onClick={() => handleMatchRightClick(item.id)}
                        className={`w-full min-h-[54px] px-4 py-3 rounded-xl border-2 text-left font-display font-bold text-base flex items-center justify-between gap-2 transition-all ${
                          isMatched
                            ? 'bg-[#ECFDF5] border-[#059669] text-[#065F46]'
                            : selectedLeftId
                              ? 'bg-white border-[#93C5FD] text-[#162A45] hover:border-[#2563EB] hover:bg-[#EFF6FF]'
                              : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]'
                        }`}
                      >
                        <span>{item.az}</span>
                        {isMatched && (
                          <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. UNSCRAMBLE LETTERS GAME */}
          {currentQuestion.type === 'unscramble' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-[#64748B]">
                    Sözün mənası:
                  </span>
                  <div className="font-display font-bold text-lg text-[#162A45]">
                    {currentQuestion.hintAz}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUnscrambleHint((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#F3EDE0] text-xs font-bold text-[#162A45] transition-colors whitespace-nowrap"
                >
                  <HelpCircle className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                  <span>{showUnscrambleHint ? 'İpucunu gizlət' : 'Cümlə ipucu'}</span>
                </button>
              </div>

              {showUnscrambleHint && (
                <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-sm font-semibold text-[#1E3A8A]">
                  {currentQuestion.hintSentence}
                </div>
              )}

              {/* Answer slots */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#64748B]">
                  Düzəltdiyin söz ({placedTileIds.length}/{currentQuestion.scrambledLetters.length} hərf):
                </div>
                <div className="min-h-[68px] p-3 rounded-xl bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] flex flex-wrap items-center justify-center gap-2">
                  {currentQuestion.scrambledLetters.map((_, slotIdx) => {
                    const tileId = placedTileIds[slotIdx];
                    const tile = currentQuestion.scrambledLetters.find(
                      (t) => t.id === tileId
                    );
                    if (!tile) {
                      return (
                        <div
                          key={slotIdx}
                          className="w-11 h-12 rounded-lg border-2 border-[#CBD5E1] bg-white"
                        />
                      );
                    }
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        disabled={phase !== 'answering'}
                        onClick={() => handleUnscrambleRemoveAt(slotIdx)}
                        className="w-11 h-12 rounded-lg bg-[#162A45] text-white font-mono-num font-bold text-xl flex items-center justify-center hover:bg-[#2563EB] transition-colors shadow-xs"
                      >
                        {tile.char}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrambled letter tray */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                {currentQuestion.scrambledLetters.map((tile) => {
                  const isUsed = placedTileIds.includes(tile.id);
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      disabled={isUsed || phase !== 'answering'}
                      onClick={() => handleUnscrambleTileClick(tile.id)}
                      className={`w-12 h-12 rounded-xl font-mono-num font-bold text-xl border-2 transition-all flex items-center justify-center ${
                        isUsed
                          ? 'bg-[#EFE9D8] border-[#E5DEC9] text-[#94A3B8] opacity-40 cursor-default'
                          : 'bg-white border-[#CBD5E1] text-[#162A45] hover:border-[#2563EB] hover:bg-[#EFF6FF] shadow-xs active:scale-95'
                      }`}
                    >
                      {tile.char}
                    </button>
                  );
                })}
              </div>

              {phase === 'answering' && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUnscrambleUndo}
                      disabled={placedTileIds.length === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] hover:bg-[#F3EDE0] text-sm font-bold text-[#162A45] disabled:opacity-45 transition-colors whitespace-nowrap"
                    >
                      <Undo2 className="w-4 h-4" aria-hidden="true" />
                      <span>Geri al</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleUnscrambleClear}
                      disabled={placedTileIds.length === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] hover:bg-[#F3EDE0] text-sm font-bold text-[#162A45] disabled:opacity-45 transition-colors whitespace-nowrap"
                    >
                      <Eraser className="w-4 h-4" aria-hidden="true" />
                      <span>Təmizlə</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleUnscrambleSubmit}
                    disabled={
                      placedTileIds.length !==
                      currentQuestion.scrambledLetters.length
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-display font-bold text-base disabled:opacity-45 transition-colors whitespace-nowrap"
                  >
                    <span>Cavabı təsdiqlə</span>
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SINGLE PLAYER IMMEDIATE FEEDBACK BANNER */}
          {phase === 'feedback' && lastRecord && (
            <div
              className={`p-5 rounded-xl border-2 space-y-3 ${
                lastRecord.correct
                  ? 'bg-[#ECFDF5] border-[#059669]'
                  : 'bg-[#FEF2F2] border-[#DC2626]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {lastRecord.correct ? (
                    <CheckCircle2
                      className="w-6 h-6 text-[#059669] shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle
                      className="w-6 h-6 text-[#DC2626] shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`font-display font-bold text-lg ${
                      lastRecord.correct ? 'text-[#065F46]' : 'text-[#991B1B]'
                    }`}
                  >
                    {lastRecord.correct
                      ? `Əla! Düzgün cavab (+${lastRecord.totalPoints} xal)`
                      : currentQuestion.type === 'match_pairs'
                        ? `Uyğunlaşdırma tamamlandı (+${lastRecord.totalPoints} xal)`
                        : `Yanlışdır — Düzgün cavab: ${
                            currentQuestion.type === 'en_to_az'
                              ? currentQuestion.targetEntry.az
                              : currentQuestion.targetEntry.en
                          }`}
                  </span>
                </div>

                {lastRecord.streakBonus > 0 && (
                  <span className="text-xs font-bold text-[#065F46]">
                    Ardıcıllıq bonusu: +{lastRecord.streakBonus} xal
                  </span>
                )}
              </div>

              {currentQuestion.type === 'match_pairs' ? (
                <div className="text-sm text-[#1E293B]">
                  <strong>Uyğunlaşdırılan sözlər:</strong>{' '}
                  {currentQuestion.pairs
                    .map((p) => `${p.en} (${p.az})`)
                    .join(' · ')}
                </div>
              ) : (
                <div className="text-sm text-[#1E293B] space-y-1">
                  <div>
                    <strong>Söz və məna:</strong>{' '}
                    <span className="font-bold">{currentQuestion.targetEntry.en}</span> —{' '}
                    {currentQuestion.targetEntry.az}
                  </div>
                  <div>
                    <strong>Nümunə cümlə:</strong> {currentQuestion.targetEntry.sentence}{' '}
                    <span className="text-[#475569]">
                      ({currentQuestion.targetEntry.sentenceAz})
                    </span>
                  </div>
                </div>
              )}

              {latestClueUnlocked && (
                <div className="p-3.5 rounded-lg bg-white border border-[#A7F3D0] flex items-start gap-2.5 text-sm text-[#065F46]">
                  <Search className="w-4 h-4 mt-0.5 text-[#059669] shrink-0" aria-hidden="true" />
                  <div>
                    <strong className="font-display">Yeni ipucu tapıldı: </strong>
                    <span>{latestClueUnlocked}</span>
                  </div>
                </div>
              )}

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleAdvanceQuestion}
                  className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-xl bg-[#162A45] hover:bg-[#0F1E33] text-white font-display font-bold text-base transition-colors whitespace-nowrap"
                >
                  <span>
                    {questionIndex + 1 >= questions.length
                      ? 'Nəticələrə və sirrə bax'
                      : 'Növbəti sual'}
                  </span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPETITION ROUND COMPARISON VIEW */}
      {phase === 'compare' && mode === 'competition' && (
        <div className="bg-white border border-[#E5DEC9] rounded-2xl p-5 sm:p-8 space-y-5 shadow-xs">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-[#64748B]">
              Sual {questionIndex + 1} · Bütün oyunçular cavablandırdı
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#162A45]">
              Düzgün cavab: {currentQuestion.targetEntry.en} ({currentQuestion.targetEntry.az})
            </h2>
            <p className="text-sm text-[#475569]">
              {currentQuestion.targetEntry.sentence}
            </p>
          </div>

          <div className="divide-y divide-[#EFE9D8] border border-[#E5DEC9] rounded-xl overflow-hidden">
            {players.map((p) => {
              const ans = p.answers[questionIndex];
              if (!ans) return null;
              return (
                <div
                  key={p.id}
                  className="p-4 bg-[#FAF7F0] flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {ans.correct ? (
                      <CheckCircle2
                        className="w-5 h-5 text-[#059669] shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle
                        className="w-5 h-5 text-[#DC2626] shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <div>
                      <div className="font-display font-bold text-base text-[#162A45]">
                        {p.name}
                      </div>
                      <div className="text-xs text-[#475569]">
                        {ans.correct ? 'Düzgün cavab' : 'Yanlış cavab'} ·{' '}
                        <span className="font-mono-num">
                          {(ans.timeMs / 1000).toFixed(1)} s
                        </span>
                        {ans.speedBonus > 0 && (
                          <span className="text-[#059669] font-semibold">
                            {' '}
                            · Sürət +{ans.speedBonus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono-num font-bold text-base text-[#2563EB]">
                      +{ans.totalPoints} xal
                    </div>
                    <div className="text-xs text-[#64748B] font-mono-num">
                      Cəmi: {p.score} xal
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {latestClueUnlocked && (
            <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-start gap-2.5 text-sm text-[#065F46]">
              <Search className="w-4 h-4 mt-0.5 text-[#059669] shrink-0" aria-hidden="true" />
              <div>
                <strong className="font-display">Komanda ipucu tapdı: </strong>
                <span>{latestClueUnlocked}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAdvanceQuestion}
              className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[50px] rounded-xl bg-[#162A45] hover:bg-[#0F1E33] text-white font-display font-bold text-base transition-colors whitespace-nowrap"
            >
              <span>
                {questionIndex + 1 >= questions.length
                  ? 'Yekun nəticələrə bax'
                  : 'Növbəti sual'}
              </span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
