# OpenShorts + n8n

An importable workflow that clips a video and calls you back when it's done.
It works out of the box with [OpenShorts Cloud](https://www.openshorts.app/)
(free tier: 20 min of video, paid plans from $12/mo). OpenShorts is also open
source: you can point the workflow at your own instance by changing the base
URL (needs a GPU box and your own Gemini key).

| Workflow | What it does | Credentials |
|---|---|---|
| `openshorts-clip-and-notify.json` | A video URL goes in through a form, clips come back on a signed webhook. No polling. | OpenShorts API key |

## Shared setup

1. In n8n: **Workflows → Import from file** → pick the workflow.
2. Create a **Header Auth** credential named `OpenShorts API key`:
   - Name: `Authorization`
   - Value: `Bearer osk_...` (create the key in your account page at
     [openshorts.app](https://www.openshorts.app/))
3. Open the **Clips ready (webhook)** node, copy its production URL, and paste
   it as `webhook_url` inside the **Start OpenShorts job** node body.
4. Optional: change `webhook_secret`. OpenShorts signs the webhook body with
   HMAC-SHA256 and sends it as `X-OpenShorts-Signature: sha256=<hex>`; verify
   it in a Code node with:

   ```javascript
   const crypto = require('crypto');
   const expected = 'sha256=' + crypto
     .createHmac('sha256', 'change-me')
     .update(JSON.stringify($json.body))
     .digest('hex');
   ```

## Webhook payload

```json
{
  "event": "job.completed",
  "job_id": "…",
  "status": "completed",
  "clips": [
    { "index": 0, "title": "…", "video_url": "…", "download_url": "…" }
  ]
}
```

Failed jobs fire the same webhook with `"event": "job.failed"` and an `error`
field, so the flow never hangs waiting.

`download_url` is a 24-hour presigned link to the archived clip (hosted
service). On the self-hosted edition the same workflow runs against
`http://localhost:8000` with no API key.

## Publishing and analytics API

Direct posting: `POST /api/social/post` (accepts `scheduled_date`, ISO-8601).
Publishing queue: `GET /api/social/scheduled`, and
`DELETE /api/social/scheduled/{job_id}` to cancel one before it goes out.
Analytics of what you published: `GET /api/social/analytics` (profile totals),
`GET /api/social/analytics/posts` (per-post metrics),
`GET /api/social/analytics/impressions` (windowed totals, `period=last_week`).
Full API reference: [api.openshorts.app/docs](https://api.openshorts.app/docs).
Agent-native version of the same pipeline (MCP):
[openshorts.app/mcp](https://www.openshorts.app/mcp).
