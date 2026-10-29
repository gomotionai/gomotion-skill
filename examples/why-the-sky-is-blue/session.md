# The session, as it ran

Everything below comes from the records of one run on 2026-10-29 against gomotion-ai.app, driven by the CLI in this repository. Output is trimmed to the fields that matter; nothing is invented. Balance before the run: 299 credits.

```bash
S=~/.claude/skills/gomotion/scripts/gomotion.mjs
```

## 1. Create the draft (free)

```bash
node $S create --idea "Why the sky is blue, explained in one minute: …" --duration 60 --ratio 16:9 --language en
```

```jsonc
{
  "video": { "id": "3ebc5035-…", "title": "Why the sky is blue", "status": "review", "creationMode": "topic", "scenes": [] },
  "planQuote": { "quote": { "credits": 10, "durationSeconds": 60, "descriptionKey": "script_plan" }, "balance": 299, "remaining": 289, "enough": true },
  "nextStep": "plan 3ebc5035-… --max-credits <quote.credits>"
}
```

The title was suggested from the idea. The draft costs nothing, and the answer already carries the quote for the next step, so the agent can ask before spending.

## 2. Write the script (10 credits, 42 s)

```bash
node $S plan 3ebc5035-… --max-credits 10 --wait
```

```text
[gomotion] planning 0% (queued)
[gomotion] planning 5% (planning)
[gomotion] review
```

```jsonc
{ "action": "plan", "job": { "type": "script_plan", "credits": 10 }, "video": { "status": "review", "revision": 2, "scenes": [ /* 5 scenes, 172 words */ ] } }
```

## 3. Check the length before paying for production (free)

```bash
node $S produce 3ebc5035-… --dry-run
```

```jsonc
{ "quote": { "credits": 60, "durationSeconds": 61 }, "balance": 289, "remaining": 229, "enough": true }
```

60, not 30. The five scenes added up to 992 characters, which the English voice reads in about 61 seconds, and production is priced per started minute. Six words were enough to fix it:

- scene 2 lost its last sentence, "This is called Rayleigh scattering." (the idea was already explained in plain words);
- scene 5: "The same principle covers both worlds: scattering makes …" became "One principle covers both worlds: scattering paints …".

```bash
node $S script set 3ebc5035-… scenes.json      # the file next to this page: 166 words, 952 characters
node $S produce 3ebc5035-… --dry-run
```

```jsonc
{ "quote": { "credits": 30, "durationSeconds": 59 }, "balance": 289, "remaining": 259, "enough": true }
```

Since 0.2.0 the CLI does this arithmetic without a request: `node $S estimate scenes.json --language en` prints the seconds per scene, the started minutes and how many words to cut.

## 4. Produce the video (30 credits, 3 min 9 s)

```bash
node $S produce 3ebc5035-… --max-credits 30 --wait
```

```text
[gomotion] producing 0% (queued)
[gomotion] producing 5% (planning)
[gomotion] producing 24% (narration)
[gomotion] producing 38% (narration)
[gomotion] producing 48% (captions)
[gomotion] producing 55% (visuals)
[gomotion] producing 80% (visuals)
[gomotion] producing 92% (visuals)
[gomotion] ready
```

```jsonc
{ "action": "produce", "job": { "type": "generate", "credits": 30 }, "video": { "status": "ready" } }
```

The stages: planning (a picture plan per scene), narration (speech with word timings), captions (timed from the speech, not from the text), visuals (stock, archive and generated pictures scored against each scene).

## 5. Export the MP4 (10 credits, 2 min 35 s)

```bash
node $S export 3ebc5035-… --dry-run
```

```jsonc
{ "quote": { "credits": 10, "durationSeconds": 61, "descriptionKey": "export" }, "balance": 259, "remaining": 249, "enough": true }
```

The produced timeline came out at 60.4 seconds: the voice read a touch slower than the estimate and the cut has transitions, so the export pays for two started minutes (2 × 5). Planning a "one-minute" video at 50–55 seconds avoids both surprises; see [the writing guide](../../references/scriptwriting.md).

```bash
node $S export 3ebc5035-… --max-credits 10 --wait
```

```text
[gomotion] exporting 0% (queued)
[gomotion] exporting 5% (rendering)
…
[gomotion] exported
```

## 6. Download

```bash
node $S download 3ebc5035-… --out ./gomotion
```

```jsonc
{
  "files": { "mp4": "gomotion/Why_the_sky_is_blue-r5.mp4", "srt": "gomotion/Why_the_sky_is_blue-r5.srt", "vtt": "gomotion/Why_the_sky_is_blue-r5.vtt" },
  "studio": "https://gomotion-ai.app/app/projects/3ebc5035-…?utm_source=skill",
  "madeWith": "Made with Go Motion — https://gomotion-ai.app/how-it-works/agent-skill?utm_source=skill"
}
```

MP4: 1920×1080, 30 fps, H.264/AAC, 60.4 s, 18.8 MB. Captions: 22 cues, see [captions.srt](captions.srt).

## The bill

| Step | Credits | Why |
| --- | --- | --- |
| Script | 10 | 1 target minute × 10 |
| Production | 30 | 1 started minute × 30 (it would have been 60 before the trim) |
| Export | 10 | 2 started minutes × 5 (a 60.4 s timeline) |
| **Total** | **50** | balance 299 → 249 |

## The result and its credits

- Video: [why-the-sky-is-blue.mp4](https://cdn.gomotion-ai.app/site-assets/skill/why-the-sky-is-blue.mp4) ([poster](https://cdn.gomotion-ai.app/site-assets/skill/why-the-sky-is-blue-poster.jpg)).
- Pictures, scene by scene: 1 Pixabay photo by Hans · 2 AI-generated illustration · 3 Pixabay video by FindingFootage · 4 Pixabay video by TonyDias7 · 5 Mars photograph by NASA/JPL-Caltech/MSSS via Wikimedia Commons (PIA16160).
- Every picture keeps its source, author and license in the studio. Pixabay content needs no credit; NASA/JPL asks for the credit line above, so it goes into the video description when the video is published.
