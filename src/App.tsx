import { useState } from 'react';
import { GamePlayScreen } from './components/GamePlayScreen';
import { ProgressView } from './components/ProgressView';
import { RoundSummaryScreen } from './components/RoundSummaryScreen';
import { RulesView } from './components/RulesView';
import { TitleSetupScreen } from './components/TitleSetupScreen';
import { TopBar } from './components/TopBar';
import { WordbookView } from './components/WordbookView';
import { MYSTERY_CASES, getMysteryCaseByNumber } from './data/mysteries';
import {
  AppView,
  Difficulty,
  GameMode,
  Grade,
  PlayerState,
  ProgressState,
  QuestionItem,
} from './types/game';
import {
  DEFAULT_PROGRESS,
  getCaseKey,
  getUnlockedCaseLimit,
  loadProgress,
  saveProgress,
} from './utils/progressStorage';
import { generateRoundQuestions } from './utils/questionGenerator';
import { soundEngine } from './utils/sound';

const PLAYER_COLORS = ['#2563EB', '#D97706', '#059669', '#7C3AED'];

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [isMuted, setIsMuted] = useState(false);

  // User setup choices
  const [grade, setGrade] = useState<Grade>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [mode, setMode] = useState<GameMode>('single');
  const [playerNames, setPlayerNames] = useState<string[]>([
    'Detektiv 1',
    'Detektiv 2',
  ]);
  const [selectedCaseNumber, setSelectedCaseNumber] = useState<number>(1);

  // Persistent student progress
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  // Active round state
  const [roundQuestions, setRoundQuestions] = useState<QuestionItem[]>([]);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [collectedClues, setCollectedClues] = useState<string[]>([]);
  const [roundSessionKey, setRoundSessionKey] = useState<number>(0);

  // Summary state
  const [starsEarned, setStarsEarned] = useState<number>(0);
  const [newlyUnlockedCaseNumber, setNewlyUnlockedCaseNumber] = useState<number | null>(
    null
  );

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleSelectGrade = (nextGrade: Grade) => {
    soundEngine.playClick();
    setGrade(nextGrade);
    const limit = getUnlockedCaseLimit(progress, nextGrade, difficulty);
    if (selectedCaseNumber > limit) {
      setSelectedCaseNumber(limit);
    }
  };

  const handleSelectDifficulty = (nextDiff: Difficulty) => {
    soundEngine.playClick();
    setDifficulty(nextDiff);
    const limit = getUnlockedCaseLimit(progress, grade, nextDiff);
    if (selectedCaseNumber > limit) {
      setSelectedCaseNumber(limit);
    }
  };

  const startRoundWithCase = (caseNum: number) => {
    soundEngine.playClick();
    const questions = generateRoundQuestions(grade, difficulty, caseNum);

    const activeNames =
      mode === 'single'
        ? ['Gənc Detektiv']
        : playerNames.map((n, i) => n.trim() || `Detektiv ${i + 1}`);

    const initialPlayers: PlayerState[] = activeNames.map((name, idx) => ({
      id: `player-${idx + 1}`,
      name,
      accentColor: PLAYER_COLORS[idx % PLAYER_COLORS.length],
      score: 0,
      correctCount: 0,
      streak: 0,
      maxStreak: 0,
      totalTimeMs: 0,
      answers: [],
    }));

    setSelectedCaseNumber(caseNum);
    setRoundQuestions(questions);
    setPlayers(initialPlayers);
    setCollectedClues([]);
    setStarsEarned(0);
    setNewlyUnlockedCaseNumber(null);
    setRoundSessionKey((k) => k + 1);
    setView('playing');
  };

  const handleFinishRound = (
    finalPlayers: PlayerState[],
    finalClues: string[]
  ) => {
    setPlayers(finalPlayers);
    setCollectedClues(finalClues);

    const topPlayer = [...finalPlayers].sort((a, b) => b.score - a.score)[0];
    const accuracy = topPlayer
      ? topPlayer.correctCount / Math.max(1, roundQuestions.length)
      : 0;

    let earnedStars = 0;
    if (accuracy >= 0.85) earnedStars = 3;
    else if (accuracy >= 0.55) earnedStars = 2;
    else if (accuracy > 0) earnedStars = 1;

    setStarsEarned(earnedStars);

    // Update persistent progress
    const key = `${grade}-${difficulty}`;
    const cKey = getCaseKey(grade, difficulty, selectedCaseNumber);
    const prevCaseStars = progress.caseBestStars[cKey] ?? 0;
    const prevCaseScore = progress.caseBestScores[cKey] ?? 0;
    const prevUnlocked = getUnlockedCaseLimit(progress, grade, difficulty);

    let unlockedNext: number | null = null;
    let nextUnlockedLimit = prevUnlocked;
    if (
      earnedStars >= 1 &&
      selectedCaseNumber === prevUnlocked &&
      prevUnlocked < MYSTERY_CASES.length
    ) {
      nextUnlockedLimit = prevUnlocked + 1;
      unlockedNext = nextUnlockedLimit;
    }

    // Collect mastered words from correctly answered questions
    const newlyMastered = new Set<string>(progress.wordsMastered);
    roundQuestions.forEach((q, qIdx) => {
      const anyoneCorrect = finalPlayers.some((p) => p.answers[qIdx]?.correct);
      if (anyoneCorrect) {
        if (q.type === 'match_pairs') {
          q.pairs.forEach((pair) => newlyMastered.add(pair.id));
        } else {
          newlyMastered.add(q.targetEntry.id);
        }
      }
    });

    const starDelta = Math.max(0, earnedStars - prevCaseStars);
    const updatedProgress: ProgressState = {
      totalScore: progress.totalScore + (topPlayer?.score ?? 0),
      totalStars: progress.totalStars + starDelta,
      roundsCompleted: progress.roundsCompleted + 1,
      wordsMastered: Array.from(newlyMastered),
      unlockedCases: {
        ...progress.unlockedCases,
        [key]: nextUnlockedLimit,
      },
      caseBestStars: {
        ...progress.caseBestStars,
        [cKey]: Math.max(prevCaseStars, earnedStars),
      },
      caseBestScores: {
        ...progress.caseBestScores,
        [cKey]: Math.max(prevCaseScore, topPlayer?.score ?? 0),
      },
    };

    setProgress(updatedProgress);
    saveProgress(updatedProgress);
    setNewlyUnlockedCaseNumber(unlockedNext);
    setView('summary');
  };

  const handlePlayNextRound = () => {
    const unlockedLimit = getUnlockedCaseLimit(progress, grade, difficulty);
    const nextCase =
      selectedCaseNumber < unlockedLimit
        ? selectedCaseNumber + 1
        : (selectedCaseNumber % unlockedLimit) + 1;
    startRoundWithCase(nextCase);
  };

  const handleResetProgress = () => {
    soundEngine.playClick();
    setProgress(DEFAULT_PROGRESS);
    saveProgress(DEFAULT_PROGRESS);
    setSelectedCaseNumber(1);
  };

  const activeCase = getMysteryCaseByNumber(selectedCaseNumber);

  return (
    <div className="min-h-screen detective-grid-bg flex flex-col">
      <TopBar
        currentView={view}
        onNavigate={(nextView) => {
          soundEngine.playClick();
          setView(nextView);
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      <main className="flex-1">
        {view === 'home' && (
          <TitleSetupScreen
            grade={grade}
            onSelectGrade={handleSelectGrade}
            difficulty={difficulty}
            onSelectDifficulty={handleSelectDifficulty}
            mode={mode}
            onSelectMode={(m) => {
              soundEngine.playClick();
              setMode(m);
            }}
            playerNames={playerNames}
            onChangePlayerNames={setPlayerNames}
            selectedCaseNumber={selectedCaseNumber}
            onSelectCaseNumber={(num) => {
              soundEngine.playClick();
              setSelectedCaseNumber(num);
            }}
            progress={progress}
            onStartGame={() => startRoundWithCase(selectedCaseNumber)}
          />
        )}

        {view === 'playing' && (
          <GamePlayScreen
            key={roundSessionKey}
            grade={grade}
            difficulty={difficulty}
            mode={mode}
            mysteryCase={activeCase}
            questions={roundQuestions}
            players={players}
            onUpdatePlayers={setPlayers}
            collectedClues={collectedClues}
            onCollectClue={(clue) =>
              setCollectedClues((prev) =>
                prev.includes(clue) ? prev : [...prev, clue]
              )
            }
            onFinishRound={handleFinishRound}
            onExitToMenu={() => {
              soundEngine.playClick();
              setView('home');
            }}
          />
        )}

        {view === 'summary' && (
          <RoundSummaryScreen
            grade={grade}
            difficulty={difficulty}
            mode={mode}
            mysteryCase={activeCase}
            players={players}
            totalQuestions={roundQuestions.length}
            collectedClues={collectedClues}
            starsEarned={starsEarned}
            newlyUnlockedCaseNumber={newlyUnlockedCaseNumber}
            progress={progress}
            onPlayNextRound={handlePlayNextRound}
            onReplayRound={() => startRoundWithCase(selectedCaseNumber)}
            onBackToMenu={() => {
              soundEngine.playClick();
              setView('home');
            }}
          />
        )}

        {view === 'wordbook' && (
          <WordbookView
            initialGrade={grade}
            masteredIds={progress.wordsMastered}
            onBackHome={() => {
              soundEngine.playClick();
              setView('home');
            }}
          />
        )}

        {view === 'progress' && (
          <ProgressView
            progress={progress}
            onResetProgress={handleResetProgress}
            onBackHome={() => {
              soundEngine.playClick();
              setView('home');
            }}
          />
        )}

        {view === 'rules' && (
          <RulesView
            onBackHome={() => {
              soundEngine.playClick();
              setView('home');
            }}
          />
        )}
      </main>

      <footer className="border-t border-[#E5DEC9] bg-white/80 py-4 px-4 sm:px-6 text-center text-xs text-[#64748B]">
        İngilis dili detektiv klubu · 5–8-ci sinif şagirdləri üçün interaktiv söz ehtiyatı oyunu
      </footer>
    </div>
  );
}
