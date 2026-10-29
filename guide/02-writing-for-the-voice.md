# 2. Writing for the voice

A faceless video script is not an article. Nobody reads it; a voice says it, once, at the voice's pace, to someone who cannot scroll back. This chapter is about writing text that survives being spoken: how long it really is, how to brief it, how to borrow a channel's style without copying it, and how to keep it honest.

## Written to be heard

Prose written for the page leans on things a listener does not have: the shape of a paragraph, a glance back at a definition, parentheses, abbreviations the eye expands on its own. Narration has none of that. The rules that follow from it are simple and unforgiving:

- **Short sentences, one clause each where you can.** A listener holds a sentence in working memory until it ends. Fourteen words is comfortable; thirty is a lecture.
- **Say numbers and units the way they are spoken.** "Three hearts", "fifteen hundred kilometres", "two per cent". A voice reads "1,500 km" correctly most of the time; it reads "1500km" as a gamble.
- **Expand an abbreviation the first time, then use it.** "The European Space Agency, ESA, …". The voice pronounces by spelling, and a listener who does not know the acronym cannot look it up.
- **No parentheses, slashes or stage directions.** Everything in the narration is spoken. "(pause)" becomes the word "pause"; "and/or" becomes "and or".
- **Spell proper nouns the same way every time.** Consistency is pronunciation: the voice cannot know that two spellings mean one person.
- **Read it aloud before you commit it.** If you run out of breath, the voice will too, and the caption cut will land in the middle of your sentence.

## Length comes from the voice, not the page

The most common surprise in automated video is that the script is longer than planned. A page of text has no duration; a voice does, and voices are slower than readers. A relaxed English narration lands somewhere around a hundred and sixty words a minute, and that is only English: languages differ a great deal in how many words, and how many characters, fit into a minute, and Chinese is counted in characters rather than words because the idea of a "word" is different.

Go Motion sizes scripts from measured speech rates: every voice it offers has been timed on the same passage, and the planner writes to the number of words (or characters) that the requested length holds at that rate. The same rates are published through the API, and the skill's `estimate` command uses them to tell you how long a script will run before anything is recorded. The table of rates lives in [references/scriptwriting.md](../references/scriptwriting.md).

Two practical consequences:

- **Plan slightly under the length you want.** The voice reads a little slower than the estimate, pauses add up, and the cut adds transitions. If a platform or a budget counts started minutes, a sixty-one-second video is a two-minute video; aim for the fifties and keep a margin.
- **Trim words, not scenes.** When a script runs long, cut the sentence that restates, the adjective, the "as we have seen". Cutting a whole scene breaks the structure from chapter 1; cutting six words rarely does.

## Brief like a writer

The brief is the most important text you will write, because everything downstream is derived from it. A title is not a brief. A good brief is one paragraph that gives the writer, human or model, five things:

1. **The hook**: what the viewer gets. "Explained in one minute", "the three mistakes that…", "why X looks nothing like Y".
2. **The facts, in order.** Three to six concrete points, in the order the video should make them. The order will be kept.
3. **The payoff**: how the video ends. Without it, endings go flat.
4. **The audience and the tone.** "Curious general audience, friendly"; "developers, dry and exact"; "students, patient".
5. **What to leave out**, when there is something tempting and wrong.

The brief behind the worked example is one paragraph that does all five:

> Why the sky is blue, explained in one minute: sunlight is made of every colour, air molecules scatter short blue wavelengths far more than red ones (Rayleigh scattering), so blue light reaches our eyes from every direction; at sunset the light crosses more air, the blue is scattered away and reds remain. End with why Mars has a butterscotch sky.

Given a brief like that, a planner (Go Motion's, or you) produces a title and a list of scenes, each with a title that steers the picture and a narration that is spoken, sized to the length you asked for. The facts arrive in the order the brief gave them, the hook becomes scene one, and "end with" becomes the payoff.

## Borrowing a channel's style

Many faceless channels succeed on a recognisable voice: a way of opening, a rhythm, a sentence length, a persona. That is learnable, and it is worth being precise about what you learn.

A writing style, learned from a channel's own captions, captures **form**: how the channel opens (a question, a claim, a scene), how fast it moves, how long its sentences are, how it addresses the viewer, how it handles facts and sources, how it closes. Go Motion builds such styles from a video's transcript and uses them as instructions to the planner, next to six built-in shapes (chapter 1).

What a style does not and must not capture is **content**: the channel's research, its footage, its specific claims. Borrowing form is how genres work; borrowing content is plagiarism and, on most platforms, a reason for removal.

Styles are also subordinate to structure and to facts. A style that wants long atmospheric sentences still has to deliver one idea per scene; a style that loves a confident claim still cannot invent the statistic behind it. In Go Motion, the platform's structural and factual rules are appended after every style and take precedence over it, which is a good rule for hand-written scripts too.

## Facts

AI-written narration fails in a particular way: it sounds certain. The sentence "studies show that…" costs nothing to generate and everything to be wrong about on a channel that wants to last.

- **Do not invent statistics, quotations or dates.** A planner can be told this, and Go Motion's is; the writer's job is to hold the line in review.
- **Label the claims that need support.** The scene that states a number or a date should carry where it came from, so the reviewer can check it and the description can cite it.
- **Keep known facts apart from uncertain ones.** "Historians believe" and "the records show" are different sentences, and the documentary shape in chapter 1 depends on the difference.
- **Stories about real people are not fiction.** A storytelling shape still cannot give a real person feelings or events they did not have.

## Review: the script is the video

Everything after the script is derived: the voice says these words, the captions show them, the pictures illustrate them. In Go Motion nothing is produced until you have read the scenes, and the review is free, which makes it the cheapest moment in the whole process to fix anything. Use it like an editor:

1. Read every scene aloud, at speaking pace.
2. Check the facts you would be embarrassed to get wrong.
3. Check the length with `estimate`; trim words if it is over the mark.
4. Check that scene one promises and the last scene delivers.
5. Check the titles: could a picture researcher work from them?

Then produce. The voice will say exactly what you approved.

## Checklist

- Every sentence can be said in one breath; numbers and abbreviations are written as spoken.
- The script's length was checked against the voice's rate, with a margin, not guessed from the page.
- The brief had a hook, ordered facts, a payoff, an audience and a tone.
- Any borrowed style borrowed form, not claims or footage.
- No invented numbers, quotes or dates; supported claims carry their source.
- The scenes were read aloud before production.

Previous: [1. Structure and pacing](01-structure.md) · Next: [3. Narration and timing](03-narration-and-timing.md).
