# -*- coding: utf-8 -*-
"""
Push eslatmalar (push.py + /api/push/*) — 2026-11-11.

    .venv/bin/python tests/test_push.py

Tarmoqqa chiqmaydi: yuborish (push.send_one) soxta funksiya bilan almashtiriladi.
Shifrlash RFC 8291 dagi namunaga bayt-baytigacha solishtiriladi — bu o'tsa, brauzer
xabarni ocha oladi; VAPID imzosi ochiq kalit bilan tekshiriladi.
"""
import json
import os
import sys
import tempfile
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

TMP = Path(tempfile.mkdtemp(prefix="dash-push-"))
os.environ.update({
    "MA_DEV": "0", "MA_DATA_DIR": str(TMP), "MA_PASSCODE": "sinov-parol-12345",
    "MA_INVITE": "", "MA_REGISTER": "0", "MA_BOT_TOKEN": "", "MA_USERS": "",
    "GOOGLE_CLIENT_ID": "", "GOOGLE_CLIENT_SECRET": "", "MA_ALLOWED_EMAILS": "",
    "AI_API_KEY": "", "OPENAI_API_KEY": "", "WHOOP_CLIENT_ID": "",
    "MA_PUSH": "0",        # fon oqimi sinovda ishga tushmasin — tick() qo'lda chaqiriladi
})

import api  # noqa: E402 — env yuqorida qo'yilishi shart
import push  # noqa: E402
import vault  # noqa: E402
from cryptography.hazmat.primitives import hashes  # noqa: E402
from cryptography.hazmat.primitives.asymmetric import ec  # noqa: E402
from cryptography.hazmat.primitives.asymmetric.utils import encode_dss_signature  # noqa: E402

FAILS, OK = [], []


def check(name, cond, detail=""):
    (OK if cond else FAILS).append(name)
    print(("  ✓ " if cond else "  ✗ ") + name + (f"  — {detail}" if detail and not cond else ""))


def raises(fn):
    try:
        fn()
    except Exception:  # noqa: BLE001
        return True
    return False


def browser():
    """Brauzer o'rnida: kalit juftligi + auth siri, PushSubscription.toJSON() ko'rinishida."""
    k = ec.generate_private_key(ec.SECP256R1())
    auth = os.urandom(16)
    return k, auth, {"p256dh": push.b64u(push._pub_bytes(k)), "auth": push.b64u(auth)}


def sub_json(n, keys):
    return {"endpoint": f"https://fcm.googleapis.com/fcm/send/sinov-{n}-abcdefghij", "keys": keys}


# ── 1. Shifrlash: RFC 8291 §5 namunasi ──────────────────────────────────────────
print("\nShifrlash (RFC 8291)")
as_priv = push.private_from_b64("yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw")
ua_priv = push.private_from_b64("q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94")
ua_pub = push.b64ud("BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4")
auth = push.b64ud("BTBZMqHH6r4Tts7J_aSIgg")
salt = push.b64ud("DGv6ra1nlYgDCS1FRnbzlw")
want = ("DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_y"
        "l95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN")
plain = b"When I grow up, I want to be a watermelon"
check("ochiq kalit RFC dagiga mos", push.b64u(push._pub_bytes(as_priv)) ==
      "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8")
check("shifr RFC namunasi bilan bayt-baytigacha bir xil",
      push.b64u(push.encrypt(ua_pub, auth, plain, as_private=as_priv, salt=salt)) == want)
check("RFC namunasi ochiladi", push.decrypt(ua_priv, auth, push.b64ud(want)) == plain)
k, a, keys = browser()
msg = "Bomdod — 10 daqiqadan keyin · Бомдод".encode()
body = push.encrypt(push.b64ud(keys["p256dh"]), a, msg)
check("tasodifiy kalit bilan borib-kelish (kirill harfi bilan)", push.decrypt(k, a, body) == msg)
check("har safar yangi tuz va kalit", push.encrypt(push.b64ud(keys["p256dh"]), a, msg)[:16] != body[:16])
check("noto'g'ri p256dh — xato", raises(lambda: push.encrypt(b"\x04" + b"\x00" * 10, a, msg)))
check("noto'g'ri auth — xato", raises(lambda: push.encrypt(push.b64ud(keys["p256dh"]), b"x" * 5, msg)))
check("4 KB dan katta xabar — xato", raises(lambda: push.encrypt(push.b64ud(keys["p256dh"]), a, b"x" * 4096)))

# ── 2. VAPID (RFC 8292) ─────────────────────────────────────────────────────────
print("\nVAPID")
kp = push.new_keypair()
priv = push.private_from_b64(kp["d"])
check("kalit juftligi bir-biriga mos", push.b64u(push._pub_bytes(priv)) == kp["pub"])
now = time.time()
hdr = push.vapid_auth(priv, kp["pub"], "https://fcm.googleapis.com/fcm/send/abc", "https://example.uz", now=now)
check("sarlavha shakli: vapid t=…, k=…", hdr.startswith("vapid t=") and hdr.endswith(", k=" + kp["pub"]))
jwt = hdr[len("vapid t="):hdr.index(", k=")]
h64, c64, s64 = jwt.split(".")
claims = json.loads(push.b64ud(c64))
check("alg ES256", json.loads(push.b64ud(h64)) == {"typ": "JWT", "alg": "ES256"})
check("aud — faqat sxema va xost", claims["aud"] == "https://fcm.googleapis.com")
check("exp 24 soatdan oshmaydi", now < claims["exp"] <= now + 24 * 3600)
check("sub — aloqa manzili", claims["sub"] == "https://example.uz")
sig = push.b64ud(s64)
pub = ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), push.b64ud(kp["pub"]))
try:
    pub.verify(encode_dss_signature(int.from_bytes(sig[:32], "big"), int.from_bytes(sig[32:], "big")),
               f"{h64}.{c64}".encode(), ec.ECDSA(hashes.SHA256()))
    ok = len(sig) == 64
except Exception:  # noqa: BLE001
    ok = False
check("imzo ochiq kalit bilan tasdiqlanadi (64 bayt r||s)", ok)

# ── 3. Manzil tekshiruvi (SSRF) ─────────────────────────────────────────────────
print("\nManzil (SSRF)")
for u in ("https://fcm.googleapis.com/fcm/send/abc123",
          "https://web.push.apple.com/QGx1Y2t5-abc",
          "https://updates.push.services.mozilla.com/wpush/v2/abc",
          "https://wns2-par02p.notify.windows.com/w/?token=abc",
          "https://fcm.googleapis.com:443/fcm/send/abc123"):
    check(f"ruxsat: {u[:46]}", push.endpoint_ok(u))
for u in ("http://fcm.googleapis.com/fcm/send/abc123",                 # https emas
          "https://fcm.googleapis.com:8443/fcm/send/abc123",           # boshqa port
          "https://user:pw@fcm.googleapis.com/fcm/send/abc",           # login bilan
          "https://fcm.googleapis.com.evil.uz/fcm/send/abc123",        # qo'shimcha domen
          "https://evilfcm.googleapis.com/fcm/send/abc123",            # o'xshash nom
          "https://169.254.169.254/latest/meta-data/xx",               # bulut metadata
          "https://localhost/fcm/send/abc123456789",
          "https://127.0.0.1/fcm/send/abc123456789",
          "https://[::1]/fcm/send/abc123456789",
          "file:///etc/passwd/abcdefghijklmn", "https://x", None, 123,
          "https://fcm.googleapis.com/" + "a" * 1100):
    check(f"rad: {str(u)[:46]}", not push.endpoint_ok(u))

# ── 4. Obuna va jadvalni tozalash ───────────────────────────────────────────────
print("\nKirishni tozalash")
_, _, keys = browser()
s = push.clean_sub(sub_json(1, keys))
check("to'g'ri obuna qabul qilinadi", s and set(s) == {"endpoint", "p256dh", "auth"})
check("standart base64 (+/=) ham o'qiladi",
      push.clean_sub(sub_json(1, {"p256dh": keys["p256dh"].replace("-", "+").replace("_", "/") + "=",
                                  "auth": keys["auth"]})) is not None)
check("egri ustida bo'lmagan nuqta rad etiladi",
      push.clean_sub(sub_json(1, {"p256dh": push.b64u(b"\x04" + b"\x01" * 64), "auth": keys["auth"]})) is None)
check("auth 16 bayt bo'lmasa rad", push.clean_sub(sub_json(1, {"p256dh": keys["p256dh"], "auth": "AAAA"})) is None)
check("ruxsatsiz manzil rad", push.clean_sub({"endpoint": "https://evil.uz/abcdefghijklmnopq", "keys": keys}) is None)
check("ro'yxat emas — None", push.clean_sub(["x"]) is None and push.clean_sub(None) is None)

now = time.time()
raw = [
    {"id": "p:bomdod:2026-11-12", "at": now + 3600, "title": "Bomdod", "body": "05:58", "url": "./#prayer", "tag": "p-bomdod"},
    {"id": "eski", "at": now - push.GRACE - 5, "title": "Eski"},                  # muddati o'tgan
    {"id": "uzoq", "at": now + push.HORIZON + 60, "title": "Uzoq"},               # juda uzoq
    {"id": "nomsiz", "at": now + 60, "title": "   "},                             # sarlavhasiz
    {"id": "p:bomdod:2026-11-12", "at": now + 3600, "title": "Takror"},           # takror
    {"id": "js", "at": now + 120, "title": "JS", "url": "javascript:alert(1)"},
    {"id": "tashqi", "at": now + 130, "title": "Tashqi", "url": "https://evil.uz"},
    {"id": "qo'shtirnoq", "at": now + 140, "title": "Q", "url": './#a"><img'},
    {"id": "erta", "at": now + 30, "title": "  Ko'p    bo'shliq  ", "body": "x" * 999},
    "satr", None, {"id": "at-yo'q", "title": "X"}, {"id": "at-matn", "at": "ertaga", "title": "X"},
]
items = push.clean_items(raw, now)
ids = [x["id"] for x in items]
check("faqat yaroqlilari qoladi", ids == ["erta", "js", "tashqi", "qo'shtirnoq", "p:bomdod:2026-11-12"], str(ids))
by = {x["id"]: x for x in items}
check("javascript: havola → ./", by["js"]["url"] == "./")
check("tashqi havola → ./", by["tashqi"]["url"] == "./")
check("qo'shtirnoqli havola → ./", by["qo'shtirnoq"]["url"] == "./")
check("ichki havola saqlanadi", by["p:bomdod:2026-11-12"]["url"] == "./#prayer")
check("bo'shliqlar yig'iladi", by["erta"]["title"] == "Ko'p bo'shliq")
check("matn uzunligi cheklanadi", len(by["erta"]["body"]) == push.BODY_MAX)
check("tag bo'lmasa — id", by["erta"]["tag"] == "erta")
many = push.clean_items([{"id": f"t{i}", "at": now + 60 + i, "title": "x"} for i in range(push.MAX_ITEMS + 50)], now)
check(f"ko'pi bilan {push.MAX_ITEMS} ta", len(many) == push.MAX_ITEMS)
check("ro'yxat emas — bo'sh", push.clean_items({"a": 1}, now) == [])
pl = json.loads(push.payload_of(by["p:bomdod:2026-11-12"]))
check("payload qisqa kalitlar bilan", set(pl) == {"t", "b", "u", "g", "ts"} and pl["g"] == "p-bomdod")

# ── 5. API: kirmasdan yo'q ──────────────────────────────────────────────────────
print("\nAPI ruxsat")
c = api.app.test_client()
check("GET /api/push → 401", c.get("/api/push").status_code == 401)
for p in ("/api/push/subscribe", "/api/push/unsubscribe", "/api/push/schedule", "/api/push/test"):
    check(f"POST {p} → 401", c.post(p, json={}).status_code == 401)

# ── 6. API: kirgan odam ─────────────────────────────────────────────────────────
print("\nAPI")
SENT = []        # (endpoint, payload) — soxta yuboruvchi shu yerga yozadi
CODES = {}       # endpoint → qaytariladigan HTTP kod (bo'lmasa 201)


def fake_send(sub, payload, priv, pub_b64, ttl=push.TTL, urgency="high"):
    SENT.append((sub["endpoint"], payload))
    return CODES.get(sub["endpoint"], 201)


push.send_one = fake_send
r = c.post("/api/login", json={"pass": "sinov-parol-12345"}, headers={"X-Forwarded-For": "10.1.1.1"})
check("parol bilan kirildi", r.status_code == 200, str(r.status_code))
uid = c.get("/api/me").get_json().get("uid") or "me"
r = c.get("/api/push")
j = r.get_json() or {}
check("holat: kalit beriladi (65 baytli nuqta)", r.status_code == 200 and len(push.b64ud(j.get("key", ""))) == 65)
check("holat: obuna yo'q", j.get("subs") == [] and j.get("items") == 0)
check("kalit qayta so'ralganda o'zgarmaydi", c.get("/api/push").get_json()["key"] == j["key"])
vf = TMP / ".vapid"
check(".vapid shifrlangan holda saqlanadi", vf.exists() and vault.is_sealed(vf.read_bytes()))

_, _, keys1 = browser()
s1 = sub_json(1, keys1)
r = c.post("/api/push/subscribe", json={"subscription": s1}, headers={"User-Agent": "Sinov/1.0 (Android)"})
check("obuna qo'shildi", r.status_code == 200 and r.get_json()["subs"] == 1, r.get_data(as_text=True)[:120])
check("xuddi shu obuna takrorlanmaydi",
      c.post("/api/push/subscribe", json={"subscription": s1}).get_json()["subs"] == 1)
check("yaroqsiz obuna → 400",
      c.post("/api/push/subscribe", json={"subscription": {"endpoint": "https://evil.uz/x" * 3, "keys": keys1}}).status_code == 400)
pf = TMP / (api._safe_uid(uid) + ".push")
check("obuna fayli <uid>.push (.json emas — hisoblar soniga kirmaydi)", pf.exists())
check(".push fayli shifrlangan", vault.is_sealed(pf.read_bytes()))
check(".push fayli 0600", (pf.stat().st_mode & 0o777) == 0o600, oct(pf.stat().st_mode & 0o777))

r = c.post("/api/push/schedule", json={"items": raw})
check("jadval qabul qilindi", r.status_code == 200 and r.get_json()["n"] == 5, r.get_data(as_text=True)[:120])
st = c.get("/api/push").get_json()
check("holatda keyingi eslatma ko'rinadi", st["items"] == 5 and st["next"] and st["next"]["title"] == "Ko'p bo'shliq")
check("jadval 512 KB dan katta — 413",
      c.post("/api/push/schedule", data=b"[" + b" " * (600 * 1024) + b"]",
             headers={"Content-Type": "application/json"}).status_code == 413)

SENT.clear()
r = c.post("/api/push/test", json={"title": "Sinov", "body": "Ishlayapti"})
check("sinov xabari yuborildi", r.status_code == 200 and r.get_json()["sent"] == 1 and len(SENT) == 1)
check("sinov xabari matni", json.loads(SENT[0][1])["t"] == "Sinov")
codes = [c.post("/api/push/test", json={}).status_code for _ in range(push.TEST_LIMIT)]
check(f"{push.TEST_LIMIT} tadan keyin 429", codes[-1] == 429 and codes.count(200) == push.TEST_LIMIT - 1, str(codes))
check("boshqa qurilmaga (endpoint) sinov — 404",
      c.post("/api/push/test", json={"endpoint": "https://fcm.googleapis.com/fcm/send/yoq-abcdef"}).status_code == 404)

# ── 7. Bitta brauzer — bitta egasi ──────────────────────────────────────────────
print("\nEgasi")
P = api.PUSH
P.subscribe("ikkinchi", push.clean_sub(s1), "https://example.uz", "Sinov")
check("boshqa hisob shu brauzerni olsa — avvalgisidan o'chadi", P.load(uid)["subs"] == [])
check("yangi egada bor", len(P.load("ikkinchi")["subs"]) == 1)
r = c.post("/api/push/subscribe", json={"subscription": s1})
check("qaytib olinadi", r.get_json()["subs"] == 1 and P.load("ikkinchi")["subs"] == [])
for i in range(push.MAX_SUBS + 3):
    _, _, kk = browser()
    P.subscribe("kop", push.clean_sub(sub_json(100 + i, kk)), "https://example.uz", "x")
check(f"bir hisobda ko'pi bilan {push.MAX_SUBS} qurilma", len(P.load("kop")["subs"]) == push.MAX_SUBS)
check("chiqishda obuna o'chadi",
      c.post("/api/push/unsubscribe", json={"endpoint": s1["endpoint"]}).get_json()["removed"] is True
      and P.load(uid)["subs"] == [])
c.post("/api/push/subscribe", json={"subscription": s1})

# ── 8. Jadval oqimi (tick) ──────────────────────────────────────────────────────
print("\nJadval oqimi")
SENT.clear()
t0 = time.time()
sched = [{"id": "hozir", "at": t0 + 5, "title": "Hozir"},
         {"id": "keyin", "at": t0 + 3600, "title": "Keyin"}]
P.set_items(uid, push.clean_items(sched, t0))
check("vaqti kelmagan — yuborilmaydi", P.tick(t0) == 0 and SENT == [])
check("vaqti keldi — bitta ketdi", P.tick(t0 + 10) == 1 and len(SENT) == 1 and json.loads(SENT[0][1])["t"] == "Hozir")
check("ikkinchi marta yuborilmaydi", P.tick(t0 + 20) == 0 and len(SENT) == 1)
check("o'zgarmagan fayl qayta ochilmaydi (kesh)", P._seen.get(pf, (0, 0))[1] == int(t0 + 3600))
check("mijoz jadvalni qayta yuborsa ham takrorlanmaydi",
      (P.set_items(uid, push.clean_items(sched, t0 + 30)), P.tick(t0 + 31))[1] == 0 and len(SENT) == 1)

SENT.clear()
P.set_items(uid, push.clean_items([{"id": "kech", "at": t0 + 100, "title": "Kech"}], t0))
check(f"server {push.GRACE // 60} daqiqadan ko'p to'xtagan bo'lsa — eskisi yuborilmaydi",
      P.tick(t0 + 100 + push.GRACE + 1) == 0 and SENT == [])
check("eskisi ro'yxatdan tushadi", P.load(uid)["items"] == [])

SENT.clear()
CODES[s1["endpoint"]] = 500
P.set_items(uid, push.clean_items([{"id": "x1", "at": t0 + 200, "title": "X"}], t0))
P.tick(t0 + 201)
sub = P.load(uid)["subs"][0]
check("500 — obuna qoladi, xato sanaladi", sub["fails"] == 1)
CODES[s1["endpoint"]] = 201
P.set_items(uid, push.clean_items([{"id": "x2", "at": t0 + 300, "title": "X"}], t0))
P.tick(t0 + 301)
check("muvaffaqiyatdan keyin xato hisobi nolga tushadi", P.load(uid)["subs"][0]["fails"] == 0 and P.load(uid)["subs"][0]["ok"])
CODES[s1["endpoint"]] = 410
P.set_items(uid, push.clean_items([{"id": "x3", "at": t0 + 400, "title": "X"}], t0))
P.tick(t0 + 401)
check("410 (obuna bekor) — o'chiriladi", P.load(uid)["subs"] == [])
st = c.get("/api/push").get_json()
check("holatda ham ko'rinadi", st["subs"] == [])

_, _, kk = browser()
P.subscribe("tushuvchi", push.clean_sub(sub_json(900, kk)), "https://example.uz", "x")
ep = sub_json(900, kk)["endpoint"]
CODES[ep] = 0       # tarmoq xatosi
P.update("tushuvchi", lambda d: d["subs"][0].__setitem__("fails", push.FAIL_DROP - 1))
P.deliver("tushuvchi", P.load("tushuvchi")["subs"], b"{}")
check(f"{push.FAIL_DROP} marta ketma-ket xato — obuna tashlanadi", P.load("tushuvchi")["subs"] == [])

# ── 9. Buzilgan fayl ilovani yiqitmaydi ─────────────────────────────────────────
print("\nChidamlilik")
bad = TMP / "buzuq.push"
bad.write_bytes(b"DENC1" + os.urandom(80))
check("buzilgan shifr — bo'sh holat, xato yo'q", P._read(bad)["subs"] == [])
(TMP / "buzuq2.push").write_text("{yarim json")
check("buzilgan JSON — bo'sh holat", P._read(TMP / "buzuq2.push")["items"] == [])
check("tick buzilgan fayllar ustida yiqilmaydi", not raises(lambda: P.tick(time.time())))
# Jonli serverda (11.11) oqim qulfi .lock.push ham *.push ga tushib, foydalanuvchi fayli
# sifatida o'qilgan va har ishga tushishda ogohlantirish yozgan edi.
lockf = TMP / ".lock.push"
lockf.write_bytes(b"")
class _Warns(__import__("logging").Handler):
    def __init__(self): super().__init__(); self.got = []
    def emit(self, r): self.got.append(r.getMessage())
wh = _Warns(); P.log.addHandler(wh)
P._seen.clear(); P.tick(time.time()); P.log.removeHandler(wh)
check("oqim qulfi .lock.push foydalanuvchi fayli emas", lockf not in P._user_files() and (TMP / "buzuq2.push") in P._user_files())
check("tick qulf faylini o'qimaydi va unga yozmaydi",
      lockf.read_bytes() == b"" and not any(".lock.push" in m for m in wh.got), wh.got)
check("MA_PUSH=0 — fon oqimi ishga tushmagan",
      not any(t.name == "push" for t in __import__("threading").enumerate()))

__import__("shutil").rmtree(TMP, ignore_errors=True)
print(f"\n{len(OK)} o'tdi, {len(FAILS)} yiqildi")
if FAILS:
    print("Yiqilganlar:", *FAILS, sep="\n  ")
    sys.exit(1)
