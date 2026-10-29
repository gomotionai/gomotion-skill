# 4. Captions

Most faceless videos are watched with the sound off, at least at first. Feeds autoplay muted; a viewer decides whether to unmute from what they can read. Captions are therefore not an accessibility extra in this format; they are the second performer, next to the voice. This chapter is about how to make them readable on any picture, how to group and time them, and which style suits which video.

## Burned in or alongside

There are two ways to deliver captions, and most channels use both.

- **Burned-in captions** are drawn into the picture. They are what short-form platforms expect: large, styled, following the voice word by word, impossible to switch off. They are part of the edit.
- **Sidecar subtitles** (SRT or VTT files) travel next to the video and are rendered by the player. YouTube indexes them, viewers can switch them off, and they can be translated. They are plain text with timings and no style.

Go Motion renders burned-in captions in the video and exports SRT and VTT files from the same word timings, so the two never disagree. On YouTube you can turn the burned-in captions off and upload the file instead; on Shorts, Reels and TikTok you keep them burned in.

## Two ways to group words

The captions you see on short-form video come in two families, and the choice is the first design decision.

**One word at a time.** Each spoken word appears alone, large, often with a small bounce or scale as it lands. The viewer's eye never has to travel; the rhythm of the words becomes the rhythm of the video. This is the native style of vertical video: a phone screen is narrow, the caption competes with a face-sized picture, and one word at a time stays legible at any size.

**Short phrases with a live highlight.** Three or four words sit on screen together and the current word is marked: by colour, by a pill behind it, by a fill that progresses like karaoke. The viewer reads slightly ahead of the voice, which makes long sentences easier to follow. This suits landscape video, explainers and anything where the sentences carry an argument rather than a punch.

The format decides more than taste does. In portrait, phrases shorten by a word, because the frame is narrow; Go Motion's phrase presets show one word fewer in portrait than in landscape for that reason.

## Legible on any picture

A caption has to be readable over a bright sky, a dark cave, a busy crowd and a white document, because you do not control the footage behind it from scene to scene. The rules that make text survive any background:

- **Heavy weight.** Thin fonts disappear over detail. Caption faces are bold or black weights, and the elegant thin serif is a deliberate exception used with calm, uniform footage.
- **An outline and a soft shadow.** White text with a dark outline reads on black and on white; a soft shadow behind the outline separates it from mid-tone clutter. The outline is what lets a caption sit over anything.
- **Size relative to the frame.** Captions are sized as a fraction of the frame width, so a phone and a monitor see the same proportion. If a caption looks small on a phone it is too small; most viewers are on one.
- **Contrast that does not depend on the footage.** A bright highlight colour on the current word (a red, a yellow, a pill) is chosen to be visible on any picture, not to match the scene.

## Where captions sit

- **Inside the safe area.** Vertical platforms draw their own interface over the bottom and the right of the frame: the caption text, the buttons, the progress bar. Captions placed there are hidden on the viewer's phone even though they looked fine in the editor. Keep them in the middle band of a vertical video and in the lower third of a landscape one, above any letterbox.
- **Shrink before you wrap.** When a phrase is too wide for the frame, a caption system should reduce the font a little before breaking the line, because a two-line caption changes the rhythm. Go Motion fits each caption to the width first and wraps only when it must.
- **No orphans.** A line that ends with a lone "the" or a dangling number is broken at the wrong place. Breaks go after a clause, not after an article.
- **Keep it still.** A caption that jumps position every scene is exhausting. Fix the position for the series and move it only when a scene's picture demands it.

## Cutting cues

A cue is the group of words shown together, in burned-in captions and in subtitle files alike. The rule for cutting cues is the rule for scenes in chapter 1, one level down: a cue is one breath.

- **Break on pauses.** A cue ends where the voice pauses: a full stop, a comma, a breath. Breaking on a fixed word count puts the break in the middle of a thought.
- **Never split a name or a number.** "Fifteen hundred | kilometres" and "Grace | Darling" are read as two things.
- **Keep cues short in time as well as in length.** A cue that stays up long after its words were spoken looks like a mistake; one that flashes past cannot be read. The timing from the speech (chapter 3) is what makes both avoidable.
- **Subtitle files follow the same breaks.** Go Motion groups exported SRT and VTT cues by the same pauses, so the file reads like the burned-in captions did.

## Scripts without spaces

Chinese, Japanese and Korean captions are written without spaces, and a caption system built for English gets them wrong in two ways: it either highlights a character at a time, which no reader follows, or it inserts spaces between words, which looks like a foreign typesetter's mistake. The right behaviour is to find the words with a language-aware segmenter, highlight by word, and write subtitle files without separators. Go Motion does this for Chinese, and the caption fonts on its renderers include the full CJK glyph sets so that no character falls back to a box.

## The nine styles

Go Motion ships nine caption presets. They differ in grouping, typeface and emphasis, and each has a natural home.

| Style | Grouping | Look | At home in |
| --- | --- | --- | --- |
| Bold Stroke | one word, with a bounce | heavy sans, thick black outline | Shorts, Reels, TikTok; the default |
| Red Highlight | short phrases | heavy sans, current word in red | landscape explainers and commentary |
| Sleek | short phrases, slide and scale | heavy sans, minimal | product, tech, modern topics |
| Karaoke | short phrases | rounded sans, a pill behind the current word | music-led and upbeat videos |
| Majestic | short phrases | tall condensed capitals | documentary, history, cinematic footage |
| Beast | one word | comic display face, very thick outline | entertainment, reactions, gaming |
| Elegant | one word | thin serif | lifestyle, calm footage, quotes |
| Pixel | one word | pixel font | retro and gaming |
| Clarity | one word | clean grotesque | education, tutorials, anything that must read fast |

Pick one per channel. Consistency across videos is worth more than the perfect style for one video.

## Checklist

- Captions are burned in for short-form and available as SRT or VTT for platforms that index them.
- The grouping (one word, or short phrases with a live highlight) fits the format.
- Text is bold, outlined and shadowed; it was checked over the brightest and the busiest scene.
- Captions sit inside the platform's safe area and keep one position for the series.
- Cues break on pauses, never inside a name or a number.
- One caption style for the channel.

Previous: [3. Narration and timing](03-narration-and-timing.md) · Next: [5. Pictures and their licenses](05-pictures.md).
