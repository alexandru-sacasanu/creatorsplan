"""Google sign-in must not merge accounts on an email Google does not vouch for."""
import asyncio

from cloud import oauth


class _FakeGoogle:
    def __init__(self, userinfo):
        self._userinfo = userinfo

    async def authorize_access_token(self, request):
        return {"userinfo": self._userinfo}


class _FakeOAuth:
    def __init__(self, userinfo):
        self.google = _FakeGoogle(userinfo)


def _callback(monkeypatch, userinfo):
    monkeypatch.setattr(oauth, "oauth", _FakeOAuth(userinfo))
    return asyncio.run(oauth.google_callback(object()))


def test_unverified_email_is_refused(monkeypatch):
    res = _callback(monkeypatch, {"email": "someone@gmail.com", "sub": "1", "email_verified": False})
    assert res.headers["location"].endswith("#/auth/callback?error=unverified")


def test_missing_verified_flag_is_refused(monkeypatch):
    res = _callback(monkeypatch, {"email": "someone@gmail.com", "sub": "1"})
    assert res.headers["location"].endswith("#/auth/callback?error=unverified")


def test_no_email_is_refused(monkeypatch):
    res = _callback(monkeypatch, {"sub": "1", "email_verified": True})
    assert res.headers["location"].endswith("#/auth/callback?error=noemail")
