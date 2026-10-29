# Changelog

## 0.4.0 — 2026-10-29

- The playbook: six chapters under `guide/` on how faceless videos are made well (structure and pacing, writing for the voice, narration and timing, captions, pictures and their licenses, composition and publishing), each with what good looks like, why, how the pipeline gets there, and a checklist.
- README rewritten as the playbook's introduction; the tool is described last and briefly.
- `references/design-notes.md` holds the developer notes that were in the README; `references/scriptwriting.md` is now the agent's one-page checklist with the speech rates.
- SKILL.md points the agent at the chapters when the user asks why or wants advice beyond the pipeline.

## 0.3.0 — 2026-10-29

- `download` writes `CREDITS.txt` next to the MP4: the source, author and license of every picture, from the new `GET /jobs/:id/attribution` endpoint, the pictures that need a credit line first. The answer gains `files.credits` and `attributionRequired` (`null` on a server without the endpoint; the download itself is unaffected).
- `references/api.md`: `GET /videos/:id/attribution` (current version) and `GET /jobs/:id/attribution` (one export), the entry shape, and the `attribution` link in `export` and `download`.
- SKILL.md: the report quotes `CREDITS.txt` and says which pictures need a credit line.

## 0.2.1 — 2026-10-29

- `estimate`: the script step is only counted for a draft that has no scenes yet. A file (your own script) and a planned or produced video list production and export only; `--duration` still drives the length advice. Found while checking the live rates against production.

## 0.2.0 — 2026-10-29

- `estimate <file | videoId>`: seconds per scene, started minutes and the credits of each step before you ask for a quote, offline for a file (built-in speech rates) or with the server's live rates (`--live`, or a draft on the server). Tells you how many words to cut when a script sits just over a minute mark.
- `references/scriptwriting.md`: how long a minute is in every language, how to brief, the shape of a scene, writing for the voice and the captions.
- `examples/why-the-sky-is-blue/`: a real brief, its final script, its captions and every command of that session, with the bill.
- README rewritten around the demo video and the design notes (quote, cap and confirm; idempotent paid requests; review before paying; refunds; an agent-friendly CLI; licensed pictures).
- SKILL.md: plan a one-minute video at 50–55 seconds, check the length with `estimate` before production, mention picture credits in the report; wording about credits (new accounts start with free credits that cover a first one-minute video).

## 0.1.0 — 2026-10-28

- First release: `SKILL.md` workflow (idea or script → plan → review → produce → export → download), zero-dependency CLI `scripts/gomotion.mjs`, API reference and examples, Codex display metadata.
