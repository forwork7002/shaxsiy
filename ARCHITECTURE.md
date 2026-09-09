# Dash — unified personal dashboard (architecture contract)

One vanilla app. No build step, no framework. Files:

```
app/
  index.html        shell: <head> tokens, nav, #view container, modal/toast roots, <script> tags in order
  app.css           design system (dark default + light theme) + every module's CSS section
  js/core.js        store, dates, i18n runtime, router, UI kit, icons, charts, undo, sync, migration
  js/i18n.js        string tables: uz (Latin), uzk (Cyrillic), ru
  js/prayer.js      prayer-time engine + hijri calendar (pure functions, no DOM)
  js/today.js       Бугун: checklist (habits, tasks, prayers, water + food tile, WHOOP readiness + workouts, AI card, note, gratitude)
  js/tasks.js       Вазифа + Мақсад
  js/health.js      Соғлиқ: WHOOP hub — day · sleep · strain · weight · water · body (age panel)
  js/food.js        Овқат: food logger (photo/text → /api/food/analyze → per-day meals, targets, WHOOP burn)
  js/finance.js     Молия
  js/ai.js          shared AI analysis engine — D.ai.card(section) insight cards
  js/whoop.js       WHOOP snapshot client, per-day store, trends, readiness, workouts, bioAge/bodyPanel
  js/nova.js        AI mentor chat (uses D.ai.ask)
  js/settings.js    Созлаш: general (profile incl. birth year / goal / WHOOP Age) · habits · food targets · prayer · finance · data
  js/history.js     Тарих: read-only archive browser over /api/history/* (month grid · year · chats · cards)
  js/onboard.js     first-entry wizard (D.onboard): name → sex → birth year → height → weight → activity → goal → WHOOP
  js/app.js         boot
  sw.js manifest.json
  api.py            Flask: accounts (register/login/Google), per-uid /api/data, per-uid WHOOP OAuth+poller, /api/ai proxy, /api/food/*, /api/history/*
  db.py             SQLite archive data/dash.db (WAL): day_facts / whoop_records / chat_threads+messages / ai_cards / ai_calls / state_versions — written on every save + WHOOP poll, never pruned
  legacy.py         one-off import of the old Шахсий export (Python port of D.migrateOld + existing-wins merge); deploy/import-legacy.sh runs it on the server
```

Script order in index.html: core.js → i18n.js → prayer.js → ai.js → whoop.js → today · tasks · health · finance · ibodat · nova → food.js → settings.js → history.js → onboard.js → app.js.
`ai.js` and `whoop.js` are libraries, not views: they register no `D.view` and must load before the views that call them.
`food.js` loads before `settings.js` (the food targets tab calls `D.food.recalcTargets`); `onboard.js` loads last so every view and `D.food` exist when it decides to open.
No Telegram: there is no `telegram-web-app.js` in the shell; `D.tg` stays `null` and the few `D.tg && …` guards in core.js are dead but harmless.

Removed on 2026-09-09 (files deleted, `<link>/<script>` and sw.js SHELL entries gone, i18n keys gone): `gym.js/css` (WHOOP workouts replace it),
`learn.js/css`, `stats.js/css` (month/year stats live in Tarix), Health sub-tabs `caffeine` and `stack`, weekly `reviews`.
Data safety: `defaultState` / `normalize` / `D.merge` keep the `gym`, `learn`, `caffeine`, `stack`, `reviews` keys so old blobs and the archive stay intact — nothing in the UI reads them
(Tarix still shows archived stack/caffeine facts on a past day's sheet, read-only).

Bottom bar = the first four `primary` views by order: today 10 · health 20 · food 25 · prayer 40; everything else (finance, tasks, nova, history, settings) sits in «Yana».

## Conventions (every module follows these)

1. **One global namespace** `window.D` (defined by core.js). Modules attach to it; no other globals.
   `D.S` = state, `D.t` = translate, `D.views` = registered views, `D.act` = action handlers.
2. **A module is an IIFE** `(function(){ 'use strict'; ... })();` that calls
   `D.view({ id:'today', icon:'calendar', order:10, nav:true, render(){…}, mount(){…}, unmount(){…} })`.
   - `render()` returns an **HTML string** for the view. `mount()` runs after the HTML is in the DOM (bind sliders, start timers). `unmount()` clears timers.
   - Nav label comes from i18n key `nav.<id>`.
3. **No inline `onclick`.** Use `data-act="name"` (+ any `data-*` params). Register handlers with
   `D.act.name = (el, ev) => {...}`. Core delegates `click`, `change`, `input` (act on `data-act`, `data-change`, `data-input`) and `keydown` Enter on inputs with `data-enter="actName"`.
4. **Mutate → `D.save()` → `D.rerender()`.** `D.save()` is debounced (localStorage immediately, server 700ms). `D.rerender()` re-renders only the active view and restores scroll. **Never rerender on text `input` events** — mutate + save only (focus must survive). For live numbers use `D.patch(id, html)`.
5. **Escape everything** user-entered with `D.esc()`. Never put user text into attributes without `esc`.
6. **Dates**: only `D.dayKey()`, `D.today()`, `D.addDays(key,n)`, `D.fmtDate(key,'short'|'long'|'weekday')`, `D.monthKey(key)`. Keys are `YYYY-MM-DD` computed in `S.settings.tz` (default Asia/Tashkent) with `S.settings.dayStart` hour boundary (default 0 → midnight). String comparison of keys is date comparison.
7. **Ids**: `D.uid('h')` → `h_<base36ts>_<3rand>`. Every record has `id`. Never address by array index.
8. **Deletion** → `D.remove(list, id, {label})` pushes an undo entry and shows a toast with «Bekor qilish». Habit-with-history deletion uses `D.confirm()` (promise → boolean). No native `confirm()/alert()`.
9. **i18n**: all UI text via `D.t('key')` or `D.t('key', {n:3})`. Modules register their own keys with
   `D.i18n.add({ uz:{...}, uzk:{...}, ru:{...} })` at top of the IIFE. Key style: `today.title`, `tasks.empty`. Plural helper `D.t('x.count', {n})` where the string uses `{n}`.
10. **CSS**: class prefix per module (`td-`, `tk-`, `hl-`, `wh-`, `fd-`, `fin-`, `ib-`, `nv-`, `set-`, `hs-`, `ob-`). Use tokens, never raw colors. Reuse the kit classes below before inventing new ones. Module CSS lives in `css/<module>.css` (linked from index.html and listed in sw.js SHELL); `app.css` holds the design system.
11. **Numbers**: `D.fmtNum(n)`, `D.fmtMoney(n)` (uses `S.settings.currency`), `D.fmtPct`. Mono font for numbers: class `num`.
12. **Never throw from render** — wrap risky parts; core catches and shows an error card for that view.

## Core API (js/core.js)

```js
D.S                         // live state object (see model)
D.save()                    // persist (debounced server push) + sync dot
D.rerender()                // re-render active view, keep scroll
D.patch(id, html)           // replace innerHTML of #id (no rerender)
D.go(viewId, sub?)          // navigate; sub stored in D.ui.sub[viewId]
D.ui                        // per-device UI state {view, sub:{}, viewDate, filters:{}} (localStorage dash.ui)
D.view(def)                 // register view
D.act.x = fn                // action handlers (el, ev)
D.t(key, params)            // translate
D.i18n.add(tables)          // add strings
D.lang()                    // 'uz' | 'uzk' | 'ru'
D.esc(s)  D.uid(p)  D.clamp(n,a,b)  D.debounce(fn,ms)  D.sum(arr, fn)
D.dayKey(date?)  D.today()  D.addDays(k,n)  D.daysBetween(a,b)  D.fmtDate(k,style)  D.monthKey(k)  D.weekKey(k)
D.nowTz()                   // Date-like {y,m,d,h,min,s,dow} in settings tz
D.profileAge()              // age from profile.birthYear (self-updating), else legacy profile.age; the ONLY age rule (food, whoop, ai, settings)
D.fmtNum(n)  D.fmtMoney(n)  D.fmtPct(x)  D.fmtTime(h,m)
D.toast(msg, {undo?:fn, ms?})  D.confirm({title,text,ok,danger}) → Promise<bool>
D.modal({title, body, actions:[{label,act,primary,danger}], onOpen})  D.closeModal()
D.sheet(html)               // bottom sheet (mobile) / modal (desktop)
D.remove(arr, id, {label})  // splice + undo toast
D.undo.push({label, undo:fn})
D.ic(name, size?)           // icon svg string (see icons list)
D.chart.ring({pct, size, stroke, color, label, sub})       // svg string
D.chart.bars({values, labels, color, height, target})
D.chart.spark({values, color, height, fill})
D.chart.heat({days, valueFn, cols})                        // heatmap
D.chart.donut({parts:[{v,color,label}], size})
D.streak(datesSet)          // grace-day streak from a Set of day keys
D.habitDue(habit, key)      // schedule check
D.sphere(id)                // {id,name(),color}
D.spheres                   // ordered list
D.tg                        // always null now (no Telegram script) — guards stay null-safe
D.api(path, opts)           // fetch (same-origin session cookie), JSON
D.serverEnabled()           // true when served by api.py (window.DASH_SERVER) or ?server=1
D.emit(name, data) D.on(name, fn)   // simple event bus ('state:changed', 'view:changed', 'day:changed', 'pull:ok' — a D.pull() that read the server copy; D.pulled stays true after the first)
D.theme.set('dark'|'light'|'auto')
D.search.register(fn)       // fn(query) → [{label, sub, go:()=>{}}] for Ctrl+K palette
D.merge(remote, local)      // union merge used by the server pull / stale-push path
```

## AI (js/ai.js)

```js
D.ai.card(section, {compact})  // full insight card: state, button, cached answer, errors
D.ai.advise(section)           // run the analysis, cache into S.ai.cards[section]
D.ai.ask(messages, system, {maxTokens})  // the one transport: /api/ai, BYOK fallback
D.ai.snapshot()                // memoised, whole-app context object
D.ai.systemFor(section)        // section prompt built from the snapshot
D.ai.mode()                    // 'server' | 'key' | 'none'
D.ai.enoughData(section)  D.ai.isFresh(section)  D.ai.md(text)
```
Sections: `today`, `health`, `sleep`, `strain`, `food`, `age`, `finance`, `prayer` — one coach card per page
(`history.js` SECTIONS mirrors this list for the Tarix «Kartalar» filter). Add one by extending `SECTIONS`, `QUESTION`,
the `sectionLines()` builder and the three `ai.hint.<section>` strings.

## WHOOP (js/whoop.js)

```js
D.whoop.sync({deep})     // recovery/sleep/cycle/workout(+body when deep) → S.whoop.days
D.whoop.autoSync()       // throttled to 30 min; runs on boot and when Health opens
D.whoop.day(key)  D.whoop.trend(field, n)  D.whoop.stats(field, n)
D.whoop.readiness()      // {pct, zone, sleepH, strain, label} for the Today strip
D.whoop.fillSleep()      // writes health[date].sleep when the user left it empty
D.whoop.workoutsOn(key)  D.whoop.workoutRows(key, {empty:false})   // Today's WHOOP workouts card + Health › strain
D.whoop.bioAge()         // {est, chrono, delta, inputs:[{k,v,effect}]} | null — transparent 30-day estimate
D.whoop.bodyPanel()      // Health › body: profile, body, last sync, WHOOP Age / Pace of Aging (typed in), estimate
D.whoop.trendCard()  D.whoop.footer()
```
Day mapping: recovery → `created_at`, sleep → `end` (the morning you woke), cycle/workout → `start`.
Naps are skipped. `health[k].sleepFromWhoop` marks an auto-filled value; a manual edit clears it.

## Food (js/food.js)

```js
D.food.tile(dayKey)        // Today tile HTML ('' when nothing to show) → D.go('food')
D.food.dayTotals(dayKey)   // {kcal,p,c,f} | null
D.food.targets()           // {kcal,p,c,f,auto}
D.food.recalcTargets()     // Mifflin-St Jeor × activity ± goal (−400/0/+300), protein 1.6 g/kg (2.0 gain), fat 25 %, carbs rest
```
Settings → Ovqat edits `S.food.targets`; a manual value sets `auto=false`, the «Avto» switch recalculates. Profile edits
(height, weight, birth year, sex, activity, goal) call `recalcTargets()` while `auto` is on.

## Onboarding (js/onboard.js)

Trigger at boot: `D.serverEnabled() && S.settings.onboarded !== true && !(S.profile.age || S.profile.birthYear) && !S.profile.weightKg`.
Full-screen steps in the auth-gate style; finish → `profile.*`, `food.targets.auto = true`, `settings.onboarded = true`, `D.save()`.
Everything it asks is editable later in Settings → Profil.

## Kit classes (app.css)

Layout: `.page`, `.section`, `.section-title`, `.grid2`, `.grid3`, `.row`, `.stack`
Card: `.card`, `.card-head`, `.eyebrow`, `.kpi`, `.kpi-num`, `.kpi-total`, `.kpi-label`, `.card.all-done`
Tiles: `.stat-grid`, `.stat`, `.stat-num`, `.stat-label`, `.zone.z-good|z-warn|z-bad`
List: `.list`, `.li` (row), `.li.done`, `.chk` (custom checkbox `<input type=checkbox class=chk>`), `.li-text`, `.li-meta`, `.li-del`, `.empty`
Chips: `.pill`, `.pill.on`, `.tag` (+ `style="--c:var(--ruh)"`), `.streak`
Controls: `.seg` > `button.on`, `.inp`, `.sel`, `.ta`, `.btn` (primary), `.btn.ghost`, `.btn.danger`, `.btn.sm`, `.btn.icon`, `.dashed`, `.slider`, `.stepper`, `.emoji-row`
Progress: `.bar` > `.bar-fill`, `.segbar` > `.seg-on`, `.ring-wrap`
Ticker: `.ticker`, `.ticker-led`, `.ticker-label`, `.ticker-stage`, `.ticker-row`, `.ticker-meta`
Typography: `.num` (mono tabular), `.muted`, `.small`, `.title`
Misc: `.hm` heatmap, `.spark`, `.tabs` (sub-nav pills, horizontally scrollable)

Tokens: `--bg --bg2 --bg3 --text --text2 --text3 --success --warning --danger --info --accent --glass --inset --line --line2 --focus --r --r-sm --r-lg --sh --ruh --aql --qalb --tana --boshqa --aralash --font --mono`.

## Data model (`D.S`, persisted as localStorage `dash.v2` and server `/api/data`)

```js
{
 meta:{ v:2, updatedAt, deviceId, migratedFrom },
 settings:{ lang:'uz', theme:'dark', tz:'Asia/Tashkent', dayStart:0, wakeHour:6, sleepHour:23,
            currency:'UZS', weightUnit:'kg', waterMl:250, waterTargetMl:null,
            prayer:{ lat:41.2995, lng:69.2401, fajr:18, isha:18, asr:'hanafi', offsets:{bomdod:0,quyosh:0,peshin:0,asr:0,shom:0,xufton:0}, hijriOffset:0, notify:false },
            caffeineLimit:400 /* legacy, unused */, showAmounts:true, onboarded:false },
 profile:{ name:'', heightCm:null, weightKg:null, age:null /* derived from birthYear when set */, birthYear:null, sex:'m', activity:3,
           goal:'lose'|'keep'|'gain' /* default keep */, whoopAge:null, paceOfAging:null, whoopAgeAt:null /* 'YYYY-MM-DD' typed-in date */ },
 habits:[ {id,name,sphere:'ruh'|'aql'|'qalb'|'tana'|'boshqa'|'aralash',active,schedule:{type:'daily'}|{type:'days',days:[0..6]}|{type:'week',n},
           target:null|{n,unit}, remind:null|'HH:MM', createdAt, order} ],
 logs:{ 'YYYY-MM-DD':[habitId] },               // key deleted when empty (Кун stat relies on it)
 counts:{ 'YYYY-MM-DD':{habitId:n} },           // quantified habits
 notes:{ 'YYYY-MM-DD':text },
 gratitude:[ {id,date,text} ],
 tasks:[ {id,text,date,done,doneAt,priority:1|2|3,createdAt,goalId} ],
 goals:[ {id,text,dir:'shaxsiy'|'oilaviy'|'ish'|'moliyaviy',priority,year,done,doneAt} ],
 prayers:{ 'YYYY-MM-DD':{ bomdod:null|'jamaat'|'alone'|'qaza'|'missed', peshin, asr, shom, xufton } },
 dhikr:{ 'YYYY-MM-DD':{ total:n, sessions:[{name,n,ts}] } },
 fasting:{ 'YYYY-MM-DD':{ type:'ramadan'|'sunnah'|'qaza'|'nafl', done } },
 health:{ 'YYYY-MM-DD':{ weight, sleep, sleepFromWhoop?:true, bed:'HH:MM', wake:'HH:MM', water:n, mood:0..4, tags:[], note } },
 food:{ logs:{ 'YYYY-MM-DD':[ {id,ts,name,grams,kcal,p,c,f,photo:id|null,items:[{name,grams,kcal,p,c,f}],note,src:'photo'|'text'|'manual'} ] },
        targets:{ kcal,p,c,f, auto:true } },      // merge: logs per day union by id (local wins); targets from the newer side
 caffeine:{ logs:[{id,name,mg,ts}], custom:[{id,name,mg}] },   // legacy — kept for old blobs/archive, no UI
 stack:{ items:[…], taken:{…} },                                 // legacy — kept, no UI
 gym:{ … },                                                     // legacy — kept, no UI
 finance:{ tx:[{id,date,type:'in'|'out',amount,cat,note,accountId}], cats:[{id,name,icon}],
           budgets:{ 'YYYY-MM':{catId:amount} }, accounts:[{id,name,type:'cash'|'bank'|'card'|'crypto'|'other',balance}],
           subs:[{id,name,amount,period:'monthly'|'yearly'|'weekly',next,accountId,auto,last}], snapshots:[{t,v}], wishlist:[{id,name,amount}] },
 learn:[ … ], reviews:[ … ],                                    // legacy — kept (legacy import may still fill learn), no UI
 nova:{ threads:[{id,ts,messages:[{role,content,ts}]}] },
 whoop:{ connected:false, lastSync, cache:{}, days:{ 'YYYY-MM-DD':{recovery,hrv,rhr,spo2,skin,sleepH,sleepPerf,sleepEff,sleepCons,resp,stages,bedTs,wakeTs,strain,kcal,hrAvg,hrMax} }, workouts:[{id,k,start,end,sport,strain,kcal,hrAvg,hrMax,meters,mins}], body:{heightCm,weightKg,maxHr} },
 ai:{ cards:{ '<section>':{day,text,ts} }, log:[{section,day,text,ts}] }
}
```

Device-only (never synced): localStorage `dash.ui` (active view, sub-tabs, filters, viewDate) and `dash.device` (whoop tokens if client-side, nova key if BYOK).

## Old-data migration (core.js `D.migrateOld(json)`)

Old `shaxsiy_*.json` / `data.json` shape → new: `habits[{id,nom,soha,faol}]`→`{id,name,sphere,active,schedule:{type:'daily'}}`;
`logs` kept; `tasks[{matn,sana,bajarildi,muhimlik}]`→`{text,date,done,priority}`; `finance[{sana,tur:'kirim'|'chiqim',summa,kategoriya,izoh}]`→`finance.tx[{date,type:'in'|'out',amount,cat,note}]` (category name → cat id, creating cats);
`learn[{tur,nom,muallif,holat}]`→`{type,name,author,status}`; `goals[{yonalish,matn,muhimlik,bajarildi,yil}]`→`{dir,text,priority,done,year}` (Шахсий→shaxsiy, Оилавий→oilaviy, Иш/Бизнес→ish, Молиявий→moliyaviy);
`gratitude[{sana,matn}]`→`{date,text}`; `notes` kept; `health[date]{weight,sleep,water,mood,note}` → numbers.
Prayer habits (names ПЕШИН/АСР/ШОМ/БОМДОД/ХУФТОН) stay as habits; the prayer module reads them too.

## Day boundary

`dayKey()` = calendar date in `settings.tz`, minus one day if local hour < `settings.dayStart`. Default `dayStart=0`. All 556 historic keys were midnight-Tashkent — do not change the default.

## Backend contract (api.py)

- `GET /api/data` → full state; `POST /api/data` body = full state (server merges per top-level key using `meta.updatedAt`; returns `{ok, updated}`)
- `GET /api/health`
- `GET /api/whoop/login` → redirect to WHOOP; `GET /api/whoop/callback` → stores tokens server-side keyed by uid → redirect `/#health`
- `GET /api/whoop/data?path=/recovery&limit=1` → proxied with server-held token (auto-refresh)
- `POST /api/ai` `{messages, system, max_tokens?, kind?}` → AI proxy (Anthropic or OpenAI, key from env), returns `{text, model, usage}`; `kind` = `chat` (Nova) | `card:<section>` (D.ai.advise) is only logged to `ai_calls`
- `POST /api/food/analyze` `{image?: dataURL jpeg/png ≤ 1.5 MB, text?, note?, lang}` → `{ok, items:[{name,grams,kcal,p,c,f}], total:{kcal,p,c,f}, confidence, advice, photo:id|null}`; errors `ai_not_configured` 501, `bad_image` 400, `ai_failed` 502. `GET /api/food/photo/<id>` → image/jpeg (auth, per-uid `data/<uid>.food/`).
- All routes require a signed-in session (name+password, Google) unless `MA_DEV=1`.

### History archive (`/api/history/*`, read by js/history.js only — never by other modules)
Server-side SQLite archive (`db.py`) filled from every state save and WHOOP poll; the client never keeps it in `D.S`.
All per-uid, `from`/`to` are day keys, ranges capped at 400 days, default = last 31 days.
The blob is the whole state: a fact that disappears from it (habit un-ticked, note cleared) gets `day_facts.gone_at` and drops out of every reader; it comes back untouched when the blob has it again. No cross-request hash cache — each `archive_state` reads the live hashes from the DB, so two gunicorn workers see each other's writes. Day keys use Tashkent time with `dayStart = 0`.
- `GET /api/history/range` → `{first, last, days, whoopFirst, threads}`
- `GET /api/history/days?from&to` → `{days:{ 'YYYY-MM-DD': {health, habits:[habitId], counts:{id:n}, prayers, note, gratitude:[{id,text}|text], food:[{id,ts,name,grams,kcal,p,c,f}] (no photos), stack:{itemId:ts}, caffeine:[{name,mg,ts}], tasks:[{id,text}|text]} }}`
- `GET /api/history/whoop?from&to` → `{recovery:[{ts,recovery,hrv,rhr}], sleep:[{start,end,nap,sleepH,sleepPerf}], cycle:[{start,end,strain,kcal}], workout:[{id,start,end,sport,strain,kcal,mins}]}` — raw server records; the client keys days exactly like `whoop.js`: recovery → `ts`, sleep → `end`, cycle → `start + 12h`, workout → `start` (all through `D.dayKey`); `whoop_records.day_hint` is filed by the same rule (`db.whoop_day`), so a cycle that starts before midnight lands on its waking day.
- `GET /api/history/months?year=YYYY` → `{months:{ 'YYYY-MM': {days, habitPct, sleepH, recovery, strain, kcal, kcalEaten, workouts, weightStart, weightEnd, notes} }}` — `kcal` = WHOOP burn, `kcalEaten` = logged meals, both daily averages
- `GET /api/history/chats?q&limit&before` → `{threads:[{id,ts,title,count,deleted}]}`; `GET /api/history/chats/<id>` → `{id,ts,title,messages:[{idx,ts,role,content}]}`
- `GET /api/history/cards?section&from&to&limit` → `{cards:[{section,day,ts,text}]}` — newest first, at most 2000 (`db.CARDS_MAX`)
- `POST /api/history/restore-thread {id}` → `{ok, thread?:{id,ts,messages}}` — re-inserts the thread into the blob; the client also adds it to `D.S.nova.threads` locally and opens Nova on it.
- `GET /api/history/versions` → `{versions:[{id,savedAt,size}]}`, `GET /api/history/versions/<id>` → the blob.
Client conventions: responses cached in module memory keyed by uid+url (ranges touching today expire after 2 min); skeleton while loading, offline card with retry on error; selector state in `D.ui.filters.hist = {y, m}`; sub-tabs `D.ui.sub.history` ∈ month|year|chats|cards; CSS prefix `hs-`, actions `hs*`.
