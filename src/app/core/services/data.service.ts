import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import type {
  ArtStyle,
  Booking,
  CinemaHall,
  Movie,
  Settings,
  Showtime,
} from '../models';

const KEY = 'noir:data';

interface DataShape {
  movies: Movie[];
  halls: CinemaHall[];
  showtimes: Showtime[];
  bookings: Booking[];
  settings: Settings;
  seeded: string;
}

const DAY = 24 * 60 * 60 * 1000;

function iso(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function art(style: ArtStyle, bg: [string, string], accent: string, accent2: string) {
  return { style, bg, accent, accent2 };
}

const MOVIES: Movie[] = [
  {
    id: 'neon-requiem',
    title: { en: 'Neon Requiem', ar: 'نيون ريكويم' },
    tagline: { en: 'The city sings one final song.', ar: 'المدينة تُغني أغنيتها الأخيرة.' },
    overview: {
      en: 'Beneath a rain-soaked skyline, a retired assassin is pulled back for one last job that echoes the death of his past love. Every neon light hides a debt waiting to be paid.',
      ar: 'تحت أفقٍ يغسله المطر، يُسحب قاتل متقاعد إلى مهمة أخيرة تُعيد إليه ظلّ حبه المفقود. كل ضوء نيون يخفي دينًا ينتظر السداد.',
    },
    status: 'now',
    year: 2026,
    durationMin: 138,
    rating: 8.7,
    age: '16+',
    genres: [
      { en: 'Sci-Fi', ar: 'خيال علمي' },
      { en: 'Neo-Noir', ar: 'نو-نوار' },
      { en: 'Thriller', ar: 'إثارة' },
    ],
    badge: 'IMAX',
    director: { en: 'Lena Marchetti', ar: 'لينا ماركيتي' },
    cast: [
      { en: 'Kai Andersen', ar: 'كاي أندرسن' },
      { en: 'Maya Reyes', ar: 'مايا ريس' },
      { en: 'Theo Brandt', ar: 'ثيو براندت' },
    ],
    art: art('surge', ['#14060f', '#04010a'], '#ff4d8d', '#7c4dff'),
  },
  {
    id: 'cassiopeia',
    title: { en: 'The Last Voyage of the Cassiopeia', ar: 'الرحلة الأخيرة لكاسيوبيا' },
    tagline: { en: 'Some lawns are built for departure.', ar: 'بعض السُفن صُنعت للمغادرة.' },
    overview: {
      en: 'A salvage crew answers a distress call from a derelict liner drifting beyond the orbit of Saturn. Inside, the ship is still setting the table for its last hundred passengers.',
      ar: 'طاقم إنقاذ يجيب نداء استغاثةٍ قادم من سفينة مهجورة تدور خلف مدار زحل. وفي الداخل، ما زالت السفينة تُعدّ الطاولة لمئتي راكبٍ رحلوا.',
    },
    status: 'now',
    year: 2026,
    durationMin: 152,
    rating: 9.1,
    age: '12+',
    genres: [
      { en: 'Space Epic', ar: 'ملحمة فضائية' },
      { en: 'Adventure', ar: 'مغامرة' },
      { en: 'Drama', ar: 'دراما' },
    ],
    badge: '3D',
    director: { en: 'Elias Vega', ar: 'إلياس فيغا' },
    cast: [
      { en: 'Nadia Sol', ar: 'نادية سول' },
      { en: 'Julian Arens', ar: 'جوليان آرينس' },
      { en: 'Irena Kovac', ar: 'إيرينا كوفاتش' },
    ],
    art: art('orbit', ['#050b1c', '#000208'], '#7aa7ff', '#c9a466'),
    favorite: true,
  },
  {
    id: 'moment-of-silence',
    title: { en: 'A Moment of Silence', ar: 'لحظة صمت' },
    tagline: { en: 'One street, one hour, a hundred lives.', ar: 'شارعٌ واحد، ساعةٌ واحدة، مئة حياة.' },
    overview: {
      en: 'Shot in monochrome over twelve takes in a single street, this film follows a barber, a bride and a thief through the sixty minutes that change all of them forever.',
      ar: 'صُوّر بالأبيض والأسود في شارعٍ واحد عبر اثنتي عشرة لقطةً للقطة الواحدة، يتابع الفيلم حلاقًا وعروسًا ولصًا خلال الستين دقيقة التي تغيّر حياتهم كلهم إلى الأبد.',
    },
    status: 'now',
    year: 2026,
    durationMin: 104,
    rating: 8.2,
    age: '12+',
    genres: [
      { en: 'Arthouse', ar: 'سينما مؤلف' },
      { en: 'Drama', ar: 'دراما' },
    ],
    director: { en: 'Salim Haddad', ar: 'سليم حداد' },
    cast: [
      { en: 'Omar Nabil', ar: 'عمر نبيل' },
      { en: 'Leila Khoury', ar: 'ليلى خوري' },
      { en: 'Yusuf Amin', ar: 'يوسف أمين' },
    ],
    art: art('monolith', ['#0a0a0c', '#000000'], '#d9d4c8', '#5a5650'),
  },
  {
    id: 'crimson-coast',
    title: { en: 'Crimson Coast', ar: 'الساحل القرمزي' },
    tagline: { en: 'The tide brings everything back.', ar: 'المدّ يُعيد كل شيء.' },
    overview: {
      en: 'A coastal town wakes to find a shipping container full of photographs of its own future. A detective and a lighthouse keeper race the tide to stop the last photo from coming true.',
      ar: 'تستيقظ بلدة ساحلية لتجد حاوية شحن مليئة بصورٍ من مستقبلها. يتسابق محققٌ وحارس منارة مع المدّ لمنع آخر صورة من التحقق.',
    },
    status: 'now',
    year: 2025,
    durationMin: 121,
    rating: 7.9,
    age: '16+',
    genres: [
      { en: 'Thriller', ar: 'إثارة' },
      { en: 'Mystery', ar: 'غموض' },
    ],
    badge: 'IMAX',
    director: { en: 'Amara Diallo', ar: 'أمارا ديالو' },
    cast: [
      { en: 'Xavier Lane', ar: 'زافير لين' },
      { en: 'Hana Park', ar: 'هانا بارك' },
    ],
    art: art('horizon', ['#170605', '#020101'], '#e2574b', '#2c4a6e'),
  },
  {
    id: 'architect-dreams',
    title: { en: 'The Architect of Dreams', ar: 'مهندس الأحلام' },
    tagline: { en: 'Build the room. Burn the map.', ar: 'ابنِ الحجرة. وأحرق الخريطة.' },
    overview: {
      en: 'A reclusive architect discovers that the buildings he drafts appear in other people’s sleep. To save one sleepless city, he must demolish his own masterpiece.',
      ar: 'يكتشف مهندسٌ منعزل أن المباني التي يرسمها تظهر في أحلام الآخرين. لإنقاذ مدينةٍ بلا نوم، عليه أن يهدم تحفته الخاصة.',
    },
    status: 'now',
    year: 2026,
    durationMin: 116,
    rating: 8.5,
    age: '12+',
    genres: [
      { en: 'Surreal', ar: 'سريالي' },
      { en: 'Fantasy', ar: 'فانتازيا' },
    ],
    badge: '3D',
    director: { en: 'Ren Fujiwara', ar: 'رين فوجيوارا' },
    cast: [
      { en: 'Adam Steele', ar: 'آدم ستيل' },
      { en: 'Ines Vidal', ar: 'إينيس فيدال' },
    ],
    art: art('prism', ['#170d05', '#040201'], '#f2a65a', '#4b9fe8'),
  },
  {
    id: 'static-hearts',
    title: { en: 'Static Hearts', ar: 'قلوب مشوشة' },
    tagline: { en: 'Love is a frequency no one can tune.', ar: 'الحب ترددٌ لا يضبطه أحد.' },
    overview: {
      en: 'Two radio hosts meet every night on an AM frequency that stops broadcasting in 1987. When the signal returns, their voices finally meet in the same room.',
      ar: 'مذيعان يلتقيان كل ليلة على تردد AM توقف عن البث عام ١٩٨٧. وعندما يعود الإرسال، تلتقي أصواتهما أخيرًا في غرفةٍ واحدة.',
    },
    status: 'soon',
    year: 2026,
    durationMin: 99,
    rating: 8,
    age: 'PG',
    genres: [
      { en: 'Romance', ar: 'رومانسي' },
      { en: 'Drama', ar: 'دراما' },
    ],
    director: { en: 'Chiara Bellini', ar: 'كيارا بيليني' },
    cast: [
      { en: 'Leo Fontaine', ar: 'ليو فونتين' },
      { en: 'Sara Elise', ar: 'سارة إليز' },
    ],
    art: art('veil', ['#150a14', '#050206'], '#e8a8c8', '#8e6bb0'),
  },
  {
    id: 'golden-arch',
    title: { en: 'Beneath the Golden Arch', ar: 'تحت القوس الذهبي' },
    tagline: { en: 'Every treasure has a guard dog.', ar: 'لكل كنزٍ حارس.' },
    overview: {
      en: 'An aging tomb-robbing couple take one last job under a city that never lets anyone leave. The vault they seek was built by the people who trapped them.',
      ar: 'زوجان من نقّابي المقابر يأخذان آخر مهمة تحت مدينةٍ لا تسمح لأحد بالمغادرة. القبو الذي يبحثان عنه بناه الذين حبسوهم.',
    },
    status: 'now',
    year: 2025,
    durationMin: 129,
    rating: 8.4,
    age: '13+',
    genres: [
      { en: 'Adventure', ar: 'مغامرة' },
      { en: 'Action', ar: 'أكشن' },
    ],
    badge: 'IMAX',
    director: { en: 'Dario Menendez', ar: 'داريو منينديز' },
    cast: [
      { en: 'Rosa Luna', ar: 'روزا لونا' },
      { en: 'Marco Aldana', ar: 'ماركو ألدانا' },
    ],
    art: art('arc', ['#191104', '#030100'], '#e6b463', '#324a2f'),
  },
  {
    id: 'zero-hour',
    title: { en: 'Zero Hour', ar: 'الساعة صفر' },
    tagline: { en: 'The countdown started yesterday.', ar: 'العدّ بدأ أمس.' },
    overview: {
      en: 'A data courier has ninety minutes to deliver a file that can prevent a blackout across the continent. Every traffic light in the city becomes an enemy.',
      ar: 'أمام ساعي بيانات تسعون دقيقة لتسليم ملفٍ يمكنه منع انقطاع الكهرباء عن القارة كلها. كل إشارة مرور في المدينة تتحول إلى عدو.',
    },
    status: 'now',
    year: 2026,
    durationMin: 112,
    rating: 8.1,
    age: '13+',
    genres: [
      { en: 'Action', ar: 'أكشن' },
      { en: 'Thriller', ar: 'إثارة' },
    ],
    badge: '3D',
    director: { en: 'Naomi Reed', ar: 'ناعومي ريد' },
    cast: [
      { en: 'Dane Hollow', ar: 'داين هولو' },
      { en: 'Priya Nair', ar: 'بريا ناير' },
    ],
    art: art('grid', ['#0a1414', '#010303'], '#3fbfaf', '#e2574b'),
  },
  {
    id: 'garden-blind',
    title: { en: 'A Garden for the Blind', ar: 'حديقة للمكفوفين' },
    tagline: { en: 'Smell the roses that aren’t there.', ar: 'شمّ الورود التي لا وجود لها.' },
    overview: {
      en: 'A poetic experiment in scent, sound and water. A blind gardener grows a garden nobody can see, for a city that has forgotten how to listen.',
      ar: 'تجربة شعرية من الرائحة والصوت والماء. بستانيٌ كفيف يزرع حديقةً لا يراها أحد، لمدينةٍ نسيت كيف تستمع.',
    },
    status: 'soon',
    year: 2026,
    durationMin: 88,
    rating: 8.8,
    age: 'G',
    genres: [
      { en: 'Poetry', ar: 'شعر' },
      { en: 'Documentary', ar: 'وثائقي' },
    ],
    director: { en: 'Fadi Salameh', ar: 'فادي سلامة' },
    cast: [{ en: '—', ar: '—' }],
    art: art('waves', ['#0b1408', '#010401'], '#9bcd6f', '#6d5a8f'),
  },
  {
    id: 'weight-of-wings',
    title: { en: 'The Weight of Wings', ar: 'ثقل الأجنحة' },
    tagline: { en: 'You were never meant to fly. Only to fall beautifully.', ar: 'لم تُخلق لتحلّق أصلًا. فقط لتهوي بشكل جميل.' },
    overview: {
      en: 'In a mountain village where everyone wears lead shoes, a girl finds a single feather. The film follows her climb to return it before the snow comes.',
      ar: 'في قريةٍ جبلية حيث يلبس الجميع أحذيةً من رصاص، تجد فتاةٌ ريشةً واحدة. يتابع الفيلم صعودها لتعيدها قبل أن يأتي الثلج.',
    },
    status: 'soon',
    year: 2026,
    durationMin: 107,
    rating: 9,
    age: 'PG',
    genres: [
      { en: 'Fantasy', ar: 'فانتازيا' },
      { en: 'Drama', ar: 'دراما' },
    ],
    badge: '3D',
    director: { en: 'Ingrid Sorensen', ar: 'إنغريد سورنسن' },
    cast: [
      { en: 'Vera Lind', ar: 'فيرا ليند' },
      { en: 'Tobias Wren', ar: 'توبياس رين' },
    ],
    art: art('cross', ['#0d0a16', '#020105'], '#b79aef', '#e6c98f'),
  },
  {
    id: 'polar',
    title: { en: 'Polar', ar: 'قطبي' },
    tagline: { en: 'The quietest place on Earth.', ar: 'أهدأ مكان على وجه الأرض.' },
    overview: {
      en: 'Shot over three winters at the ends of the earth, Polar is a hymn to silence, survival and the enormous white patience of the ice.',
      ar: 'صُوّر خلال ثلاثة فصول شتاء في أقصى الأرض، "قطبي" ترنيمةٌ للصمت والبقاء وصبر الجليد الأبيض الهائل.',
    },
    status: 'now',
    year: 2025,
    durationMin: 94,
    rating: 8.6,
    age: 'G',
    genres: [
      { en: 'Documentary', ar: 'وثائقي' },
      { en: 'Nature', ar: 'طبيعة' },
    ],
    badge: 'IMAX',
    director: { en: 'Anouk Decker', ar: 'أنوك ديكر' },
    cast: [{ en: '—', ar: '—' }],
    art: art('horizon', ['#07131c', '#01060a'], '#bfe8f5', '#5a7d99'),
  },
  {
    id: 'echoes-cairo',
    title: { en: 'Echoes of Cairo', ar: 'أصداء القاهرة' },
    tagline: { en: 'The city remembers everything.', ar: 'المدينة تتذكر كل شيء.' },
    overview: {
      en: 'Nora returns to Cairo to sell her grandmother’s apartment and finds, behind each wall, a decade of stories the family buried. A quiet meditation on home.',
      ar: 'تعود نورا إلى القاهرة لبيع شقة جدتها، وتجد خلف كل جدارٍ عقدًا من القصص التي دفنتها العائلة. تأملٌ هادئ في معنى الوطن.',
    },
    status: 'now',
    year: 2026,
    durationMin: 118,
    rating: 8.3,
    age: '12+',
    genres: [
      { en: 'Drama', ar: 'دراما' },
      { en: 'Family', ar: 'عائلي' },
    ],
    director: { en: 'Hala Mansour', ar: 'هالة منصور' },
    cast: [
      { en: 'Rania Ghaly', ar: 'رانيا غالي' },
      { en: 'Karim Zaki', ar: 'كريم زكي' },
    ],
    art: art('grid', ['#14100a', '#040302'], '#d4b079', '#7b3b2b'),
    favorite: true,
  },
];

const HALLS: CinemaHall[] = [
  { id: 'hall-nebula', name: { en: 'Nebula', ar: 'سديم' }, kind: 'IMAX', rows: 10, seatsPerRow: 16, vipRows: 2, aislesAfter: [4, 11] },
  { id: 'hall-phantom', name: { en: 'Phantom', ar: 'فانتوم' }, kind: '3D', rows: 9, seatsPerRow: 14, vipRows: 1, aislesAfter: [4, 9] },
  { id: 'hall-aurum', name: { en: 'Aurum Lounge', ar: 'صالون أوروم' }, kind: 'VIP', rows: 6, seatsPerRow: 8, vipRows: 6, aislesAfter: [] },
  { id: 'hall-solstice', name: { en: 'Solstice', ar: 'سولستيس' }, kind: '2D', rows: 12, seatsPerRow: 18, vipRows: 2, aislesAfter: [4, 9, 14] },
];

const TIMES = ['13:00', '15:45', '18:30', '19:15', '21:00', '22:45'];
const PRICE_BASE: Record<string, { price: number; vip: number }> = {
  IMAX: { price: 150, vip: 300 },
  '3D': { price: 120, vip: 240 },
  '2D': { price: 90, vip: 180 },
  VIP: { price: 260, vip: 260 },
};

const DEMO_NAMES: [string, string][] = [
  ['Omar Khaled', 'omar.k@mail.com'],
  ['Sara Mostafa', 'sara.m@mail.com'],
  ['Ahmed Hassan', 'ahmed@mail.com'],
  ['Lina Adel', 'lina@mail.com'],
  ['Karim Fouad', 'karim@mail.com'],
  ['Nour El-Sherbiny', 'nour@mail.com'],
  ['Mariam Wael', 'mariam@mail.com'],
  ['Youssef Nabil', 'youssef@mail.com'],
  ['Farida Tarek', 'farida@mail.com'],
  ['Adam Zaki', 'adam@mail.com'],
];

function buildShowtimes(): Showtime[] {
  const showtimes: Showtime[] = [];
  const nowMovies = MOVIES.filter((m) => m.status === 'now');
  const halls = [...HALLS];
  nowMovies.forEach((movie, mi) => {
    for (let day = 0; day < 5; day++) {
      const hall = halls[(mi + day) % halls.length];
      const slots = TIMES.filter((_, ti) => (ti + mi + day) % 2 !== 0).slice(0, day === 0 && mi === 0 ? 4 : 3);
      for (const time of slots) {
        const rate = PRICE_BASE[hall.kind];
        const booked = seededBooked(movie.id, day, time, hall);
        showtimes.push({
          id: `st-${movie.id}-${day}-${time.replace(':', '')}`,
          movieId: movie.id,
          hallId: hall.id,
          dateISO: iso(day),
          time,
          price: rate.price,
          vipPrice: rate.vip,
          bookedSeats: booked,
        });
      }
    }
  });
  return showtimes;
}

function buildDemoBookings(showtimes: Showtime[]): Booking[] {
  const out: Booking[] = [];
  const candidates = showtimes.filter((s) => s.bookedSeats.length >= 2).slice(0, 26);
  candidates.forEach((st, i) => {
    const local = st.bookedSeats.slice(0, 1 + (i % 3));
    const daysAgo = i % 7;
    const createdAt = new Date(Date.now() - daysAgo * DAY - (i % 5) * 3600000).toISOString();
    const hall = HALLS.find((h) => h.id === st.hallId);
    const vipStart = hall ? Math.max(0, hall.rows - hall.vipRows) : 999;
    const amount = local.reduce((acc, code) => {
      const m = /^([A-Z]+)/.exec(code);
      const idx = m ? m[1].charCodeAt(0) - 65 : 0;
      return acc + (idx >= vipStart ? st.vipPrice : st.price);
    }, 0);
    const [name, email] = DEMO_NAMES[i % DEMO_NAMES.length];
    out.push({
      id: `seed-bk-${i}`,
      code: `NX-D${STCODE(i)}`,
      showtimeId: st.id,
      movieId: st.movieId,
      seats: [...local],
      subtotal: amount,
      discount: 0,
      total: amount,
      customer: { name, email, phone: `+20 10${(10000000 + ((i * 1379) % 90000000))}` },
      payment: i % 4 === 0 ? 'paylater' : 'card',
      status: i === 8 ? 'cancelled' : 'confirmed',
      createdAt,
    });
  });
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function STCODE(i: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  let n = i * 31 + 7;
  for (let k = 0; k < 4; k++) {
    s += chars[n % chars.length];
    n = (Math.imul(n, 1103515245) + 12345) >>> 0;
  }
  return s;
}

function seededBooked(movieId: string, day: number, time: string, hall: CinemaHall): string[] {
  const seed = (movieId.length + day * 7 + time.length * 3) % 5;
  const booked: string[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const colsToVip = hall.rows - hall.vipRows;
  for (let n = 0; n < seed + 4; n++) {
    const r = rows[(n + day) % hall.rows];
    const c = ((n * 3 + seatIndex(seed)) % hall.seatsPerRow) + 1;
    booked.push(rowCode(r, c));
  }
  return [...new Set(booked)];
}

function seatIndex(n: number): number {
  return (n * 2654435761) % 17;
}

function rowCode(row: string, col: number): string {
  return `${row}${col}`;
}

export const DEFAULT_SETTINGS: Settings = {
  currency: 'EGP',
  cinemaName: { en: 'NOIR Cinemas', ar: 'نوار سينمات' },
  email: 'hello@noir.cinema',
  phone: '+20 100 123 4567',
  address: { en: 'Nile Corniche, Downtown', ar: 'كورنيش النيل، وسط البلد' },
};

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly seedData: DataShape = {
    movies: MOVIES,
    halls: HALLS,
    showtimes: buildShowtimes(),
    bookings: buildDemoBookings(buildShowtimes()),
    settings: DEFAULT_SETTINGS,
    seeded: '3',
  };

  readonly movies = signal<Movie[]>([]);
  readonly halls = signal<CinemaHall[]>([]);
  readonly showtimes = signal<Showtime[]>([]);
  readonly bookings = signal<Booking[]>([]);
  readonly settings = signal<Settings>(DEFAULT_SETTINGS);

  constructor(private storage: StorageService) {
    this.load();
  }

  private load(): void {
    const stored = this.storage.get<DataShape>(KEY);
    if (stored && stored.seeded === this.seedData.seeded) {
      this.movies.set(stored.movies);
      this.halls.set(stored.halls);
      this.showtimes.set(stored.showtimes);
      this.bookings.set(stored.bookings);
      this.settings.set(stored.settings);
    } else {
      this.resetDemo();
    }
  }

  private persist(): void {
    this.storage.set<DataShape>(KEY, {
      movies: this.movies(),
      halls: this.halls(),
      showtimes: this.showtimes(),
      bookings: this.bookings(),
      settings: this.settings(),
      seeded: this.seedData.seeded,
    });
  }

  resetDemo(): void {
    this.movies.set(this.seedData.movies.map((m) => ({ ...m })));
    this.halls.set(this.seedData.halls.map((h) => ({ ...h })));
    this.showtimes.set(this.seedData.showtimes.map((s) => ({ ...s, bookedSeats: [...s.bookedSeats] })));
    this.bookings.set([]);
    this.settings.set({ ...DEFAULT_SETTINGS });
    this.persist();
  }

  // ---- Movies ----
  saveMovie(movie: Movie): void {
    const list = this.movies();
    const i = list.findIndex((m) => m.id === movie.id);
    if (i >= 0) {
      list[i] = movie;
      this.movies.set([...list]);
    } else {
      this.movies.set([...list, movie]);
    }
    this.persist();
  }

  deleteMovie(id: string): void {
    this.movies.set(this.movies().filter((m) => m.id !== id));
    this.showtimes.set(this.showtimes().filter((s) => s.movieId !== id));
    this.persist();
  }

  // ---- Halls ----
  saveHall(hall: CinemaHall): void {
    const list = this.halls();
    const i = list.findIndex((h) => h.id === hall.id);
    if (i >= 0) {
      list[i] = hall;
      this.halls.set([...list]);
    } else {
      this.halls.set([...list, hall]);
    }
    this.persist();
  }

  deleteHall(id: string): void {
    this.halls.set(this.halls().filter((h) => h.id !== id));
    this.persist();
  }

  // ---- Showtimes ----
  saveShowtime(st: Showtime): void {
    const list = this.showtimes();
    const i = list.findIndex((x) => x.id === st.id);
    if (i >= 0) {
      list[i] = st;
      this.showtimes.set([...list]);
    } else {
      this.showtimes.set([...list, st]);
    }
    this.persist();
  }

  deleteShowtime(id: string): void {
    this.showtimes.set(this.showtimes().filter((s) => s.id !== id));
    this.persist();
  }

  // ---- Bookings ----
  addBooking(booking: Booking): Booking {
    const st = this.showtimes().find((x) => x.id === booking.showtimeId);
    if (st) {
      st.bookedSeats = [...new Set([...st.bookedSeats, ...booking.seats])];
      this.saveShowtime(st);
    }
    this.bookings.set([booking, ...this.bookings()]);
    this.persist();
    return booking;
  }

  cancelBooking(id: string): void {
    const booking = this.bookings().find((b) => b.id === id);
    if (booking) {
      const st = this.showtimes().find((x) => x.id === booking.showtimeId);
      if (st) {
        st.bookedSeats = st.bookedSeats.filter((s) => !booking.seats.includes(s));
        this.saveShowtime(st);
      }
      const list = this.bookings();
      const i = list.findIndex((b) => b.id === id);
      list[i] = { ...list[i], status: 'cancelled' };
      this.bookings.set([...list]);
      this.persist();
    }
  }

  saveSettings(settings: Settings): void {
    this.settings.set(settings);
    this.persist();
  }
}