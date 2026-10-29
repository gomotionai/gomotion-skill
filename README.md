<p align="center">
  <img src="assets/logo.svg" width="72" alt="Go Motion" />
</p>

<h1 align="center">The faceless video playbook</h1>

<p align="center">
  How narrated, captioned videos are made well: structure, writing for a voice, timing, captions, pictures and their licenses, composition and publishing.<br />
  Six chapters of craft, a worked example, and an open-source skill that applies all of it from Claude Code, Codex or Cursor.
</p>

<p align="center">
  <a href="#the-playbook">The playbook</a> ·
  <a href="examples/why-octopuses-have-three-hearts/">Worked example</a> ·
  <a href="#the-skill">The skill</a> ·
  <a href="references/api.md">API reference</a>
</p>

## Why most faceless videos fail

A faceless video has nobody on screen to carry it. No face asks the viewer to stay, no personality papers over a weak minute. Everything the video has going for it is in its shape: the promise it makes in the first seconds, the one idea each scene carries, a voice that sounds like it means it, captions that land on the spoken word, pictures that show what the narration names, and an ending that pays the promise off.

Most faceless videos fail at one of those joints, and they fail in predictable ways:

- The first scene introduces the topic instead of promising something.
- The narration was written to be read, so the voice stumbles over numbers, abbreviations and thirty-word sentences.
- The captions were timed from the text, so by the second minute the highlight is a sentence behind the voice.
- The pictures were chosen by their titles, so "Mars" is a desert in Utah and a nineteenth-century keeper stands in front of a modern lighthouse.
- Nobody kept the licenses, so one complaint takes the video down.
- The vertical version is the landscape one, cropped.

This playbook is about those joints. Each chapter says what good looks like, why, how a production pipeline gets there, and what you do yourself, and ends with a checklist. It was written while building [Go Motion](https://gomotion-ai.app?utm_source=github), a pipeline that turns a brief into a finished video, and it describes what that pipeline does and why; it is not a manual for it. The principles hold whether you cut by hand, use any tool, or let an agent do the work.

## The playbook

| | Chapter | What you will learn |
| --- | --- | --- |
| 1 | [Structure and pacing](guide/01-structure.md) | The scene as the unit of a video; hook, body and payoff; six shapes a script can take and what each is for; pacing; how long videos are outlined and written chapter by chapter without seams |
| 2 | [Writing for the voice](guide/02-writing-for-the-voice.md) | Text that survives being spoken; why length comes from the voice's rate and not from the page; how to brief a writer; borrowing a channel's style without its content; fact discipline; the review |
| 3 | [Narration and timing](guide/03-narration-and-timing.md) | Casting a voice; why caption timing must come from the speech itself; changing one line without re-recording the video; pauses as cuts; music and sound; other languages |
| 4 | [Captions](guide/04-captions.md) | Burned-in versus sidecar; one word at a time versus phrases with a live highlight; legibility on any picture; safe areas; cutting cues on pauses; scripts without spaces; nine styles and where each belongs |
| 5 | [Pictures and their licenses](guide/05-pictures.md) | What a scene's picture must do; writing the search like a photographer tags; judging candidates by looking; illustrations with a house style; framing; the four license tiers and the credit line |
| 6 | [Composition and publishing](guide/06-compose-and-publish.md) | The cut that follows the voice; backgrounds and themes; landscape versus portrait; thumbnails; export; the publishing checklist |

Alongside the chapters:

- [**A worked example**](examples/why-octopuses-have-three-hearts/): a one-paragraph brief, the five scenes it became, the captions of the exported video, how it was edited after production, and the credit each picture carries.
- [**The writing checklist**](references/scriptwriting.md): the agent's one-page version of chapters 1 and 2, with the measured speech rates per language.
- [**Design notes**](references/design-notes.md): for developers, how a pipeline lets an agent spend credits safely (quote, cap, confirm; idempotent paid requests; refunds as a contract).

## See it applied

<p align="center">
  <a href="https://cdn.gomotion-ai.app/site-assets/skill/why-octopuses-have-three-hearts.mp4"><img src="https://cdn.gomotion-ai.app/site-assets/skill/why-octopuses-have-three-hearts-preview.gif" width="640" alt="The first seconds of “Why Octopuses Have Three Hearts”" /></a>
  <br />
  <sub>“Why Octopuses Have Three Hearts”, about a minute, 1080p. <a href="https://cdn.gomotion-ai.app/site-assets/skill/why-octopuses-have-three-hearts.mp4">Full MP4</a> · <a href="examples/why-octopuses-have-three-hearts/making-of.md">how it was made</a></sub>
</p>

The example follows the playbook end to end: a brief that names the audience, the tone, a rule per scene and the ending (chapter 2); five scenes that each carry one surprising fact, from the promise to a one-sentence takeaway (chapter 1); a voice chosen for a science channel, one line rewritten and re-voiced on its own (chapter 3); karaoke captions timed from the speech (chapter 4); pictures from three libraries and one illustration, two of them changed after production, with a Creative Commons credit line for the description (chapters 5 and 6).

## The skill

The skill is the playbook in executable form: a `SKILL.md` your coding agent reads, and a zero-dependency client of the Go Motion API. Tell the agent what the video is about; it writes the brief with you, has the script written, shows you the scenes and checks their length before anything is produced, then produces, exports and downloads the MP4 with its SRT and VTT captions and a `CREDITS.txt` listing every picture's source and license. Every paid step is quoted and confirmed before it runs, and failed steps refund themselves.

### Install

```bash
npx skills add gomotionai/gomotion-skill
```

Pick the agent with `-a claude-code`, `-a codex` or `-a cursor` (`-g` installs for every project), or clone it by hand:

| Agent | Folder |
| --- | --- |
| Claude Code | `git clone https://github.com/gomotionai/gomotion-skill ~/.claude/skills/gomotion` |
| Codex | `git clone https://github.com/gomotionai/gomotion-skill ~/.agents/skills/gomotion` |
| Cursor | `git clone https://github.com/gomotionai/gomotion-skill ~/.cursor/skills/gomotion` |

Requirements: Node.js 18 or newer and a [Go Motion](https://gomotion-ai.app?utm_source=github) account with an API key (**Settings → API keys**, then `export GOMOTION_API_KEY=sk_…` in your shell; never paste the key into a chat).

### Use

In Claude Code, just ask: `make a 55-second explainer about …`, or run `/gomotion …`. In Codex, mention `$gomotion`. The CLI also works on its own (`node scripts/gomotion.mjs help`), and `estimate` runs offline on any script file:

```bash
node scripts/gomotion.mjs estimate scenes.json --language en
```

Production runs on your account's credits at the same prices as the studio; new accounts start with free credits that cover a first one-minute video. The [API reference](references/api.md) documents every endpoint the skill uses, and the [guide with screenshots](https://gomotion-ai.app/how-it-works/agent-skill?utm_source=github) walks through the setup.

## Contributing

Corrections and additions to the chapters are as welcome as code. Run the tests with `node --test test/*.test.mjs` and keep the CLI dependency-free.

## License

MIT © Go Motion. The chapters may be quoted and translated with attribution.
