# CreatorsPlan

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

**AI video platform** with 3 tools in one: **Clip Generator**, **AI Shorts (UGC videos with AI actors)**, and **YouTube Studio**.

Two people on camera? CreatorsPlan stacks them instead of shrinking the wide shot, puts the captions on the seam where they cover nobody, and switches back to a face-tracked crop when the cut goes to one person. The AI picks the layout per video; nothing to configure.

---

## 3 Tools in 1 Platform

### 1. Clip Generator
Turn your long-form videos — podcasts, webinars, livestreams, vlogs, interviews — into viral-ready 9:16 shorts for TikTok, Instagram Reels, and YouTube Shorts.

### 2. AI Shorts (UGC Video Creator)
Generate marketing videos with AI actors for **any product or business**. No camera, no studio, no influencer budget. Just describe your product or paste a URL.

- **Two cost modes**: Low Cost (~$0.65/video) and Premium (~$2/video)
- Works for any business: SaaS, restaurants, e-commerce, coaching, local businesses
- AI-generated actors with lip-sync, voiceover, b-roll, and TikTok-style subtitles
- Choose from a shared avatar gallery or upload your own photo

### 3. YouTube Studio
Complete AI YouTube toolkit: thumbnails, titles and descriptions, ready to paste into YouTube.

- AI thumbnail generator with face overlay
- 10 viral title suggestions with refinement chat
- Auto-generated descriptions with chapter timestamps

### UGC Video Gallery
All generated videos and avatars are saved to a gallery.

- Gallery page with hover-to-play (`/gallery`)
- Individual video pages (`/video/{id}`)
- Avatar gallery with prompt history

---

## Key Features

### Clip Generator
- **Viral Moment Detection**: Google Gemini 3.1 Flash-Lite analyzes transcripts and scene boundaries to detect 3-15 high-potential moments
- **Runs fully local if you want**: point `LLM_BASE_URL` at Ollama, LM Studio, vLLM or any OpenAI-compatible server and the moment picker runs on your own model, no Google key needed (see [Run without a Google key](#6-run-without-a-google-key-local-llm-optional))
- **Smart 9:16 Cropping**: AI reframing per scene — TRACK mode (MediaPipe + YOLOv8 face tracking), GENERAL mode (blurred background), SPLIT mode (two speakers stacked, captions on the seam) and SCREENCAST mode (screen over presenter); the layout is picked per video by Gemini or forced from the dashboard
- **Auto Subtitles**: faster-whisper with word-level timestamps, styled and burned into clips
- **AI Voice Dubbing**: ElevenLabs integration for 30+ languages with voice cloning
- **Hook Text Overlays**: AI-generated attention-grabbing text overlays
- **AI Video Effects**: Gemini-generated FFmpeg filters for professional effects

### AI Shorts Pipeline
1. **Analyze**: Scrape website URL + web research, or generate from manual description
2. **Script**: AI writes viral scripts (hook - problem - solution - CTA format)
3. **Actor**: Generate AI actors with Flux 2 Pro or select from shared gallery
4. **Voice**: ElevenLabs TTS voiceover (English/Spanish, male/female)
5. **Video**: Talking head generation (Hailuo 2.3 Fast img2video + VEED Lipsync)
6. **B-roll**: AI-generated visuals with Ken Burns effect
7. **Composite**: FFmpeg final assembly with subtitles and hook overlays

### YouTube Studio
- AI-powered title generation with 10 viral options
- Interactive refinement chat for titles
- AI thumbnail generation with custom face + background
- Auto descriptions with chapter timestamps from Whisper transcript

### Infrastructure
- S3 cloud backup (private bucket for clips, public bucket for gallery/avatars)
- Async job queue with configurable concurrency

---

## Who Is This For?

- **Content creators** — Turn long videos into shorts automatically, ready for every platform
- **Marketing agencies** — Generate UGC videos for clients at scale, no actors or studios needed
- **SaaS founders** — Create product demos and marketing shorts from just a URL
- **E-commerce brands** — Product videos with AI actors for TikTok Shop, Instagram, YouTube
- **Local businesses** — Restaurants, gyms, real estate, coaching — affordable video marketing
- **Developers** — Self-host, customize the pipeline, integrate via API

---

## Requirements

- **Docker & Docker Compose**
- **Google Gemini API Key** ([Free — get it here](https://aistudio.google.com/app/apikey)) — required for all AI features
- **fal.ai API Key** ([Pay-per-use](https://fal.ai)) — required for AI Shorts (actor generation, video, lip-sync)
- **ElevenLabs API Key** ([Free tier](https://elevenlabs.io)) — required for voiceover/dubbing

---

## Getting Started

### 1. Clone

```bash
git clone <repo-url>
cd creatorsplan
```

### 2. Configure (optional)
```bash
cp .env.example .env
# Edit .env with your AWS keys for S3 backup
```

### 3. Launch
```bash
docker compose up --build
```

### 4. Open Dashboard
Navigate to **`http://localhost:5175`**

1. Go to **Settings** and enter your API keys (Gemini, fal.ai, ElevenLabs)
2. **Clip Generator**: Upload a long-form video to generate viral shorts
3. **AI Shorts**: Describe your product or paste a URL to generate UGC marketing videos
4. **YouTube Studio**: Generate thumbnails, titles, and descriptions for YouTube
5. **UGC Gallery**: Browse all generated videos and avatars

### 5. GPU acceleration (optional, NVIDIA)

The default image is CPU-only. With an NVIDIA card (any card with NVENC, e.g. RTX 4060) an 8-minute video clips in about a minute instead of 5 to 8. Nothing is passed through in the VM sense — the container just gets access to the host GPU.

**Host:** install the NVIDIA driver (`nvidia-smi` must work) and the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html):
```bash
sudo nvidia-ctk runtime configure --runtime=docker && sudo systemctl restart docker
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi   # sanity check
```
On Windows use Docker Desktop with the WSL2 backend and the Windows NVIDIA driver; no driver inside WSL.

**Compose:** create `docker-compose.override.yml` next to `docker-compose.yml` (picked up automatically). `GPU: "1"` adds cuBLAS/cuDNN and onnxruntime-gpu to the image (~2 GB); `video` is required for NVENC.
```yaml
services:
  backend:
    build:
      context: .
      args:
        GPU: "1"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu, video]
```

**`.env`:**
```
WHISPER_MODEL=large-v3-turbo
WHISPER_DEVICE=cuda
WHISPER_COMPUTE=float16
FFMPEG_ENCODER=auto           # probes h264_nvenc at startup, falls back to x264
TRANSCRIBE_BACKEND=parakeet   # optional: ~2x faster than whisper, 25 European languages, auto-falls back to whisper
ASR_GPU_CONCURRENCY=1
```

**Verify:**
```bash
docker compose up --build -d
docker exec creatorsplan-backend nvidia-smi -L
docker exec creatorsplan-backend ffmpeg -hide_banner -f lavfi -i testsrc=size=256x256:rate=1 -frames:v 1 -c:v h264_nvenc -f null -
```
The backend log on the first job reports the chosen encoder and transcription device. A CUDA error in whisper (e.g. VRAM exhausted) retries once on CPU automatically. 8 GB of VRAM is enough for `large-v3-turbo` fp16 plus the detection models.

---

### 6. Run without a Google key (local LLM, optional)

The only cloud call in the clip pipeline is the moment picker: it sends the
transcript (never the video) to Gemini. Point it at any OpenAI-compatible
server instead and the whole pipeline stays on your box:

```bash
# .env
LLM_BASE_URL=http://host.docker.internal:11434/v1   # Ollama on the host
LLM_MODEL=qwen2.5:14b                                # any chat model that follows instructions
# LLM_API_KEY=...                                    # only if your server checks one (vLLM --api-key, OpenRouter)
```

Works with Ollama, LM Studio, vLLM, llama.cpp server, LocalAI and OpenRouter.
The dashboard stops asking for a Gemini key when this is set. Two things to
know:

- **Context length.** A scoring call carries three transcript windows
  (~2-3k tokens) and the detail call up to ten (~5k on a long podcast).
  Ollama defaults to a 4096-token context and truncates silently, so run it
  with `OLLAMA_CONTEXT_LENGTH=16384` (or set `num_ctx` in a Modelfile); raise
  `LLM_SCORE_BATCH` above 3 only if your context allows it. 7-8B models
  return valid JSON reliably, 3B ones do not.
- **What still needs Gemini.** Anything that has to look at frames: the
  automatic layout picker (`AUTO_LAYOUT`), the on-screen content detector
  and silent videos (no speech to clip by). Without a Gemini key those fall
  back to the plain face-tracking crop, and a silent video fails with a
  message that says so. Add a key alongside `LLM_BASE_URL` and you get both.

## Technical Pipeline

### Clip Generator
1. **Ingest** — Local video upload (or self-hosted URL ingest via yt-dlp)
2. **Transcribe** — faster-whisper with word-level timestamps
3. **Detect** — PySceneDetect for scene boundaries
4. **Analyze** — Gemini identifies 3-15 viral moments (15-60s each)
5. **Extract** — FFmpeg precise clip cutting
6. **Reframe** — AI vertical cropping with subject tracking
7. **Effects** — Subtitles, hooks, AI video effects
8. **Backup** — S3 backup

### AI Shorts
1. **Analyze** — Website scraping + Gemini web research (or manual description)
2. **Script** — Gemini generates viral scripts with segments
3. **Actor** — Flux 2 Pro portrait generation (or gallery/upload)
4. **Voice** — ElevenLabs TTS voiceover
5. **Video** — Hailuo 2.3 Fast img2video + VEED Lipsync (Low Cost) or Kling Avatar v2 (Premium)
6. **B-roll** — Flux 2 Pro image generation + Ken Burns effect
7. **Composite** — FFmpeg assembly with ASS subtitles and hook overlays
8. **Gallery** — Upload to public S3 with metadata

---

## Automate It: MCP Server, REST API and Webhooks

You don't need the dashboard. The whole pipeline is callable by AI agents and scripts.

### MCP server (`/mcp`)

CreatorsPlan ships a built-in [MCP](https://modelcontextprotocol.io) server, so Claude, ChatGPT, Cursor or any MCP client can clip videos for you:

```bash
# Self-hosted (no key needed, BYOK rules apply):
claude mcp add --transport http creatorsplan http://localhost:8000/mcp

# Self-hosted without running the web server: same tools over stdio
claude mcp add creatorsplan -- python mcp_stdio.py
```

Tools: `process_video` (URL or `upload_id`; `captions: false` when the source already has subtitles, `auto_hook: false` to skip the hook line, burned by default like the dashboard), `create_upload` (hand the agent a local file: PUT the bytes, then process), `get_job_status`, `list_clips`, `get_quota`, `add_subtitles`, `recut_clip`. A prompt like *"clip this podcast and caption the best 3"* is now a one-liner in your agent of choice.

### REST API

```bash
curl -X POST http://localhost:8000/api/process \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=...", "acknowledged": true,
       "webhook_url": "https://your-server.com/hooks/creatorsplan"}'
```

Interactive docs at `/docs` (OpenAPI) on any instance.

### Completion webhooks

Pass `webhook_url` (and optionally `webhook_secret`) to `POST /api/process` and you get exactly one `POST` when the job reaches a terminal state — no polling loops in your n8n / Zapier / cron pipelines:

```json
{"event": "job.completed", "job_id": "…",
 "clips": [{"index": 0, "title": "…", "video_url": "…", "download_url": "…"}]}
```

With a secret, the body is signed: `X-CreatorsPlan-Signature: sha256=<hmac-sha256(body)>`.

### n8n

An importable workflow (video URL in, published-ready clips out, no polling)
lives in [`examples/n8n/`](examples/n8n/).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI, google-genai, faster-whisper, ultralytics (YOLOv8), mediapipe, opencv-python, yt-dlp, FFmpeg, httpx |
| Frontend | React 18, Vite 4, Tailwind CSS 3.4 |
| AI APIs | Google Gemini, fal.ai (Flux, Hailuo, VEED, Kling), ElevenLabs |
| Infrastructure | Docker + Docker Compose, AWS S3 |

---

## Environment Variables

**Server-side (.env):**
| Variable | Description |
|----------|------------|
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_REGION` | AWS region (default: us-east-1) |
| `AWS_S3_BUCKET` | Private bucket for clip backup |
| `AWS_S3_PUBLIC_BUCKET` | Public bucket for gallery/avatars |
| `MAX_CONCURRENT_JOBS` | Concurrent processing limit (default: 5) |
| `LLM_BASE_URL` | OpenAI-compatible server for the moment picker (Ollama, vLLM, LM Studio...). Set it and the Gemini key becomes optional |
| `LLM_MODEL` | Model name on that server (default `llama3.1:8b`) |
| `LLM_API_KEY` | Bearer token for that server, if it checks one |
| `LLM_SCORE_BATCH` | Transcript windows per scoring call (default 3 local, 8 Gemini) |

**Client-side (encrypted in localStorage):**
| Key | Description |
|-----|------------|
| `GEMINI_API_KEY` | Google Gemini — required unless `LLM_BASE_URL` is set (then only for layout picking and silent videos) |
| `FAL_KEY` | fal.ai — required for AI Shorts |
| `ELEVENLABS_API_KEY` | ElevenLabs — required for voiceover/dubbing |

---

## Security & Performance

- **Non-Root Execution**: Containers run as dedicated `appuser`
- **Concurrency Control**: Semaphore-based job queue (`MAX_CONCURRENT_JOBS`)
- **Auto-Cleanup**: Automatic purging of old jobs (1h retention)
- **Encrypted Keys**: API keys encrypted client-side, never stored server-side
- **Upload Validation**: Image uploads validated for format and minimum size
- **File Limits**: 2GB upload limit protection

---

## License

MIT License for the core application — CreatorsPlan is yours to use, modify, and scale.

**Exception:** the [`cloud/`](cloud/LICENSE) directory (billing, managed keys, and the hosted-service infrastructure behind the optional `BILLING_ENABLED` flag) is source-available under a commercial license. You can read it, modify it, and self-host it for personal or internal use, but you can't offer it to third parties as a paid/hosted service. Self-hosting the core app never requires this directory.
