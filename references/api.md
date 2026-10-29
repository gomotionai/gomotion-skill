# Go Motion public API (`/api/v1`)

Base URL `https://gomotion-ai.app/api/v1`. Authenticate with `Authorization: Bearer sk_…` (a key from Settings → API keys). JSON bodies (`Content-Type: application/json`, 2 MiB max). Every answer is an envelope:

```json
{ "code": 0, "message": "ok", "data": … }
{ "code": -1, "message": "Not enough credits.", "data": { "errorCode": "INSUFFICIENT_CREDITS", "credits": 30 } }
```

Errors use real HTTP statuses. Send `X-GoMotion-Client: skill/<version> <agent>` so usage can be attributed (the CLI does).

## Paid steps

`plan`, `produce` and `export` take the same body:

| Field | Meaning |
| --- | --- |
| `dryRun: true` | Answer with the quote and the balance, charge nothing |
| `maxCredits: N` | The most credits you accept; required unless `dryRun`. The server quotes, signs and starts the job in one request |
| `idempotencyKey` | Optional (`^[a-zA-Z0-9_.:-]{8,120}$`); also accepted as the `Idempotency-Key` header. The same key replays the same job instead of charging twice |

Dry run answer: `{ "quote": { "credits", "estimatedProviderUsd", "durationSeconds", "description", "descriptionKey" }, "balance", "remaining", "enough" }`.

**How a quote is computed.** Minutes are started minutes (`ceil(seconds / 60)`, at least 1). `plan` is priced on the target length in `settings.durationSeconds`; `produce` on the narration time of the scenes, estimated as `characters / charsPerMinute × 60` at the language's rate from `capabilities`; `export` on the produced timeline. The CLI's `estimate` command does the same arithmetic before you ask.

## Endpoints

| Method and path | Body / query | Answer |
| --- | --- | --- |
| `GET /me` | — | `{ userId, keyId, balance, limits: { maxActiveJobs, maxDurationSeconds }, links: { studio, pricing, apiKeys, docs } }` |
| `GET /capabilities` | — | abilities, languages (`code`, `name`, `defaultVoice`, `narration`, `charsPerMinute`, `wordsPerMinute`, `planningUnit`), limits, `prices: { scriptPlanPerMinute, generatePerMinute, exportPerMinute }` |
| `GET /voices?language=en` | language code | voices with `id`, `name`, `previewUrl` |
| `GET /styles` | — | `{ builtin: [...], mine: [...] }` script writing styles (`id`) |
| `GET /videos?status=draft\|active` | — | summaries: `id`, `title`, `creationStatus`, `creationMode`, `revision`, `aspectRatio`, `durationSeconds`, `language`, timestamps |
| `POST /videos` | `{ idea }` **or** `{ scenes: [{ id?, title?, narration }] }`, plus `title?`, `settings?: { aspectRatio, durationSeconds, language, voice, theme, captionPresetId }`, `styleId?` | `201` video (free; status `review`) |
| `GET /videos/:id` | — | video (below) |
| `PATCH /videos/:id` | `{ revision?, title?, settings? }` (draft only) | video |
| `PATCH /videos/:id/scenes` | `{ revision?, scenes: [{ id?, title?, narration }] }` (draft only, free) | video |
| `DELETE /videos/:id` | — | `{ deleted: true }` (409 while a job runs) |
| `POST /videos/:id/plan` | paid body | `202 { job, video }` — writes the script of an idea |
| `POST /videos/:id/produce` | paid body + `revision?` | `202 { job, video }` — voice, captions and footage |
| `POST /videos/:id/export` | paid body | `202 { job }` — 1080p MP4 |
| `GET /videos/:id/jobs` | — | the last 30 jobs |
| `GET /videos/:id/subtitles?format=srt\|vtt` | — | captions of the current version (text) |
| `GET /videos/:id/attribution` | — | the pictures of the current version: one entry per scene with a picture, in scene order (see Picture credits) |
| `GET /jobs/:id` | — | job (`type`, `status`, `stage`, `progress`, `error`, `credits`, `refundedCredits`) plus `download` (`url`, `subtitles`, `attribution` links) once an export succeeded |
| `POST /jobs/:id/cancel` | — | job (refunded when no paid work started) |
| `GET /jobs/:id/download` | — | `302` to a signed MP4 URL valid 15 minutes (follow it without the key) |
| `GET /jobs/:id/subtitles?format=srt\|vtt` | — | captions of that export (text) |
| `GET /jobs/:id/attribution` | — | the pictures of that export, same shape; what `download` writes to `CREDITS.txt` |

## The video record

```jsonc
{
  "id": "…", "title": "…",
  "status": "planning | review | producing | ready | exporting | exported | failed",
  "error": null,                       // why it failed; failed jobs refund their credits
  "creationStatus": "draft | active",  // draft = not produced yet
  "creationMode": "topic | script",
  "creationState": "editing | planning | review | stale | failed | …",  // drafts only
  "revision": 3,
  "settings": { "aspectRatio": "16:9", "durationSeconds": 60, "language": "en", "voice": "", "theme": "blue", "captionPresetId": "bold-stroke" },
  "scenes": [{ "id": "scene-1", "title": "…", "narration": "…" }],
  "submitErrors": [],                  // what a produce would refuse right now
  "produced": false,
  "planJob": null, "activeJob": null, "lastJob": null, "jobs": [],
  "export": { "jobId": "…", "url": "/api/v1/jobs/…/download", "subtitles": { "srt": "…", "vtt": "…" }, "attribution": "/api/v1/jobs/…/attribution" },
  "links": { "studio": "https://gomotion-ai.app/app/projects/…" }
}
```

Status flow: `review` →(plan)→ `planning` → `review` →(produce)→ `producing` → `ready` →(export)→ `exporting` → `exported`. `failed` carries `error`; the next paid call starts again.

## Picture credits

`GET /videos/:id/attribution` (the current version) and `GET /jobs/:id/attribution` (one finished export) answer with the pictures of the scenes, in scene order. Scenes without a picture are skipped and a picture two scenes share is listed under each; narration, music and the rendered files are not pictures. Servers from before 2026-10-29 answer 404.

```jsonc
[
  {
    "sceneId": "scene-1", "sceneNumber": 1, "sceneTitle": "A Blueprint for the Deep",
    "kind": "image",                       // image | video
    "originKind": "stock",                 // stock | ai | illustrative | upload
    "source": "commons", "sourceName": "Wikimedia Commons",
    "name": "Octopus eyes closeup",        // the picture's own title
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Octopus_eyes_closeup.jpg",
    "author": "Victor Micallef", "authorUrl": "https://commons.wikimedia.org/wiki/File:Octopus_eyes_closeup.jpg",
    "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "attributionRequired": true            // the credit line belongs in the video description
  }
]
```

The CLI's `download` writes them to `CREDITS.txt` next to the MP4 (`files.credits`), the pictures with `attributionRequired` first, and answers with `attributionRequired`: `true`, `false`, or `null` when the server gave no credits.

## Error codes (`data.errorCode`)

| Code | Status | Meaning |
| --- | --- | --- |
| `AUTH_REQUIRED` | 401 | Missing, malformed, unknown or deleted key |
| `VALIDATION_ERROR` | 400 / 409 | Bad field (`data.issues` or `data.fields`), or an action the video's state does not allow (`data.reason`) |
| `NOT_FOUND` | 404 | Not yours or gone |
| `INSUFFICIENT_CREDITS` | 402 | `data.credits` needed; buy credits on the pricing page |
| `QUOTE_EXCEEDS_BUDGET` | 409 | The price (`data.quote.credits`) is above `maxCredits`; ask the user, send the new number |
| `QUOTE_CHANGED` | 409 | Prices or inputs changed between quote and start; quote again |
| `REVISION_CONFLICT` | 409 | The draft changed; read it again (`data.revision`) |
| `DRAFT_BUSY` | 409 | The script is being written; wait |
| `DRAFT_NOT_SUBMITTED` | 409 | Produce before exporting |
| `ACTIVE_JOB_LIMIT` | 409 / 429 | A job is already running on this video (`data.jobId`) or the account reached its limit |
| `IDEMPOTENCY_CONFLICT` | 409 | The same key was used for a different request |
| `RATE_LIMITED` | 429 | Writes with one key are spaced; retry after `Retry-After` seconds |
| `PROVIDER_NOT_CONFIGURED` | 503 | A provider is unavailable; try later |
