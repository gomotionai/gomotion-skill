# 3. Narration and timing

The voice is the only performer in a faceless video. It sets the pace, it decides where the cuts fall, and it is what the captions have to follow. This chapter covers choosing a voice, where the timing of everything else comes from, how to change a line without re-recording the whole video, and what music and sound are for.

## Choosing a voice

A voice is a casting decision, and it is made once per channel, not once per video.

- **Match the voice to the topic and the audience.** A patient, warm voice for explainers; a drier, lower one for history and documentary; a brighter, faster one for lists and Shorts. Energy matters more than gender or age: a slow voice on a fast-paced script fights the writing.
- **Audition with your own lines.** A voice's sample reads a sentence the vendor chose. Play it with a line from your script, including a number and a name, before you commit.
- **One voice per channel.** Viewers recognise a channel by its voice before they recognise its thumbnails. Changing voice between videos reads as a different channel; changing it inside a series means every scene has to be recorded again.
- **Default voices are a safe middle.** Each language in Go Motion has a default that was picked for clarity and neutrality; for Chinese the default is a film-commentary style that the audience of that format expects. Start there, and switch only when the topic asks for a character.

## Where the timing comes from

Captions, cuts and scene lengths all need to know when each word is spoken. There are two ways to get that, and only one of them works.

The first is to **estimate from the text**: count characters, assume a rate, spread the words evenly. It is what cheap tools do, and it drifts. Voices slow down on numbers and names, speed up on familiar phrases, pause at commas for different lengths, and breathe where the writer did not put punctuation. Thirty seconds in, the highlighted word is the one before the spoken one; a minute in, the caption is a sentence behind.

The second is to **take the timing from the audio itself**. Modern speech synthesis can return the start and end of every word it spoke, and that is what Go Motion uses: the words of the script are matched back to the words the voice produced, so each caption word carries the moment it was actually said. Where we measured it against an independent speech recogniser, the two agree to within a small fraction of a second, which is below what a viewer can perceive. The practical effect is that the highlight sits on the spoken word, cuts fall in real pauses, and the subtitle files you export match the video word for word.

If you ever build or buy a pipeline, this is the question to ask: does the timing come from the speech or from the text?

## Segments: change a line, not the video

A finished video is not frozen. You will find a wrong number, a clumsy sentence, a name mispronounced. The expensive way to fix it is to record the whole narration again and re-time everything. The right way is to record only what changed.

Go Motion records narration in segments that follow the scenes. When you edit the narration of one scene, only that scene's speech is produced again; the other scenes keep their audio exactly, the captions of the changed scene are re-timed from the new speech, and the captions after it shift by the difference in length. A fix to one sentence in a long video touches one sentence.

Two things follow for the writer:

- **Edit the text, do not re-plan.** Rewriting a sentence is a segment; asking for a new script is a new video.
- **A voice change is not an edit.** Switching voices re-records everything, because every segment was spoken by the old voice. Choose the voice before production.

## Pauses are the cut

Scene boundaries are pauses. The voice ends a sentence, breathes, and the next scene's picture appears with its first word. This is why the writing matters to the edit: a scene that ends mid-thought, or a sentence that runs across two scenes, leaves the cut with nowhere clean to land.

- End every scene on a full stop. The pause the voice takes there is the cut.
- Inside a scene, commas and sentence ends are where caption cues break; a sentence with no punctuation for twenty words gives the captions nothing to break on.
- A scene that needs a dramatic pause gets a short sentence before it, not a stage direction.

## Music and sound

Music in a faceless video is a floor, not a performer.

- **Low and constant.** The track sits well under the voice, low enough that a viewer notices it only when it stops. Go Motion starts music at a level most people would call quiet; raise it only if the video has long stretches without narration.
- **Instrumental, one track, looped or faded.** Lyrics compete with the narration. One track per video keeps the mood steady; a change of track reads as a change of chapter, so use it for that and nothing else.
- **Sound effects mark moments.** A whoosh on every cut is noise; a single sound on the one reveal that deserves it is punctuation. Silence under a key sentence is also an effect, and it is free.
- **Check the mix on a phone.** Phone speakers lose bass and bring the music forward. What is subtle on headphones can bury the voice on a phone.

## Other languages

Everything above holds in every language, with two adjustments.

- **Lengths are counted differently.** Languages run at very different rates, so a script of the same word count is a different length in Spanish and in Polish. Scripts in Chinese are planned in characters, because characters, not spaced words, are the unit a reader and a voice work in.
- **Word highlighting needs real words.** In languages written without spaces, the caption highlight has to follow dictionary words, not characters and not the whole line. Go Motion segments Chinese narration into words for exactly that reason, and writes the subtitle files without the spaces a Latin-script tool would insert.

## Checklist

- The voice was chosen for the channel, auditioned on your own lines, and will not change mid-series.
- Caption timing comes from the speech, not from a text estimate.
- Fixes are made by editing a scene's text; a new voice is chosen before production, not after.
- Every scene ends on a full stop; long sentences have punctuation for the cues to break on.
- Music is instrumental, one track, and quiet; sound effects are rare and deliberate.
- The mix was checked on a phone speaker.

Previous: [2. Writing for the voice](02-writing-for-the-voice.md) · Next: [4. Captions](04-captions.md).
