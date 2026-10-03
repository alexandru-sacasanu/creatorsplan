"""Thumbnail Studio pieces that run without Gemini or a video."""
import io
import os
import sys

import pytest
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import thumbnail  # noqa: E402


def test_burn_text_wraps_and_stays_in_its_half():
    img = Image.new("RGB", (1280, 720), (20, 20, 20))
    out = thumbnail.burn_thumbnail_text(img, "0 A 10K EN 30 DÍAS", "left", "yellow")
    px = out.convert("RGB")
    # Something got drawn on the left half...
    left = px.crop((0, 0, 640, 720))
    assert max(left.getextrema()[0]) > 200
    # ...and the right half (where the subject lives) is untouched.
    right = px.crop((700, 0, 1280, 720))
    assert max(right.getextrema()[0]) < 60


def test_burn_text_no_text_is_a_noop():
    img = Image.new("RGB", (1280, 720), (0, 0, 0))
    assert thumbnail.burn_thumbnail_text(img, "  ", "left") is img


def test_finalize_cover_crops_to_1280x720_under_2mb(tmp_path):
    # A 2K-ish image with a different aspect ratio, full of noise so JPEG is heavy.
    import random
    noisy = Image.effect_noise((2048, 1536), 80).convert("RGB")
    out = tmp_path / "t.jpg"
    thumbnail.finalize_thumbnail(noisy, str(out))
    with Image.open(out) as saved:
        assert saved.size == (1280, 720)
    assert out.stat().st_size <= thumbnail.THUMB_MAX_BYTES


def test_rank_frame_rejects_tiny_faces():
    assert thumbnail.rank_frame(0, 0.0, None, [0, 0, 50, 50], (1920, 1080), 100) is None
    big = thumbnail.rank_frame(0, 0.0, None, [0, 0, 400, 400], (1920, 1080), 100)
    assert big and big["score"] > 0


def test_pick_spread_keeps_picks_apart_in_time():
    total = 1000
    # Three near-identical best frames at 500/505/510 and a weaker one far away.
    scored = [
        {"idx": 500, "score": 1.0}, {"idx": 505, "score": 0.99}, {"idx": 510, "score": 0.98},
        {"idx": 100, "score": 0.5}, {"idx": 900, "score": 0.4},
    ]
    picked = thumbnail.pick_spread(scored, 3, total)
    assert [p["idx"] for p in picked] == [100, 500, 900]


def test_normalise_concepts_clamps_and_pads():
    raw = [
        {"text": "esto funciona", "text_position": "diagonal", "text_color": "red", "scene": "a desk"},
        {"scene": ""},  # dropped
        "garbage",
    ]
    out = thumbnail.normalise_concepts(raw, 3, "My title", thumbnail_text_hint="hint")
    assert len(out) == 3
    assert out[0] == {"text": "ESTO FUNCIONA", "text_position": "left", "text_color": "white",
                      "scene": "a desk", "why": ""}
    assert out[1]["why"] == "fallback" and out[1]["text"] == "HINT"


def test_parse_json_tolerates_fences_and_prose():
    assert thumbnail._parse_json('Sure!\n```json\n{"a": 1}\n```') == {"a": 1}


def test_parse_json_ignores_trailing_garbage():
    assert thumbnail._parse_json('{"a": [1]}\n  ]\n}') == {"a": [1]}


class _FakeModels:
    """Stands in for client.models: raises the queued errors, then answers."""

    def __init__(self, errors):
        self.errors = list(errors)
        self.calls = []

    def generate_content(self, model, **kwargs):
        self.calls.append(model)
        if self.errors:
            raise self.errors.pop(0)
        return f"ok:{model}"


class _FakeClient:
    def __init__(self, errors):
        self.models = _FakeModels(errors)


UNAVAILABLE = RuntimeError("503 UNAVAILABLE. This model is currently experiencing high demand.")


@pytest.fixture
def no_sleep(monkeypatch):
    monkeypatch.setattr(thumbnail.time, "sleep", lambda s: None)
    monkeypatch.setattr(thumbnail, "_text_model_down_until", 0.0)


def test_generate_retries_a_503_then_succeeds(no_sleep):
    client = _FakeClient([UNAVAILABLE, UNAVAILABLE])
    assert thumbnail._generate(client, model=thumbnail.TEXT_MODEL, contents=["x"]) == f"ok:{thumbnail.TEXT_MODEL}"
    assert client.models.calls == [thumbnail.TEXT_MODEL] * 3


def test_generate_falls_back_when_the_text_model_stays_overloaded(no_sleep, monkeypatch):
    monkeypatch.setattr(thumbnail, "FALLBACK_TEXT_MODEL", "fallback-model")
    client = _FakeClient([UNAVAILABLE] * (len(thumbnail.RETRY_DELAYS) + 1))
    assert thumbnail._generate(client, model=thumbnail.TEXT_MODEL, contents=["x"]) == "ok:fallback-model"
    assert client.models.calls[-1] == "fallback-model"


def test_generate_image_model_has_no_fallback(no_sleep):
    client = _FakeClient([UNAVAILABLE] * (len(thumbnail.RETRY_DELAYS) + 1))
    with pytest.raises(RuntimeError, match="503"):
        thumbnail._generate(client, model=thumbnail.IMAGE_MODEL, contents=["x"])
    assert set(client.models.calls) == {thumbnail.IMAGE_MODEL}


def test_generate_does_not_retry_a_permanent_error(no_sleep):
    client = _FakeClient([ValueError("400 INVALID_ARGUMENT: API key not valid")])
    with pytest.raises(ValueError):
        thumbnail._generate(client, model=thumbnail.TEXT_MODEL, contents=["x"])
    assert len(client.models.calls) == 1


def test_generate_skips_the_overloaded_model_for_the_next_call(no_sleep, monkeypatch):
    monkeypatch.setattr(thumbnail, "FALLBACK_TEXT_MODEL", "fallback-model")
    client = _FakeClient([UNAVAILABLE] * (len(thumbnail.RETRY_DELAYS) + 1))
    thumbnail._generate(client, model=thumbnail.TEXT_MODEL, contents=["brainstorm"])
    before = len(client.models.calls)
    assert thumbnail._generate(client, model=thumbnail.TEXT_MODEL, contents=["critic"]) == "ok:fallback-model"
    assert client.models.calls[before:] == ["fallback-model"]  # no retries the second time
