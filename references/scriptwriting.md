# Writing a script that produces well

For the agent (SKILL.md sends it here before it writes or edits narration) and for anyone who writes their own `--script`. Nothing on this page needs an account; the numbers come from how Go Motion measures and prices a script.

## 1. How long is a minute

Narration length is estimated from **characters**, at the rate of the language's default voice (measured on 2026-10-26 with the same passage read in every language; the live table is `capabilities` → `languages[]`). Production and export are priced **per started minute**: a 61-second script pays for two minutes, a 59-second one for one.

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

Characters count everything in the narration after trimming, spaces and punctuation included. Words are what the planner is told to write; time is estimated from characters, so long words cost more than short ones.

**Rule of thumb:** plan a "one-minute" video at **50–55 seconds** of narration and a two-minute one at 110–115. The voice may read a few seconds slower than the estimate and the cut adds transitions, so a script estimated at 58 seconds can come out as a 60.4-second timeline, which exports as two minutes (it happened in [the example](../examples/why-the-sky-is-blue/session.md)).

Check before you pay:

```bash
node scripts/gomotion.mjs estimate scenes.json --language en     # a file, offline
node scripts/gomotion.mjs estimate <videoId>                     # a draft on the server, live rates
```

The answer lists seconds per scene, the started minutes, the credits each step would cost at those minutes, and, when the script sits just over a minute mark, about how many words to cut.

## 2. Brief like a writer

A good `--idea` is a paragraph, not a title. Give the planner:

- **The hook**: what the viewer will understand or get ("explained in one minute", "the three mistakes that…").
- **The facts to include**, in the order they should appear. The planner keeps that order.
- **The payoff**: how the video ends. Without it, endings go flat.
- **Audience and tone**: "curious general audience, friendly", "developers, dry and precise".
- Optionally, what to leave out.

The brief that made the example video:

> Why the sky is blue, explained in one minute: sunlight is made of every colour, air molecules scatter short blue wavelengths far more than red ones (Rayleigh scattering), so blue light reaches our eyes from every direction; at sunset the light crosses more air, the blue is scattered away and reds remain. End with why Mars has a butterscotch sky.

What the planner does with it: a title plus four to six scenes per minute, each with a **title** (not spoken; it steers the picture search) and a **narration** (spoken, sized to the language's words per minute and your `--duration`).

## 3. The shape of a scene

- **One idea per scene.** Pictures are found from the scene's title and narration; a scene with two ideas gets a picture for one of them.
- **Hook inside the first ten seconds** (about 25–30 English words): say what the viewer gets. The example opens with "In the next minute, you will understand why our sky is blue, why sunsets burn red, and why the sky on Mars glows butterscotch."
- **Middle scenes**: a claim, then the concrete thing that makes it real: a number, an example, a comparison.
- **Last scene**: the payoff and a closing line that lands. No "thanks for watching".
- **Four to six scenes per minute**, 30–40 English words each (10–14 seconds).
- **Titles are nouns.** "Sunlight holds every colour" found a prism; "Introduction" finds nothing in particular.

## 4. Write for the voice and the captions

- Short sentences, 8–14 words. Captions show a few words at a time (2–4 seconds per cue) and the highlighted word follows the voice; long sentences read badly on screen.
- Write numbers and units as they should be spoken: "three hearts", "1,500 kilometres", "two per cent".
- Expand an abbreviation the first time it appears; the voice pronounces by spelling.
- No parentheses, slashes or stage directions: everything in the narration is spoken.
- Keep proper nouns spelled the same way every time.
- Read it aloud once. If you run out of breath, the voice will too.

## 5. 16:9 versus 9:16

- **9:16** (Shorts, Reels, TikTok): 30–45 seconds, hook in the first three seconds, captions are large, so keep clauses short.
- **16:9** (YouTube): 55 seconds to several minutes; the same rules, with more room for an example per scene.

## 6. Editing after planning (free)

- `script get <videoId>` → edit the file → `script set <videoId> scenes.json`. Keep the scene ids so edits stay attached to their scenes.
- To get under a minute mark, trim words, not scenes: cut the sentence that restates something, the adjective, the "as we have seen".
- If the draft reports `stale` (its settings changed after the script was written), plan again; otherwise edit the narration, which costs nothing.

## 7. Checklist before `produce`

1. `estimate` says the total is at least five seconds under a minute mark.
2. Scene 1 has the hook, the last scene has the payoff.
3. One idea per scene, a concrete title on each.
4. Numbers, units and names are written as spoken.
5. `--language` matches the language of the narration.
