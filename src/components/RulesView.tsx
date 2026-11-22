import { ArrowLeft, CheckCircle2, Clock, Search, Sparkles, Users } from 'lucide-react';

interface RulesViewProps {
  onBackHome: () => void;
}

export function RulesView({ onBackHome }: RulesViewProps) {
  const gameTypes = [
    {
      title: '1. Tərcümə tap (EN → AZ)',
      desc: 'İngilis dilində verilən sözün Azərbaycan dilində düzgün mənasını 4 variant arasından seç.',
    },
    {
      title: '2. İngiliscəsini tap (AZ → EN)',
      desc: 'Azərbaycan dilində verilən sözün düzgün ingiliscə qarşılığını tap.',
    },
    {
      title: '3. Söz və məna uyğunlaşdırma',
      desc: '4 ingilis sözünü onların Azərbaycan dilindəki düzgün mənaları ilə cütləşdir.',
    },
    {
      title: '4. Qarışıq hərfləri düzəlt',
      desc: 'Hərfləri qarışdırılmış ingilis sözünü düzgün ardıcıllıqla topla. İstəsən ipucundan yararlana bilərsən.',
    },
    {
      title: '5. Cümlədə boşluğu tamamla',
      desc: 'İngilis cümləsindəki boş yerə məna baxımından uyğun gələn sözü seç.',
    },
    {
      title: '6. İpucuna görə sözü tap',
      desc: 'Qısa ingiliscə təsviri oxu və gizlənmiş sözün hansı olduğunu müəyyən et.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#162A45]">
          Oyun qaydaları
        </h1>
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-sm font-bold text-[#162A45] transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Ana ekrana qayıt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5DEC9] rounded-2xl p-5 space-y-2">
          <Search className="w-6 h-6 text-[#2563EB]" aria-hidden="true" />
          <h2 className="font-display font-bold text-base text-[#162A45]">
            Detektiv ipucları
          </h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            Hər raund 7 qarışıq söz tapşırığından ibarətdir. Hər düzgün cavab sənə yeni bir detektiv ipucu qazandırır və sonda sirr açılır.
          </p>
        </div>

        <div className="bg-white border border-[#E5DEC9] rounded-2xl p-5 space-y-2">
          <Sparkles className="w-6 h-6 text-[#D97706]" aria-hidden="true" />
          <h2 className="font-display font-bold text-base text-[#162A45]">
            Xal və ardıcıllıq bonusu
          </h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            Hər düzgün cavab 100 əsas xal verir. Ardıcıl düzgün cavablar (+25 xal seriya bonusu) daha yüksək nəticə və 3 ulduz qazandırır.
          </p>
        </div>

        <div className="bg-white border border-[#E5DEC9] rounded-2xl p-5 space-y-2">
          <Users className="w-6 h-6 text-[#059669]" aria-hidden="true" />
          <h2 className="font-display font-bold text-base text-[#162A45]">
            Yarış rejimi
          </h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            2–4 oyunçu növbə ilə eyni sualları cavablandırır. Hər suala düzgün və sürətli cavab verən oyunçu əlavə sürət bonusu qazanır.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E5DEC9] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#162A45]">
          <Clock className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
          <h2 className="font-display font-bold text-lg">
            Raunddakı 6 söz oyunu növü
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gameTypes.map((gt) => (
            <div
              key={gt.title}
              className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1.5"
            >
              <div className="flex items-center gap-2 font-display font-bold text-sm text-[#162A45]">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" aria-hidden="true" />
                <span>{gt.title}</span>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">{gt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
