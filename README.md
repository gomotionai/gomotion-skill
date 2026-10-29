<p align="center">
  <img src="assets/logo.svg" width="72" alt="Go Motion" />
</p>

<h1 align="center">Go Motion skill for Claude Code, Codex and Cursor</h1>

<p align="center">
  Tell your coding agent what the video is about. It writes the script, you approve it, and <a href="https://gomotion-ai.app?utm_source=github">Go Motion</a> records the voice, times the captions, finds the footage and renders a 1080p MP4 with SRT/VTT captions — delivered into your working folder.
</p>

<p align="center">
  <a href="https://gomotion-ai.app/how-it-works/agent-skill?utm_source=github">Guide</a> ·
  <a href="https://gomotion-ai.app/pricing?utm_source=github">Pricing</a> ·
  <a href="https://gomotion-ai.app/how-it-works?utm_source=github">How Go Motion works</a>
</p>

---

```text
You:    Make a 60-second 16:9 explainer about why octopuses have three hearts.
Agent:  Writing the script costs 10 credits (balance 1050). Go ahead?
You:    yes
Agent:  Here are the 6 scenes … Want changes?
You:    Shorten scene 2, then produce it.
Agent:  Producing voice, captions and footage costs 30 credits. Go ahead?
You:    yes
Agent:  Done: gomotion/Why_octopuses_have_three_hearts-r4.mp4 (+ .srt, .vtt).
        45 credits used, 1005 left. Fine-tune it in the studio: https://gomotion-ai.app/app/projects/…
```

## Install

One line, from the project you work in (`-g` installs for every project):

```bash
npx skills add gomotionai/gomotion-skill
```

Pick the agent with `-a claude-code`, `-a codex` or `-a cursor`. Or clone it by hand:

| Agent | Folder |
| --- | --- |
| Claude Code | `git clone https://github.com/gomotionai/gomotion-skill ~/.claude/skills/gomotion` |
| Codex | `git clone https://github.com/gomotionai/gomotion-skill ~/.agents/skills/gomotion` |
| Cursor | `git clone https://github.com/gomotionai/gomotion-skill ~/.cursor/skills/gomotion` |

Requirements: Node.js 18 or newer, a [Go Motion](https://gomotion-ai.app?utm_source=github) account with credits, and an API key.

## Set up your key

1. Sign in to Go Motion (new accounts start with free credits) and open **Settings → API keys**: https://gomotion-ai.app/settings/apikeys?utm_source=github
2. Create a key and put it in your shell, for example in `~/.zshrc`:

   ```bash
   export GOMOTION_API_KEY=sk_your_key
   ```

The key is equivalent to your account: keep it out of chats, repositories and screenshots. Delete it on the same page if it leaks.

## Use it

In Claude Code, just ask — `make a 45-second vertical video about …` — or run `/gomotion …`. In Codex, mention `$gomotion`. The agent:

1. checks your balance (`me`);
2. creates a free draft from your idea or from a script you give it;
3. **quotes every paid step and asks before spending**: writing the script, producing the video, exporting the MP4;
4. shows you the script and applies your edits before production;
5. downloads the MP4 and captions into `./gomotion/` and gives you the studio link to fine-tune pictures, captions, voice or a thumbnail.

Everything is billed in Go Motion credits at the same prices as the studio — there is no API surcharge. Prices and plans: https://gomotion-ai.app/pricing?utm_source=github

### The CLI on its own

```bash
node scripts/gomotion.mjs me
node scripts/gomotion.mjs create --idea "…" --duration 60 --ratio 16:9 --language en
node scripts/gomotion.mjs plan <videoId> --max-credits 10 --wait
node scripts/gomotion.mjs produce <videoId> --dry-run
node scripts/gomotion.mjs produce <videoId> --max-credits 30 --wait
node scripts/gomotion.mjs export <videoId> --max-credits 5 --wait
node scripts/gomotion.mjs download <videoId>
```

Every command prints JSON; `help` lists them all. See [references/api.md](references/api.md) for the HTTP API behind it and [references/examples.md](references/examples.md) for a full session.

## What's inside

| File | Purpose |
| --- | --- |
| `SKILL.md` | The instructions your agent follows (the workflow, the consent rules, the report) |
| `scripts/gomotion.mjs` | Zero-dependency client of the public API, Node 18+ |
| `references/api.md`, `references/examples.md` | API reference and examples |
| `agents/openai.yaml` | Display metadata for Codex |

## FAQ

**Does it work without a Go Motion account?** No. The skill drives your own account; credits are bought on gomotion-ai.app.

**Can the agent spend credits without asking?** Not by design: the server refuses paid steps without an explicit `maxCredits`, and the skill tells the agent to show the quote and wait for your yes before sending one.

**What if a job fails?** Its credits come back automatically.

**Codex says the network is blocked.** Codex's workspace-write sandbox blocks network access by default. Approve running the command outside the sandbox, or start Codex with `-c 'sandbox_workspace_write.network_access=true'`.

**Can I edit the video afterwards?** Yes, in the studio: the download step gives you the link.

## Contributing

Issues and pull requests are welcome. Run the tests with `node --test test/*.test.mjs`. The API this skill uses is documented in `references/api.md`; please keep the CLI dependency-free.

## License

MIT © Go Motion
