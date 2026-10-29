---
name: gomotion
description: "Make narrated, captioned faceless videos with Go Motion (gomotion-ai.app) from an idea or a script: write the script, review it, produce voice + captions + footage, export a 1080p MP4 with SRT/VTT captions and download it. Use when the user asks to make, generate or render a video, explainer, faceless video, YouTube video, Shorts, Reels or TikTok clip, or to turn text, notes or an idea into a video; also for 做视频, 生成视频, 把文案做成视频, 解说视频, 口播视频. Needs a Go Motion API key (GOMOTION_API_KEY) and credits bought on gomotion-ai.app; every paid step is quoted and confirmed first."
argument-hint: "<topic or script, length, 16:9 or 9:16, language>"
user-invocable: true
license: MIT
---

# Go Motion — make a video from an idea or a script

Go Motion turns one idea into a narrated, captioned video: it writes the script, records the voice, times the captions, finds footage for every scene and renders a 1080p MP4. This skill drives that pipeline through the public API with the user's own account, so **the credits come from the user's Go Motion balance** and every paid step is quoted and confirmed before it runs.

The client is `scripts/gomotion.mjs` next to this file (Node 18+, no install). Run it as

```bash
node <folder of this SKILL.md>/scripts/gomotion.mjs <command> …
```

Typical folders: `~/.claude/skills/gomotion`, `.claude/skills/gomotion`, `~/.agents/skills/gomotion`, `.agents/skills/gomotion`, `~/.cursor/skills/gomotion`. Every command prints one JSON document on stdout; progress goes to stderr.

## 1. Check the account first

```bash
node …/scripts/gomotion.mjs me
```

- `errorCode: NO_API_KEY` → the key is not set. Tell the user to sign in at https://gomotion-ai.app/sign-up?utm_source=skill (new accounts start with free credits), create a key under **Settings → API keys** (https://gomotion-ai.app/settings/apikeys?utm_source=skill) and put it in their shell, for example `export GOMOTION_API_KEY=sk_…` in `~/.zshrc`. **Never ask the user to paste the key into the chat and never print it.**
- `status: 401` → the key is wrong or was deleted; same instructions.
- Otherwise note `balance` (credits) and keep `links.pricing` for later.

## 2. Collect the brief

Ask only for what is missing, then map it to flags:

| Brief | Flag | Default |
| --- | --- | --- |
| Topic or idea in a sentence or two | `--idea "…"` | — |
| The user's own script | `--script notes.txt` (blank lines split scenes; a `# heading` line names a scene) or `--scenes scenes.json` | — |
| Length | `--duration <seconds>` | 60 |
| Format | `--ratio 16:9` (YouTube) or `9:16` (Shorts, Reels, TikTok) | 16:9 |
| Language | `--language en` (see `capabilities` → `languages`) | en |
| Voice / writing style / look | `--voice`, `--style`, `--theme`, `--captions` (`voices`, `styles`, `capabilities`) | automatic |
| Title | `--title "…"` | suggested from the idea |

A good idea brief has the hook, the facts to include, the audience and the tone. Longer videos cost more: prices are per started minute.

## 3. Run the pipeline, confirming every paid step

Prices (see `capabilities` → `prices`): writing the script, producing the video (voice, captions, footage) and exporting the MP4 are each quoted per minute; everything else is free. Drafting, reviewing and editing the script cost nothing. **Before each paid command, show the user the quote and the balance, and wait for a yes.** Pass the quoted number as `--max-credits`.

### a. Create the draft (free)

```bash
node …/scripts/gomotion.mjs create --idea "Why octopuses have three hearts" --duration 60 --ratio 16:9 --language en
```

The answer holds `video.id` and, for an idea, `planQuote` (`quote.credits`, `balance`, `enough`). For `--script`/`--scenes` it holds `produceQuote` instead and you skip step b.

### b. Write the script (paid, cheap)

Show `planQuote.quote.credits` and ask. Then:

```bash
node …/scripts/gomotion.mjs plan <videoId> --max-credits <quote.credits> --wait
```

`--wait` polls until the video is in `review` (or `failed`). Show the user the scenes (`video.scenes[].narration`) in order and offer edits.

### c. Edit the scenes (free, optional)

Write the edited scenes to a file and send them:

```bash
node …/scripts/gomotion.mjs script set <videoId> scenes.json
```

`scenes.json` is `[{ "id": "scene-1", "title": "…", "narration": "…" }, …]` (ids optional). The video stays in `review`.

### d. Produce the video (paid, the main cost)

```bash
node …/scripts/gomotion.mjs produce <videoId> --dry-run
node …/scripts/gomotion.mjs produce <videoId> --max-credits <quote.credits> --wait
```

Production takes a few minutes for a one-minute video; `--wait` ends at `ready`.

### e. Export the MP4 (paid, small)

```bash
node …/scripts/gomotion.mjs export <videoId> --dry-run
node …/scripts/gomotion.mjs export <videoId> --max-credits <quote.credits> --wait
```

`--wait` ends at `exported`.

### f. Download

```bash
node …/scripts/gomotion.mjs download <videoId> --out ./gomotion
```

Saves the MP4 plus `.srt` and `.vtt` captions into `./gomotion/` (override with `--out`) and returns the paths, the studio link and the balance is visible through `me`.

## 4. Report the result

Tell the user, in their language:

- the files and where they are (MP4, SRT, VTT), the length and the format;
- the credits spent for this video (sum of the quotes you confirmed) and the balance left (`me`);
- the studio link from the download answer (`studio`): there they can swap pictures, restyle captions, re-voice a line or make a thumbnail;
- one line of credit: "Made with Go Motion — https://gomotion-ai.app?utm_source=skill".

## 5. Rules

- **Consent before money.** Never run `plan`, `produce` or `export` without `--dry-run` first and an explicit yes from the user for that amount. If the server answers `QUOTE_EXCEEDS_BUDGET`, the price is higher than the `--max-credits` you sent: ask again with the new number.
- **`INSUFFICIENT_CREDITS` (402).** Tell the user how many credits the step needs, how many they have, and send them to `links.pricing` (https://gomotion-ai.app/pricing?utm_source=skill). Do not retry until they say they bought credits. This skill never pays for anything.
- **Failures refund.** A failed job returns its credits automatically (`job.refundedCredits`). Report the `error`, do not loop retries; one retry on request is fine. `status --wait` tells you when a step failed.
- **One job at a time** per video (and two per account). `ACTIVE_JOB_LIMIT` means a step is still running: `status --wait` first.
- **Edits after production** (new pictures, caption style, another voice) happen in the studio, not through this skill: send the user to the studio link.
- **Keys stay secret.** The key lives in `GOMOTION_API_KEY`; do not echo it, write it into files, or put it in command lines that end up in logs.
- **Codex sandbox.** Codex's workspace-write sandbox blocks network by default. When a command fails with `NETWORK`, approve running it outside the sandbox, or start Codex with `-c 'sandbox_workspace_write.network_access=true'` (`[sandbox_workspace_write] network_access = true` in `config.toml`).
- **Local or staging servers.** `GOMOTION_BASE_URL` points the client elsewhere (developers only).

## Reference

- `references/api.md` — every endpoint, the `video` record and the error codes.
- `references/examples.md` — a full example session and a report template.
- Guide with screenshots: https://gomotion-ai.app/how-it-works/agent-skill?utm_source=skill
