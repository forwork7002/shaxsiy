"""AI — Anthropic (Claude) yo'li: haqiqiy `anthropic` SDK (1.4.0, serverdagi bilan bir xil) soxta
HTTP transport bilan. Tarmoqqa chiqmaydi: so'rov tanasi va sarlavhalari tekshiriladi.
  • ikkala kalit bo'lsa ham sukut — Anthropic, model claude-opus-5-5, effort low;
  • effort faqat 4.6+/5-avlod modellarga, server zaxirasi (fallbacks) faqat qabul qiluvchi modellarga;
  • rad etish (refusal) bo'sh javob emas — ai_refused; /api/ai, /api/ai/stream, /api/food/analyze.
Ishga tushirish:  .venv/bin/python tests/test_ai_anthropic.py   (.venv'da anthropic==1.4.0 kerak)"""
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
TMP = Path(tempfile.mkdtemp(prefix="dash-ai-"))
BASE_ENV = {
    "MA_DEV": "1", "MA_DATA_DIR": str(TMP), "MA_BOT_TOKEN": "", "MA_USERS": "",
    "WHOOP_CLIENT_ID": "", "MA_REGISTER": "0", "MA_WHOOP_POLL": "0",
    "AI_PROVIDER": "", "AI_MODEL": "", "AI_EFFORT": "", "ANTHROPIC_API_KEY": "",
}
os.environ.update(BASE_ENV)
os.environ.update({"AI_API_KEY": "sk-ant-test", "OPENAI_API_KEY": "sk-openai-test"})

import anthropic  # noqa: E402
import httpx2  # noqa: E402

import api  # noqa: E402

FAILS, N = [], [0]


def ok(name, cond, extra=None):
    N[0] += 1
    print(("  ok   " if cond else "  FAIL ") + name + ("" if cond or extra is None else f"  -> {extra!r}"))
    if not cond:
        FAILS.append(name)


# ── soxta Anthropic: har so'rov yoziladi, javob navbatdan olinadi ──
SEEN = []
QUEUE = []


def msg(content, stop="end_turn", model="claude-opus-5-5"):
    return {"id": "msg_1", "type": "message", "role": "assistant", "model": model, "content": content,
            "stop_reason": stop, "stop_sequence": None, "usage": {"input_tokens": 11, "output_tokens": 7}}


def sse_body(chunks, stop="end_turn"):
    ev = [("message_start", {"type": "message_start", "message": msg([], None)})]
    if chunks:
        ev.append(("content_block_start", {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}))
        for c in chunks:
            ev.append(("content_block_delta", {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": c}}))
        ev.append(("content_block_stop", {"type": "content_block_stop", "index": 0}))
    ev.append(("message_delta", {"type": "message_delta", "delta": {"stop_reason": stop, "stop_sequence": None}, "usage": {"output_tokens": 9}}))
    ev.append(("message_stop", {"type": "message_stop"}))
    return "".join(f"event: {e}\ndata: {json.dumps(d)}\n\n" for e, d in ev).encode()


def handler(request):
    body = json.loads(request.content.decode() or "{}")
    SEEN.append({"path": request.url.path, "query": str(request.url.query, "ascii") if isinstance(request.url.query, bytes) else str(request.url.query),
                 "beta": request.headers.get("anthropic-beta", ""), "body": body})
    kind, payload = QUEUE.pop(0) if QUEUE else ("json", msg([{"type": "text", "text": "Salom"}]))
    if kind == "sse":
        return httpx2.Response(200, headers={"content-type": "text/event-stream"}, content=payload)
    if kind == "err":   # (status, xabar) — Anthropic xato shakli
        etype = {400: "invalid_request_error", 429: "rate_limit_error"}.get(payload[0], "api_error")
        return httpx2.Response(payload[0], json={"type": "error", "error": {"type": etype, "message": payload[1]}})
    return httpx2.Response(200, json=payload)


def fake_client(key):
    c = anthropic.Anthropic(api_key=key, max_retries=0,
                            http_client=anthropic.DefaultHttpxClient(transport=httpx2.MockTransport(handler)))
    api._ai_clients[hashlib.sha256(key.encode()).hexdigest()] = c


fake_client("sk-ant-test")
fake_client("sk-ant-own")


def last():
    return SEEN[-1] if SEEN else {}


def own(model):
    return {"kind": "anthropic", "proto": "anthropic", "key": "sk-ant-own", "model": model, "base": "https://api.anthropic.com", "own": True}


print("— sozlama")
ok("ikkala kalit bor, AI_PROVIDER bo'sh → anthropic", api.AI_PROVIDER == "anthropic", api.AI_PROVIDER)
ok("sukut modeli claude-opus-5-5", api.AI_MODEL == "claude-opus-5-5", api.AI_MODEL)
ok("sukut effort low", api.AI_EFFORT == "low", api.AI_EFFORT)
srv = api.ai_server_cfg()
ok("server cfg — anthropic sim, o'z kaliti emas", srv["proto"] == "anthropic" and srv["key"] == "sk-ant-test" and not srv["own"], srv)
ok("odam o'zi ulaydigan Claude'ning sukut modeli ham 5.5", api.AI_KINDS["anthropic"][2] == "claude-opus-5-5")

print("— so'rov tanasi (claude-opus-5-5)")
out, fail = api.ai_call(srv, "tizim", [{"role": "user", "content": "salom"}], 1400)
r = last()
ok("javob matni olinadi", fail is None and out["text"] == "Salom", (out, fail))
ok("model/max_tokens/system", r["body"].get("model") == "claude-opus-5-5" and r["body"].get("max_tokens") == 1400 and r["body"].get("system") == "tizim", r["body"])
ok("output_config.effort = low", r["body"].get("output_config") == {"effort": "low"}, r["body"].get("output_config"))
ok("fallbacks = default", r["body"].get("fallbacks") == "default", r["body"].get("fallbacks"))
ok("beta sarlavha server-side-fallback-2026-07-01", "server-side-fallback-2026-07-01" in r["beta"], r["beta"])
ok("thinking/temperature yuborilmaydi (Opus 5.5 da 400)", "thinking" not in r["body"] and "temperature" not in r["body"], list(r["body"]))
ok("usage hisobi", out["usage"] == {"in": 11, "out": 7}, out.get("usage"))

print("— boshqa modellar (odam o'z kalitida tanlagan)")
api.ai_call(own("claude-haiku-4-5"), "", [{"role": "user", "content": "x"}], 900)
r = last()
ok("haiku-4-5: effort yo'q (400 bo'lardi)", "output_config" not in r["body"], r["body"])
ok("haiku-4-5: fallbacks va beta yo'q", "fallbacks" not in r["body"] and not r["beta"], (r["body"].get("fallbacks"), r["beta"]))
ok("haiku-4-5: system bo'sh bo'lsa yuborilmaydi", "system" not in r["body"])
api.ai_call(own("claude-haiku-5-5"), "", [{"role": "user", "content": "x"}], 900)
r = last()
ok("haiku-5-5: effort bor, fallbacks yo'q", r["body"].get("output_config") == {"effort": "low"} and "fallbacks" not in r["body"], r["body"])
for m, eff in (("claude-sonnet-4-6", True), ("claude-opus-4-8", True), ("claude-opus-4-5-20251101", False), ("claude-sonnet-4-5-20250929", False),
               ("claude-fable-5-2", True), ("claude-sonnet-5-5", True), ("claude-opus-5", True)):
    api.ai_call(own(m), "", [{"role": "user", "content": "x"}], 900)
    ok(f"{m}: effort {'bor' if eff else 'yoq'}", ("output_config" in last()["body"]) == eff, last()["body"].get("output_config"))
api.ai_call(own("claude-sonnet-5-5"), "", [{"role": "user", "content": "x"}], 900)
ok("sonnet-5-5: fallbacks default", last()["body"].get("fallbacks") == "default")

print("— rad etish va zaxira")
QUEUE.append(("json", msg([], "refusal")))
out, fail = api.ai_call(srv, "", [{"role": "user", "content": "x"}], 900)
ok("bo'sh rad etish → ai_refused 422", out is None and fail == ("ai_refused", 422), (out, fail))
QUEUE.append(("json", msg([{"type": "text", "text": "qisman"}], "refusal")))
out, fail = api.ai_call(srv, "", [{"role": "user", "content": "x"}], 900)
ok("matnli rad etish → kelgan matn qaytadi", fail is None and out["text"] == "qisman", (out, fail))
QUEUE.append(("json", msg([{"type": "fallback", "from": {"model": "claude-opus-5-5"}, "to": {"model": "claude-opus-4-8"}},
                           {"type": "text", "text": "zaxiradan"}], model="claude-opus-4-8")))
out, fail = api.ai_call(srv, "", [{"role": "user", "content": "x"}], 900)
ok("fallback bloki o'tkazib yuboriladi, zaxira modeli yoziladi", fail is None and out["text"] == "zaxiradan" and out["model"] == "claude-opus-4-8", (out, fail))
QUEUE.append(("json", msg([{"type": "thinking", "thinking": "", "signature": "sig"}, {"type": "text", "text": "fikrdan keyin"}])))
out, fail = api.ai_call(srv, "", [{"role": "user", "content": "x"}], 900)
ok("thinking bloki matnga qo'shilmaydi", fail is None and out["text"] == "fikrdan keyin", (out, fail))

c = api.app.test_client()
print("— /api/ai")
n0 = len(SEEN)
res = c.post("/api/ai", json={"messages": [{"role": "user", "content": "kunim qanday?"}], "system": "s", "max_tokens": 1400, "kind": "card:today"})
ok("200 va matn", res.status_code == 200 and res.get_json().get("text") == "Salom", (res.status_code, res.get_json()))
QUEUE.append(("json", msg([{"type": "thinking", "thinking": "", "signature": "s"}], "max_tokens")))
res = c.post("/api/ai", json={"messages": [{"role": "user", "content": "x"}], "max_tokens": 1400})
ok("fikrlash byudjetni yesa — bir marta 3× byudjet bilan qayta", res.status_code == 200 and SEEN[-1]["body"]["max_tokens"] == 4200, (res.status_code, SEEN[-1]["body"].get("max_tokens")))
QUEUE.append(("json", msg([], "refusal")))
res = c.post("/api/ai", json={"messages": [{"role": "user", "content": "x"}]})
ok("rad etish → 422 ai_refused", res.status_code == 422 and res.get_json().get("error") == "ai_refused", (res.status_code, res.get_json()))

print("— /api/ai/stream")
QUEUE.append(("sse", sse_body(["Sa", "lom"])))
res = c.post("/api/ai/stream", json={"messages": [{"role": "user", "content": "x"}], "system": "s", "max_tokens": 1200, "kind": "yusa:today"})
txt = res.get_data(as_text=True)
ok("bo'laklar keladi", '"d": "Sa"' in txt and '"d": "lom"' in txt, txt[:300])
ok("oxirida done + model", '"done": true' in txt and "claude-opus-5-5" in txt, txt[-200:])
r = last()
ok("oqim: stream=true, effort, fallbacks, beta", r["body"].get("stream") is True and r["body"].get("output_config") == {"effort": "low"}
   and r["body"].get("fallbacks") == "default" and "server-side-fallback" in r["beta"], (r["body"], r["beta"]))
QUEUE.append(("sse", sse_body([], "refusal")))
txt = c.post("/api/ai/stream", json={"messages": [{"role": "user", "content": "x"}]}).get_data(as_text=True)
ok("oqimda bo'sh rad etish → ai_refused", '"error": "ai_refused"' in txt and '"done": true' in txt, txt[-300:])
QUEUE.append(("sse", sse_body(["yarim"], "refusal")))
txt = c.post("/api/ai/stream", json={"messages": [{"role": "user", "content": "x"}]}).get_data(as_text=True)
ok("matn kelgandan keyingi rad etish — xato qo'shilmaydi", '"d": "yarim"' in txt and "ai_refused" not in txt, txt[-300:])

print("— /api/food/analyze")
food = {"title": "Osh", "items": [{"name": "osh", "grams": 350, "kcal": 680, "p": 22, "c": 80, "f": 30}],
        "score": 5, "processing": "mixed", "confidence": 0.7, "assumptions": "", "advice": "Yaxshi.", "tips": []}
QUEUE.append(("json", msg([{"type": "text", "text": json.dumps(food)}])))
res = c.post("/api/food/analyze", json={"text": "bir kosa osh", "lang": "uz"})
j = res.get_json() or {}
ok("tahlil 200, kkal o'qildi", res.status_code == 200 and j.get("total", {}).get("kcal") == 680, (res.status_code, j))
r = last()
parts = r["body"]["messages"][0]["content"]
ok("ovqat: matn qismi, effort, fallbacks, 4000 token", isinstance(parts, list) and parts[-1]["type"] == "text" and "osh" in parts[-1]["text"]
   and r["body"].get("output_config") == {"effort": "low"} and r["body"].get("fallbacks") == "default" and r["body"]["max_tokens"] == 4000, r["body"])

print("— hisobda mablag' tugashi (23.11 hodisasi: foydalanuvchi 12 soat «juda ko'p so'rov» ni ko'rdi)")
CREDIT = "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits."
QUEUE.append(("err", (400, CREDIT)))
res = c.post("/api/food/analyze", json={"text": "bir kosa osh", "lang": "uz"})
ok("ovqat: kredit tugagan → 402 ai_no_credit", res.status_code == 402 and (res.get_json() or {}).get("error") == "ai_no_credit", (res.status_code, res.get_json()))
QUEUE.append(("err", (400, "You have reached your specified API usage limits. You will regain access on 2026-12-01 at 00:00 UTC.")))
res = c.post("/api/ai", json={"messages": [{"role": "user", "content": "x"}]})
ok("chat: oylik xarajat chegarasi → 402 ai_no_credit", res.status_code == 402 and res.get_json().get("error") == "ai_no_credit", (res.status_code, res.get_json()))
QUEUE.append(("err", (400, CREDIT)))
res = c.post("/api/ai/stream", json={"messages": [{"role": "user", "content": "x"}]})
ok("oqim: kredit tugagan → 402 JSON (SSE emas)", res.status_code == 402 and res.get_json().get("error") == "ai_no_credit", (res.status_code, res.get_data(as_text=True)[:200]))
QUEUE.append(("err", (429, "Number of request tokens has exceeded your per-minute rate limit")))
res = c.post("/api/ai", json={"messages": [{"role": "user", "content": "x"}]})
ok("haqiqiy tezlik chegarasi → 429 rate_limited", res.status_code == 429 and res.get_json().get("error") == "rate_limited", (res.status_code, res.get_json()))
QUEUE.append(("err", (400, "model: claude-x not found")))
res = c.post("/api/ai", json={"messages": [{"role": "user", "content": "x"}]})
ok("boshqa 400 → api_400 (kredit deb aytilmaydi)", res.status_code == 502 and res.get_json().get("error", "").startswith("api_400"), (res.status_code, res.get_json()))
ok("OpenAI 429 «no credits remaining» → ai_no_credit",
   api._ai_fail(429, "You have no credits remaining. Add credits to continue using the API at https://platform.openai.com/settings/organization/billing/.") == ("ai_no_credit", 402))
ok("OpenAI 429 insufficient_quota → ai_no_credit", api._ai_fail(429, "You exceeded your current quota, please check your plan and billing details.") == ("ai_no_credit", 402))
ok("OpenAI oddiy tezlik chegarasi (billing havolasi bilan) → rate_limited",
   api._ai_fail(429, "Rate limit reached for gpt-5 on tokens per min. Add a payment method at https://platform.openai.com/account/billing to increase your rate limit.") == ("rate_limited", 429))

print("— /api/health")
h = c.get("/api/health").get_json()
ok("health: anthropic · claude-opus-5-5 · low", h.get("aiProvider") == "anthropic" and h.get("aiModel") == "claude-opus-5-5" and h.get("aiReasoning") == "low", h)

print("— env chegaralari (alohida jarayon)")


def boot(extra):
    env = {**os.environ, **BASE_ENV, "MA_DATA_DIR": tempfile.mkdtemp(prefix="dash-ai-b-"), "AI_API_KEY": "", "OPENAI_API_KEY": "", **extra}
    p = subprocess.run([sys.executable, "-c", "import api,json;print(json.dumps([api.AI_PROVIDER,api.AI_MODEL,api.AI_EFFORT]))"],
                       cwd=str(HERE.parent), env=env, capture_output=True, text=True, timeout=60)
    try:
        return json.loads(p.stdout.strip().splitlines()[-1])
    except Exception:  # noqa: BLE001
        return p.stderr[-300:]


ok("faqat OpenAI kaliti → openai (eski yo'l saqlangan)", boot({"OPENAI_API_KEY": "sk-x"})[0] == "openai")
ok("AI_PROVIDER=openai aniq yozilsa — hurmat qilinadi", boot({"AI_API_KEY": "sk-ant-x", "OPENAI_API_KEY": "sk-x", "AI_PROVIDER": "openai"})[0] == "openai")
ok("noto'g'ri AI_EFFORT → low", boot({"AI_API_KEY": "sk-ant-x", "AI_EFFORT": "turbo"})[2] == "low")
ok("AI_EFFORT=medium o'qiladi", boot({"AI_API_KEY": "sk-ant-x", "AI_EFFORT": " Medium "})[2] == "medium")
ok("AI_MODEL bo'sh qator → sukut", boot({"AI_API_KEY": "sk-ant-x", "AI_MODEL": ""})[1] == "claude-opus-5-5")

print(f"\n{N[0] - len(FAILS)}/{N[0]} o'tdi")
sys.exit(1 if FAILS else 0)
