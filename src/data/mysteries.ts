import { MysteryCase } from '../types/game';

export const HERO_IMAGE = '/src/assets/images/detective_club_hero_1795332248919.jpg';

export const MYSTERY_CASES: MysteryCase[] = [
  {
    id: 'case-school-trophy',
    caseNumber: 1,
    titleAz: 'İş #1: Məktəb Kubokunun İzi',
    locationAz: 'Məktəb Dəhlizi və Bağça',
    introAz:
      'Səhər məktəbin foyesindəki qızıl idman kuboku yerində deyildi! Yalnız bir neçə ipucu qalıb. İngilis sözlərini düzgün taparaq kuboku kim və haraya apardığını öyrən!',
    image: '/src/assets/images/mystery_school_trophy_1795332249291.jpg',
    cluesAz: [
      'Boş stendin yanında parlaq mavi tutuquşu lələyi tapıldı.',
      'Döşəmədə kiçik rəngli təbaşir izləri həyət qapısına doğru gedir.',
      'Məktəb bağbanı səhər musiqi otağından şən fit səsi eşitdiyini deyir.',
      'Bağça qapısının ağzında “Science & Sports” yazılı lent parçası var.',
      'Məktəbin maskotu olan ağıllı tutuquşu “Koko” açıq pəncərədən içəri uçubmuş!',
      'Koko parıltılı əşyaları çox sevdiyi üçün kuboku günəşli bağça çardağına aparıb.',
      'Müəllim və şagirdlər kuboku bağçadakı çiçəkli skamyanın üstündə tapdılar!',
    ],
    resolutionAz:
      'Sirr açıldı! Məktəbin əyləncəli maskot tutuquşusu Koko parıltılı kuboku günəşdə parlasın deyə bağça skamyasına aparıbmış. Kubok təhlükəsiz şəkildə yerinə qaytarıldı!',
  },
  {
    id: 'case-library-compass',
    caseNumber: 2,
    titleAz: 'İş #2: Kitabxana Kompasının Sirri',
    locationAz: 'Şəhər Kitabxanası',
    introAz:
      'Şəhər kitabxanasının “Səyahət və Coğrafiya” guşəsindəki gümüş kompas yoxa çıxıb. Hər düzgün cavabla yeni bir ipucu topla və kompasın sirrini aç!',
    image: '/src/assets/images/mystery_library_book_1795332249106.jpg',
    cluesAz: [
      'Qlobusun yanında rəngli yapışqanlı qeyd vərəqləri tapıldı.',
      'Qeyd vərəqində ingiliscə “Look toward the sunrise” (Günçıxana bax) yazılıb.',
      'Pəncərənin qarşısındakı teleskop şərq tərəfdəki oxu zalına yönəlib.',
      'Kitab rəfinin üstündə təzə rəngli karandaş yonqarı görünür.',
      '6-cı sinif şagirdi Əli coğrafiya layihəsi üçün xəritə çəkirmiş.',
      'Kitabxanaçı xanım kompasın “Səyahət atlası” bölməsinə qoyulduğunu təsdiqlədi.',
      'Gümüş kompas coğrafiya layihəsi masasının üstündə səliqə ilə qorunmuş halda tapıldı!',
    ],
    resolutionAz:
      'Sirr açıldı! Gümüş kompası coğrafiya klubunun üzvləri məktəb xəritə sərgisi üçün götürüb sonra rəfin şərq küncünə qoyublarmış. Kitabxana sərgisi uğurla baş tutdu!',
  },
  {
    id: 'case-museum-garden',
    caseNumber: 3,
    titleAz: 'İş #3: Botanika Bağının Qızıl Açarı',
    locationAz: 'Şəhər Muzeyi və Bağça',
    introAz:
      'Şəhər muzeyinin kəpənək sərgisi açılmalıdır, lakin bağça qapısının qızıl açarı itirilib! Söz biliklərinlə ipuclarını birləşdir və açarı tap!',
    image: '/src/assets/images/mystery_museum_map_1795332249458.jpg',
    cluesAz: [
      'Daş skamyanın üstündə rəngli kəpənək eskizləri olan dəftər qalıb.',
      'Dəftərin kənarında böyüdücü şüşə günəş işığında parlayır.',
      'Fəvvarənin yanındakı çiçək dibçəyində kiçik torpaq izi var.',
      'Muzey rəssamı səhər bağçada kəpənəklərin şəklini çəkdiyini söylədi.',
      'Açar rəssamın çantasından düşüb və daş skamyanın yanındakı gül kolunun altında parlayır.',
      'Qızıl açar tapıldı və kəpənək sərgisinin qapısı vaxtında açıldı!',
      'Muzey direktoru gənc detektivlərə “Fəxri Söz Ustası” nişanı təqdim etdi!',
    ],
    resolutionAz:
      'Sirr açıldı! Qızıl açar rəssamın eskiz dəftərini qoyduğu daş skamyanın yanında, gül kolunun dibində tapıldı. Şəhər muzeyinin kəpənək sərgisi möhtəşəm şəkildə açıldı!',
  },
];

export function getMysteryCaseByNumber(caseNumber: number): MysteryCase {
  const index = (Math.max(1, caseNumber) - 1) % MYSTERY_CASES.length;
  return MYSTERY_CASES[index];
}
