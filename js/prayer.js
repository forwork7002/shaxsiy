/* =====================================================================
   Prayer-time engine + Hijri calendar. Pure functions, no DOM.
   D.prayer.times(key) → { bomdod, quyosh, peshin, asr, shom, xufton } minutes-of-day
   D.prayer.next()     → { id, time:'HH:MM', minsLeft, current }
   D.hijri.fromKey(key) → { y, m, d }
   ===================================================================== */
(function () {
  'use strict';
  const RAD = Math.PI / 180;
  const sin = (x) => Math.sin(x * RAD), cos = (x) => Math.cos(x * RAD), tan = (x) => Math.tan(x * RAD);
  const asin = (x) => Math.asin(x) / RAD, acos = (x) => Math.acos(D.clamp(x, -1, 1)) / RAD, atan2 = (y, x) => Math.atan2(y, x) / RAD;
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };

  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  // Sun position at Julian day (approx. NOAA low precision)
  function sunPos(jd) {
    const Dd = jd - 2451545.0;
    const g = fix(357.529 + 0.98560028 * Dd, 360);
    const q = fix(280.459 + 0.98564736 * Dd, 360);
    const L = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360);
    const e = 23.439 - 0.00000036 * Dd;
    const RA = fix(atan2(cos(e) * sin(L), cos(L)) / 15, 24);
    const decl = asin(sin(e) * sin(L));
    const eqt = q / 15 - RA;
    return { decl, eqt: eqt > 12 ? eqt - 24 : eqt < -12 ? eqt + 24 : eqt };
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
  // hour angle for sun altitude `alt` (negative = below horizon)
  function hourAngle(alt, lat, decl) {
    const v = (sin(alt) - sin(lat) * sin(decl)) / (cos(lat) * cos(decl));
    if (v < -1 || v > 1) return null;
    return acos(v) / 15;
  }

  const prayer = {
    times(key) {
      key = key || D.today();
      const st = D.S.settings.prayer || {};
      const lat = +st.lat || 41.2995, lng = +st.lng || 69.2401;
      const { y, m, d } = D.parseKey(key);
      const tz = tzOffsetHours(key);
      const jd = julian(y, m, d) + 0.5 - lng / 360; // local noon-ish
      const { decl, eqt } = sunPos(jd);
      const dhuhr = 12 + tz - lng / 15 - eqt;
      const fajrA = +st.fajr || 18, ishaA = +st.isha || 18;
      const tF = hourAngle(-fajrA, lat, decl), tI = hourAngle(-ishaA, lat, decl), tS = hourAngle(-0.833, lat, decl);
      // Asr: shadow factor k (Hanafi = 2, Shafi = 1)
      const k = st.asr === 'shafi' ? 1 : 2;
      const asrAlt = -Math.atan(1 / (k + tan(Math.abs(lat - decl)))) / RAD; // altitude of sun when shadow = k + shadow at noon
      const tA = hourAngle(-asrAlt, lat, decl);
      const night = tS ? (24 - 2 * tS) : 12;
      const out = {
        bomdod: tF !== null ? dhuhr - tF : dhuhr - tS - night / 7,
        quyosh: dhuhr - (tS || 6),
        peshin: dhuhr + 2 / 60,
        asr: tA !== null ? dhuhr + tA : dhuhr + 3.5,
        shom: dhuhr + (tS || 6) + 1 / 60,
        xufton: tI !== null ? dhuhr + tI : dhuhr + tS + night / 7,
      };
      const off = st.offsets || {};
      const res = {};
      for (const id of Object.keys(out)) res[id] = Math.round(fix(out[id], 24) * 60 + (+off[id] || 0));
      return res;
    },
    fmt: (mins) => D.fmtTime(Math.floor(mins / 60) % 24, mins % 60),
    list(key) {
      const t = prayer.times(key);
      return ['bomdod', 'quyosh', 'peshin', 'asr', 'shom', 'xufton'].map((id) => ({ id, mins: t[id], time: prayer.fmt(t[id]) }));
    },
    // next prayer from now; also which waqt is current
    next(now) {
      try {
        const p = D.nowTz(now);
        const key = D.keyOf(p.y, p.m, p.d);
        const nowM = p.h * 60 + p.min;
        const list = prayer.list(key).filter((x) => x.id !== 'quyosh');
        let cur = null;
        for (const x of list) if (x.mins <= nowM) cur = x.id;
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
      const list = prayer.list(key).filter((x) => x.id !== 'quyosh');
      let cur = null;
      for (const x of list) if (x.mins <= nowM) cur = x.id;
      return { key, waqt: cur };
    },
    // qibla bearing from settings location
    qibla() {
      const st = D.S.settings.prayer || {};
      const lat = +st.lat || 41.2995, lng = +st.lng || 69.2401;
      const kLat = 21.4225, kLng = 39.8262;
      const dL = kLng - lng;
      const b = atan2(sin(dL), cos(lat) * tan(kLat) - sin(lat) * cos(dL));
      return fix(b, 360);
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
    sunnahFast(key) {
      const h = hijri.fromKey(key); if (!h) return null;
      const dow = D.dowOf(key);
      if (h.m === 9) return 'ramadan';
      if ([13, 14, 15].includes(h.d)) return 'ayyam_bid';
      if (h.m === 12 && h.d === 9) return 'arafa';
      if (h.m === 1 && (h.d === 9 || h.d === 10)) return 'ashura';
      if (h.m === 10 && h.d >= 2 && h.d <= 7) return 'shawwal';
      if (dow === 1 || dow === 4) return 'mon_thu';
      return null;
    },
  };
  D.hijri = hijri;
})();
