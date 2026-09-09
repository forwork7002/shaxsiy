#!/usr/bin/env python3
"""
Eski Шахсий mini-app eksportini (habits/logs/tasks/… kirill maydonlar) yangi
formatga o'giradi va foydalanuvchining data/<uid>.json fayliga qo'shadi.

core.js dagi D.isOldFormat / D.migrateOld / D.normalize / D.merge ning Python nusxasi.
Farqi: bu yerda mavjud (serverdagi) yozuv to'qnashuvda g'olib — import hech narsani buzmaydi.

Buyruq satri (serverda, shaxsiy foydalanuvchi nomidan):
    python3 legacy.py <data_dir> <uid> <old.json> [--dry-run]

  • <uid>.json ni <uid>.pre-legacy.<epoch>.json ga zaxiralaydi
  • birlashtiradi, tmp + replace bilan ixcham JSON yozadi (api.save_data kabi)
  • sonlarni chop etadi (kunlar/odatlar/vazifalar/… oldin → keyin)
  • db.archive_state(uid, blob) topilsa — arxivga ham yozadi

api.py dan hech narsa import qilinmaydi (u Flask va poller ipini ishga tushiradi).
"""
import copy
import hashlib
import json
import math
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

VERSION = 2
TZ = timezone(timedelta(hours=5))  # Toshkent — yangi holatning default tz'i
SPHERE_IDS = ['ruh', 'aql', 'qalb', 'tana', 'boshqa', 'aralash']
DIRS = ['shaxsiy', 'oilaviy', 'ish', 'moliyaviy']

OLD_DIR = {'Шахсий': 'shaxsiy', 'Оилавий': 'oilaviy', 'Иш/Бизнес': 'ish', 'Молиявий': 'moliyaviy'}
OLD_CAT = {'Озиқ-овқат': 'oziq', 'Транспорт': 'transport', 'Коммуналка': 'kommunal', 'Кийим': 'kiyim',
           'Соғлиқ': 'soglik', 'Таълим': 'talim', 'Ҳадя/Садақа': 'sadaqa', 'Ресторан': 'restoran',
           'Уй/Ремонт': 'uy', 'Бошқа': 'boshqa'}

DATE_MAPS = ['logs', 'counts', 'notes', 'health', 'prayers', 'dhikr', 'fasting']
ID_LISTS = ['habits', 'gratitude', 'tasks', 'goals', 'learn', 'reviews']


# ═══════════════════════ default holat (core.js defaultState) ═══════════════════════

def default_state() -> dict:
    return {
        'meta': {'v': VERSION, 'updatedAt': 0, 'deviceId': '', 'migratedFrom': None},
        'settings': {
            'lang': 'uz', 'theme': 'dark', 'tz': 'Asia/Tashkent', 'dayStart': 0, 'wakeHour': 6, 'sleepHour': 23,
            'currency': 'UZS', 'weightUnit': 'kg', 'waterMl': 250, 'waterTargetMl': None,
            'prayer': {'lat': 41.2995, 'lng': 69.2401, 'fajr': 18, 'isha': 18, 'asr': 'hanafi',
                       'offsets': {'bomdod': 0, 'quyosh': 0, 'peshin': 0, 'asr': 0, 'shom': 0, 'xufton': 0},
                       'hijriOffset': 0, 'notify': False},
            'caffeineLimit': 400, 'showAmounts': True, 'onboarded': False,
        },
        'profile': {'name': '', 'heightCm': None, 'weightKg': None, 'age': None, 'sex': 'm', 'activity': 3},
        'habits': [], 'logs': {}, 'counts': {}, 'notes': {}, 'gratitude': [],
        'tasks': [], 'goals': [],
        'prayers': {}, 'dhikr': {}, 'fasting': {},
        'health': {},
        'caffeine': {'logs': [], 'custom': []},
        'stack': {'items': [], 'taken': {}},
        'gym': {'gyms': [], 'days': [], 'exercises': [], 'logs': {}, 'done': {}, 'split': {'names': [], 'anchor': None}},
        'finance': {'tx': [], 'cats': [], 'budgets': {}, 'accounts': [], 'subs': [], 'snapshots': [], 'wishlist': []},
        'learn': [], 'reviews': [],
        'nova': {'threads': []},
        'ai': {'cards': {}, 'log': []},
        'whoop': {'connected': False, 'lastSync': None, 'cache': {}, 'days': {}, 'workouts': [], 'body': {}},
    }


def default_cats() -> list:
    return [{'id': i, 'name': n, 'icon': ic} for i, n, ic in [
        ('oziq', 'Oziq-ovqat', '🍽️'), ('transport', 'Transport', '🚌'), ('kommunal', 'Kommunal', '💡'), ('kiyim', 'Kiyim', '👕'),
        ('soglik', "Sog'liq", '💊'), ('talim', "Ta'lim", '📚'), ('sadaqa', 'Hadya/Sadaqa', '🤲'), ('restoran', 'Restoran', '☕'),
        ('uy', 'Uy/Remont', '🏠'), ('boshqa', 'Boshqa', '📦'), ('maosh', 'Maosh', '💼'),
    ]]


# ═══════════════════════ yordamchilar ═══════════════════════

def _uid(prefix: str, seed) -> str:
    """D.uid o'rnida: tasodifiy emas, yozuv mazmunidan hosil bo'ladi — import qayta
    ishlaganda bir xil id chiqadi (idempotent)."""
    raw = json.dumps(seed, ensure_ascii=False, sort_keys=True, default=str)
    return f"{prefix}_{hashlib.sha1(raw.encode('utf-8')).hexdigest()[:10]}"


def _num(v):
    """JS unary + : son → o'zi, satr → float (bo'sh = 0), bo'lmasa NaN (None)."""
    if isinstance(v, bool):
        return 1 if v else 0
    if isinstance(v, (int, float)):
        return None if isinstance(v, float) and math.isnan(v) else v
    if v is None:
        return 0
    if isinstance(v, str):
        s = v.strip()
        if s == '':
            return 0
        try:
            f = float(s)
        except ValueError:
            return None
        return int(f) if f.is_integer() and '.' not in s and 'e' not in s.lower() else f
    return None


def _truthy(v) -> bool:
    return not (v is None or v is False or v == 0 or v == '' or (isinstance(v, float) and math.isnan(v)))


def _today() -> str:
    return datetime.now(TZ).strftime('%Y-%m-%d')


def _fill(target, d):
    """core.js fill: yetishmayotgan kalitlarni default bilan to'ldiradi, mavjudini o'zgartirmaydi."""
    if isinstance(d, list):
        return target if isinstance(target, list) else []
    if isinstance(d, dict):
        out = target if isinstance(target, dict) else {}
        for k in d:
            out[k] = _fill(out.get(k), d[k])
        return out
    return d if target is None else target


def normalize(s) -> dict:
    """core.js D.normalize: default kalitlar + yozuv darajasidagi defaultlar."""
    n = _fill(copy.deepcopy(s) if s else {}, default_state())
    for i, h in enumerate(n['habits']):
        if not h.get('id'):
            h['id'] = _uid('h', h)
        if h.get('active') is None:
            h['active'] = True
        if not h.get('schedule'):
            h['schedule'] = {'type': 'daily'}
        if h.get('sphere') not in SPHERE_IDS:
            h['sphere'] = 'boshqa'
        if h.get('order') is None:
            h['order'] = i
    for k in list(n['logs']):
        if not isinstance(n['logs'][k], list) or not n['logs'][k]:
            del n['logs'][k]
    for t in n['tasks']:
        if not t.get('id'):
            t['id'] = _uid('t', t)
        if not t.get('priority'):
            t['priority'] = 2
    for g in n['goals']:
        if not g.get('id'):
            g['id'] = _uid('g', g)
        if not g.get('priority'):
            g['priority'] = 2
        if g.get('dir') not in DIRS:
            g['dir'] = 'shaxsiy'
    if not n['finance']['cats']:
        n['finance']['cats'] = default_cats()
    n['meta']['v'] = VERSION
    return n


# ═══════════════════════ eski format → yangi ═══════════════════════

def is_old_format(j) -> bool:
    """D.isOldFormat: habits ro'yxati (bo'sh yoki birinchisida 'nom' bor) va settings yo'q."""
    if not isinstance(j, dict) or not j:
        return False
    habits = j.get('habits')
    if not isinstance(habits, list):
        return False
    if habits:
        first = habits[0] if isinstance(habits[0], dict) else {}
        if 'nom' not in first:
            return False
    return not _truthy(j.get('settings'))


def migrate_old(o: dict) -> dict:
    """D.migrateOld ning aynan nusxasi (maydon nomlari kirill → lotin)."""
    n = default_state()
    n['meta']['migratedFrom'] = 'shaxsiy'
    n['settings']['lang'] = 'uzk'

    n['habits'] = [{
        'id': h.get('id') or _uid('h', h), 'name': h.get('nom') or '',
        'sphere': h.get('soha') if h.get('soha') in SPHERE_IDS else 'boshqa',
        'active': h.get('faol') is not False, 'schedule': {'type': 'daily'},
        'target': None, 'remind': None, 'createdAt': 0, 'order': i,
    } for i, h in enumerate(o.get('habits') or [])]
    n['logs'] = o.get('logs') or {}
    n['notes'] = o.get('notes') or {}
    n['gratitude'] = [{'id': g.get('id') or _uid('gr', g), 'date': g.get('sana') or None, 'text': g.get('matn') or ''}
                      for g in (o.get('gratitude') or [])]
    n['tasks'] = [{
        'id': t.get('id') or _uid('t', t), 'text': t.get('matn') or '', 'date': t.get('sana') or None,
        'done': _truthy(t.get('bajarildi')), 'doneAt': None, 'priority': _num(t.get('muhimlik')) or 2,
        'createdAt': 0, 'goalId': None,
    } for t in (o.get('tasks') or [])]
    n['goals'] = [{
        'id': g.get('id') or _uid('g', g), 'text': g.get('matn') or '', 'dir': OLD_DIR.get(g.get('yonalish'), 'shaxsiy'),
        'priority': _num(g.get('muhimlik')) or 2, 'year': _num(g.get('yil')) if _truthy(g.get('yil')) else None,
        'done': _truthy(g.get('bajarildi')), 'doneAt': None,
    } for g in (o.get('goals') or [])]

    n['finance']['cats'] = default_cats()
    new_cats = {}  # nom → id: JS har safar yangi kategoriya ochadi, biz bir nomga bittasini
    tx = []
    for f in (o.get('finance') or []):
        name = f.get('kategoriya')
        cat = OLD_CAT.get(name)
        if not cat and _truthy(name):
            cat = new_cats.get(name)
            if not cat:
                cat = new_cats[name] = _uid('c', name)
                n['finance']['cats'].append({'id': cat, 'name': name, 'icon': '📦'})
        tx.append({'id': f.get('id') or _uid('f', f), 'date': f.get('sana') or _today(),
                   'type': 'in' if f.get('tur') == 'kirim' else 'out', 'amount': _num(f.get('summa')) or 0,
                   'cat': cat or 'boshqa', 'note': f.get('izoh') or '', 'accountId': None})
    n['finance']['tx'] = tx

    n['learn'] = [{
        'id': l.get('id') or _uid('l', l), 'type': l.get('tur') or 'kitob', 'name': l.get('nom') or '',
        'author': l.get('muallif') or '', 'status': 'tugadi' if l.get('holat') == 'tugadi' else 'jarayonda',
        'progress': None, 'total': None, 'createdAt': 0,
    } for l in (o.get('learn') or [])]

    for k, v in (o.get('health') or {}).items():
        v = v or {}
        mood = v.get('mood')
        n['health'][k] = {
            'weight': _num(v.get('weight')) if _truthy(v.get('weight')) else None,
            'sleep': _num(v.get('sleep')) if _truthy(v.get('sleep')) else None,
            'bed': None, 'wake': None,
            'water': _num(v.get('water')) or 0,
            'mood': mood if isinstance(mood, (int, float)) and not isinstance(mood, bool) else None,
            'tags': [], 'note': v.get('note') or '',
        }
    return normalize(n)


# ═══════════════════════ birlashtirish (D.merge, mavjud g'olib) ═══════════════════════

def _union_by_id(a, b) -> list:
    out, seen = [], set()
    for x in list(a or []) + list(b or []):
        if isinstance(x, dict) and x.get('id') and x['id'] not in seen:
            seen.add(x['id'])
            out.append(x)
    return out


def _empty_blob(b) -> bool:
    return not isinstance(b, dict) or not b or not any(
        b.get(k) for k in ID_LISTS + DATE_MAPS + ['finance', 'gym', 'nova', 'caffeine', 'stack'])


def merge_into(existing, migrated) -> dict:
    """Ko'chirilgan blobni mavjudiga qo'shadi: sanali xaritalar va id ro'yxatlar birlashadi,
    to'qnashuvda MAVJUD yozuv qoladi. Bo'sh mavjud → ko'chirilgan blob o'zi."""
    m = normalize(migrated)
    if _empty_blob(existing):
        out = m
    else:
        e = normalize(existing)
        out = e
        for k in DATE_MAPS:
            out[k] = {**m[k], **e[k]}
        for k in ID_LISTS:
            out[k] = _union_by_id(e[k], m[k])

        # kategoriyalar: id bo'yicha, bir xil nomli yangi kategoriya mavjudiga ulanadi
        by_name = {c.get('name'): c['id'] for c in e['finance']['cats'] if isinstance(c, dict) and c.get('id')}
        remap, add = {}, []
        have = {c['id'] for c in e['finance']['cats'] if isinstance(c, dict) and c.get('id')}
        for c in m['finance']['cats']:
            if c['id'] in have:
                continue
            if c.get('name') in by_name:
                remap[c['id']] = by_name[c['name']]
            else:
                add.append(c)
        out['finance']['cats'] = e['finance']['cats'] + add
        mtx = [dict(t, cat=remap.get(t.get('cat'), t.get('cat'))) for t in m['finance']['tx']]
        out['finance']['tx'] = _union_by_id(e['finance']['tx'], mtx)
        for k in ('accounts', 'subs', 'wishlist'):
            out['finance'][k] = _union_by_id(e['finance'][k], m['finance'][k])
        out['finance']['budgets'] = {**m['finance']['budgets'], **e['finance']['budgets']}
        out['stack']['taken'] = {**m['stack']['taken'], **e['stack']['taken']}
        if out['meta'].get('migratedFrom') is None:
            out['meta']['migratedFrom'] = m['meta'].get('migratedFrom')
    out['meta']['updatedAt'] = int(time.time() * 1000)
    return out


# ═══════════════════════ fayl va CLI ═══════════════════════

def user_file(data_dir, uid: str) -> Path:
    """api.user_file bilan bir xil nom."""
    safe = ''.join(c for c in uid if c.isalnum() or c in '-_')[:40] or 'user'
    return Path(data_dir) / f'{safe}.json'


def counts(b) -> dict:
    b = b if isinstance(b, dict) else {}
    fin = b.get('finance') if isinstance(b.get('finance'), dict) else {}
    return {
        'days': len(b.get('logs') or {}), 'habits': len(b.get('habits') or []), 'tasks': len(b.get('tasks') or []),
        'learn': len(b.get('learn') or []), 'gratitude': len(b.get('gratitude') or []), 'goals': len(b.get('goals') or []),
        'tx': len(fin.get('tx') or []), 'health': len(b.get('health') or {}),
    }


def write_blob(f: Path, blob: dict):
    tmp = f.with_suffix('.tmp')
    tmp.write_text(json.dumps(blob, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    tmp.replace(f)


def run_import(data_dir, uid: str, old_path, dry_run=False, out=print) -> dict:
    data_dir = Path(data_dir)
    old = json.loads(Path(old_path).read_text(encoding='utf-8'))
    if not is_old_format(old):
        raise SystemExit(f'{old_path}: eski Шахсий formati emas (habits[].nom kutilgan edi)')
    f = user_file(data_dir, uid)
    existing = {}
    if f.exists():
        existing = json.loads(f.read_text(encoding='utf-8'))
    before = counts(existing)
    merged = merge_into(existing, migrate_old(old))
    after = counts(merged)

    out(f"{'[sinov] ' if dry_run else ''}{f.name}:")
    for k in before:
        out(f'  {k:10s} {before[k]:6d} → {after[k]:6d}')
    result = {'file': str(f), 'before': before, 'after': after, 'dryRun': dry_run, 'backup': None, 'archive': 'skipped'}
    if dry_run:
        return result

    data_dir.mkdir(parents=True, exist_ok=True)
    if f.exists():
        b = f.with_name(f'{f.stem}.pre-legacy.{int(time.time())}.json')
        b.write_bytes(f.read_bytes())
        result['backup'] = str(b)
        out(f'  zaxira: {b.name}')
    write_blob(f, merged)
    out(f'  yozildi: {f}')

    # arxiv (db.py bo'lsa): init(data_dir) sxemani ochadi, archive_state kunlik faktlarni yozadi
    try:
        import db  # noqa: WPS433
        fn = getattr(db, 'archive_state', None)
        if fn is None:
            result['archive'] = 'db.archive_state yo‘q'
        else:
            if callable(getattr(db, 'init', None)):
                db.init(data_dir)
            st = fn(uid, merged)
            result['archive'] = 'ok' + (f' {st}' if st else '')
    except ImportError:
        result['archive'] = 'db moduli yo‘q'
    except Exception as e:  # noqa: BLE001
        result['archive'] = f'xato: {e}'
    out(f"  arxiv: {result['archive']}")
    return result


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    dry = '--dry-run' in argv
    argv = [a for a in argv if a != '--dry-run']
    if len(argv) != 3:
        print('Foydalanish: legacy.py <data_dir> <uid> <old.json> [--dry-run]', file=sys.stderr)
        return 2
    run_import(argv[0], argv[1], argv[2], dry_run=dry)
    return 0


if __name__ == '__main__':
    sys.exit(main())
