/* =====================================================================
   Prayer-time engine + Hijri calendar. Pure functions, no DOM.

   Solar math is the full Meeus / "Astronomical Algorithms" model — the same
   one adhan.js implements, which is what islom.uz runs in the browser.
   Verified 2026-09-10 against islom.uz's own published tables (Toshkent,
   Nukus, Termiz, Fargʻona, Angren, Zarafshon, Oʻsh — sentyabr 2026,
   7 x 30 x 7 = 1470 checks, all exact) and against adhan.js over a full
   year x all 90 places x 6 waqts = 197 100 checks, all exact.

   islom.uz parameters, used as defaults:
     Bomdod 15.5°, Xufton 15.5°, Asr Hanafiy,
     Shom = quyosh botishi + 4 daqiqa, Ishroq = quyosh chiqishi + 20 daqiqa.

   D.prayer.times(key) → { bomdod, quyosh, peshin, asr, shom, xufton } minutes-of-day
   D.prayer.next()     → { id, time:'HH:MM', minsLeft, current }
   D.hijri.fromKey(key) → { y, m, d }
   ===================================================================== */
(function () {
  'use strict';
  const RAD = Math.PI / 180;
  const dtr = (d) => d * RAD, rtd = (r) => r / RAD;
  const sin = (x) => Math.sin(dtr(x)), cos = (x) => Math.cos(dtr(x)), tan = (x) => Math.tan(dtr(x));
  const nb = (v, max) => v - max * Math.floor(v / max);
  const unwind = (a) => nb(a, 360);
  // shift an angle into -180..180 so a transit correction never wraps the wrong way
  const qshift = (a) => (a >= -180 && a <= 180 ? a : a - 360 * Math.round(a / 360));

  /* ---- defaults: islom.uz ---- */
  const DEF = { lat: 41.300872, lng: 69.241813, fajr: 15.5, isha: 15.5, asr: 'hanafi', shom: 4, ishroq: 20 };

  /* ------------------------------------------------------------------ */
  /* solar coordinates (Meeus)                                           */
  /* ------------------------------------------------------------------ */
  function julianDay(y, m, d, hours) {
    const H = hours || 0;
    const Y = m > 2 ? y : y - 1, M = m > 2 ? m : m + 12, Dd = d + H / 24;
    const A = Math.trunc(Y / 100), B = 2 - A + Math.trunc(A / 4);
    return Math.trunc(365.25 * (Y + 4716)) + Math.trunc(30.6001 * (M + 1)) + Dd + B - 1524.5;
  }
  const jc = (jd) => (jd - 2451545.0) / 36525;
  const meanSolarLongitude = (T) => unwind(280.4664567 + 36000.76983 * T + 0.0003032 * T * T);
  const meanLunarLongitude = (T) => unwind(218.3165 + 481267.8813 * T);
  const ascNode = (T) => unwind(125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000);
  const meanSolarAnomaly = (T) => unwind(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const eqCenter = (T, M) => sin(M) * (1.914602 - 0.004817 * T - 0.000014 * T * T) + sin(2 * M) * (0.019993 - 0.000101 * T) + sin(3 * M) * 0.000289;
  function apparentSolarLongitude(T, L0) {
    const lon = L0 + eqCenter(T, meanSolarAnomaly(T)), O = 125.04 - 1934.136 * T;
    return unwind(lon - 0.00569 - 0.00478 * sin(O));
  }
  const meanObliquity = (T) => 23.439291 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
  const apparentObliquity = (T, e0) => e0 + 0.00256 * cos(125.04 - 1934.136 * T);
  const meanSiderealTime = (T) => {
    const jd = T * 36525 + 2451545.0;
    return unwind(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000);
  };
  const nutLon = (L0, Lp, O) => (-17.2 / 3600) * sin(O) - (1.32 / 3600) * sin(2 * L0) - (0.23 / 3600) * sin(2 * Lp) + (0.21 / 3600) * sin(2 * O);
  const nutObl = (L0, Lp, O) => (9.2 / 3600) * cos(O) + (0.57 / 3600) * cos(2 * L0) + (0.1 / 3600) * cos(2 * Lp) - (0.09 / 3600) * cos(2 * O);

  function solarCoords(jd) {
    const T = jc(jd), L0 = meanSolarLongitude(T), Lp = meanLunarLongitude(T), O = ascNode(T);
    const Lam = apparentSolarLongitude(T, L0), Th0 = meanSiderealTime(T);
    const dP = nutLon(L0, Lp, O), dE = nutObl(L0, Lp, O);
    const e0 = meanObliquity(T), eA = apparentObliquity(T, e0);
    return {
      decl: rtd(Math.asin(sin(eA) * sin(Lam))),
      ra: unwind(rtd(Math.atan2(cos(eA) * sin(Lam), cos(Lam)))),
      sidereal: Th0 + (dP * 3600 * cos(e0 + dE)) / 3600,
    };
  }
  const interp = (y2, y1, y3, f) => { const a = y2 - y1, b = y3 - y2, c = b - a; return y2 + (f / 2) * (a + b + f * c); };
  const interpA = (y2, y1, y3, f) => { const a = unwind(y2 - y1), b = unwind(y3 - y2), c = b - a; return y2 + (f / 2) * (a + b + f * c); };
  const altitudeOf = (lat, decl, H) => rtd(Math.asin(sin(lat) * sin(decl) + cos(lat) * cos(decl) * cos(H)));

  /* solar day: transit, sunrise, sunset and an hour-angle solver, all in UTC hours */
  function solarDay(y, m, d, lat, lng) {
    const jd = julianDay(y, m, d);
    const s = solarCoords(jd), p = solarCoords(jd - 1), n = solarCoords(jd + 1);
    const m0 = nb((s.ra - lng - s.sidereal) / 360, 1);

    function hourAngle(alt, afterTransit) {
      const t1 = sin(alt) - sin(lat) * sin(s.decl), t2 = cos(lat) * cos(s.decl);
      const r = t1 / t2;
      if (!isFinite(r) || r < -1 || r > 1) return NaN;   // sun never reaches that altitude here today
      const H0 = rtd(Math.acos(r));
      const mm = afterTransit ? m0 + H0 / 360 : m0 - H0 / 360;
      const theta = unwind(s.sidereal + 360.985647 * mm);
      const a = unwind(interpA(s.ra, p.ra, n.ra, mm));
      const del = interp(s.decl, p.decl, n.decl, mm);
      const H = theta + lng - a;
      const h = altitudeOf(lat, del, H);
      return (mm + (h - alt) / (360 * cos(del) * cos(lat) * sin(H))) * 24;
    }
    const transit = (() => {
      const theta = unwind(s.sidereal + 360.985647 * m0);
      const a = unwind(interpA(s.ra, p.ra, n.ra, m0));
      return (m0 + qshift(theta + lng - a) / -360) * 24;
    })();
    const SUN = -50 / 60;   // standard refraction + solar radius
    return {
      transit,
      sunrise: hourAngle(SUN, false),
      sunset: hourAngle(SUN, true),
      hourAngle,
      // asr: shadow of length k plus the noon shadow
      afternoon: (k) => hourAngle(rtd(Math.atan(1 / (k + tan(Math.abs(lat - s.decl))))), true),
    };
  }

  function tzOffsetHours(key) {
    // offset of settings.tz at that date, in hours
    try {
      const { y, m, d } = D.parseKey(key);
      const utcNoon = Date.UTC(y, m - 1, d, 12);
      const p = D.nowTz(new Date(utcNoon));
      const local = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min);
      return (local - utcNoon) / 3600000;
    } catch (e) { return 5; }
  }

  /* One-time move onto the islom.uz method. The old engine hard-defaulted to
     18°/18°, so anyone still sitting on exactly those never chose them —
     clear the values and let the new defaults apply. A deliberate setting
     (anything but 18) is left alone. */
  /* No module-level latch: the stored state can land after the first read,
     so the flag has to live on the settings object itself. */
  function migrate() {
    if (!D.S || !D.S.settings) return;
    const st = D.S.settings.prayer;
    if (!st) return;
    let dirty = false;
    // settings still holding the old hard default of 18°/18° → clear it, so islom.uz's applies
    if (!st.methodV2) {
      if (+st.fajr === 18) delete st.fajr;
      if (+st.isha === 18) delete st.isha;
      st.methodV2 = true; dirty = true;
    }
    // The old default coordinate sat ~150 m from islom.uz's Toshkent, and a city
    // picked from the list used to be rounded to 4 decimals. Either can move a
    // waqt by a minute on a day or two a year — snap both back to the exact ones.
    if (!st.placeV2) {
      if (!st.place && Math.abs(+st.lat - 41.2995) < 1e-6 && Math.abs(+st.lng - 69.2401) < 1e-6) {
        st.lat = DEF.lat; st.lng = DEF.lng;
      } else if (st.place) {
        const p = prayer.places.find((x) => x.n === st.place);
        if (p && Math.abs(p.lat - +st.lat) < 1e-4 && Math.abs(p.lng - +st.lng) < 1e-4) {
          st.lat = p.lat; st.lng = p.lng; st.fromList = true;
        }
      }
      st.placeV2 = true; dirty = true;
    }
    if (dirty) try { D.save(); } catch (e) {}
  }

  const prayer = {
    /* the resolved location + method, so callers never re-read raw settings */
    conf() {
      migrate();
      const st = (D.S && D.S.settings.prayer) || {};
      const lat = Number.isFinite(+st.lat) ? +st.lat : DEF.lat;
      const lng = Number.isFinite(+st.lng) ? +st.lng : DEF.lng;
      return {
        lat, lng,
        fajr: +st.fajr || DEF.fajr,
        isha: +st.isha || DEF.isha,
        asr: st.asr === 'shafi' ? 'shafi' : DEF.asr,
        shom: Number.isFinite(+st.shomOffset) ? +st.shomOffset : DEF.shom,
        place: st.place || '',
      };
    },
    times(key) {
      key = key || D.today();
      const c = prayer.conf();
      const { y, m, d } = D.parseKey(key);
      const tz = tzOffsetHours(key);
      const sd = solarDay(y, m, d, c.lat, c.lng);
      const k = c.asr === 'shafi' ? 1 : 2;

      let bomdod = sd.hourAngle(-c.fajr, false);
      let xufton = sd.hourAngle(-c.isha, true);
      // Above ~48° the sun can stay too high for a 15.5° twilight in summer.
      // adhan's default HighLatitudeRule (middle of the night) fills the gap.
      if (isFinite(sd.sunrise) && isFinite(sd.sunset)) {
        const nextRise = solarDay(...(() => { const n = D.parseKey(D.addDays(key, 1)); return [n.y, n.m, n.d, c.lat, c.lng]; })()).sunrise;
        const night = isFinite(nextRise) ? nextRise + 24 - sd.sunset : 24 - (sd.sunset - sd.sunrise);
        const safeFajr = sd.sunrise - night / 2, safeIsha = sd.sunset + night / 2;
        if (!isFinite(bomdod) || safeFajr > bomdod) bomdod = safeFajr;
        if (!isFinite(xufton) || safeIsha < xufton) xufton = safeIsha;
      }
      // polar day/night: no sunrise at all — keep the table readable rather than blank
      const rise = isFinite(sd.sunrise) ? sd.sunrise : sd.transit - 6;
      const set = isFinite(sd.sunset) ? sd.sunset : sd.transit + 6;
      if (!isFinite(bomdod)) bomdod = rise - 1.5;
      if (!isFinite(xufton)) xufton = set + 1.5;
      let asr = sd.afternoon(k);
      if (!isFinite(asr)) asr = sd.transit + 3.5;

      const raw = {
        bomdod, quyosh: rise, peshin: sd.transit, asr,
        shom: set + c.shom / 60, xufton,
      };
      const off = (D.S && D.S.settings.prayer && D.S.settings.prayer.offsets) || {};
      const res = {};
      for (const id of Object.keys(raw)) res[id] = Math.round(nb(raw[id] + tz, 24) * 60 + (+off[id] || 0));
      return res;
    },
    fmt: (mins) => D.fmtTime(Math.floor(mins / 60) % 24, mins % 60),
    list(key) {
      const t = prayer.times(key);
      return ['bomdod', 'quyosh', 'peshin', 'asr', 'shom', 'xufton'].map((id) => ({ id, mins: t[id], time: prayer.fmt(t[id]) }));
    },
    // end of the makruh window after sunrise — islom.uz calls it Ishroq
    ishroq(key) {
      const t = prayer.times(key);
      return (t.quyosh + DEF.ishroq) % 1440;
    },
    // next prayer from now; also which waqt is current
    next(now) {
      try {
        const p = D.nowTz(now);
        const key = D.keyOf(p.y, p.m, p.d);
        const nowM = p.h * 60 + p.min;
        // Joriy vaqtni QUYOSH bilan birga sanaymiz, keyingi namozni esa usiz.
        // Quyosh chiqishi bomdod oynasini YOPADI. Ilgari u ro'yxatdan butunlay
        // chiqarib tashlanardi, shuning uchun soat 10:00 da ham «joriy vaqt: Bomdod»
        // deb turardi — bomdod tugaganiga to'rt soat bo'lgan bo'lsa ham.
        // ibodat.js dagi timesTable() allaqachon to'g'ri sanaydi (u quyoshni
        // qoldiradi), ya'ni bitta ekranda jadval «Quyosh» qatorini joriy deb
        // belgilab turgan paytda hero «Bomdod» derdi.
        const full = prayer.list(key);
        const list = full.filter((x) => x.id !== 'quyosh');
        let cur = null;
        for (const x of full) if (x.mins <= nowM) cur = x.id;
        const nx = list.find((x) => x.mins > nowM);
        if (nx) return { id: nx.id, time: nx.time, minsLeft: nx.mins - nowM, current: cur, key };
        const tomorrow = prayer.list(D.addDays(key, 1))[0];
        return { id: 'bomdod', time: tomorrow.time, minsLeft: 24 * 60 - nowM + tomorrow.mins, current: cur || 'xufton', key };
      } catch (e) { return null; }
    },
    // which waqt a timestamp falls in (for auto-classifying "on time" vs qaza)
    waqtAt(ts) {
      const p = D.nowTz(new Date(ts));
      const key = D.keyOf(p.y, p.m, p.d), nowM = p.h * 60 + p.min;
      // next() bilan bir xil qoida: quyosh bomdod oynasini yopadi.
      // Aks holda soat 09:00 dagi namoz bomdod vaqtida deb yozilib, qazo
      // bo'lgani holda «vaqtida» deb belgilanardi.
      let cur = null;
      for (const x of prayer.list(key)) if (x.mins <= nowM) cur = x.id;
      return { key, waqt: cur };
    },
    // qibla bearing from settings location
    qibla() {
      const c = prayer.conf();
      const kLat = 21.4225, kLng = 39.8262;
      const dL = kLng - c.lng;
      const b = rtd(Math.atan2(sin(dL), cos(c.lat) * tan(kLat) - sin(c.lat) * cos(dL)));
      return unwind(b);
    },
    /* Uzbek regions, coordinates straight from islom.uz. Used for the
       city picker and to name whatever GPS hands us. */
    /* Shaharlar va koordinatalar islom.uz ro'yxatidan (new.islom.uz/api/v1/regions,
       90 ta joy, 2026-09-10 da olingan). Sayt differ_minute maydonini qo'llamaydi —
       har bir joyning o'z koordinatasidan hisoblaydi, biz ham shunday qilamiz.
       `c` — qidiruv uchun kirillcha nomlar: o'zbekchasi va (farq qilsa) ruschasi. */
    places: [
      /* islom.uz viloyat markazlari (saytdagi tartibda) */
      { n: 'Toshkent', c: 'Тошкент Ташкент', lat: 41.300872, lng: 69.241813 },
      { n: 'Andijon', c: 'Андижон Андижан', lat: 40.786215, lng: 72.328205 },
      { n: 'Buxoro', c: 'Бухоро Бухара', lat: 39.7723, lng: 64.423324 },
      { n: 'Guliston', c: 'Гулистон Гулистан', lat: 40.49255, lng: 68.777611 },
      { n: 'Samarqand', c: 'Самарқанд Самарканд', lat: 39.65065, lng: 66.97646 },
      { n: 'Namangan', c: 'Наманган', lat: 41.005175, lng: 71.643583 },
      { n: 'Navoiy', c: 'Навоий Навои', lat: 40.102403, lng: 65.367579 },
      { n: 'Jizzax', c: 'Жиззах Джизак', lat: 40.122196, lng: 67.873275 },
      { n: 'Nukus', c: 'Нукус', lat: 42.471325, lng: 59.61682 },
      { n: 'Qarshi', c: 'Қарши Карши', lat: 38.830248, lng: 65.778764 },
      { n: 'Qoʻqon', c: 'Қўқон Коканж', lat: 40.535509, lng: 70.937948 },
      { n: 'Xiva', c: 'Хива', lat: 41.389141, lng: 60.350174 },
      { n: 'Margʻilon', c: 'Марғилон Маргилан', lat: 40.47111, lng: 71.72472 },
      /* qolgan shaharlar, alifbo tartibida */
      { n: 'Angren', c: 'Ангрен', lat: 41.008146, lng: 70.077367 },
      { n: 'Arnasoy', c: 'Арнасой Арнасай', lat: 40.605335, lng: 67.799755 },
      { n: 'Ashxabod', c: 'Ашхабод Ашхабад', lat: 37.983693, lng: 58.301086 },
      { n: 'Bekobod', c: 'Бекобод Бекабад', lat: 40.22083, lng: 69.26972 },
      { n: 'Bishkek', c: 'Бишкек', lat: 42.87157, lng: 74.598038 },
      { n: 'Boysun', c: 'Бойсун Байсун', lat: 38.20047, lng: 67.203991 },
      { n: 'Buloqboshi', c: 'Булоқбоши Булакбаши', lat: 40.606746, lng: 72.484615 },
      { n: 'Burchmulla', c: 'Бурчмулла', lat: 41.598232, lng: 70.101865 },
      { n: 'Chimboy', c: 'Чимбой Чимбай', lat: 42.945065, lng: 59.778851 },
      { n: 'Chimkent', c: 'Чимкент', lat: 42.340823, lng: 69.589995 },
      { n: 'Chortoq', c: 'Чортоқ Чатрак', lat: 41.070518, lng: 71.820193 },
      { n: 'Chust', c: 'Чуст', lat: 41.005111, lng: 71.235968 },
      { n: 'Dehqonobod', c: 'Деҳқонобод Дехканабад', lat: 38.358959, lng: 66.489929 },
      { n: 'Denov', c: 'Денов Денау', lat: 38.33333, lng: 67.83333 },
      { n: 'Doʻstlik', c: 'Дўстлик Дустлик', lat: 40.528459, lng: 68.030412 },
      { n: 'Dushanbe', c: 'Душанбе', lat: 38.560052, lng: 68.786846 },
      { n: 'Fargʻona', c: 'Фарғона Фергана', lat: 40.376952, lng: 71.793129 },
      { n: 'Gʻallaorol', c: 'Ғаллаорол Галлаарал', lat: 40.665277, lng: 67.244211 },
      { n: 'Gʻazalkent', c: 'Ғазалкент', lat: 41.5659, lng: 69.7704 },
      { n: 'Gazli', c: 'Газли', lat: 40.12947, lng: 63.457245 },
      { n: 'Gʻuzor', c: 'Ғузор Гузор', lat: 38.520046, lng: 66.142491 },
      { n: 'Jalolobod', c: 'Жалолобод Джалалабад', lat: 40.93177, lng: 72.982601 },
      { n: 'Jambul', c: 'Жамбул Джамбул', lat: 44.23807, lng: 72.346934 },
      { n: 'Jomboy', c: 'Жомбой Джамбай', lat: 39.69889, lng: 67.09333 },
      { n: 'Kattaqoʻrgʻon', c: 'Каттақўрғон Каттакурган', lat: 39.90129, lng: 66.269495 },
      { n: 'Konibodom', c: 'Конибодом Канибадам', lat: 40.297416, lng: 70.425968 },
      { n: 'Konimex', c: 'Конимех Канимех', lat: 40.271337, lng: 65.148668 },
      { n: 'Koson', c: 'Косон Касан', lat: 39.041041, lng: 65.590889 },
      { n: 'Kosonsoy', c: 'Косонсой Касансай', lat: 41.250312, lng: 71.544702 },
      { n: 'Mingbuloq', c: 'Мингбулоқ Мингбулак', lat: 42.255591, lng: 62.862908 },
      { n: 'Moʻynoq', c: 'Мўйноқ Муйнак', lat: 43.783621, lng: 59.025581 },
      { n: 'Muborak', c: 'Муборак Мубарек', lat: 39.262229, lng: 65.156092 },
      { n: 'Nurota', c: 'Нурота Нурата', lat: 40.564163, lng: 65.70086 },
      { n: 'Oʻgʻiz', c: 'Ўғиз Огуз', lat: 42.022119, lng: 65.332689 },
      { n: 'Olmaota', c: 'Олмаота Алмата', lat: 43.219699, lng: 76.86939 },
      { n: 'Olot', c: 'Олот Алат', lat: 39.405125, lng: 63.795209 },
      { n: 'Oltiariq', c: 'Олтиариқ Олтыарик', lat: 40.26395, lng: 71.852609 },
      { n: 'Oltinkoʻl', c: 'Олтинкўл Алтынкуль', lat: 42.772018, lng: 59.142859 },
      { n: 'Oʻsh', c: 'Ўш Ош', lat: 40.51524, lng: 72.815204 },
      { n: 'Oʻsmat', c: 'Ўсмат Усмат', lat: 39.736121, lng: 67.652669 },
      { n: 'Paxtaobod', c: 'Пахтаобод Пахтаабад', lat: 40.339467, lng: 68.175706 },
      { n: 'Pop', c: 'Поп Пап', lat: 40.880613, lng: 71.102295 },
      { n: 'Qiziltepa', c: 'Қизилтепа Кизилтепа', lat: 40.05517, lng: 64.822082 },
      { n: 'Qoʻngʻirot', c: 'Қўнғирот Кунгират', lat: 43.060726, lng: 58.862514 },
      { n: 'Qorakoʻl', c: 'Қоракўл Каракул', lat: 39.495808, lng: 63.856634 },
      { n: 'Qoʻrgʻontepa', c: 'Қўрғонтепа Кургантепа', lat: 40.731087, lng: 72.759757 },
      { n: 'Qorovulbozor', c: 'Қоровулбозор Каравулбазар', lat: 39.488766, lng: 64.759067 },
      { n: 'Qumqoʻrgʻon', c: 'Қумқўрғон Кумкурган', lat: 37.819965, lng: 67.599609 },
      { n: 'Quva', c: 'Қува Кува', lat: 40.523064, lng: 72.070085 },
      { n: 'Rishton', c: 'Риштон Риштан', lat: 40.362995, lng: 71.27552 },
      { n: 'Sayram', c: 'Сайрам', lat: 42.301081, lng: 69.752523 },
      { n: 'Shahrixon', c: 'Шаҳрихон Шахрихан', lat: 40.715027, lng: 72.060484 },
      { n: 'Sherobod', c: 'Шеробод Шерабад', lat: 37.669969, lng: 67.014584 },
      { n: 'Shovot', c: 'Шовот Шават', lat: 41.654125, lng: 60.293054 },
      { n: 'Shumanay', c: 'Шуманай', lat: 42.63885, lng: 58.926029 },
      { n: 'Tallimarjon', c: 'Таллимаржон Талимарджан', lat: 38.383559, lng: 65.619262 },
      { n: 'Taxtakoʻpir', c: 'Тахтакўпир Тахтакупир', lat: 43.016883, lng: 60.310256 },
      { n: 'Termiz', c: 'Термиз Термез', lat: 37.258528, lng: 67.308346 },
      { n: 'Tomdi', c: 'Томди Тамды', lat: 41.757288, lng: 64.626303 },
      { n: 'Toʻrtkoʻl', c: 'Тўрткўл Турткуль', lat: 41.549257, lng: 60.991887 },
      { n: 'Toshhovuz', c: 'Тошҳовуз Ташхавуз', lat: 41.837891, lng: 59.963473 },
      { n: 'Turkiston', c: 'Туркистон Туркестан', lat: 43.306769, lng: 68.248173 },
      { n: 'Turkmanobod', c: 'Туркманобод Туркменабад', lat: 39.014272, lng: 63.562335 },
      { n: 'Uchqoʻrgʻon', c: 'Учқўрғон Учкурган', lat: 41.121434, lng: 72.088502 },
      { n: 'Uchquduq', c: 'Учқудуқ Учкудук', lat: 42.152718, lng: 63.562435 },
      { n: 'Uchtepa', c: 'Учтепа', lat: 41.502101, lng: 66.151155 },
      { n: 'Urganch', c: 'Урганч Ургенч', lat: 41.553823, lng: 60.620611 },
      { n: 'Urgut', c: 'Ургут', lat: 39.415816, lng: 67.2477 },
      { n: 'Uzunquduq', c: 'Узунқудуқ Узункудук', lat: 41.095886, lng: 63.229079 },
      { n: 'Xazorasp', c: 'Хазорасп Хазарасп', lat: 41.301795, lng: 61.090421 },
      { n: 'Xoʻjand', c: 'Хўжанд Ходжанд', lat: 40.2833322, lng: 69.6333308 },
      { n: 'Xoʻjaobod', c: 'Хўжаобод Ходжаабад', lat: 40.666157, lng: 72.565383 },
      { n: 'Xonobod', c: 'Хонобод Ханабад', lat: 40.799431, lng: 72.990006 },
      { n: 'Xonqa', c: 'Хонқа Ханка', lat: 41.474607, lng: 60.783834 },
      { n: 'Yangibozor', c: 'Янгибозор Янгибазар', lat: 41.318903, lng: 69.527575 },
      { n: 'Zarafshon', c: 'Зарафшон Зарафшан', lat: 41.573315, lng: 64.184617 },
      { n: 'Zomin', c: 'Зомин Замин', lat: 39.964589, lng: 68.393473 },
    ],
    /* Is the current location one of islom.uz's own places? Only then do our
       times land on the site's published table minute for minute; a GPS fix a
       few km away is right for that spot but not the same as the city row. */
    listed() {
      const c = prayer.conf();
      return prayer.places.find((p) => Math.abs(p.lat - c.lat) < 6e-5 && Math.abs(p.lng - c.lng) < 6e-5) || null;
    },
    // closest known place to a coordinate — labels a GPS fix without a network call
    nearest(lat, lng) {
      let best = null, bd = Infinity;
      for (const p of prayer.places) {
        const dx = (p.lng - lng) * cos((p.lat + lat) / 2), dy = p.lat - lat;
        const d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = p; }
      }
      return best && bd < 4 ? best : null;   // ~2° ≈ 200 km; further away, don't guess a name
    },
    /* Qibla — Ka'ba tomon yo'nalish, shimoldan soat strelkasi bo'yicha gradusda.
       Yer sferasida ikki nuqta orasidagi eng qisqa yo'l — katta doira, shuning
       uchun bu «xaritada to'g'ri chiziq» emas: Toshkentdan qibla janubi-g'arb
       emas, g'arbdan biroz janubda chiqadi. Formula shuni beradi. */
    qibla(lat, lng) {
      const KA_LAT = 21.4224779, KA_LNG = 39.8251832;   // Ka'ba, yaxlitlanmagan
      const φ1 = lat * RAD, φ2 = KA_LAT * RAD, Δλ = (KA_LNG - lng) * RAD;
      const y = Math.sin(Δλ);
      const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
      return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    },
  };
  D.prayer = prayer;

  /* Hijri (Kuwaiti algorithm) */
  const hijri = {
    fromKey(key) {
      try {
        let { y, m, d } = D.parseKey(key || D.today());
        const off = (D.S && D.S.settings.prayer && +D.S.settings.prayer.hijriOffset) || 0;
        if (off) { const k2 = D.addDays(key, off); ({ y, m, d } = D.parseKey(k2)); }
        const a = Math.floor((m - 14) / 12);
        const JD = Math.floor((1461 * (y + 4800 + a)) / 4) + Math.floor((367 * (m - 2 - 12 * a)) / 12) - Math.floor((3 * Math.floor((y + 4900 + a) / 100)) / 4) + d - 32075;
        let l = JD - 1948440 + 10632;
        const n = Math.floor((l - 1) / 10631);
        l = l - 10631 * n + 354;
        const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
        l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
        const month = Math.floor((24 * l) / 709);
        return { d: l - Math.floor((709 * month) / 24), m: month, y: 30 * n + j - 30 };
      } catch (e) { return null; }
    },
    fmt(key) { const h = hijri.fromKey(key); return h ? `${h.d} ${D.t('hijri.months')[h.m - 1]} ${h.y}` : ''; },
    isRamadan(key) { const h = hijri.fromKey(key); return !!h && h.m === 9; },
    // sunnah fasting suggestions for a day
    // Ro'za tutish man etilgan kunlar (ayyom an-nahy). Beshta:
    //   1 Shavvol            — Iyd al-Fitr
    //   10 Zulhijja          — Iyd al-Adho
    //   11, 12, 13 Zulhijja  — tashriq kunlari
    // sunnahFast() bulardan hech birida tavsiya bermasligi kerak. Ilgari berardi:
    // 10-12 Zulhijja va 1 Shavvol dushanba yoki payshanbaga to'g'ri kelsa 'mon_thu'
    // bo'lib chiqardi, 13 Zulhijja esa [13,14,15] sharti bilan 'ayyam_bid' bo'lardi.
    forbiddenFast(key) {
      const h = hijri.fromKey(key); if (!h) return null;
      if (h.m === 10 && h.d === 1) return 'eid_fitr';
      if (h.m === 12 && h.d === 10) return 'eid_adha';
      if (h.m === 12 && h.d >= 11 && h.d <= 13) return 'tashriq';
      return null;
    },
    sunnahFast(key) {
      const h = hijri.fromKey(key); if (!h) return null;
      if (hijri.forbiddenFast(key)) return null;   // man etilgan kun — tavsiya yo'q
      const dow = D.dowOf(key);
      if (h.m === 9) return 'ramadan';
      if ([13, 14, 15].includes(h.d)) return 'ayyam_bid';
      if (h.m === 12 && h.d === 9) return 'arafa';
      if (h.m === 1 && (h.d === 9 || h.d === 10)) return 'ashura';
      // Shavvolning olti kuni — Iyddan keyingi istalgan kunlar, faqat 2-7 emas.
      if (h.m === 10 && h.d >= 2) return 'shawwal';
      if (dow === 1 || dow === 4) return 'mon_thu';
      return null;
    },
  };
  D.hijri = hijri;
})();
