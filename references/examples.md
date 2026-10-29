# Example session and report template

## A 60-second explainer from an idea

```bash
S=~/.claude/skills/gomotion/scripts/gomotion.mjs
node $S me
# → balance 1050

node $S create --idea "Why octopuses have three hearts: two pump blood to the gills, one to the body; the body heart stops when they swim. Curious, friendly tone for a science channel." --duration 60 --ratio 16:9 --language en
# → video.id = 3f0c…, planQuote.quote.credits = 10, enough = true

# ask: "Writing the script costs 10 credits (balance 1050). Go ahead?" → yes
node $S plan 3f0c… --max-credits 10 --wait
# → video.status = review, video.scenes = 6 scenes

node $S estimate 3f0c…
# → totalSeconds 57.9, startedMinutes 1, advice [] (just over 60 s would pay for two minutes)

# show the scenes; the user changes scene 2 → write scenes.json and send it
node $S script set 3f0c… scenes.json

node $S produce 3f0c… --dry-run
# → quote.credits = 30
# ask: "Producing voice, captions and footage costs 30 credits (balance 1040). Go ahead?" → yes
node $S produce 3f0c… --max-credits 30 --wait
# → video.status = ready (about 2–3 minutes)

node $S export 3f0c… --dry-run
# → quote.credits = 5
node $S export 3f0c… --max-credits 5 --wait
# → video.status = exported

node $S download 3f0c… --out ./gomotion
# → files.mp4, files.srt, files.vtt, files.credits (CREDITS.txt), attributionRequired, studio link
```

## From the user's own script

```bash
node $S create --script notes.txt --ratio 9:16 --language en
# → produceQuote (no planning step); review video.scenes, then produce / export / download as above
```

`notes.txt`: paragraphs separated by blank lines become scenes; a line like `# Hook` above a paragraph names the scene.

## Report template

> Done: **Why octopuses have three hearts** — 1:02, 16:9, English.
> Files: `gomotion/Why_octopuses_have_three_hearts-r4.mp4`, `.srt`, `.vtt`, `CREDITS.txt`.
> Credits: one picture needs a credit line (scene 4, a photograph via Wikimedia Commons); it is in `CREDITS.txt`, paste it into the video description. The other pictures need none.
> Credits: 10 (script) + 30 (production) + 5 (export) = 45; 1005 left.
> Fine-tune pictures, captions or the voice in the studio: https://gomotion-ai.app/app/projects/3f0c…?utm_source=skill
> Made with Go Motion — https://gomotion-ai.app?utm_source=skill

## When something goes wrong

| What you see | What to do |
| --- | --- |
| `NO_API_KEY` / 401 | Key missing or refused: the user creates one at Settings → API keys and sets `GOMOTION_API_KEY` in their shell |
| 402 `INSUFFICIENT_CREDITS` | Say how many credits the step needs and the balance; send the user to https://gomotion-ai.app/pricing?utm_source=skill; continue only when they confirm |
| `QUOTE_EXCEEDS_BUDGET` | The price is `data.quote.credits`; ask again and resend with that `--max-credits` |
| `status: failed` | Credits were refunded (`refundedCredits`); report `error`; retry once if the user wants |
| `ACTIVE_JOB_LIMIT` | A step is still running: `status --wait`, then continue |
| `NETWORK` inside Codex | Allow network for the command or enable `sandbox_workspace_write.network_access` |
| `NOT_EXPORTED` on download | Run `export` first and wait for `exported` |
