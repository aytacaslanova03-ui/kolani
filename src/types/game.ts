export type Grade = 5 | 6 | 7 | 8;

export type Difficulty = 'beginner' | 'intermediate' | 'hard';

export type GameMode = 'single' | 'competition';

export type QuestionType =
  | 'en_to_az'
  | 'az_to_en'
  | 'match_pairs'
  | 'unscramble'
  | 'fill_blank'
  | 'clue_guess';

export type VocabTopic =
  | 'Gündəlik həyat'
  | 'Məktəb'
  | 'Ailə'
  | 'Yemək'
  | 'Heyvanlar'
  | 'Hava'
  | 'Hobbilər'
  | 'Şəhər'
  | 'Səyahət';

export interface VocabEntry {
  id: string;
  en: string;
  az: string;
  grade: Grade;
  difficulty: Difficulty;
  topic: VocabTopic;
  sentence: string;
  sentenceBlank: string;
  sentenceAz: string;
  clueEn: string;
  clueAz: string;
}

export interface MysteryCase {
  id: string;
  caseNumber: number;
  titleAz: string;
  locationAz: string;
  introAz: string;
  image: string;
  cluesAz: string[];
  resolutionAz: string;
}

export interface MultipleChoiceOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface MatchPairItem {
  id: string;
  en: string;
  az: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  promptAz: string;
  targetEntry: VocabEntry;
  clueIndex: number;
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'en_to_az' | 'az_to_en' | 'fill_blank' | 'clue_guess';
  displayMain: string;
  displaySub?: string;
  options: MultipleChoiceOption[];
  correctLabel: string;
}

export interface MatchPairsQuestion extends BaseQuestion {
  type: 'match_pairs';
  pairs: MatchPairItem[];
  shuffledAz: { id: string; az: string }[];
}

export interface UnscrambleQuestion extends BaseQuestion {
  type: 'unscramble';
  scrambledLetters: { id: string; char: string }[];
  hintAz: string;
  hintSentence: string;
}

export type QuestionItem = ChoiceQuestion | MatchPairsQuestion | UnscrambleQuestion;

export interface PlayerAnswerRecord {
  questionId: string;
  correct: boolean;
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  totalPoints: number;
  timeMs: number;
  chosenLabel?: string;
}

export interface PlayerState {
  id: string;
  name: string;
  accentColor: string;
  score: number;
  correctCount: number;
  streak: number;
  maxStreak: number;
  totalTimeMs: number;
  answers: PlayerAnswerRecord[];
}

export interface ProgressState {
  totalScore: number;
  totalStars: number;
  roundsCompleted: number;
  wordsMastered: string[];
  /** Key format: `${grade}-${difficulty}` -> highest unlocked case number (1..3) */
  unlockedCases: Record<string, number>;
  /** Key format: `${grade}-${difficulty}-${caseNumber}` -> best stars (0..3) */
  caseBestStars: Record<string, number>;
  /** Key format: `${grade}-${difficulty}-${caseNumber}` -> best score */
  caseBestScores: Record<string, number>;
}

export type AppView = 'home' | 'playing' | 'summary' | 'wordbook' | 'progress' | 'rules';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Başlanğıc',
  intermediate: 'Orta',
  hard: 'Çətin',
};

export const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  beginner: 'Əsas gündəlik sözlər və qısa cümlələr',
  intermediate: 'Sinif proqramına uyğun zəngin söz ehtiyatı',
  hard: 'Daha mürəkkəb sözlər, ifadələr və ipucları',
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  en_to_az: 'Tərcümə tap (EN → AZ)',
  az_to_en: 'İngiliscəsini tap (AZ → EN)',
  match_pairs: 'Söz və məna uyğunlaşdırma',
  unscramble: 'Qarışıq hərfləri düzəlt',
  fill_blank: 'Cümlədə boşluğu tamamla',
  clue_guess: 'İpucuna görə sözü tap',
};
