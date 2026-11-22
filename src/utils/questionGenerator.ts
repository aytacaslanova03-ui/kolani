import { getVocabPool, VOCABULARY_BANK } from '../data/vocabulary';
import {
  ChoiceQuestion,
  Difficulty,
  Grade,
  MatchPairsQuestion,
  MultipleChoiceOption,
  QuestionItem,
  QuestionType,
  UnscrambleQuestion,
  VocabEntry,
} from '../types/game';

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function scrambleWord(word: string): string[] {
  const upper = word.toUpperCase().split('');
  if (upper.length <= 1) return upper;

  let attempts = 0;
  let scrambled = shuffleArray(upper);
  while (scrambled.join('') === upper.join('') && attempts < 12) {
    scrambled = shuffleArray(upper);
    attempts++;
  }
  if (scrambled.join('') === upper.join('')) {
    // Guaranteed deterministic shift fallback
    scrambled = [...upper.slice(1), upper[0]];
  }
  return scrambled;
}

function pickDistractors(
  target: VocabEntry,
  primaryPool: VocabEntry[],
  count: number,
  field: 'en' | 'az'
): VocabEntry[] {
  const usedValues = new Set<string>([target[field].toLowerCase()]);
  const result: VocabEntry[] = [];

  const candidates = shuffleArray(
    primaryPool.filter((item) => item.id !== target.id)
  );

  for (const cand of candidates) {
    const val = cand[field].toLowerCase();
    if (!usedValues.has(val)) {
      usedValues.add(val);
      result.push(cand);
      if (result.length === count) return result;
    }
  }

  // Fallback to same grade, any difficulty if pool is tight
  const fallbackCandidates = shuffleArray(
    VOCABULARY_BANK.filter(
      (item) => item.id !== target.id && item.grade === target.grade
    )
  );
  for (const cand of fallbackCandidates) {
    const val = cand[field].toLowerCase();
    if (!usedValues.has(val)) {
      usedValues.add(val);
      result.push(cand);
      if (result.length === count) return result;
    }
  }

  return result;
}

function buildChoiceQuestion(
  type: 'en_to_az' | 'az_to_en' | 'fill_blank' | 'clue_guess',
  target: VocabEntry,
  pool: VocabEntry[],
  clueIndex: number
): ChoiceQuestion {
  const isEnToAz = type === 'en_to_az';
  const optionField: 'en' | 'az' = isEnToAz ? 'az' : 'en';

  const distractors = pickDistractors(target, pool, 3, optionField);
  const rawOptions: MultipleChoiceOption[] = [
    {
      id: `${target.id}-correct`,
      label: target[optionField],
      isCorrect: true,
    },
    ...distractors.map((d) => ({
      id: `${d.id}-dist`,
      label: d[optionField],
      isCorrect: false,
    })),
  ];

  const options = shuffleArray(rawOptions);

  if (type === 'en_to_az') {
    return {
      id: `q-${clueIndex}-${target.id}-${type}`,
      type,
      promptAz: 'Bu ingilis sözünün Azərbaycan dilində düzgün mənasını seç:',
      displayMain: target.en,
      displaySub: `Mövzu: ${target.topic}`,
      targetEntry: target,
      options,
      correctLabel: target.az,
      clueIndex,
    };
  }

  if (type === 'az_to_en') {
    return {
      id: `q-${clueIndex}-${target.id}-${type}`,
      type,
      promptAz: 'Verilən sözün ingiliscə qarşılığını tap:',
      displayMain: target.az,
      displaySub: `Mövzu: ${target.topic}`,
      targetEntry: target,
      options,
      correctLabel: target.en,
      clueIndex,
    };
  }

  if (type === 'fill_blank') {
    return {
      id: `q-${clueIndex}-${target.id}-${type}`,
      type,
      promptAz: 'Cümlədəki boş yerə uyğun gələn ingilis sözünü seç:',
      displayMain: target.sentenceBlank,
      displaySub: target.sentenceAz,
      targetEntry: target,
      options,
      correctLabel: target.en,
      clueIndex,
    };
  }

  // clue_guess
  return {
    id: `q-${clueIndex}-${target.id}-${type}`,
    type: 'clue_guess',
    promptAz: 'Qısa ingiliscə ipucuna əsasən gizli sözü tap:',
    displayMain: target.clueEn,
    displaySub: target.clueAz,
    targetEntry: target,
    options,
    correctLabel: target.en,
    clueIndex,
  };
}

function buildMatchPairsQuestion(
  entries: VocabEntry[],
  clueIndex: number
): MatchPairsQuestion {
  const pairs = entries.map((e) => ({
    id: e.id,
    en: e.en,
    az: e.az,
  }));

  let shuffledAz = shuffleArray(pairs.map((p) => ({ id: p.id, az: p.az })));
  if (
    pairs.length > 1 &&
    shuffledAz.every((item, idx) => item.id === pairs[idx].id)
  ) {
    shuffledAz = [...shuffledAz.slice(1), shuffledAz[0]];
  }

  return {
    id: `q-${clueIndex}-match-${entries[0].id}`,
    type: 'match_pairs',
    promptAz: 'Hər ingilis sözünü Azərbaycan dilindəki düzgün mənası ilə uyğunlaşdır:',
    targetEntry: entries[0],
    pairs,
    shuffledAz,
    clueIndex,
  };
}

function buildUnscrambleQuestion(
  target: VocabEntry,
  clueIndex: number
): UnscrambleQuestion {
  const chars = scrambleWord(target.en);
  return {
    id: `q-${clueIndex}-${target.id}-unscramble`,
    type: 'unscramble',
    promptAz: 'Qarışdırılmış hərfləri düzgün ardıcıllıqla düzərək ingilis sözünü yarat:',
    targetEntry: target,
    scrambledLetters: chars.map((char, idx) => ({
      id: `${target.id}-char-${idx}-${char}`,
      char,
    })),
    hintAz: target.az,
    hintSentence: target.sentenceBlank,
    clueIndex,
  };
}

export function generateRoundQuestions(
  grade: Grade,
  difficulty: Difficulty,
  caseNumber: number = 1
): QuestionItem[] {
  const pool = getVocabPool(grade, difficulty);
  const shuffledPool = shuffleArray(pool);

  // Rotate starting offset subtly by caseNumber + randomness while never repeating words in the round
  const usedIds = new Set<string>();

  const takeWord = (predicate?: (w: VocabEntry) => boolean): VocabEntry => {
    const found = shuffledPool.find(
      (w) => !usedIds.has(w.id) && (!predicate || predicate(w))
    );
    if (found) {
      usedIds.add(found.id);
      return found;
    }
    const fallback = shuffledPool.find((w) => !usedIds.has(w.id)) ?? pool[0];
    usedIds.add(fallback.id);
    return fallback;
  };

  // Ensure all 6 game types appear in every 7-question round
  const extraTypes: QuestionType[] = ['en_to_az', 'az_to_en', 'fill_blank', 'clue_guess'];
  const extraType = extraTypes[(caseNumber + Math.floor(Math.random() * 4)) % extraTypes.length];

  const plannedTypes: QuestionType[] = shuffleArray([
    'en_to_az',
    'az_to_en',
    'match_pairs',
    'unscramble',
    'fill_blank',
    'clue_guess',
    extraType,
  ]);

  const questions: QuestionItem[] = plannedTypes.map((qType, idx) => {
    if (qType === 'match_pairs') {
      const pairWords: VocabEntry[] = [];
      const usedAz = new Set<string>();
      for (let i = 0; i < 4; i++) {
        const w = takeWord((cand) => !usedAz.has(cand.az.toLowerCase()));
        usedAz.add(w.az.toLowerCase());
        pairWords.push(w);
      }
      return buildMatchPairsQuestion(pairWords, idx);
    }

    if (qType === 'unscramble') {
      const w = takeWord(
        (cand) => !cand.en.includes(' ') && cand.en.length >= 4 && cand.en.length <= 12
      );
      return buildUnscrambleQuestion(w, idx);
    }

    const w = takeWord();
    return buildChoiceQuestion(qType, w, pool, idx);
  });

  return questions;
}
