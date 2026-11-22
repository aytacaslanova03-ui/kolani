import { useState } from 'react';
import {
  Play,
  Users,
  User,
  Star,
  Lock,
  CheckCircle2,
  Compass,
  Award,
  Plus,
  Minus,
} from 'lucide-react';
import { HERO_IMAGE, MYSTERY_CASES } from '../data/mysteries';
import {
  DIFFICULTY_DESCRIPTIONS,
  DIFFICULTY_LABELS,
  Difficulty,
  GameMode,
  Grade,
  ProgressState,
} from '../types/game';
import {
  getCaseKey,
  getDetectiveRank,
  getUnlockedCaseLimit,
} from '../utils/progressStorage';

interface TitleSetupScreenProps {
  grade: Grade;
  onSelectGrade: (grade: Grade) => void;
  difficulty: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  playerNames: string[];
  onChangePlayerNames: (names: string[]) => void;
  selectedCaseNumber: number;
  onSelectCaseNumber: (caseNum: number) => void;
  progress: ProgressState;
  onStartGame: () => void;
}

const GRADES: Grade[] = [5, 6, 7, 8];
const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'hard'];

export function TitleSetupScreen({
  grade,
  onSelectGrade,
  difficulty,
  onSelectDifficulty,
  mode,
  onSelectMode,
  playerNames,
  onChangePlayerNames,
  selectedCaseNumber,
  onSelectCaseNumber,
  progress,
  onStartGame,
}: TitleSetupScreenProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const unlockedLimit = getUnlockedCaseLimit(progress, grade, difficulty);
  const rank = getDetectiveRank(progress.totalStars);

  const handlePlayerCount = (delta: number) => {
    const nextCount = Math.min(4, Math.max(2, playerNames.length + delta));
    if (nextCount === playerNames.length) return;
    if (nextCount > playerNames.length) {
      const next = [...playerNames];
      for (let i = playerNames.length; i < nextCount; i++) {
        next.push(`Detektiv ${i + 1}`);
      }
      onChangePlayerNames(next);
    } else {
      onChangePlayerNames(playerNames.slice(0, nextCount));
    }
  };

  const handleNameEdit = (index: number, value: string) => {
    const next = [...playerNames];
    next[index] = value;
    onChangePlayerNames(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero Banner Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-white border border-[#E5DEC9] rounded-2xl p-5 sm:p-8 shadow-xs">
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-[#64748B]">
              <span>5–8-ci siniflər</span>
              <span aria-hidden="true">·</span>
              <span>İngilis dili söz ehtiyatı</span>
              <span aria-hidden="true">·</span>
              <span>Detektiv sirrləri</span>
            </div>

            <h1
              className="font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#162A45] leading-tight tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              İngilis dili detektiv klubu
            </h1>

            <p className="text-base sm:text-lg text-[#334155] leading-relaxed max-w-2xl">
              Sinifini və səviyyəni seç, qarışıq ingilis söz oyunlarını həll et,
              hər düzgün cavabla yeni ipucu topla və günün maraqlı sirrini aç!
            </p>
          </div>

          {/* Primary CTA + Quick Summary Strip */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartGame}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 min-h-[56px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white font-display font-bold text-lg shadow-sm transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#162A45]"
              >
                <Play className="w-5 h-5 fill-current" aria-hidden="true" />
                <span>Başla</span>
              </button>

              <div className="text-sm text-[#475569] font-semibold">
                <span>Seçilmiş: </span>
                <span className="text-[#162A45] font-bold">
                  {grade}-ci sinif · {DIFFICULTY_LABELS[difficulty]} ·{' '}
                  {mode === 'single' ? 'Tək oyun' : `Yarış (${playerNames.length} oyunçu)`}
                </span>
              </div>
            </div>

            {/* Clean unboxed stats row */}
            <div className="pt-4 border-t border-[#EFE9D8] flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#475569]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                <span>Rütbə:</span>
                <strong className="text-[#162A45]">{rank.titleAz}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#EAB308] fill-[#EAB308]" aria-hidden="true" />
                <span>Ulduzlar:</span>
                <strong className="font-mono-num text-[#162A45]">
                  {progress.totalStars}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                <span>Ümumi xal:</span>
                <strong className="font-mono-num text-[#162A45]">
                  {progress.totalScore}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" aria-hidden="true" />
                <span>Öyrənilmiş söz:</span>
                <strong className="font-mono-num text-[#162A45]">
                  {progress.wordsMastered.length}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="lg:col-span-5 flex items-stretch">
          {!heroImgFailed ? (
            <div className="w-full h-56 sm:h-64 lg:h-auto rounded-xl overflow-hidden border border-[#E5DEC9] bg-[#F3EDE0]">
              <img
                src={HERO_IMAGE}
                alt="İngilis dili detektiv klubu iş masası: böyüdücü şüşə, ipucu dəftəri və xəritə"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full min-h-[220px] rounded-xl border border-[#E5DEC9] bg-gradient-to-br from-[#162A45] to-[#24426B] text-white p-6 flex flex-col items-center justify-center text-center gap-3">
              <Compass className="w-12 h-12 text-[#FACC15]" aria-hidden="true" />
              <p className="font-display font-bold text-lg">
                Detektiv Qərargahı Hazırdır
              </p>
              <p className="text-sm text-slate-200">
                İpuclarını topla və ingilis sözləri ilə sirri aç!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Setup Controls Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Grade, Difficulty, Mode */}
        <div className="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
          {/* 1. Grade selection */}
          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-[#162A45]">
              1. Sinifini seç
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GRADES.map((g) => {
                const isSelected = grade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onSelectGrade(g)}
                    className={`min-h-[54px] px-4 py-3 rounded-xl font-display font-bold text-base transition-all border-2 whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#162A45] text-white border-[#162A45] shadow-xs'
                        : 'bg-[#FAF7F0] text-[#162A45] border-[#E5DEC9] hover:border-[#2563EB]'
                    }`}
                  >
                    {g}-ci sinif
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Difficulty selection */}
          <div className="space-y-3 pt-2 border-t border-[#EFE9D8]">
            <h2 className="font-display text-lg font-bold text-[#162A45]">
              2. Çətinlik səviyyəsini seç
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DIFFICULTIES.map((diff) => {
                const isSelected = difficulty === diff;
                const unlockedForDiff = getUnlockedCaseLimit(progress, grade, diff);
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => onSelectDifficulty(diff)}
                    className={`text-left p-4 min-h-[84px] rounded-xl border-2 transition-all flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-[#2563EB] text-[#162A45]'
                        : 'bg-[#FAF7F0] border-[#E5DEC9] text-[#162A45] hover:border-[#94A3B8]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-base whitespace-nowrap">
                        {DIFFICULTY_LABELS[diff]}
                      </span>
                      <span className="text-xs font-mono-num font-bold text-[#2563EB] whitespace-nowrap">
                        {unlockedForDiff}/3 iş
                      </span>
                    </div>
                    <span className="text-xs text-[#475569] leading-snug">
                      {DIFFICULTY_DESCRIPTIONS[diff]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Mode selection */}
          <div className="space-y-3 pt-2 border-t border-[#EFE9D8]">
            <h2 className="font-display text-lg font-bold text-[#162A45]">
              3. Oyun rejimini seç
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectMode('single')}
                className={`p-4 min-h-[68px] rounded-xl border-2 text-left flex items-center gap-3.5 transition-all ${
                  mode === 'single'
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#162A45]'
                    : 'bg-[#FAF7F0] border-[#E5DEC9] text-[#162A45] hover:border-[#94A3B8]'
                }`}
              >
                <span className="w-11 h-11 rounded-xl bg-white border border-[#E5DEC9] flex items-center justify-center shrink-0 text-[#2563EB]">
                  <User className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <div className="font-display font-bold text-base">Tək oyun</div>
                  <div className="text-xs text-[#475569]">
                    Öz sürətinlə oyna, xal və ulduz qazan
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectMode('competition')}
                className={`p-4 min-h-[68px] rounded-xl border-2 text-left flex items-center gap-3.5 transition-all ${
                  mode === 'competition'
                    ? 'bg-[#FEF9C3] border-[#D97706] text-[#162A45]'
                    : 'bg-[#FAF7F0] border-[#E5DEC9] text-[#162A45] hover:border-[#94A3B8]'
                }`}
              >
                <span className="w-11 h-11 rounded-xl bg-white border border-[#E5DEC9] flex items-center justify-center shrink-0 text-[#D97706]">
                  <Users className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <div className="font-display font-bold text-base">Yarış rejimi</div>
                  <div className="text-xs text-[#475569]">
                    2–4 oyunçu eyni sualları sürətlə cavablayır
                  </div>
                </div>
              </button>
            </div>

            {/* Competition Players Editor */}
            {mode === 'competition' && (
              <div className="mt-3 p-4 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#162A45]">
                    Oyunçuların sayı və adları ({playerNames.length} nəfər)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePlayerCount(-1)}
                      disabled={playerNames.length <= 2}
                      aria-label="Oyunçu sayını azalt"
                      className="w-10 h-10 rounded-lg border border-[#E5DEC9] bg-white flex items-center justify-center text-[#162A45] disabled:opacity-40 hover:bg-[#F3EDE0] transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePlayerCount(1)}
                      disabled={playerNames.length >= 4}
                      aria-label="Oyunçu sayını artır"
                      className="w-10 h-10 rounded-lg border border-[#E5DEC9] bg-white flex items-center justify-center text-[#162A45] disabled:opacity-40 hover:bg-[#F3EDE0] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {playerNames.map((pName, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#162A45] text-white text-xs font-mono-num font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={pName}
                        maxLength={18}
                        onChange={(e) => handleNameEdit(idx, e.target.value)}
                        placeholder={`Detektiv ${idx + 1}`}
                        aria-label={`${idx + 1}-ci oyunçunun adı`}
                        className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm font-semibold text-[#162A45] focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 cols: Detective Cases / Unlocked Levels for selected Grade + Difficulty */}
        <div className="lg:col-span-5 bg-white border border-[#E5DEC9] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-[#162A45]">
                4. Detektiv işini seç
              </h2>
              <span className="text-xs font-semibold text-[#64748B]">
                {grade}-ci sinif · {DIFFICULTY_LABELS[difficulty]}
              </span>
            </div>

            <div className="space-y-3">
              {MYSTERY_CASES.map((mCase) => {
                const isUnlocked = mCase.caseNumber <= unlockedLimit;
                const isSelected = selectedCaseNumber === mCase.caseNumber;
                const cKey = getCaseKey(grade, difficulty, mCase.caseNumber);
                const bestStars = progress.caseBestStars[cKey] ?? 0;

                return (
                  <button
                    key={mCase.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => onSelectCaseNumber(mCase.caseNumber)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3.5 ${
                      !isUnlocked
                        ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-65 cursor-not-allowed'
                        : isSelected
                          ? 'bg-[#EFF6FF] border-[#2563EB]'
                          : 'bg-[#FAF7F0] border-[#E5DEC9] hover:border-[#94A3B8]'
                    }`}
                  >
                    <div className="w-16 h-14 rounded-lg overflow-hidden border border-[#E5DEC9] bg-[#F3EDE0] shrink-0 relative">
                      <img
                        src={mCase.image}
                        alt={mCase.titleAz}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-[#162A45]/60 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-white" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm sm:text-base text-[#162A45] truncate">
                        {mCase.titleAz}
                      </div>
                      <div className="text-xs text-[#475569] truncate">
                        {mCase.locationAz}
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= bestStars
                                ? 'text-[#EAB308] fill-[#EAB308]'
                                : 'text-[#CBD5E1]'
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                        <span className="ml-1.5 text-xs font-semibold text-[#64748B]">
                          {!isUnlocked
                            ? `Açmaq üçün İş #${mCase.caseNumber - 1}-i tamamla`
                            : bestStars > 0
                              ? 'Tamamlanıb'
                              : 'Açıqdır'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onStartGame}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 min-h-[54px] rounded-xl bg-[#162A45] hover:bg-[#0F1E33] text-white font-display font-bold text-base transition-colors whitespace-nowrap"
          >
            <Play className="w-5 h-5 fill-current" aria-hidden="true" />
            <span>Raunda başla</span>
          </button>
        </div>
      </section>
    </div>
  );
}
