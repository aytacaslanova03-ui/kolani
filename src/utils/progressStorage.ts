import { Difficulty, Grade, ProgressState } from '../types/game';

const STORAGE_KEY = 'english_detective_club_progress_v1';

export const DEFAULT_PROGRESS: ProgressState = {
  totalScore: 0,
  totalStars: 0,
  roundsCompleted: 0,
  wordsMastered: [],
  unlockedCases: {},
  caseBestStars: {},
  caseBestScores: {},
};

export function loadProgress(): ProgressState {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      wordsMastered: Array.isArray(parsed.wordsMastered) ? parsed.wordsMastered : [],
      unlockedCases: parsed.unlockedCases ?? {},
      caseBestStars: parsed.caseBestStars ?? {},
      caseBestScores: parsed.caseBestScores ?? {},
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: ProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function getUnlockedCaseLimit(
  progress: ProgressState,
  grade: Grade,
  difficulty: Difficulty
): number {
  const key = `${grade}-${difficulty}`;
  return Math.max(1, progress.unlockedCases[key] ?? 1);
}

export function getCaseKey(
  grade: Grade,
  difficulty: Difficulty,
  caseNumber: number
): string {
  return `${grade}-${difficulty}-${caseNumber}`;
}

export function getDetectiveRank(totalStars: number): {
  titleAz: string;
  nextStars: number;
} {
  if (totalStars >= 25) return { titleAz: 'Baş Detektiv', nextStars: 36 };
  if (totalStars >= 12) return { titleAz: 'Usta Axtarışçı', nextStars: 25 };
  if (totalStars >= 5) return { titleAz: 'Klub İzləyicisi', nextStars: 12 };
  return { titleAz: 'Gənc Detektiv', nextStars: 5 };
}
