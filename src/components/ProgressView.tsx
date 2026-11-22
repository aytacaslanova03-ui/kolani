import { ArrowLeft, Award, CheckCircle2, Lock, RotateCcw, Star } from 'lucide-react';
import {
  DIFFICULTY_LABELS,
  Difficulty,
  Grade,
  ProgressState,
} from '../types/game';
import {
  getCaseKey,
  getDetectiveRank,
  getUnlockedCaseLimit,
} from '../utils/progressStorage';

interface ProgressViewProps {
  progress: ProgressState;
  onResetProgress: () => void;
  onBackHome: () => void;
}

const GRADES: Grade[] = [5, 6, 7, 8];
const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'hard'];

export function ProgressView({
  progress,
  onResetProgress,
  onBackHome,
}: ProgressViewProps) {
  const rank = getDetectiveRank(progress.totalStars);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#162A45]">
            Detektiv İrəliləyişi
          </h1>
          <p className="text-sm text-[#475569]">
            Topladığın xallar, ulduzlar və siniflər üzrə açılmış detektiv işləri.
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

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5DEC9] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#64748B]">Detektiv rütbəsi</div>
          <div className="flex items-center gap-2 mt-2">
            <Award className="w-5 h-5 text-[#D97706] shrink-0" aria-hidden="true" />
            <span className="font-display font-bold text-lg text-[#162A45]">
              {rank.titleAz}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#E5DEC9] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#64748B]">Ümumi xal</div>
          <div className="font-mono-num font-extrabold text-2xl text-[#2563EB] mt-1.5">
            {progress.totalScore}
          </div>
        </div>

        <div className="bg-white border border-[#E5DEC9] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#64748B]">Toplanmış ulduz</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star className="w-5 h-5 text-[#EAB308] fill-[#EAB308]" aria-hidden="true" />
            <span className="font-mono-num font-extrabold text-2xl text-[#162A45]">
              {progress.totalStars}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#E5DEC9] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#64748B]">Öyrənilmiş sözlər</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <CheckCircle2 className="w-5 h-5 text-[#059669]" aria-hidden="true" />
            <span className="font-mono-num font-extrabold text-2xl text-[#162A45]">
              {progress.wordsMastered.length}
            </span>
          </div>
        </div>
      </div>

      {/* Grade & Difficulty Matrix */}
      <div className="bg-white border border-[#E5DEC9] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display font-bold text-lg text-[#162A45]">
            Siniflər və açılmış səviyyələr
          </h2>
          <span className="text-xs font-semibold text-[#64748B]">
            Tamamlanmış raundlar: <strong className="font-mono-num">{progress.roundsCompleted}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GRADES.map((g) => (
            <div
              key={g}
              className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-3"
            >
              <div className="font-display font-bold text-base text-[#162A45]">
                {g}-ci sinif
              </div>

              <div className="space-y-2.5">
                {DIFFICULTIES.map((diff) => {
                  const unlockedLimit = getUnlockedCaseLimit(progress, g, diff);
                  return (
                    <div
                      key={diff}
                      className="p-3 rounded-lg bg-white border border-[#E5DEC9] flex items-center justify-between gap-3"
                    >
                      <span className="text-sm font-bold text-[#162A45]">
                        {DIFFICULTY_LABELS[diff]}
                      </span>

                      <div className="flex items-center gap-2.5">
                        {[1, 2, 3].map((caseNum) => {
                          const isOpen = caseNum <= unlockedLimit;
                          const stars =
                            progress.caseBestStars[getCaseKey(g, diff, caseNum)] ?? 0;

                          return (
                            <div
                              key={caseNum}
                              className="flex items-center gap-1 text-xs font-mono-num font-semibold"
                              title={`İş #${caseNum}`}
                            >
                              {isOpen ? (
                                <span className="inline-flex items-center gap-0.5 text-[#162A45]">
                                  <span>#{caseNum}</span>
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      stars > 0
                                        ? 'text-[#EAB308] fill-[#EAB308]'
                                        : 'text-[#CBD5E1]'
                                    }`}
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[#94A3B8]">
                                  <span>#{caseNum}</span>
                                  <Lock className="w-3 h-3" aria-hidden="true" />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#EFE9D8] flex justify-end">
          <button
            type="button"
            onClick={onResetProgress}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-xs font-bold text-[#991B1B] transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>İrəliləyişi sıfırla</span>
          </button>
        </div>
      </div>
    </div>
  );
}
