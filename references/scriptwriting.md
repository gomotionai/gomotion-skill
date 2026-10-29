# Writing checklist

The one-page version of [chapter 1](../guide/01-structure.md) and [chapter 2](../guide/02-writing-for-the-voice.md) of the playbook, for the agent to apply while it briefs, reviews and edits. The chapters hold the reasoning; this page holds the rules.

## How long is a minute

Narration length is estimated from **characters**, at the rate of the language's default voice (measured by Go Motion with the same passage in every language; the live table is `capabilities` → `languages[]`).

| Language | Words / min | Characters / min | Words in 55 s |
| --- | ---: | ---: | ---: |
| English `en` | 170 | 980 | 155 |
| Dutch `nl` | 181 | 1090 | 166 |
| French `fr` | 222 | 1340 | 203 |
| German `de` | 167 | 1040 | 153 |
| Hindi `hi` | 179 | 910 | 164 |
| Indonesian `id` | 204 | 1420 | 187 |
| Italian `it` | 232 | 1340 | 213 |
| Polish `pl` | 111 | 760 | 102 |
| Portuguese `pt` | 180 | 1000 | 165 |
| Russian `ru` | 128 | 840 | 117 |
| Spanish `es` | 189 | 1000 | 173 |
| Swedish `sv` | 152 | 920 | 139 |
| Turkish `tr` | 132 | 970 | 121 |
| Ukrainian `uk` | 134 | 910 | 123 |
| Chinese `zh` | 375 characters | 375 | 344 characters |

Characters count everything in the narration after trimming, spaces and punctuation included. Plan a "one-minute" video at **50–55 seconds** of narration: the voice may read a few seconds slower than the estimate and the cut adds transitions.

```bash
node scripts/gomotion.mjs estimate scenes.json --language en     # a file, offline
node scripts/gomotion.mjs estimate <videoId>                     # a draft on the server, live rates
```

## The brief

One paragraph with the hook, the facts in order, the payoff, the audience and the tone, and what to leave out. The planner keeps the order of the facts, makes the hook scene one and "end with" the last scene.

## The scenes

- One idea per scene; a concrete noun phrase as the title (it steers the picture search).
- Scene one promises something concrete; the last scene delivers it; no "thanks for watching".
- Body scenes: a claim, then the thing that makes it real.
- No scene re-introduces the topic; middle chapters of a long video never conclude.

## The narration

- Short sentences (8–14 words); numbers and units as spoken; abbreviations expanded the first time.
- No parentheses, slashes or stage directions: everything is spoken.
- Proper nouns spelled the same way every time.
- No invented statistics, quotations or dates; claims that need support carry their source.

## Editing after planning

- `script get` → edit → `script set`; keep the scene ids.
- To get under a minute mark, trim words, not scenes.
- A draft that reports `stale` (settings changed after the script was written) needs a new plan; otherwise edit the narration, which costs nothing.

## Before `produce`

1. `estimate` says the total is at least five seconds under a minute mark.
2. Scene one has the hook, the last scene has the payoff.
3. One idea per scene, a concrete title on each.
4. Numbers, units and names are written as spoken.
5. `--language` matches the language of the narration.
