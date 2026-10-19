'use strict';

/* =========================================================
   Криминальная Россия — Путь Сильвестра
   Браузерная криминальная стратегия. Один файл, без сборки.
   ========================================================= */

const SAVE_KEY = 'kr_sylvester_v1';
const BASE_DATE = new Date(2026, 10, 12); // 12 ноября 2026
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const nf = new Intl.NumberFormat('ru-RU');

function fmt(n) {
  return '$' + nf.format(Math.round(n));
}

function fmtShort(n) {
  const a = Math.abs(Math.round(n));
  if (a >= 1e9) return '$' + (n / 1e9).toFixed(a >= 1e10 ? 0 : 1).replace('.', ',') + ' млрд';
  if (a >= 1e6) return '$' + (n / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace('.', ',') + ' млн';
  if (a >= 1e3) return '$' + Math.round(n / 1e3) + ' тыс.';
  return fmt(n);
}

function gameDate(day) {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() + (day - 1));
  return d.getDate() + ' ' + MONTHS[d.getMonth()];
}

function plural(n, forms) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

/* =========================================================
   ДАННЫЕ
   ========================================================= */

const RANKS = [
  'Понаехавший',
  'Грузчик с рынка',
  'Держатель точки',
  'Смотрящий',
  'Авторитет',
  'Босс бригады',
  'Босс мафии',
  'Хозяин Рублёвки',
  'Forbes №52'
];

const MILESTONES = [
  { label: 'Снять койку у тёти Клавы', stage: 1 },
  { label: 'Перебраться из койки в комнату', stage: 2 },
  { label: 'Собрать первую бригаду', stage: 3 },
  { label: 'Взять Люблино', stage: 4 },
  { label: 'Стрелка с Бароном', stage: 5 },
  { label: 'Коронация: стать боссом', stage: 6 },
  { label: 'Дом на Рублёвке', stage: 7 },
  { label: '$2,5 млрд · 52-е место', stage: 8 }
];

const BUSINESSES = [
  { id: 'wash',   name: 'Автомойка',     icon: '🚿', cost: 4000,       income: 500,       heat: 1,  desc: 'Две камеры, три мойщика. Первый легальный рубль пахнет пеной.' },
  { id: 'tire',   name: 'Шиномонтаж',    icon: '🛞', cost: 20000,      income: 2400,      heat: 1,  desc: 'Сезонная золотая жила. Очередь на километр дважды в год.' },
  { id: 'market', name: 'Рынок',         icon: '🏪', cost: 100000,     income: 12000,     heat: 2,  desc: 'Своя крыша над чужими ларьками. Деньги идут каждый день.' },
  { id: 'resto',  name: 'Ресторан',      icon: '🍽️', cost: 700000,     income: 80000,     heat: 3,  desc: '«Сибирь» на набережной. Здесь теперь решают вопросы.' },
  { id: 'build',  name: 'Стройтрест',    icon: '🏗️', cost: 6000000,    income: 700000,    heat: 4,  desc: 'Бетон, краны, подряды. Легализация по-московски.' },
  { id: 'bank',   name: 'Банк',          icon: '🏦', cost: 50000000,   income: 6000000,   heat: 6,  desc: 'Чужие деньги работают на вас. Особенно чужие.' },
  { id: 'it',     name: 'IT-холдинг',    icon: '🛰️', cost: 300000000,  income: 30000000,  heat: 8,  desc: 'Серверы, приложения, «цифровая экономика». Идеальное прикрытие.' }
];

const CREW = [
  { id: 'shest',   name: 'Шестёрка',        icon: '🧢', cost: 800,       power: 3,     upkeep: 15,      rep: 0,  desc: 'Парень с рынка. Быстрый, дешёвый, не задаёт вопросов.' },
  { id: 'boec',    name: 'Боец',            icon: '🥊', cost: 6000,      power: 15,    upkeep: 120,     rep: 8,  desc: 'Ходил на стрелки. Умеет держать удар и язык за зубами.' },
  { id: 'avtor',   name: 'Авторитет',       icon: '🕴️', cost: 45000,     power: 95,    upkeep: 900,     rep: 22, desc: 'Его слушают без крика. Одна фамилия решает споры.' },
  { id: 'brig',    name: 'Бригадир',        icon: '🎖️', cost: 600000,    power: 800,   upkeep: 12000,   rep: 40, desc: 'Держит район и людей. Отвечает за результат, а не за процесс.' },
  { id: 'soldier', name: 'Солдат удачи',    icon: '🪖', cost: 12000000,  power: 6000,  upkeep: 240000,  rep: 60, desc: 'Не задаёт вопросов вообще. Дорого, тихо, эффективно.' },
  { id: 'guard',   name: 'Личная гвардия',  icon: '🛡️', cost: 150000000, power: 60000, upkeep: 3000000, rep: 75, desc: 'Люди, которые не уходят. Живут на территории, едят с вашей кухни.' }
];

const DISTRICTS = [
  { id: 'lublino',   name: 'Люблино',      short: 'ЛЮБ',  power: 15,    income: 12000,     rep: 4,  x: 2, y: 4, desc: 'Рынок, общежития, первая крыша. Здесь всё началось.' },
  { id: 'maryino',   name: 'Марьино',      short: 'МАР',  power: 60,    income: 60000,     rep: 5,  x: 3, y: 5, desc: 'Спальники и гаражи. Мафия держит их через бригадира по кличке Штырь.' },
  { id: 'arbat',     name: 'Арбат',        short: 'АРБ',  power: 220,   income: 250000,    rep: 6,  x: 1, y: 2, desc: 'Туристы, бутики, рестораны. Дорого, красиво, опасно.' },
  { id: 'tverskaya', name: 'Тверская',     short: 'ТВЕ',  power: 800,   income: 1200000,   rep: 7,  x: 2, y: 1, desc: 'Центр. Здесь даже воздух берут в аренду.' },
  { id: 'city',      name: 'Москва-Сити',  short: 'СИТИ', power: 3000,  income: 5000000,   rep: 8,  x: 1, y: 0, desc: 'Стекло и деньги. Мафия сидит в 64-м этаже и смотрит сверху.' },
  { id: 'rublevka',  name: 'Рублёвка',     short: 'РУБ',  power: 15000, income: 25000000,  rep: 10, x: 0, y: 3, desc: 'Сосны, заборы, охрана. Место, где заканчивается война и начинается статус.' }
];

const JOBS = [
  {
    id: 'phone', name: 'Толкнуть телефон', icon: '📱', ap: 1,
    unlock: () => true,
    desc: 'Скупщик на Савёловском даёт наличные без вопросов.',
    risk: 'риск 15%',
    run() {
      if (Math.random() < 0.15) return { cash: 0, heat: 3, hp: -6, rep: 0, bad: true, msg: 'Телефон оказался «меченым». Пришлось уходить дворами.' };
      const cash = rand(250, 650);
      return { cash, heat: 3, hp: -2, rep: 0, msg: 'Телефон ушёл за ' + fmt(cash) + '.' };
    }
  },
  {
    id: 'courier', name: 'Курьер', icon: '📦', ap: 1,
    unlock: s => s.stage >= 1,
    desc: 'Возить пакеты по городу. Скучно, зато почти безопасно.',
    risk: 'почти без риска',
    run() {
      const cash = rand(450, 900);
      return { cash, heat: 1, hp: -1, rep: 0, msg: 'Смена прошла спокойно: ' + fmt(cash) + '.' };
    }
  },
  {
    id: 'racket', name: 'Собрать дань', icon: '💰', ap: 1,
    unlock: s => ownedDistricts().length > 0,
    desc: 'Пройти по своим точкам и напомнить, кто здесь теперь крыша.',
    risk: 'зависит от районов',
    run() {
      const n = ownedDistricts().length;
      const bonus = 1 + state.hype / 200;
      const cash = Math.round(rand(400, 700) * n * bonus);
      return { cash, heat: 5, hp: -1, rep: 1, msg: 'Собрали с ' + n + ' ' + plural(n, ['района', 'районов', 'районов']) + ': ' + fmt(cash) + '.' };
    }
  },
  {
    id: 'gop', name: 'Гоп-стоп', icon: '🚗', ap: 1,
    unlock: s => s.rep >= 6,
    desc: 'Ночная трасса, тонированная «девятка», разговор через стекло.',
    risk: 'риск 20%',
    run() {
      if (Math.random() < 0.2) return { cash: 0, heat: 8, hp: -12, rep: 0, bad: true, msg: 'Клиент оказался не робким. Ушли с пустыми руками и разбитой губой.' };
      const cash = rand(900, 1800);
      return { cash, heat: 6, hp: -6, rep: 1, msg: 'Ночная смена принесла ' + fmt(cash) + '.' };
    }
  },
  {
    id: 'razvod', name: 'Развести на бабки', icon: '🎭', ap: 1,
    unlock: s => s.rep >= 14,
    desc: 'Схема, документы, пара подставных. Никакого насилия — только психология.',
    risk: 'риск 10%',
    run() {
      if (Math.random() < 0.1) return { cash: 0, heat: 6, hp: 0, rep: 0, bad: true, msg: 'Клиент оказался юристом. Схема рассыпалась, пришлось стереть контакты.' };
      const cash = rand(2500, 5200);
      return { cash, heat: 3, hp: 0, rep: 1, msg: 'Схема сработала: ' + fmt(cash) + '.' };
    }
  },
  {
    id: 'nalet', name: 'Налёт на ломбард', icon: '🔓', ap: 1,
    unlock: s => s.rep >= 20 && crewPower() >= 25,
    desc: 'Три минуты, два человека, один сейф. Нужна бригада.',
    risk: 'риск 25%',
    run() {
      if (Math.random() < 0.25) {
        loseCrew(1);
        return { cash: 0, heat: 14, hp: -15, rep: 0, bad: true, msg: 'Сигнализация сработала раньше времени. Ушли, потеряв человека.' };
      }
      const cash = rand(7000, 15000);
      return { cash, heat: 12, hp: -5, rep: 2, msg: 'Ломбард на Павелецкой: ' + fmt(cash) + '.' };
    }
  },
  {
    id: 'kontrabanda', name: 'Контрабанда', icon: '🚛', ap: 1,
    unlock: s => s.rep >= 28 && crewPower() >= 100,
    desc: 'Фура, таможня, конверт. Главное — не жадничать на конверте.',
    risk: 'риск 15%',
    run() {
      if (Math.random() < 0.15) {
        loseCrew(1);
        return { cash: 0, heat: 20, hp: -10, rep: 0, bad: true, msg: 'Фуру вскрыли на посту. Часть груза и человека потеряли.' };
      }
      const cash = rand(14000, 28000);
      return { cash, heat: 16, hp: -2, rep: 2, msg: 'Фура прошла. На счету ' + fmt(cash) + '.' };
    }
  },
  {
    id: 'reider', name: 'Рейдерский захват', icon: '📑', ap: 1,
    unlock: s => s.rep >= 40 && crewPower() >= 300,
    desc: 'Чужая фирма с хорошими активами. Нужны юристы, охрана и наглость.',
    risk: 'риск 20%',
    run() {
      if (Math.random() < 0.2) {
        loseCrew(2);
        return { cash: 0, heat: 24, hp: -12, rep: 0, bad: true, msg: 'Собственник оказался со связями. Захват сорвался, люди попали в отдел.' };
      }
      const cash = rand(80000, 150000);
      return { cash, heat: 20, hp: -4, rep: 3, msg: 'Фирма перешла под контроль. Активы: ' + fmt(cash) + '.' };
    }
  },
  {
    id: 'offshore', name: 'Офшорная схема', icon: '🌐', ap: 1,
    unlock: s => s.rep >= 52 && state.biz.bank > 0,
    desc: 'Кипр, лицензия, три прокладки. Деньги любят тишину.',
    risk: 'риск 12%',
    run() {
      if (Math.random() < 0.12) return { cash: 0, heat: 18, hp: 0, rep: 0, bad: true, msg: 'Схему вскрыл аудит. Пришлось сжечь документы и заплатить.' };
      const cash = rand(1500000, 3000000);
      return { cash, heat: 12, hp: 0, rep: 3, msg: 'Схема закрыта. Выведено ' + fmtShort(cash) + '.' };
    }
  },
  {
    id: 'scheme', name: 'Крупная афера', icon: '🧠', ap: 1,
    unlock: s => s.rep >= 64 && state.biz.it > 0,
    desc: 'Государственный тендер, три подрядчика, один победитель. Угадайте кто.',
    risk: 'риск 18%',
    run() {
      if (Math.random() < 0.18) return { cash: 0, heat: 26, hp: -5, rep: 0, bad: true, msg: 'Тендер переиграли в последний момент. Убыток и внимание.' };
      const cash = rand(15000000, 30000000);
      return { cash, heat: 18, hp: -3, rep: 4, msg: 'Тендер наш. Прибыль: ' + fmtShort(cash) + '.' };
    }
  }
];

const CONTACTS = [
  {
    id: 'klava', name: 'Тётя Клава', role: 'Родня · Люблино', icon: '🫖',
    unlock: s => s.stage >= 1,
    blurb: 'Троюродная сестра матери. Пустила на койку, кормит борщом и знает всех на рынке.',
    actions: [
      {
        id: 'borrow', label: 'Занять до получки', hint: 'Разово +$600', ap: 1, cost: () => 0,
        once: true, flag: 'klavaBorrow',
        enabled: () => true,
        run() {
          return { cash: 600, rep: -1, msg: 'Клава достала из банки под крупу $600: «Отдашь, когда сможешь. Только не пропади».' };
        }
      }
    ]
  },
  {
    id: 'lawyer', name: 'Адвокат Гольцман', role: 'Юрист · Тверская', icon: '⚖️',
    unlock: s => s.stage >= 2,
    blurb: 'Бывший следователь. Знает, кому звонить, и никогда не спрашивает, зачем.',
    actions: [
      {
        id: 'fix', label: 'Решить вопросы', hint: 'Розыск −20', ap: 1,
        cost: s => 2000 + Math.round(s.heat * 400),
        enabled: s => s.heat >= 5,
        run() {
          return { heat: -20, msg: 'Гольцман снял трубку, сказал «добрый вечер» и вопрос закрылся.' };
        }
      }
    ]
  },
  {
    id: 'alina', name: 'Алина Верещагина', role: 'Журналистка · City', icon: '🎙️',
    unlock: s => s.rep >= 10,
    blurb: 'Пишет про «теневую экономику» так, что её читают и в мэрии, и в Мафии.',
    actions: [
      {
        id: 'interview', label: 'Дать интервью', hint: 'Медиа +12, розыск +3', ap: 1, cost: () => 0,
        enabled: s => s.hype < 95,
        run() {
          return { hype: 12, heat: 3, rep: 1, msg: 'Материал вышел под заголовком «Сибиряк, который не боится». Комментарии горят.' };
        }
      },
      {
        id: 'pr', label: 'PR-кампания', hint: 'Медиа +25', ap: 1, cost: () => 2000000,
        enabled: s => s.hype < 95,
        run() {
          return { hype: 25, rep: 2, msg: 'Алина запустила серию публикаций. О вас говорят в ресторанах и в новостях.' };
        }
      }
    ]
  },
  {
    id: 'banker', name: 'Лев Левченко', role: 'Банкир · Москва-Сити', icon: '🏦',
    unlock: s => s.rep >= 20,
    blurb: 'Финансист новой школы. Деньги для него — не цель, а инструмент. Ваши деньги — тоже.',
    actions: [
      {
        id: 'credit', label: 'Кредит $500 тыс.', hint: 'Долг $650 тыс. через 10 дней', ap: 0, cost: () => 0,
        enabled: s => s.debt === 0,
        run() {
          state.debt = 650000;
          state.debtDay = state.day + 10;
          return { cash: 500000, heat: 2, msg: 'Деньги на счету. Левченко попросил не опаздывать — он не любит сюрпризов.' };
        }
      },
      {
        id: 'bigcredit', label: 'Крупный кредит $5 млн', hint: 'Долг $7 млн через 12 дней', ap: 0, cost: () => 0,
        unlockStage: 5,
        enabled: s => s.debt === 0,
        run() {
          state.debt = 7000000;
          state.debtDay = state.day + 12;
          return { cash: 5000000, heat: 4, msg: 'Пять миллионов под честное слово и залог. Через двенадцать дней — семь.' };
        }
      }
    ]
  },
  {
    id: 'moroz', name: 'Мороз', role: 'Политтехнолог · мэрия', icon: '🏛️',
    unlock: s => s.stage >= 5,
    blurb: 'Человек без должности, который решает вопросы с должностями. Любит конверты и тишину.',
    actions: [
      {
        id: 'deal', label: 'Договориться с мэрией', hint: 'Розыск −50', ap: 1, cost: () => 3000000,
        enabled: s => s.heat >= 20,
        run() {
          return { heat: -50, msg: 'Мороз вышел из кабинета, поправил галстук: «Вас временно не замечают».' };
        }
      }
    ]
  },
  {
    id: 'secretary', name: 'Секретарь Лариса', role: 'Помощник · штаб', icon: '📎',
    unlock: s => s.stage >= 5,
    blurb: 'Держит календарь, знает всех, кому вы должны, и всех, кто должен вам.',
    actions: [
      {
        id: 'hire', label: 'Нанять Ларису', hint: '+1 дело в день навсегда', ap: 0, cost: () => 5000000,
        once: true, flag: 'secretaryHired',
        enabled: () => true,
        run() {
          state.apMax = 4;
          return { msg: 'Лариса вывела календарь в идеальный порядок. В сутках появилось лишнее дело.' };
        }
      }
    ]
  }
];

const ASSETS = [
  { id: 'mansion', name: 'Дом на Рублёвке', icon: '🏡', cost: 85000000,  hype: 15, stage: 5, desc: '1800 м², сосны, вертолётная площадка. Соседи здороваются первыми.' },
  { id: 'yacht',   name: 'Яхта «Сибирячка»', icon: '🛥️', cost: 120000000, hype: 10, stage: 6, desc: '28 метров, экипаж, капитан из Сочи. Летом — Лазурный берег.' },
  { id: 'club',    name: 'Футбольный клуб', icon: '⚽', cost: 260000000, hype: 15, stage: 6, desc: 'Клуб из нижней части таблицы. С вашими деньгами он пойдёт вверх.' },
  { id: 'jet',     name: 'Бизнес-джет',    icon: '✈️', cost: 700000000, hype: 10, stage: 7, desc: 'Свой борт. В Иркутск — четыре часа вместо четырёх дней.' }
];

const CHAPTERS = [
  {
    num: 'I', title: 'Вокзал', place: 'Казанский вокзал · 06:40',
    brief: 'Четыре дня в плацкарте, и вот она — Москва. В кармане $300 и адрес тёти Клавы, записанный на обороте справки. Первое, что нужно, — крыша и хоть какая-то работа.',
    reqText: () => 'Снять койку · $150',
    reqOk: s => s.cash >= 150,
    cost: 150,
    reward: { rep: 3 },
    outro: 'Койка у рынка. Тётя Клава поставила чайник и сказала: «В Москве не пропадёшь, если не будешь борзым. Ну или будешь — но тогда быстро». Утром она отвела Сильвестра на рынок.'
  },
  {
    num: 'II', title: 'Крыша над головой', place: 'Люблинский рынок · 09:20',
    brief: 'Рынок — отдельное государство. Здесь торгуют все, и здесь же решают, кто сколько платит «за воздух». Грузчиком он будет горбатиться до пенсии. Пора меняться.',
    reqText: () => 'Накопить $2 000',
    reqOk: s => s.cash >= 2000,
    cost: 1500,
    reward: { rep: 3 },
    outro: 'Своя комната, свой телефон, свой район. Теперь можно не просто выживать — можно подниматься.'
  },
  {
    num: 'III', title: 'Первая бригада', place: 'Гаражи на Варшавке · 23:10',
    brief: 'На рынке к нему подошли трое: «Слышали, ты с Иркутска. Сибиряки не сдают». Сильвестр не сдал. Через неделю у него были люди, которые смотрели ему в рот.',
    reqText: () => 'Сила бригады ≥ 9',
    reqOk: s => crewPower() >= 9,
    cost: 0,
    reward: { rep: 4 },
    outro: 'Бригада — это не про силу. Это про то, что теперь есть кого послать. И кого потерять.'
  },
  {
    num: 'IV', title: 'Люблино наше', place: 'Люблинский рынок · 14:00',
    brief: 'Рынок платит Мафии — группировке, которая держит юг Москвы. Пора объяснить, что с сегодняшнего дня здесь другие правила.',
    reqText: () => 'Взять район Люблино',
    reqOk: s => !!s.districts.lublino,
    cost: 0,
    reward: { rep: 5, cash: 5000 },
    outro: 'Люблино под контролем. Первый район. Первая крыша. Мафия запомнит имя.'
  },
  {
    num: 'V', title: 'Стрелка', place: 'Баня на Варшавском · 22:30',
    brief: 'Барон, глава Мафии, назначил стрелку. Разговор будет коротким: либо Сильвестр отдаёт Люблино, либо начинается война. За спиной Барона — полтора десятка людей.',
    reqText: () => 'Марьино + сила бригады ≥ 45',
    reqOk: s => !!s.districts.maryino && crewPower() >= 45,
    cost: 0,
    reward: { rep: 8, heat: 8 },
    outro: 'Барон смотрел долго, потом усмехнулся: «Сибиряк. Злой». Война началась, но теперь у неё есть лицо.'
  },
  {
    num: 'VI', title: 'Коронация', place: 'Сход · 01:15',
    brief: 'Четыре района, своя бригада, своя репутация. На сходе спросят: «Кто ты?» Ответ должен быть коротким.',
    reqText: () => '4 района + репутация 70',
    reqOk: s => ownedDistricts().length >= 4 && s.rep >= 70,
    cost: 0,
    reward: { rep: 12, hype: 20 },
    outro: '«Я — Сильвестр. И это мой город». В зале стало тихо. Потом — аплодисменты. Босс.'
  },
  {
    num: 'VII', title: 'Рублёвка', place: 'Рублёво-Успенское шоссе · 08:00',
    brief: 'Дом на Рублёвке — 85 миллионов. Это не про квадратные метры. Это про то, что теперь в спину не смотрят, а смотрят снизу вверх.',
    reqText: () => 'Дом на Рублёвке + капитал $300 млн',
    reqOk: s => s.assets.mansion && netWorth() >= 300000000,
    cost: 0,
    reward: { rep: 10, hype: 25 },
    outro: 'Утро. Сосны. Тишина. Из окна видно, как охрана проверяет номера. Впервые за годы Сильвестр выспался.'
  },
  {
    num: 'VIII', title: '52-е место', place: 'Редакция · 11:00',
    brief: 'Журнал Forbes Россия готовит список богатейших. Чтобы войти в него, мало денег — нужна легенда. У Сильвестра есть и то, и другое.',
    reqText: () => 'Капитал $2,5 млрд',
    reqOk: s => netWorth() >= 2500000000,
    cost: 0,
    reward: { rep: 10, hype: 30 },
    outro: 'Строка 52. Сильвестр. $2,5 млрд. Где-то в Иркутске, в маленькой квартире на Партизанской, по телевизору идёт этот же список.'
  }
];

/* ---- Forbes: вымышленный рейтинг ---- */

const FORBES = [
  ['Аркадий Мирошниченко', 'нефть', 31.5],
  ['Олег Батурин', 'металлургия', 28.4],
  ['Роман Кацнельсон', 'розница', 24.9],
  ['Игорь Вяземский', 'газ', 22.1],
  ['Тимур Асланов', 'телеком', 20.7],
  ['Владимир Стрельцов', 'банки', 19.3],
  ['Сергей Полянский', 'девелопмент', 17.8],
  ['Алексей Дубровин', 'удобрения', 16.4],
  ['Михаил Гурьев', 'сталь', 15.2],
  ['Наталья Ковалёва', 'e-commerce', 14.1],
  ['Андрей Тихонов', 'логистика', 13.0],
  ['Дмитрий Заславский', 'IT', 12.2],
  ['Виктор Штерн', 'химия', 11.4],
  ['Павел Кудряшов', 'уголь', 10.8],
  ['Елена Соловьёва', 'фарма', 10.1],
  ['Борис Гринберг', 'недвижимость', 9.6],
  ['Кирилл Мазуров', 'энергетика', 9.1],
  ['Артём Бельский', 'ритейл', 8.7],
  ['Илья Хайкин', 'финансы', 8.2],
  ['Оксана Тарасова', 'АПК', 7.9],
  ['Григорий Смолин', 'стройка', 7.5],
  ['Денис Кравцов', 'автодилер', 7.1],
  ['Максим Ланской', 'IT', 6.8],
  ['Вадим Гордеев', 'металлы', 6.5],
  ['Светлана Ерёмина', 'косметика', 6.2],
  ['Юрий Ковалёв', 'нефтехимия', 5.9],
  ['Никита Пахомов', 'логистика', 5.7],
  ['Андрей Власов', 'нефтесервис', 5.4],
  ['Марина Гусева', 'ретейл', 5.2],
  ['Игорь Слуцкий', 'стройка', 4.9],
  ['Владислав Ерохин', 'IT', 4.7],
  ['Роман Крылов', 'агро', 4.5],
  ['Анна Лунёва', 'финтех', 4.3],
  ['Пётр Сальников', 'химия', 4.1],
  ['Дмитрий Волков', 'девелопмент', 3.95],
  ['Алишер Рахимов', 'ретейл', 3.8],
  ['Константин Барков', 'банки', 3.65],
  ['Софья Мельник', 'медиа', 3.5],
  ['Артур Геворкян', 'логистика', 3.35],
  ['Михаил Разумов', 'энергетика', 3.2],
  ['Лев Абрамов', 'металлы', 3.08],
  ['Дарья Соколова', 'IT', 2.96],
  ['Игорь Левандовский', 'фарма', 2.85],
  ['Тимур Юсупов', 'нефть', 2.74],
  ['Николай Зайцев', 'стройка', 2.67],
  ['Виктория Орлова', 'финтех', 2.61],
  ['Сергей Дементьев', 'уголь', 2.58],
  ['Руслан Ахметов', 'АПК', 2.55],
  ['Олег Симонов', 'банки', 2.53],
  ['Екатерина Бирюкова', 'ретейл', 2.52],
  ['Аркадий Столяров', 'недвижимость', 2.51],
  ['Александр Пестов', 'логистика', 2.45],
  ['Инна Данилова', 'фарма', 2.38],
  ['Григорий Осипов', 'металлы', 2.31],
  ['Марат Хайруллин', 'АПК', 2.25]
];

const TICKER = [
  'ИРКУТСК · въезд закрыт, карантин продлён',
  'ЧУМА · в городе введён режим ЧС',
  'МОСКВА · рынки работают, цены растут',
  'ЛЮБЛИНО · рынок платит «за воздух»',
  'МАФИЯ · Барон собирает бригады на юге',
  'КУРС · $1 = 92 ₽',
  'ПОГОДА · −3°, снег с дождём',
  'FORBES · готовится новый список богатейших'
];

/* =========================================================
   СОСТОЯНИЕ
   ========================================================= */

function freshState() {
  return {
    v: 1,
    started: false,
    day: 1,
    cash: 300,
    ap: 3,
    apMax: 3,
    hp: 100,
    rep: 0,
    heat: 0,
    hype: 0,
    stage: 0,
    tab: 'hq',
    crew: { shest: 0, boec: 0, avtor: 0, brig: 0, soldier: 0, guard: 0 },
    biz: { wash: 0, tire: 0, market: 0, resto: 0, build: 0, bank: 0, it: 0 },
    districts: {},
    assets: { mansion: false, yacht: false, club: false, jet: false },
    flags: {},
    debt: 0,
    debtDay: 0,
    log: [],
    seenEvents: [],
    lastTicker: ''
  };
}

let state = freshState();

/* =========================================================
   ПРОИЗВОДНЫЕ
   ========================================================= */

function crewPower() {
  return CREW.reduce((sum, c) => sum + (state.crew[c.id] || 0) * c.power, 0);
}

function crewCount() {
  return CREW.reduce((sum, c) => sum + (state.crew[c.id] || 0), 0);
}

function ownedDistricts() {
  return DISTRICTS.filter(d => state.districts[d.id]);
}

function bizSpent(id) {
  const b = BUSINESSES.find(x => x.id === id);
  let total = 0;
  for (let i = 0; i < (state.biz[id] || 0); i++) total += Math.round(b.cost * Math.pow(1.7, i));
  return total;
}

function bizPrice(b) {
  return Math.round(b.cost * Math.pow(1.7, state.biz[b.id] || 0));
}

function assetValue() {
  return ASSETS.reduce((sum, a) => sum + (state.assets[a.id] ? a.cost : 0), 0);
}

function netWorth() {
  let n = Math.max(0, state.cash);
  BUSINESSES.forEach(b => { n += bizSpent(b.id); });
  n += assetValue();
  return n;
}

function dailyIncome() {
  let legal = 0, crime = 0, upkeep = 0, heatCut = 0;
  BUSINESSES.forEach(b => {
    const n = state.biz[b.id] || 0;
    legal += b.income * n;
    heatCut += b.heat * n;
  });
  DISTRICTS.forEach(d => {
    if (state.districts[d.id]) crime += d.income;
  });
  CREW.forEach(c => { upkeep += c.upkeep * (state.crew[c.id] || 0); });
  const hypeBonus = 1 + state.hype / 200;
  return { legal, crime: Math.round(crime * hypeBonus), upkeep, heatCut };
}

function forbesRank(w) {
  return 1 + FORBES.filter(f => f[2] * 1e9 > w).length;
}

/* =========================================================
   УТИЛИТЫ
   ========================================================= */

const $ = sel => document.querySelector(sel);

function addLog(text, type) {
  state.log.unshift({ day: state.day, text, type: type || '' });
  if (state.log.length > 90) state.log.length = 90;
}

function toast(text, type) {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + (type || '');
  const icons = { good: '✓', bad: '!', gold: '★' };
  el.innerHTML = '<span class="t-ic">' + (icons[type] || '•') + '</span><span>' + text + '</span>';
  box.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 320);
  }, 4200);
}

let modalActions = [];

function openModal(opts) {
  const box = $('#modalBox');
  modalActions = opts.actions || [{ label: 'Закрыть', cls: 'ghost' }];
  let body = '';
  if (opts.kicker) body += '<div class="modal-kicker">' + opts.kicker + '</div>';
  body += '<h2 id="modalTitle">' + opts.title + '</h2>';
  body += opts.body || '';
  if (opts.rewards && opts.rewards.length) {
    body += '<div class="m-rewards">' + opts.rewards.map(r => '<span class="chip gold">' + r + '</span>').join('') + '</div>';
  }
  body += '<div class="modal-actions">' + modalActions.map((a, i) =>
    '<button class="btn ' + (a.cls || 'ghost') + '" data-act="mact" data-mi="' + i + '">' + a.label + '</button>'
  ).join('') + '</div>';
  box.innerHTML = body;
  $('#modal').classList.remove('hidden');
}

function closeModal() {
  $('#modal').classList.add('hidden');
  modalActions = [];
}

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    const el = $('#saveState');
    el.textContent = 'Сохранено · день ' + state.day;
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 900);
  } catch (e) { /* localStorage может быть недоступен */ }
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1) return false;
    state = Object.assign(freshState(), data);
    state.crew = Object.assign(freshState().crew, data.crew || {});
    state.biz = Object.assign(freshState().biz, data.biz || {});
    state.assets = Object.assign(freshState().assets, data.assets || {});
    state.districts = data.districts || {};
    state.flags = data.flags || {};
    state.log = data.log || [];
    state.seenEvents = data.seenEvents || [];
    return true;
  } catch (e) {
    return false;
  }
}

function commit() {
  render();
  save();
}

function applyResult(r, title) {
  if (r.cash) state.cash = Math.max(0, state.cash + r.cash);
  if (r.heat) state.heat = clamp(state.heat + r.heat, 0, 100);
  if (r.hp) state.hp = clamp(state.hp + r.hp, 0, 100);
  if (r.rep) state.rep = clamp(state.rep + r.rep, 0, 100);
  if (r.hype) state.hype = clamp(state.hype + r.hype, 0, 100);

  const bits = [];
  if (r.cash) bits.push((r.cash > 0 ? '+' : '') + fmtShort(r.cash));
  if (r.rep) bits.push((r.rep > 0 ? '+' : '') + r.rep + ' реп.');
  if (r.hype) bits.push((r.hype > 0 ? '+' : '') + r.hype + ' медиа');
  if (r.heat) bits.push((r.heat > 0 ? '+' : '') + r.heat + ' розыск');
  if (r.hp) bits.push((r.hp > 0 ? '+' : '') + r.hp + ' HP');

  addLog('<b>' + title + '</b> — ' + r.msg + (bits.length ? ' <span class="muted">(' + bits.join(', ') + ')</span>' : ''), r.bad ? 'bad' : 'good');

  if (r.hp && state.hp <= 0) hospital();

  toast((r.bad ? 'Неудача: ' : '') + r.msg, r.bad ? 'bad' : 'good');
}

function loseCrew(n) {
  for (let k = 0; k < n; k++) {
    const owned = CREW.filter(c => (state.crew[c.id] || 0) > 0);
    if (!owned.length) return;
    const c = pick(owned);
    state.crew[c.id]--;
    addLog('Бригада потеряла человека: <b>' + c.name + '</b>.', 'bad');
  }
}

function hospital() {
  const bill = Math.min(state.cash, 8000);
  state.cash -= bill;
  state.hp = 45;
  state.heat = clamp(state.heat + 5, 0, 100);
  addLog('Больница. Врачи зашили, выписали и выставили счёт на ' + fmt(bill) + '.', 'bad');
  toast('Вы в больнице. Восстановлено 45 HP, счёт ' + fmt(bill) + '.', 'bad');
}

/* =========================================================
   ДЕЙСТВИЯ
   ========================================================= */

function spendAp(n) {
  if (state.ap < n) {
    toast('Нет свободных дел. Нажмите «Следующий день».', 'bad');
    return false;
  }
  state.ap -= n;
  return true;
}

function doJob(id) {
  const job = JOBS.find(j => j.id === id);
  if (!job) return;
  if (!job.unlock(state)) { toast('Это дело пока недоступно.', 'bad'); return; }
  if (!spendAp(job.ap)) return;
  const res = job.run(state);
  applyResult(res, job.name);
  commit();
}

function recruit(id) {
  const c = CREW.find(x => x.id === id);
  if (!c) return;
  if (state.rep < c.rep) { toast('Нужна репутация ' + c.rep + '.', 'bad'); return; }
  if (state.cash < c.cost) { toast('Не хватает денег.', 'bad'); return; }
  state.cash -= c.cost;
  state.crew[c.id] = (state.crew[c.id] || 0) + 1;
  addLog('В бригаде пополнение: <b>' + c.name + '</b>.', 'good');
  toast(c.name + ' в бригаде. Сила: +' + c.power + '.', 'good');
  commit();
}

function buyBiz(id) {
  const b = BUSINESSES.find(x => x.id === id);
  if (!b) return;
  const price = bizPrice(b);
  if (state.cash < price) { toast('Не хватает денег.', 'bad'); return; }
  state.cash -= price;
  state.biz[b.id] = (state.biz[b.id] || 0) + 1;
  addLog('Куплено: <b>' + b.name + '</b> ×' + state.biz[b.id] + '. Доход +' + fmtShort(b.income) + '/день.', 'good');
  toast(b.name + ' — ваша. +' + fmtShort(b.income) + ' в день.', 'good');
  commit();
}

function buyAsset(id) {
  const a = ASSETS.find(x => x.id === id);
  if (!a) return;
  if (state.assets[a.id]) return;
  if (state.stage < a.stage) { toast('Пока рано. Нужна глава ' + a.stage + '.', 'bad'); return; }
  if (state.cash < a.cost) { toast('Не хватает денег.', 'bad'); return; }
  state.cash -= a.cost;
  state.assets[a.id] = true;
  state.hype = clamp(state.hype + a.hype, 0, 100);
  addLog('Статус: <b>' + a.name + '</b>. Медиа +' + a.hype + '.', 'gold');
  toast(a.name + ' — теперь ваша.', 'gold');
  commit();
}

function fightDistrict(id) {
  const d = DISTRICTS.find(x => x.id === id);
  if (!d || state.districts[d.id]) return;
  if (!spendAp(1)) return;

  const power = crewPower();
  const chance = clamp(power / (power + d.power), 0.05, 0.85);
  state.heat = clamp(state.heat + 8, 0, 100);

  if (Math.random() < chance) {
    state.districts[d.id] = true;
    state.rep = clamp(state.rep + d.rep, 0, 100);
    const loot = Math.round(d.income * rand(1, 2));
    state.cash += loot;
    addLog('<b>' + d.name + '</b> под контролем. Трофеи: ' + fmtShort(loot) + '.', 'good');
    openModal({
      kicker: 'Район взят',
      title: d.name,
      body: '<p>' + d.desc + '</p><p>Бригада вошла без потерь. Теперь точка платит вам, а не Мафии. Ежедневный доход района — <b>' + fmtShort(d.income) + '</b>.</p>',
      rewards: ['+' + d.rep + ' репутации', fmtShort(loot) + ' трофеев', '+8 розыска'],
      actions: [{ label: 'Закрепиться', cls: 'primary' }]
    });
  } else {
    loseCrew(1);
    state.hp = clamp(state.hp - 18, 0, 100);
    addLog('Провал на <b>' + d.name + '</b>. Мафия отбилась.', 'bad');
    openModal({
      kicker: 'Район не взят',
      title: d.name,
      body: '<p>Люди Мафии оказались готовы. Бригада отступила, оставив одного человека и немного крови на асфальте.</p><p>Соберите больше силы и попробуйте снова.</p>',
      rewards: ['−1 боец', '−18 HP', '+8 розыска'],
      actions: [{ label: 'Уйти', cls: 'ghost' }]
    });
    if (state.hp <= 0) hospital();
  }
  commit();
}

function completeChapter() {
  const i = state.stage;
  if (i >= CHAPTERS.length) return;
  const ch = CHAPTERS[i];
  if (!ch.reqOk(state)) { toast('Условия главы не выполнены.', 'bad'); return; }
  if (ch.cost && state.cash < ch.cost) { toast('Не хватает денег.', 'bad'); return; }

  if (ch.cost) state.cash -= ch.cost;
  const r = ch.reward || {};
  if (r.rep) state.rep = clamp(state.rep + r.rep, 0, 100);
  if (r.hype) state.hype = clamp(state.hype + r.hype, 0, 100);
  if (r.cash) state.cash += r.cash;
  if (r.heat) state.heat = clamp(state.heat + r.heat, 0, 100);

  state.stage++;
  addLog('Глава ' + ch.num + ' завершена: <b>' + ch.title + '</b>.', 'gold');

  const rewards = [];
  if (r.rep) rewards.push('+' + r.rep + ' репутации');
  if (r.hype) rewards.push('+' + r.hype + ' медиа');
  if (r.cash) rewards.push('+' + fmtShort(r.cash));

  openModal({
    kicker: 'Глава ' + ch.num + ' · завершена',
    title: ch.title,
    body: '<p>' + ch.outro + '</p>',
    rewards,
    actions: [{ label: state.stage >= CHAPTERS.length ? 'Итоги' : 'Дальше', cls: 'primary', fn: afterChapter }]
  });
  commit();
}

function afterChapter() {
  if (state.stage >= CHAPTERS.length && !state.flags.victory) {
    victory();
  } else {
    render();
  }
}

function victory() {
  state.flags.victory = true;
  const w = netWorth();
  const rank = forbesRank(w);
  addLog('Forbes Россия: <b>52-е место</b>. $2,5 млрд.', 'gold');
  openModal({
    kicker: 'Forbes Россия · итог',
    title: '52-е место',
    body:
      '<p><b>Сильвестр. $2,5 млрд. Криминал и легальный бизнес.</b></p>' +
      '<p>Строка пятьдесят два. Между логистом и фармацевтом. Где-то в Иркутске, в маленькой квартире на Партизанской, по телевизору идёт этот же список. Мать смотрит на строку и не сразу понимает, что это её сын.</p>' +
      '<p>Через год снимут карантин, и он всё-таки прилетит домой. Мать встретит его у подъезда, посмотрит и скажет: «Похудел». Это будет дороже любого места в списке.</p>' +
      '<p class="m-quote">«Я не выбирал этот город. Город выбрал меня. Но правила здесь теперь мои».</p>',
    rewards: ['Капитал ' + fmtShort(w), 'Место в списке: ' + rank, 'Репутация ' + Math.round(state.rep)],
    actions: [{ label: 'Продолжить играть', cls: 'gold' }]
  });
}

function bribe() {
  if (state.heat < 5) { toast('Проблем с законом пока нет.', 'good'); return; }
  const cost = 1500 + Math.round(state.heat * 350);
  if (state.cash < cost) { toast('Адвокат просит ' + fmt(cost) + '. Не хватает.', 'bad'); return; }
  state.cash -= cost;
  state.heat = clamp(state.heat - 15, 0, 100);
  addLog('Адвокат закрыл вопрос: розыск −15 (' + fmtShort(cost) + ').', 'good');
  toast('Розыск снижен на 15.', 'good');
  commit();
}

function doctor() {
  if (state.hp >= 100) { toast('Вы в порядке.', 'good'); return; }
  const cost = 500 + Math.round((100 - state.hp) * 45);
  if (state.cash < cost) { toast('Врач просит ' + fmt(cost) + '. Не хватает.', 'bad'); return; }
  state.cash -= cost;
  state.hp = 100;
  addLog('Врач подлатал: HP восстановлено (' + fmtShort(cost) + ').', 'good');
  toast('HP восстановлено до 100.', 'good');
  commit();
}

function contactAction(cid, aid) {
  const c = CONTACTS.find(x => x.id === cid);
  if (!c) return;
  const a = c.actions.find(x => x.id === aid);
  if (!a) return;
  if (!c.unlock(state)) { toast('Этот человек пока недоступен.', 'bad'); return; }
  if (a.unlockStage && state.stage < a.unlockStage) { toast('Пока рано.', 'bad'); return; }
  if (a.once && state.flags[a.flag]) { toast('Уже использовано.', 'bad'); return; }
  const cost = typeof a.cost === 'function' ? a.cost(state) : (a.cost || 0);
  if (state.cash < cost) { toast('Нужно ' + fmt(cost) + '.', 'bad'); return; }
  if (a.enabled && !a.enabled(state)) { toast('Сейчас это не нужно.', 'bad'); return; }
  if (a.ap && !spendAp(a.ap)) return;

  state.cash -= cost;
  if (a.once) state.flags[a.flag] = true;
  const res = a.run(state) || {};
  if (res.cash) state.cash = Math.max(0, state.cash + res.cash);
  if (res.heat) state.heat = clamp(state.heat + res.heat, 0, 100);
  if (res.rep) state.rep = clamp(state.rep + res.rep, 0, 100);
  if (res.hype) state.hype = clamp(state.hype + res.hype, 0, 100);
  if (res.hp) state.hp = clamp(state.hp + res.hp, 0, 100);
  addLog('<b>' + c.name + '</b>: ' + (res.msg || 'договорились.'), 'good');
  toast(res.msg || 'Договорились.', 'good');
  commit();
}

/* =========================================================
   ДЕНЬ
   ========================================================= */

function advanceDay(opts) {
  opts = opts || {};
  state.day++;
  state.ap = state.apMax;

  const inc = dailyIncome();
  const net = inc.legal + inc.crime - inc.upkeep;
  state.cash = Math.max(0, state.cash + net);

  state.heat = clamp(state.heat - 2 - inc.heatCut, 0, 100);
  state.hp = clamp(state.hp + 6, 0, 100);

  const parts = [];
  if (inc.legal) parts.push('+' + fmtShort(inc.legal) + ' легально');
  if (inc.crime) parts.push('+' + fmtShort(inc.crime) + ' с районов');
  if (inc.upkeep) parts.push('−' + fmtShort(inc.upkeep) + ' на бригаду');
  addLog('День ' + state.day + ': ' + (parts.join(' · ') || 'тишина, доходов нет') + '.', net >= 0 ? 'good' : 'bad');

  // долг
  if (state.debt > 0 && state.day >= state.debtDay) {
    if (state.cash >= state.debt) {
      state.cash -= state.debt;
      addLog('Долг закрыт: ' + fmtShort(state.debt) + '.', 'good');
      toast('Долг перед банком закрыт.', 'good');
    } else {
      state.cash = 0;
      state.heat = clamp(state.heat + 25, 0, 100);
      state.rep = clamp(state.rep - 8, 0, 100);
      addLog('Долг не закрыт. Банк передал вопрос «нужным людям».', 'bad');
      toast('Долг не закрыт: розыск +25, репутация −8.', 'bad');
    }
    state.debt = 0;
    state.debtDay = 0;
  }

  // контратаки Мафии
  ownedDistricts().forEach(d => {
    if (Math.random() < 0.1) {
      const def = clamp(crewPower() / (crewPower() + d.power * 0.8), 0.15, 0.92);
      if (Math.random() < def) {
        state.rep = clamp(state.rep + 1, 0, 100);
        addLog('Мафия пыталась отбить <b>' + d.name + '</b> — не вышло.', 'good');
      } else {
        delete state.districts[d.id];
        const loss = Math.round(state.cash * 0.05);
        state.cash = Math.max(0, state.cash - loss);
        addLog('Мафия отбила <b>' + d.name + '</b>. Потери: ' + fmtShort(loss) + '.', 'bad');
        toast('Мафия отбила район ' + d.name + '.', 'bad');
      }
    }
  });

  // облава
  if (state.heat >= 100) {
    const loss = Math.round(state.cash * 0.2);
    state.cash = Math.max(0, state.cash - loss);
    state.heat = 30;
    state.hp = clamp(state.hp - 20, 0, 100);
    loseCrew(1);
    addLog('Облава. Изъято ' + fmtShort(loss) + ', один человек задержан.', 'bad');
    toast('Облава: −' + fmtShort(loss) + ', розыск сброшен до 30.', 'bad');
  }

  if (!opts.silent) {
    save();
    render();
    maybeEvent();
  }
}

function nextDay() {
  if ($('#modal').classList.contains('hidden') === false) return;
  advanceDay();
}

function nextWeek() {
  const before = state.cash;
  const d0 = state.day;
  for (let i = 0; i < 7; i++) advanceDay({ silent: true });
  const diff = state.cash - before;
  addLog('Неделя ' + d0 + '–' + state.day + ': ' + (diff >= 0 ? '+' : '') + fmtShort(diff) + '.', diff >= 0 ? 'good' : 'bad');
  render();
  save();
  openModal({
    kicker: 'Промотка недели',
    title: 'Дни ' + d0 + '–' + state.day,
    body: '<p>Неделя прошла без вашего участия: дела копились, доходы шли, кто-то остался должен.</p>' +
      '<div class="m-list"><div><span>Изменение наличных</span><b>' + (diff >= 0 ? '+' : '') + fmtShort(diff) + '</b></div>' +
      '<div><span>Капитал</span><b>' + fmtShort(netWorth()) + '</b></div>' +
      '<div><span>Розыск</span><b>' + Math.round(state.heat) + '%</b></div>' +
      '<div><span>Дела</span><b>' + state.ap + '/' + state.apMax + '</b></div></div>',
    actions: [{ label: 'Продолжить', cls: 'primary' }]
  });
}

/* =========================================================
   СОБЫТИЯ
   ========================================================= */

const EVENTS = [
  {
    id: 'mafiaBurn',
    when: s => s.stage >= 3,
    kicker: 'Сводка · ночь',
    title: 'Мафия сожгла точку',
    text: s => 'Ночью на рынке сгорел ларёк, который платил вам. На стене — метка Мафии: три полосы. Барон напоминает, кто здесь хозяин.',
    choices: [
      {
        label: 'Восстановить ларёк', cost: 15000,
        run: () => ({ rep: 2, heat: 4, msg: 'Вы отстроили ларёк. Люди это оценили — и запомнили.' })
      },
      {
        label: 'Ответить', cost: 0,
        run: () => { loseCrew(1); return { heat: 12, rep: 5, hp: -8, bad: false, msg: 'Ваши люди нашли поджигателей. Разговор был коротким, но один свой остался в больнице.' }; }
      }
    ]
  },
  {
    id: 'policeRaid',
    when: s => s.heat >= 45,
    kicker: 'Сводка · отдел',
    title: 'Внимание к персоне',
    text: s => 'В отделе на Таганке завели папку. Пока тонкую, но в неё уже подшивают фотографии и фамилии.',
    choices: [
      {
        label: 'Занести конверт ($20 000)', cost: 20000,
        run: () => ({ heat: -25, msg: 'Папка легла в ящик и, кажется, навсегда.' })
      },
      {
        label: 'Ничего не делать', cost: 0,
        run: () => { state.cash = Math.max(0, state.cash - Math.round(state.cash * 0.08)); return { heat: 10, bad: true, msg: 'Ночью кто-то вскрыл сейф. Официально — «неустановленные лица».' }; }
      }
    ]
  },
  {
    id: 'interview',
    when: s => s.hype < 60 && s.rep >= 8,
    kicker: 'Сводка · пресса',
    title: 'Звонок из редакции',
    text: s => 'Журналистка Алина Верещагина хочет сделать материал «о новых лицах московского бизнеса». Она задаёт слишком точные вопросы.',
    choices: [
      {
        label: 'Дать интервью', cost: 0,
        run: () => ({ hype: 12, heat: 3, rep: 1, msg: 'Материал вышел под заголовком «Сибиряк, который не боится». Комментарии горят.' })
      },
      {
        label: 'Отказаться', cost: 0,
        run: () => ({ rep: 2, hype: -2, msg: 'Вы промолчали. В узких кругах это оценили больше, чем интервью.' })
      }
    ]
  },
  {
    id: 'oldFriend',
    when: s => s.stage >= 2,
    kicker: 'Сводка · Люблино',
    title: 'Земляк из Иркутска',
    text: s => 'На рынке окликнули: «Сильвестр? Ты же с Партизанской». Земляк с семьёй снимает угол, работы нет, карантин закрыл ему всё.',
    choices: [
      {
        label: 'Помочь ($5 000)', cost: 5000,
        run: () => ({ rep: 5, msg: 'Земляк ушёл с деньгами и обещанием не подвести. Через неделю он привёл ещё двоих.' })
      },
      {
        label: 'Сделать вид, что не узнал', cost: 0,
        run: () => ({ rep: -2, msg: 'Вы прошли мимо. В Москве так проще. Иногда.' })
      }
    ]
  },
  {
    id: 'traitor',
    when: s => crewPower() >= 30,
    kicker: 'Сводка · штаб',
    title: 'Предатель в бригаде',
    text: s => 'Кто-то сливает Мафии маршруты и суммы. Подозрение на двух людей, и оба ходили с вами с самого рынка.',
    choices: [
      {
        label: 'Выкупить лояльность ($30 000)', cost: 30000,
        run: () => ({ rep: -1, msg: 'Деньги решили вопрос. Один из двоих ушёл сам — и это лучший исход.' })
      },
      {
        label: 'Разобраться жёстко', cost: 0,
        run: () => { loseCrew(1); return { rep: 3, heat: 6, msg: 'Бригада стала тише и злее. Больше утечек не было.' }; }
      }
    ]
  },
  {
    id: 'baronOffer',
    when: s => s.stage >= 4,
    kicker: 'Сводка · Мафия',
    title: 'Предложение Барона',
    text: s => 'Барон передал через человека: «Пусть сибиряк платит как все. Тогда войны не будет». Цифра — $100 000 в месяц.',
    choices: [
      {
        label: 'Заплатить ($100 000)', cost: 100000,
        run: () => ({ heat: -10, rep: -5, msg: 'Вы заплатили. Барон удовлетворён, но теперь считает вас должником.' })
      },
      {
        label: 'Отказаться', cost: 0,
        run: () => ({ heat: 15, rep: 5, msg: 'Ответ был коротким. В Мафии его обсуждали до утра.' })
      }
    ]
  },
  {
    id: 'plagueNews',
    when: s => true,
    kicker: 'Сводка · Иркутск',
    title: 'Письмо из дома',
    text: s => 'Почта принесла конверт без обратного адреса. Внутри — фотография двора на Партизанской и записка: «Всё живы. Держимся. Ты там как?»',
    choices: [
      {
        label: 'Отправить $2 000', cost: 2000,
        run: () => ({ rep: 4, hype: 2, msg: 'Деньги ушли переводом. Через месяц пришла открытка: «Спасибо. Квартиру топят».' })
      },
      {
        label: 'Написать, что всё хорошо', cost: 0,
        run: () => ({ rep: 1, hype: 1, msg: 'Вы написали, что всё хорошо. Это было почти правдой.' })
      }
    ]
  },
  {
    id: 'journalistHit',
    when: s => s.stage >= 5 && s.heat >= 50,
    kicker: 'Сводка · пресса',
    title: 'Расследование',
    text: s => 'В сети вышел материал: «Кто стоит за рынками юга Москвы». Ваша фамилия — в третьем абзаце. Пока без фотографии.',
    choices: [
      {
        label: 'Купить тишину ($500 000)', cost: 500000,
        run: () => ({ heat: -30, msg: 'Материал исчез из сети. Автор получил грант и уехал писать книгу.' })
      },
      {
        label: 'Игнорировать', cost: 0,
        run: () => ({ hype: 10, heat: 15, msg: 'Материал разошёлся по телеграм-каналам. Вас начали узнавать на улице.' })
      }
    ]
  }
];

const IRKUTSK_EVENT = {
  id: 'irkutskOpen',
  kicker: 'Особое событие · Иркутск',
  title: 'Въезд открыли',
  text: s => 'Утром в новостях сказали то, чего ждали два года: карантин в Иркутске снят, въезд открыт. Мать звонит и молчит в трубку. За окном Рублёвка, в кармане — капитал, о котором в Партизанской не мечтали.',
  choices: [
    {
      label: 'Полететь домой ($5 млн)', cost: 5000000,
      run: () => {
        state.flags.irkutskReturned = true;
        return { rep: 10, hype: 10, msg: 'Через четыре часа самолёт сел в Иркутске. Мать встретила у подъезда и сказала: «Похудел».' };
      }
    },
    {
      label: 'Перевести городу $10 млн', cost: 10000000,
      run: () => {
        state.flags.irkutskHelped = true;
        return { rep: 7, hype: 6, msg: 'Деньги ушли в фонд восстановления города. На табличке у больницы — ваша фамилия без должности.' };
      }
    },
    {
      label: 'Не сейчас', cost: 0,
      run: () => ({ heat: -5, hype: -5, rep: -2, msg: 'Вы отложили звонок. Через неделю позвонили снова, и вы снова не взяли.' })
    }
  ]
};

function maybeEvent() {
  if (state.day < 4) return;
  if (!$('#modal').classList.contains('hidden')) return;

  // особое событие
  if (!state.flags.irkutsk && netWorth() >= 500000000 && state.day >= 20) {
    state.flags.irkutsk = true;
    openEvent(IRKUTSK_EVENT);
    return;
  }

  if (Math.random() > 0.38) return;

  const pool = EVENTS.filter(e => e.when(state));
  if (!pool.length) return;
  const ev = pick(pool);
  openEvent(ev);
}

function openEvent(ev) {
  const body = '<p>' + ev.text(state) + '</p>';
  const actions = ev.choices.map(ch => ({
    label: ch.label,
    cls: ch.cost ? 'ghost' : 'primary',
    fn: () => {
      if (ch.cost && state.cash < ch.cost) {
        toast('Не хватает ' + fmt(ch.cost) + '.', 'bad');
        return;
      }
      state.cash = Math.max(0, state.cash - (ch.cost || 0));
      const r = ch.run();
      applyResult(r, ev.title);
      render();
      save();
    }
  }));
  actions.push({ label: 'Позже', cls: 'ghost' });
  openModal({ kicker: ev.kicker, title: ev.title, body, actions });
}

/* =========================================================
   РЕНДЕР
   ========================================================= */

const TABS = [
  { id: 'hq', label: 'Штаб', unlock: () => true },
  { id: 'street', label: 'Улица', unlock: s => s.stage >= 1 },
  { id: 'business', label: 'Бизнес', unlock: s => s.stage >= 2 },
  { id: 'districts', label: 'Районы', unlock: s => s.stage >= 3 },
  { id: 'contacts', label: 'Связи', unlock: s => s.stage >= 2 },
  { id: 'forbes', label: 'Forbes', unlock: () => true }
];

function render() {
  renderHUD();
  renderTicker();
  renderVitals();
  renderGoal();
  renderTabs();
  renderPanel();
  renderFeed();
}

function renderHUD() {
  const apClass = state.ap > 0 ? 'blue' : 'violet';
  $('#hud').innerHTML =
    '<div class="hud-item"><span class="k">День</span><span class="v">' + state.day + '</span></div>' +
    '<div class="hud-item gold"><span class="k">Капитал</span><span class="v">' + fmtShort(netWorth()) + '</span></div>' +
    '<div class="hud-item green"><span class="k">Наличные</span><span class="v">' + fmtShort(state.cash) + '</span></div>' +
    '<div class="hud-item ' + apClass + '"><span class="k">Дела</span><span class="v">' + state.ap + '/' + state.apMax + '</span></div>' +
    '<div class="hud-item violet"><span class="k">Розыск</span><span class="v">' + Math.round(state.heat) + '%</span></div>';
}

let lastTickerKey = '';

function renderTicker() {
  const line = 'ДЕНЬ ' + state.day + ' · ' + gameDate(state.day) + ' · МОСКВА';
  const all = [line].concat(TICKER).map(t => '<span>' + t.replace(/·/g, '<i>·</i>') + '</span>').join('');
  const key = state.day + '|' + state.stage;
  if (key === lastTickerKey) return;
  lastTickerKey = key;
  $('#tickerTrack').innerHTML = all + all;
}

function renderVitals() {
  const items = [
    { cls: 'hp', label: 'Здоровье', val: state.hp },
    { cls: 'rep', label: 'Репутация', val: state.rep },
    { cls: 'hype', label: 'Медиа', val: state.hype },
    { cls: 'heat', label: 'Розыск', val: state.heat }
  ];
  $('#vitals').innerHTML = items.map(it =>
    '<div class="bar-row"><div class="bar-top"><span>' + it.label + '</span><b>' + Math.round(it.val) + '</b></div>' +
    '<div class="bar ' + it.cls + '"><i style="width:' + clamp(it.val, 0, 100) + '%"></i></div></div>'
  ).join('');

  $('#rankBadge').textContent = RANKS[clamp(state.stage, 0, RANKS.length - 1)];

  const bribeCost = 1500 + Math.round(state.heat * 350);
  $('#bribeCost').textContent = state.heat >= 5 ? fmt(bribeCost) : '';
  const bribeBtn = document.querySelector('[data-act="bribe"]');
  if (bribeBtn) bribeBtn.disabled = state.heat < 5;
}

function renderGoal() {
  const pct = clamp(netWorth() / 2500000000 * 100, 0, 100);
  const items = MILESTONES.map(m => {
    const done = state.stage >= m.stage;
    return '<div class="goal-item ' + (done ? 'done' : '') + '"><span class="dot">✓</span><span>' + m.label + '</span></div>';
  }).join('');

  $('#goalCard').innerHTML =
    '<div class="goal-head"><h2>Путь</h2><span>' + state.stage + ' / ' + CHAPTERS.length + '</span></div>' +
    '<div class="goal-list">' + items + '</div>' +
    '<div class="goal-progress"><div class="g-label">Капитал до $2,5 млрд</div>' +
    '<div class="g-big">' + fmtShort(netWorth()) + ' <small>из $2,5 млрд</small></div>' +
    '<div class="g-track"><i style="width:' + pct + '%"></i></div></div>';
}

function renderTabs() {
  $('#tabs').innerHTML = TABS.map(t => {
    const open = t.unlock(state);
    const active = state.tab === t.id ? ' active' : '';
    return '<button class="tab' + active + '" data-act="tab" data-id="' + t.id + '"' + (open ? '' : ' title="Закрыто"') + '>' +
      (open ? '' : '🔒 ') + t.label + '</button>';
  }).join('');
}

function renderPanel() {
  const t = TABS.find(x => x.id === state.tab);
  if (!t || !t.unlock(state)) {
    if (state.tab !== 'hq') {
      state.tab = 'hq';
      renderTabs();
    }
    return renderHQ();
  }
  switch (state.tab) {
    case 'street': return renderStreet();
    case 'business': return renderBusiness();
    case 'districts': return renderDistricts();
    case 'contacts': return renderContacts();
    case 'forbes': return renderForbes();
    default: return renderHQ();
  }
}

function panelHead(title, sub, side) {
  return '<div class="panel-title"><div><h2>' + title + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' +
    (side ? '<div class="side">' + side + '</div>' : '') + '</div>';
}

/* ---- HQ ---- */

function renderHQ() {
  const ch = CHAPTERS[state.stage];
  const inc = dailyIncome();
  const daily = inc.legal + inc.crime - inc.upkeep;

  let html = panelHead('Штаб', 'День ' + state.day + ' · ' + gameDate(state.day) + ' · Москва', 'Глава ' + Math.min(state.stage + 1, CHAPTERS.length) + ' из ' + CHAPTERS.length);

  html += '<div class="stat-grid">' +
    stat('Капитал', fmtShort(netWorth()), 'кэш + активы', 'gold') +
    stat('Доход в день', (daily >= 0 ? '+' : '') + fmtShort(daily), 'легально ' + fmtShort(inc.legal) + ' · улица ' + fmtShort(inc.crime), daily >= 0 ? 'green' : 'red') +
    stat('Бригада', String(crewPower()), crewCount() + ' ' + plural(crewCount(), ['человек', 'человека', 'человек']) + ' · содержание ' + fmtShort(inc.upkeep), 'blue') +
    stat('Районы', ownedDistricts().length + ' / 6', 'под контролем', '') +
    '</div>';
  if (ch) {
    const ok = ch.reqOk(state);
    const canPay = !ch.cost || state.cash >= ch.cost;
    const ready = ok && canPay;
    html += '<div class="mission">' +
      '<div class="mission-tag">Глава ' + ch.num + ' · ' + ch.place + '</div>' +
      '<h3>' + ch.title + '</h3>' +
      '<p>' + ch.brief + '</p>' +
      '<div class="mission-foot">' +
      '<div class="mission-reward">' +
      '<span class="chip ' + (ok ? 'green' : '') + '">' + (ok ? '✓ ' : '') + ch.reqText() + '</span>' +
      (ch.cost ? '<span class="chip ' + (canPay ? 'gold' : 'red') + '">' + fmt(ch.cost) + '</span>' : '') +
      '</div>' +
      '<button class="btn ' + (ready ? 'primary' : 'ghost') + '" data-act="chapter"' + (ready ? '' : ' disabled') + '>' +
      (ready ? 'Завершить главу' : 'Условия не выполнены') + '</button>' +
      '</div></div>';
  } else {
    html += '<div class="mission"><div class="mission-tag">Финал</div><h3>Вы в списке</h3>' +
      '<p>Сильвестр — 52-я строка Forbes Россия. Капитал $2,5 млрд. Дальше — только вверх: скупайте районы, бизнесы и статус.</p></div>';
  }

  html += '<div class="section"><div class="section-title">Сводка</div><div class="list">';
  html += row('📈', 'Доход', 'Легально ' + fmtShort(inc.legal) + ' + улица ' + fmtShort(inc.crime) + ' − бригада ' + fmtShort(inc.upkeep), '<span class="chip ' + (daily >= 0 ? 'green' : 'red') + '">' + (daily >= 0 ? '+' : '') + fmtShort(daily) + '</span>');
  html += row('⚖️', 'Розыск', state.heat >= 70 ? 'Полиция дышит в затылок. Адвокат или деньги.' : 'Пока терпимо. Следите за уровнем.', '<span class="chip ' + (state.heat >= 70 ? 'red' : '') + '">' + Math.round(state.heat) + '%</span>');
  html += row('🎙️', 'Медиа', 'Чем больше шума, тем выше доход с улицы.', '<span class="chip blue">+' + Math.round(state.hype / 2) + '% к улице</span>');
  if (state.debt > 0) {
    html += row('🏦', 'Долг', 'Срок: день ' + state.debtDay + ' · осталось ' + Math.max(0, state.debtDay - state.day) + ' ' + plural(Math.max(0, state.debtDay - state.day), ['день', 'дня', 'дней']), '<span class="chip red">' + fmtShort(state.debt) + '</span>');
  }
  html += '</div></div>';

  $('#panel').innerHTML = html;
}

function stat(k, v, d, cls) {
  return '<div class="stat ' + (cls || '') + '"><div class="s-k">' + k + '</div><div class="s-v">' + v + '</div><div class="s-d">' + d + '</div></div>';
}

function row(icon, title, sub, side, cls) {
  return '<div class="row ' + (cls || '') + '"><div class="row-icon">' + icon + '</div>' +
    '<div class="row-body"><div class="row-title">' + title + '</div><div class="row-sub">' + sub + '</div></div>' +
    '<div class="row-side">' + (side || '') + '</div></div>';
}

/* ---- STREET ---- */

function renderStreet() {
  const inc = dailyIncome();
  let html = panelHead('Улица', 'Дела, бригада, налёты. Каждое дело стоит действия.', 'Сила: ' + crewPower());

  html += '<div class="stat-grid">' +
    stat('Действия', state.ap + ' / ' + state.apMax, 'обновляются каждый день', state.ap > 0 ? 'blue' : 'red') +
    stat('Сила бригады', String(crewPower()), crewCount() + ' ' + plural(crewCount(), ['человек', 'человека', 'человек']), 'green') +
    stat('Доход с районов', '+' + fmtShort(inc.crime), 'с учётом медиа', 'gold') +
    stat('Розыск', Math.round(state.heat) + '%', state.heat >= 70 ? 'опасно' : 'под контролем', state.heat >= 70 ? 'red' : '') +
    '</div>';

  html += '<div class="section"><div class="section-title">Дела</div><div class="list">';
  JOBS.forEach(j => {
    const open = j.unlock(state);
    const can = open && state.ap >= j.ap;
    html += '<div class="row ' + (open ? '' : 'locked') + '">' +
      '<div class="row-icon">' + j.icon + '</div>' +
      '<div class="row-body"><div class="row-title">' + j.name + ' <span class="chip">' + j.ap + ' дело</span> <span class="chip ' + (j.risk.includes('риск') ? 'red' : '') + '">' + j.risk + '</span></div>' +
      '<div class="row-sub">' + j.desc + '</div></div>' +
      '<div class="row-side">' +
      (open
        ? '<button class="btn sm primary" data-act="job" data-id="' + j.id + '"' + (can ? '' : ' disabled') + '>Выполнить</button>'
        : '<span class="chip">закрыто</span>') +
      '</div></div>';
  });
  html += '</div></div>';

  html += '<div class="section"><div class="section-title">Бригада</div><div class="list">';
  CREW.forEach(c => {
    const n = state.crew[c.id] || 0;
    const locked = state.rep < c.rep;
    html += '<div class="row ' + (locked ? 'locked' : '') + '">' +
      '<div class="row-icon">' + c.icon + '</div>' +
      '<div class="row-body"><div class="row-title">' + c.name + (n ? ' <span class="chip green">×' + n + '</span>' : '') + ' <span class="chip">сила ' + c.power + '</span></div>' +
      '<div class="row-sub">' + c.desc + ' Содержание: ' + fmtShort(c.upkeep) + '/день.</div></div>' +
      '<div class="row-side">' +
      (locked
        ? '<span class="chip">репутация ' + c.rep + '</span>'
        : '<button class="btn sm" data-act="recruit" data-id="' + c.id + '"' + (state.cash >= c.cost ? '' : ' disabled') + '>Нанять <span class="cost">' + fmtShort(c.cost) + '</span></button>') +
      '</div></div>';
  });
  html += '</div></div>';

  $('#panel').innerHTML = html;
}

/* ---- BUSINESS ---- */

function renderBusiness() {
  const inc = dailyIncome();
  let html = panelHead('Бизнес', 'Легальные деньги, которые работают без вас.', 'Доход: ' + fmtShort(inc.legal) + '/день');

  html += '<div class="stat-grid">' +
    stat('Легальный доход', '+' + fmtShort(inc.legal), 'в день', 'green') +
    stat('Точек', String(BUSINESSES.reduce((s, b) => s + (state.biz[b.id] || 0), 0)), 'в собственности', '') +
    stat('Снижение розыска', '−' + inc.heatCut + '/день', 'за счёт легальных точек', 'blue') +
    stat('Статус', fmtShort(assetValue()), 'активы', 'gold') +
    '</div>';

  html += '<div class="section"><div class="section-title">Точки</div><div class="list">';
  BUSINESSES.forEach(b => {
    const n = state.biz[b.id] || 0;
    const price = bizPrice(b);
    html += '<div class="row">' +
      '<div class="row-icon">' + b.icon + '</div>' +
      '<div class="row-body"><div class="row-title">' + b.name + (n ? ' <span class="chip green">×' + n + '</span>' : '') + '</div>' +
      '<div class="row-sub">' + b.desc + '</div></div>' +
      '<div class="row-side">' +
      '<span class="chip green">+' + fmtShort(b.income) + '/день</span>' +
      '<span class="chip">−' + b.heat + ' розыск</span>' +
      '<button class="btn sm" data-act="buyBiz" data-id="' + b.id + '"' + (state.cash >= price ? '' : ' disabled') + '>' +
      (n ? 'Ещё точку' : 'Купить') + ' <span class="cost">' + fmtShort(price) + '</span></button>' +
      '</div></div>';
  });
  html += '</div></div>';

  html += '<div class="section"><div class="section-title">Статус</div><div class="list">';
  ASSETS.forEach(a => {
    const owned = state.assets[a.id];
    const locked = state.stage < a.stage;
    html += '<div class="row ' + (locked ? 'locked' : '') + '">' +
      '<div class="row-icon">' + a.icon + '</div>' +
      '<div class="row-body"><div class="row-title">' + a.name + (owned ? ' <span class="chip gold">куплено</span>' : '') + '</div>' +
      '<div class="row-sub">' + a.desc + '</div></div>' +
      '<div class="row-side">' +
      '<span class="chip gold">+' + a.hype + ' медиа</span>' +
      (owned
        ? '<span class="chip green">✓</span>'
        : '<button class="btn sm ' + (locked ? '' : 'gold') + '" data-act="buyAsset" data-id="' + a.id + '"' + (locked || state.cash < a.cost ? ' disabled' : '') + '>' +
          (locked ? 'глава ' + a.stage : 'Купить') + ' <span class="cost">' + fmtShort(a.cost) + '</span></button>') +
      '</div></div>';
  });
  html += '</div></div>';

  $('#panel').innerHTML = html;
}

/* ---- DISTRICTS ---- */

function renderDistricts() {
  const inc = dailyIncome();
  const owned = ownedDistricts().length;
  let html = panelHead('Районы', 'Москва делится на тех, кто платит, и тех, кому платят.', owned + ' / 6 под контролем');

  html += '<div class="stat-grid">' +
    stat('Контроль', owned + ' / 6', 'районов', '') +
    stat('Доход с районов', '+' + fmtShort(inc.crime), 'в день', 'gold') +
    stat('Сила бригады', String(crewPower()), 'нужна для штурма', 'green') +
    stat('Розыск', Math.round(state.heat) + '%', 'война добавляет', state.heat >= 70 ? 'red' : '') +
    '</div>';

  html += '<div class="list">';
  DISTRICTS.forEach(d => {
    const isOwned = !!state.districts[d.id];
    const power = crewPower();
    const chance = Math.round(clamp(power / (power + d.power), 0.05, 0.85) * 100);
    const canTry = !isOwned && state.ap > 0;
    html += '<div class="row ' + (isOwned ? '' : '') + '">' +
      '<div class="row-icon" style="font-family:var(--mono);font-size:11px;letter-spacing:.08em;color:' + (isOwned ? 'var(--green)' : 'var(--ink-3)') + '">' + d.short + '</div>' +
      '<div class="row-body"><div class="row-title">' + d.name + (isOwned ? ' <span class="chip green">наш</span>' : ' <span class="chip red">Мафия</span>') + '</div>' +
      '<div class="row-sub">' + d.desc + '</div></div>' +
      '<div class="row-side">' +
      '<span class="chip gold">+' + fmtShort(d.income) + '/день</span>' +
      (isOwned
        ? '<span class="chip">сила Мафии ' + d.power + '</span>'
        : '<span class="chip ' + (chance >= 60 ? 'green' : chance >= 30 ? '' : 'red') + '">шанс ' + chance + '%</span>' +
          '<button class="btn sm ' + (chance >= 60 ? 'primary' : '') + '" data-act="fight" data-id="' + d.id + '"' + (canTry ? '' : ' disabled') + '>Штурм</button>') +
      '</div></div>';
  });
  html += '</div>';

  html += '<div class="section"><div class="section-title">Как это работает</div>' +
    '<div class="row"><div class="row-icon">🎯</div><div class="row-body">' +
    '<div class="row-title">Шанс штурма</div>' +
    '<div class="row-sub">Шанс = сила вашей бригады против силы Мафии в районе. Проигрыш стоит человека, здоровья и розыска. Мафия может отбивать районы — держите бригаду в форме.</div>' +
    '</div><div class="row-side"><span class="chip">1 дело</span></div></div></div>';

  $('#panel').innerHTML = html;
}

/* ---- CONTACTS ---- */

function renderContacts() {
  let html = panelHead('Связи', 'Люди, которые открывают двери без стука.', state.rep + ' репутации');

  CONTACTS.forEach(c => {
    const open = c.unlock(state);
    html += '<div class="section"><div class="row" style="grid-template-columns:auto minmax(0,1fr);">' +
      '<div class="row-icon">' + c.icon + '</div>' +
      '<div class="row-body"><div class="row-title">' + c.name + ' <span class="chip">' + c.role + '</span>' + (open ? '' : ' <span class="chip red">закрыто</span>') + '</div>' +
      '<div class="row-sub">' + c.blurb + '</div></div></div>';

    if (open) {
      html += '<div class="list" style="margin-top:8px;">';
      c.actions.forEach(a => {
        const cost = typeof a.cost === 'function' ? a.cost(state) : (a.cost || 0);
        const stageOk = !a.unlockStage || state.stage >= a.unlockStage;
        const used = a.once && state.flags[a.flag];
        const enabled = stageOk && !used && (!a.enabled || a.enabled(state)) && state.cash >= cost && (a.ap === 0 || state.ap >= a.ap);
        html += '<div class="row">' +
          '<div class="row-icon" style="font-size:14px">' + (used ? '✓' : a.ap ? '🎲' : '💵') + '</div>' +
          '<div class="row-body"><div class="row-title">' + a.label + ' <span class="chip ' + (cost ? 'gold' : '') + '">' + (cost ? fmtShort(cost) : 'бесплатно') + '</span>' + (a.ap ? ' <span class="chip">' + a.ap + ' дело</span>' : '') + '</div>' +
          '<div class="row-sub">' + a.hint + (used ? ' · уже использовано' : '') + '</div></div>' +
          '<div class="row-side">' +
          (used
            ? '<span class="chip green">готово</span>'
            : '<button class="btn sm" data-act="contact" data-c="' + c.id + '" data-a="' + a.id + '"' + (enabled ? '' : ' disabled') + '>' +
              (stageOk ? 'Действовать' : 'глава ' + a.unlockStage) + '</button>') +
          '</div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
  });

  $('#panel').innerHTML = html;
}

/* ---- FORBES ---- */

function renderForbes() {
  const w = netWorth();
  const rank = forbesRank(w);
  const inList = rank <= FORBES.length;
  const target = 2500000000;
  const pct = clamp(w / target * 100, 0, 100);

  let html = panelHead('Forbes Россия', 'Вымышленный рейтинг. Не связан с реальным журналом.', inList ? 'Место: ' + rank : 'Вне списка');

  html += '<div class="stat-grid">' +
    stat('Ваш капитал', fmtShort(w), 'кэш + активы', 'gold') +
    stat('Место', inList ? String(rank) : '—', rank <= 52 ? 'цель достигнута' : 'цель — 52-е', rank <= 52 ? 'green' : '') +
    stat('До 52-го места', w >= target ? 'достигнуто' : fmtShort(target - w), 'осталось', '') +
    stat('Медиа-вес', Math.round(state.hype), 'влияет на улицу', 'blue') +
    '</div>';

  html += '<div class="goal-progress" style="border-top:0;padding-top:0;margin-bottom:18px;">' +
    '<div class="g-label">Прогресс к $2,5 млрд</div>' +
    '<div class="g-track"><i style="width:' + pct + '%"></i></div></div>';

  html += '<div class="section"><div class="section-title">Список</div>';
  html += '<div class="list" style="max-height:520px;overflow-y:auto;padding-right:4px;">';

  let inserted = false;
  FORBES.forEach((f, i) => {
    const r = i + 1;
    if (r === rank) {
      inserted = true;
      html += '<div class="row highlight"><div class="row-icon" style="font-family:var(--mono);font-size:12px;color:var(--gold)">' + r + '</div>' +
        '<div class="row-body"><div class="row-title">Сильвестр <span class="chip gold">вы</span></div><div class="row-sub">криминал / легальный бизнес</div></div>' +
        '<div class="row-side"><span class="chip gold">' + fmtShort(w) + '</span></div></div>';
    }
    html += '<div class="row"><div class="row-icon" style="font-family:var(--mono);font-size:12px;color:var(--ink-3)">' + r + '</div>' +
      '<div class="row-body"><div class="row-title">' + f[0] + '</div><div class="row-sub">' + f[1] + '</div></div>' +
      '<div class="row-side"><span class="chip">' + fmtShort(f[2] * 1e9) + '</span></div></div>';
  });
  if (!inserted) {
    html += '<div class="row highlight"><div class="row-icon" style="font-family:var(--mono);font-size:12px;color:var(--gold)">' + rank + '</div>' +
      '<div class="row-body"><div class="row-title">Сильвестр <span class="chip gold">вы</span></div><div class="row-sub">криминал / легальный бизнес</div></div>' +
      '<div class="row-side"><span class="chip gold">' + fmtShort(w) + '</span></div></div>';
  }
  html += '</div></div>';

  if (state.flags.victory) {
    html += '<div class="mission" style="margin-top:18px;"><div class="mission-tag">Цель достигнута</div>' +
      '<h3>52-е место</h3><p>Сильвестр вошёл в список Forbes Россия. $2,5 млрд, Рублёвка, собственная гвардия. Игра пройдена — но город всё ещё ваш.</p></div>';
  }

  $('#panel').innerHTML = html;
}

/* ---- FEED ---- */

function renderFeed() {
  const el = $('#feed');
  if (!state.log.length) {
    el.innerHTML = '<div class="empty"><b>Пока тихо</b>Хроника начнётся с первого дня в Москве.</div>';
    return;
  }
  el.innerHTML = state.log.slice(0, 40).map(l =>
    '<div class="feed-item ' + (l.type || '') + '"><div class="feed-time">Д' + l.day + '</div><div class="feed-text">' + l.text + '</div></div>'
  ).join('');
}

/* =========================================================
   СОБЫТИЯ ИНТЕРФЕЙСА
   ========================================================= */

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;

  if (act === 'mact') {
    const a = modalActions[Number(el.dataset.mi)];
    closeModal();
    if (a && typeof a.fn === 'function') a.fn();
    else render();
    return;
  }

  switch (act) {
    case 'tab': {
      const t = TABS.find(x => x.id === el.dataset.id);
      if (!t || !t.unlock(state)) {
        toast('Раздел откроется по ходу истории.', 'bad');
        return;
      }
      state.tab = t.id;
      renderTabs();
      renderPanel();
      save();
      break;
    }
    case 'nextDay': nextDay(); break;
    case 'nextWeek': nextWeek(); break;
    case 'job': doJob(el.dataset.id); break;
    case 'recruit': recruit(el.dataset.id); break;
    case 'buyBiz': buyBiz(el.dataset.id); break;
    case 'buyAsset': buyAsset(el.dataset.id); break;
    case 'fight': fightDistrict(el.dataset.id); break;
    case 'chapter': completeChapter(); break;
    case 'contact': contactAction(el.dataset.c, el.dataset.a); break;
    case 'bribe': bribe(); break;
    case 'doctor': doctor(); break;
    case 'start': startGame(); break;
    case 'help': openHelp(); break;
    case 'reset': confirmReset(); break;
    case 'resetYes':
      try { localStorage.removeItem(SAVE_KEY); } catch (err) {}
      location.reload();
      break;
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) closeModal();
});

function startGame() {
  state.started = true;
  $('#intro').classList.add('hidden');
  addLog('Прибытие в Москву. Казанский вокзал, 06:40. В кармане ' + fmt(state.cash) + '.', 'gold');
  render();
  save();
}

function openHelp() {
  openModal({
    kicker: 'Как играть',
    title: 'Правила улицы',
    body:
      '<p>Вы — <b>Сильвестр</b>, сибиряк из Иркутска. Город закрыт на карантин, вы в Москве с $300 и одной целью: стать хозяином города и войти в список Forbes под номером 52.</p>' +
      '<div class="m-list">' +
      '<div><span>Дела</span><b>' + state.apMax + ' в день</b></div>' +
      '<div><span>Новый день</span><b>доход + дела</b></div>' +
      '<div><span>Улица</span><b>быстрые деньги</b></div>' +
      '<div><span>Бизнес</span><b>деньги без вас</b></div>' +
      '<div><span>Районы</span><b>сила и доход</b></div>' +
      '<div><span>Розыск</span><b>100% = облава</b></div>' +
      '</div>' +
      '<p><b>Совет:</b> легальные точки снижают розыск. Бригада требует содержания каждый день — не нанимайте больше, чем можете прокормить. Мафия может отбить район, если бригада слаба.</p>' +
      '<p>Прогресс сохраняется автоматически в браузере.</p>',
    actions: [{ label: 'Понятно', cls: 'primary' }]
  });
}

function confirmReset() {
  openModal({
    kicker: 'Осторожно',
    title: 'Начать заново?',
    body: '<p>Весь прогресс будет удалён: день, капитал, бригада, районы и место в списке. Это действие нельзя отменить.</p>',
    actions: [
      { label: 'Удалить и начать', cls: 'primary', fn: () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} location.reload(); } },
      { label: 'Отмена', cls: 'ghost' }
    ]
  });
}

/* =========================================================
   СТАРТ
   ========================================================= */

function init() {
  const hasSave = load();
  if (hasSave && state.started) {
    $('#intro').classList.add('hidden');
  } else {
    state = hasSave ? state : freshState();
  }
  if (!state.log.length) {
    addLog('Поезд из Иркутска прибыл на Казанский вокзал. Москва встречает снегом.', '');
  }
  render();
  if (!state.started) {
    // интро остаётся поверх игры
  }
}

init();
