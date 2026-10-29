# Changelog

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
