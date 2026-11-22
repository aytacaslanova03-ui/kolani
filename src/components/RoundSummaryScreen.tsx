import { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Home,
  RotateCcw,
  Search,
  Star,
  Trophy,
  Unlock,
} from 'lucide-react';
import {
  DIFFICULTY_LABELS,
  Difficulty,
  GameMode,
  Grade,
  MysteryCase,
  PlayerState,
  ProgressState,
} from '../types/game';
import { getUnlockedCaseLimit } from '../utils/progressStorage';

interface RoundSummaryScreenProps {
  grade: Grade;
  difficulty: Difficulty;
  mode: GameMode;
  mysteryCase: MysteryCase;
  players: PlayerState[];
  totalQuestions: number;
  collectedClues: string[];
  starsEarned: number;
  newlyUnlockedCaseNumber: number | null;
  progress: ProgressState;
  onPlayNextRound: () => void;
  onReplayRound: () => void;
  onBackToMenu: () => void;
}

export function RoundSummaryScreen({
  grade,
  difficulty,
  mode,
  mysteryCase,
  players,
  totalQuestions,
  collectedClues,
  starsEarned,
  newlyUnlockedCaseNumber,
  progress,
  onPlayNextRound,
  onReplayRound,
  onBackToMenu,
}: RoundSummaryScreenProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const sortedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
    return a.totalTimeMs - b.totalTimeMs;
  });

  const primaryPlayer = sortedPlayers[0];
  const unlockedLimit = getUnlockedCaseLimit(progress, grade, difficulty);
  const accuracy = Math.round(
    (primaryPlayer.correctCount / Math.max(1, totalQuestions)) * 100
  );

  const mysterySolved = collectedClues.length >= Math.ceil(totalQuestions / 2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Result Hero Card */}
      <section className="bg-white border border-[#E5DEC9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs sm:text-sm font-semibold text-[#64748B]">
              {grade}-ci sinif · {DIFFICULTY_LABELS[difficulty]} ·{' '}
              {mode === 'single' ? 'Tək oyun' : 'Yarış rejimi'} · Açıq işlər:{' '}
              {unlockedLimit}/3
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#162A45]">
              {mode === 'competition'
                ? `Qalib: ${primaryPlayer.name}!`
                : mysterySolved
                  ? 'Raund tamamlandı və sirr açıldı!'
                  : 'Raund tamamlandı!'}
            </h1>
          </div>

          {/* Stars Earned */}
          <div className="flex items-center gap-2 bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-4 py-3 shrink-0">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-7 h-7 transition-transform ${
                  s <= starsEarned
                    ? 'text-[#EAB308] fill-[#EAB308]'
                    : 'text-[#CBD5E1]'
                }`}
                aria-hidden="true"
              />
            ))}
            <span className="ml-1 font-mono-num font-bold text-base text-[#162A45]">
              {starsEarned}/3 ulduz
            </span>
          </div>
        </div>

        {/* Newly Unlocked Case Notice */}
        {newlyUnlockedCaseNumber && (
          <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-3 text-sm sm:text-base font-bold text-[#065F46]">
            <Unlock className="w-5 h-5 text-[#059669] shrink-0" aria-hidden="true" />
            <span>
              Təbriklər! {grade}-ci sinif ({DIFFICULTY_LABELS[difficulty]}) üzrə yeni səviyyə açıldı: İş #{newlyUnlockedCaseNumber}!
            </span>
          </div>
        )}

        {/* Single Player Metrics OR Competition Podium */}
        {mode === 'single' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9]">
              <div className="text-xs font-semibold text-[#64748B]">Toplam xal</div>
              <div className="font-mono-num font-extrabold text-2xl text-[#2563EB] mt-1">
                {primaryPlayer.score}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9]">
              <div className="text-xs font-semibold text-[#64748B]">Düzgün cavab</div>
              <div className="font-mono-num font-extrabold text-2xl text-[#059669] mt-1">
                {primaryPlayer.correctCount}/{totalQuestions}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9]">
              <div className="text-xs font-semibold text-[#64748B]">Dəqiqlik</div>
              <div className="font-mono-num font-extrabold text-2xl text-[#162A45] mt-1">
                {accuracy}%
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9]">
              <div className="text-xs font-semibold text-[#64748B]">Ən uzun seriya</div>
              <div className="font-mono-num font-extrabold text-2xl text-[#D97706] mt-1">
                {primaryPlayer.maxStreak}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-display font-bold text-base text-[#162A45]">
              <Trophy className="w-5 h-5 text-[#EAB308]" aria-hidden="true" />
              <span>Yarış nəticələri</span>
            </div>
            <div className="divide-y divide-[#EFE9D8] border border-[#E5DEC9] rounded-xl overflow-hidden">
              {sortedPlayers.map((p, idx) => {
                const avgSec = (p.totalTimeMs / Math.max(1, totalQuestions) / 1000).toFixed(1);
                return (
                  <div
                    key={p.id}
                    className={`p-4 flex flex-wrap items-center justify-between gap-3 ${
                      idx === 0 ? 'bg-[#FEF9C3]/60' : 'bg-[#FAF7F0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg font-mono-num font-bold text-sm flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? 'bg-[#EAB308] text-[#162A45]'
                            : 'bg-[#162A45] text-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-display font-bold text-base text-[#162A45]">
                          {p.name}
                        </div>
                        <div className="text-xs text-[#475569]">
                          Düzgün: {p.correctCount}/{totalQuestions} · Orta vaxt:{' '}
                          <span className="font-mono-num">{avgSec} s</span> · Seriya:{' '}
                          {p.maxStreak}
                        </div>
                      </div>
                    </div>

                    <div className="font-mono-num font-extrabold text-xl text-[#2563EB]">
                      {p.score} xal
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Detective Mystery Clues & Resolution Card */}
      <section className="bg-white border border-[#E5DEC9] rounded-2xl p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {!imgFailed ? (
            <div className="w-full h-56 lg:h-full min-h-[220px] rounded-xl overflow-hidden border border-[#E5DEC9] bg-[#F3EDE0]">
              <img
                src={mysteryCase.image}
                alt={mysteryCase.titleAz}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full min-h-[220px] rounded-xl bg-[#162A45] text-white p-6 flex flex-col items-center justify-center text-center gap-2">
              <Award className="w-10 h-10 text-[#FACC15]" aria-hidden="true" />
              <div className="font-display font-bold text-lg">{mysteryCase.titleAz}</div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold text-[#162A45]">
                {mysteryCase.titleAz}
              </h2>
              <span className="text-xs font-mono-num font-bold text-[#059669]">
                {collectedClues.length}/{totalQuestions} ipucu
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-1.5">
              <div className="flex items-center gap-2 font-display font-bold text-sm text-[#1E3A8A]">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                <span>{mysterySolved ? 'Sirrin həlli' : 'İstintaq qeydi'}</span>
              </div>
              <p className="text-sm sm:text-base text-[#1E293B] leading-relaxed">
                {mysterySolved
                  ? mysteryCase.resolutionAz
                  : 'Bir neçə ipucu topladın! Sirri tam açmaq üçün bu işi yenidən oynayıb daha çox düzgün cavab verə bilərsən.'}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-sm text-[#475569]">
                Toplanmış detektiv ipucları
              </h3>
              {collectedClues.length > 0 ? (
                <ul className="space-y-2">
                  {collectedClues.map((clue, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-lg bg-[#FAF7F0] border border-[#E5DEC9] text-sm text-[#162A45] flex items-start gap-2.5"
                    >
                      <Search
                        className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{clue}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#64748B]">
                  Bu raundda hələ ipucu toplanmayıb. Yenidən cəhd et!
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#EFE9D8] flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onPlayNextRound}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[50px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-display font-bold text-base transition-colors whitespace-nowrap"
            >
              <span>Növbəti raund</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onReplayRound}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[50px] rounded-xl border border-[#CBD5E1] bg-[#FAF7F0] hover:bg-[#F3EDE0] text-[#162A45] font-display font-bold text-base transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Yenidən oyna</span>
            </button>

            <button
              type="button"
              onClick={onBackToMenu}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[50px] rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#FAF7F0] text-[#475569] hover:text-[#162A45] font-display font-bold text-base transition-colors whitespace-nowrap"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Menyuya qayıt</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
