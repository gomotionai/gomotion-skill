# 1. Structure and pacing

A faceless video has no presenter to carry it. Nothing on screen asks the viewer to stay; only the shape of the video does. This chapter is about that shape: how a video earns its first ten seconds, how it keeps moving, and how it ends so that the viewer remembers it.

## The unit of a faceless video is the scene

A faceless video is a sequence of scenes. Each scene is one spoken thought, one picture, and a few seconds of the viewer's attention. Everything else in this playbook (the voice, the captions, the footage, the cut) is built on that unit, so it is worth being strict about what a scene is:

- **One idea per scene.** The narration of a scene makes one point, and the picture illustrates that point. A scene that makes two points will get a picture for one of them and leave the other naked. If you catch yourself writing "and also" in a scene, it is two scenes.
- **A scene is as long as the thought.** The cut follows the narration, not a stopwatch. A scene that needs one sentence gets one sentence; a scene that needs three gets three. What you avoid is the scene that runs on: once a picture has been on screen for the length of a long breath, the eye starts looking for something new, and a long scene with a static picture is where viewers leave.
- **A scene has a title that nobody hears.** The title is for you and for the picture search: a concrete noun phrase that says what should be on screen ("Sunlight holds every colour", "Mars and its butterscotch sky"). "Introduction" and "Conclusion" are not titles; they tell the picture search nothing.

Go Motion plans and edits in exactly this unit. The script you review is a list of scenes, each with a title and a narration, and production attaches a voice, timed captions and a picture to each of them. When you edit, you edit a scene; when you swap a picture, you swap it for a scene.

## The three jobs of a short video

Most faceless videos under a few minutes have the same skeleton, whatever the topic: a hook, a body, and a payoff. The skeleton is boring; the craft is in making each part do its job.

**The hook says what the viewer gets.** The first scene is not an introduction and not a welcome. It is a promise: in the next minute you will understand X, or here is the thing that makes Y surprising. The example in this repository opens with "In the next minute, you will understand why our sky is blue, why sunsets burn red, and why the sky on Mars glows butterscotch." Three concrete promises, and the video then keeps each of them. A hook that promises nothing ("Today we're going to talk about the sky") is skipped.

**The body alternates claim and proof.** Each body scene states one thing and then makes it real: a number, an example, a comparison, a mechanism. "Blue light has a short wavelength, so it is scattered again and again" is the claim; "until it reaches your eyes from every direction, that is why the whole sky looks blue, not just one patch" is the proof. A body that is all claims sounds like a lecture; a body that is all examples never gets to the point.

**The payoff lands the promise.** The last scene answers the question the hook asked, or shows the consequence of everything before it. In the example, the Mars sky is the payoff: the same scattering that paints our sky blue paints theirs butterscotch, and the viewer leaves with one principle instead of three facts. Do not end with "thanks for watching" or "let me know in the comments"; end on the idea, and let the platform's end screen do the rest.

## Six shapes of a script

The skeleton above bends into different shapes depending on what the video is for. Go Motion ships six writing styles, and they are a useful vocabulary even if you write by hand, because each one has its own opening and its own ending.

| Shape | Opens with | Moves by | Ends with | Good for |
| --- | --- | --- | --- | --- |
| **Clear explainer** | what the viewer will understand | one point per scene, concrete examples, natural transitions | a short recap that does not oversell | how-things-work topics, educational channels |
| **Documentary narrative** | the context | process, the key change, the outcome; known facts kept apart from uncertain ones | the consequence | history, science, places, people |
| **Suspense** | a question about the topic | information released scene by scene, each one narrowing the question | the answer to the opening question | mysteries, "why does X happen", investigations |
| **Storytelling** | a situation and a goal | obstacle, turn, outcome | what changed | biographies, case studies, origin stories |
| **Listicle** | why the topic matters | independent points in a clear order, each with a short example | a natural summary | tips, tools, comparisons |
| **Fast-paced explainer** | a direct question or a counter-intuitive fact | short sentences, one conclusion per scene, controlled density | the conclusion, no slogans | Shorts, Reels, TikTok |

Two of these deserve a warning. Suspense only works when the payoff is real: a question that the video cannot actually answer, or answers with "it's complicated", feels like a bait. And storytelling about real people must not invent experiences for them; a story shape does not license fiction.

## Pacing

Pacing is the rhythm of scene lengths and of what each scene asks from the viewer.

- **Vary the length.** A run of scenes that are all the same length feels mechanical. Let a mechanism scene breathe and cut a transition scene short.
- **Front-load.** The most surprising fact goes early, not into a "but here's the twist" at the end. Viewers decide in the first few seconds whether a video is for them; the twist at the end is only seen by the people who stayed.
- **One new thing per scene.** Density is the enemy of retention in a faceless video, because there is no face to help the viewer absorb it. If a scene introduces two new terms, split it or cut one.
- **Transitions are sentences, not words.** "Now let's look at…" is filler. The last sentence of a scene can hand over to the next ("That is the sky. Sunsets are a different story.") and the picture change does the rest.

## Long videos: outline first, then chapters

A ten-minute video is not a one-minute video written ten times longer. It has chapters, and the failure mode of long AI-written scripts is that every chapter reads like a separate video: each one re-introduces the topic, repeats facts from earlier chapters, and ends with its own little conclusion. The viewer feels the seams.

The approach that works, and the one Go Motion uses for longer scripts, is to plan before writing:

1. **Write an outline first.** The outline names the chapters, gives each one its facts and story beats, and makes sure no beat appears twice. It also plans one continuous line through the whole video, so the chapters are stages of one argument rather than a playlist.
2. **Give every chapter two hand-offs.** Each chapter knows how it picks up from the one before and how it hands over to the one after. A chapter in the middle must not conclude or summarise; it leads into the next one.
3. **Write chapters one at a time, continuing from the previous ending.** When a chapter is written, it gets the closing lines of the previous chapter verbatim and continues from them. That is what makes the seam disappear: the first sentence of chapter three follows the last sentence of chapter two, instead of starting over.
4. **Only the last chapter ends the video.** The first chapter opens it; the last chapter closes it; everything in between keeps moving.

If you write long scripts by hand, the same discipline applies: outline, hand-offs, continue from the previous ending, and read the seams aloud.

## Worked example: "Why the sky is blue" in five scenes

The example in `examples/why-the-sky-is-blue/` was written from a one-paragraph brief. Its five scenes each do one job:

| Scene | Title | Job |
| --- | --- | --- |
| 1 | What you will understand in one minute | the hook: three promises |
| 2 | Sunlight holds every colour | setup: the fact the mechanism needs |
| 3 | Blue arrives from every direction | the mechanism, and the answer to the title |
| 4 | Why sunsets turn red | the contrast that proves the mechanism |
| 5 | Mars and its butterscotch sky | the payoff: one principle, two worlds |

Notice what is not there: no introduction scene, no "in this video", no summary scene that repeats scenes 2 to 4. The video is a minute long because a minute is what the idea needs, and the hook promised exactly what the five scenes deliver.

## Checklist

- The first scene promises something concrete; the last scene delivers it.
- Every scene makes one point and has a title a picture researcher could work from.
- Each body scene has a claim and something that makes it real.
- No scene re-introduces the topic; no middle chapter concludes.
- The most surprising fact is in the first half.
- Read it aloud: every seam between scenes sounds like one voice continuing.

Next: [2. Writing for the voice](02-writing-for-the-voice.md).
