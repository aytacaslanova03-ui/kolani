import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Search } from 'lucide-react';
import { VOCABULARY_BANK } from '../data/vocabulary';
import {
  DIFFICULTY_LABELS,
  Difficulty,
  Grade,
  VocabTopic,
} from '../types/game';

interface WordbookViewProps {
  initialGrade: Grade;
  masteredIds: string[];
  onBackHome: () => void;
}

const GRADES: Grade[] = [5, 6, 7, 8];
const TOPICS: ('Hamısı' | VocabTopic)[] = [
  'Hamısı',
  'Məktəb',
  'Gündəlik həyat',
  'Ailə',
  'Yemək',
  'Heyvanlar',
  'Hava',
  'Hobbilər',
  'Şəhər',
  'Səyahət',
];

export function WordbookView({
  initialGrade,
  masteredIds,
  onBackHome,
}: WordbookViewProps) {
  const [gradeFilter, setGradeFilter] = useState<Grade>(initialGrade);
  const [diffFilter, setDiffFilter] = useState<'all' | Difficulty>('all');
  const [topicFilter, setTopicFilter] = useState<'Hamısı' | VocabTopic>('Hamısı');
  const [query, setQuery] = useState('');

  const filteredWords = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VOCABULARY_BANK.filter((item) => {
      if (item.grade !== gradeFilter) return false;
      if (diffFilter !== 'all' && item.difficulty !== diffFilter) return false;
      if (topicFilter !== 'Hamısı' && item.topic !== topicFilter) return false;
      if (
        q &&
        !item.en.toLowerCase().includes(q) &&
        !item.az.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [gradeFilter, diffFilter, topicFilter, query]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#162A45]">
            Detektiv Söz Lüğəti
          </h1>
          <p className="text-sm text-[#475569]">
            Siniflər üzrə bütün ingilis sözlərini, Azərbaycan dilində mənalarını və nümunə cümlələri təkrarla.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-sm font-bold text-[#162A45] transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Ana ekrana qayıt</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#E5DEC9] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Grade Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl">
            {GRADES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGradeFilter(g)}
                className={`px-3.5 py-2 min-h-[40px] rounded-lg text-sm font-display font-bold transition-colors whitespace-nowrap ${
                  gradeFilter === g
                    ? 'bg-[#162A45] text-white'
                    : 'text-[#475569] hover:text-[#162A45]'
                }`}
              >
                {g}-ci sinif
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search
              className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Söz axtar (EN və ya AZ)..."
              aria-label="Söz axtar"
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#CBD5E1] bg-[#FAF7F0] text-sm font-semibold text-[#162A45] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#EFE9D8]">
          {/* Difficulty select */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'beginner', 'intermediate', 'hard'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiffFilter(d)}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${
                  diffFilter === d
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]'
                    : 'bg-white border-[#E5DEC9] text-[#475569] hover:text-[#162A45]'
                }`}
              >
                {d === 'all' ? 'Bütün səviyyələr' : DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>

          {/* Topic dropdown */}
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="topic-filter" className="text-xs font-bold text-[#64748B]">
              Mövzu:
            </label>
            <select
              id="topic-filter"
              value={topicFilter}
              onChange={(e) =>
                setTopicFilter(e.target.value as 'Hamısı' | VocabTopic)
              }
              className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-[#FAF7F0] text-xs font-bold text-[#162A45] focus:outline-none focus:border-[#2563EB]"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Words Grid */}
      {filteredWords.length === 0 ? (
        <div className="bg-white border border-[#E5DEC9] rounded-2xl p-10 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-[#94A3B8] mx-auto" aria-hidden="true" />
          <p className="font-display font-bold text-base text-[#162A45]">
            Axtarışa uyğun söz tapılmadı
          </p>
          <p className="text-sm text-[#64748B]">
            Başqa filtr və ya açar söz seçməyi yoxla.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word) => {
            const isMastered = masteredIds.includes(word.id);
            return (
              <article
                key={word.id}
                className="bg-white border border-[#E5DEC9] rounded-2xl p-5 space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#64748B] font-semibold">
                    <span>
                      {DIFFICULTY_LABELS[word.difficulty]} · {word.topic}
                    </span>
                    {isMastered && (
                      <span className="inline-flex items-center gap-1 text-[#059669] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Öyrənilib
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="font-display text-xl font-extrabold text-[#162A45]">
                      {word.en}
                    </h2>
                    <div className="text-base font-bold text-[#2563EB]">
                      {word.az}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EFE9D8] text-sm space-y-1">
                  <p className="text-[#1E293B] font-medium">{word.sentence}</p>
                  <p className="text-xs text-[#64748B]">{word.sentenceAz}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
