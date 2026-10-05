"""With accounts on, a user's own Gemini key (Settings) beats the server's."""
import asyncio
from types import SimpleNamespace

import app as app_module


class _Req:
    def __init__(self, headers):
        self.headers = headers


def _resolve(monkeypatch, user, headers):
    monkeypatch.setattr(app_module, "BILLING_ENABLED", True)

    async def _user(_request):
        return user

    monkeypatch.setattr(app_module, "_user_from_request", _user)
    monkeypatch.setattr(app_module, "managed_keys", SimpleNamespace(
        has_active_entitlement=lambda u: bool(u and u.entitled),
        gemini_key=lambda: "server-key"))
    return asyncio.run(app_module.resolve_gemini(_Req(headers)))


ENTITLED = SimpleNamespace(entitled=True)


def test_own_key_wins_for_an_entitled_user(monkeypatch):
    assert _resolve(monkeypatch, ENTITLED, {"X-Gemini-Key": " AIza-own "}) == "AIza-own"


def test_server_key_when_the_user_set_none(monkeypatch):
    assert _resolve(monkeypatch, ENTITLED, {}) == "server-key"
    assert _resolve(monkeypatch, ENTITLED, {"X-Gemini-Key": "  "}) == "server-key"


def test_a_key_does_not_unlock_a_user_without_a_plan(monkeypatch):
    assert _resolve(monkeypatch, SimpleNamespace(entitled=False), {"X-Gemini-Key": "AIza-own"}) is None
    assert _resolve(monkeypatch, None, {"X-Gemini-Key": "AIza-own"}) is None
