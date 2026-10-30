# How it was made

"Why Octopuses Have Three Hearts" was made in the Go Motion studio from the brief in [brief.md](brief.md). Everything below comes from the project's own records: the jobs it ran, the pictures it chose and the credits they carry. Nothing is reconstructed.

## In the studio

1. **The script.** The wizard planned five scenes from the brief in the Clear explainer style, one of the built-in styles at the time. The hook promises three things and the last scene is the one-sentence takeaway the brief asked for. The scenes were read and approved as written.
2. **Production.** The voice recorded the five scenes, the captions were timed from that speech, and a picture was found for every scene: three from stock and archive libraries, one generated illustration where no library had the right picture, and one that was later replaced.
3. **One line re-voiced.** After listening, one scene's narration was rewritten. Only that scene was recorded again; the other four kept their audio and the captions moved with the change.
4. **Two pictures changed.** One scene's picture was swapped with *Find new visual* (the search ran again with new words and the result was judged against the narration); for another scene a photograph was picked by hand from the open libraries through *Choose media*.
5. **A cover.** A YouTube cover was read as a style reference and a background was generated in its composition, colours and light, twice, with the title on its own layer.
6. **Export.** The saved version was rendered to a 1080p MP4 with SRT and VTT captions. [Watch it](https://cdn.gomotion-ai.app/site-assets/skill/why-octopuses-have-three-hearts.mp4).

What this sequence shows is the editing model: nothing after production was regenerated from scratch. A line, a picture and a cover were changed one at a time, and the rest of the video stayed as it was.

## The same with the skill

An agent running this skill does the first two steps and the export from the terminal; it is also where the length is checked before production. The commands, with the brief from `brief.md`:

```bash
S=~/.claude/skills/gomotion/scripts/gomotion.mjs
node $S create --idea "Explain why octopuses have three hearts and blue blood, …" --ratio 16:9 --language en
node $S plan <videoId> --max-credits <quote> --wait        # the scenes come back for review
node $S estimate <videoId>                                  # seconds per scene, minutes started
node $S script set <videoId> scenes.json                    # after your edits (free)
node $S produce <videoId> --max-credits <quote> --wait
node $S export <videoId> --max-credits <quote> --wait
node $S download <videoId>                                  # MP4, SRT, VTT and CREDITS.txt
```

Re-voicing one line, swapping a picture by hand and generating a cover are studio steps today; the download answer carries the studio link for them.

## The pictures and their credits

| Scene | Picture | Source | Credit |
| --- | --- | --- | --- |
| 1 | an octopus's eyes, close up | Wikimedia Commons, by Victor Micallef, CC BY-SA 4.0 | **required**: author, license and link in the description; share-alike applies to the video |
| 2 | an illustration of the three hearts | generated for this series | none; marked as an illustration |
| 3 | a reddish-brown octopus on the ocean floor | Unsplash, by dani grau | none required (Unsplash License) |
| 4 | an octopus clinging to a rock in an aquarium | Unsplash, by Diane Picchiottino | none required (Unsplash License) |
| 5 | an octopus on a beach | Pixabay, by GGovastki | none required (Pixabay Content License) |

`download` writes the same list to `CREDITS.txt`, the required credit first:

```text
Credit required (put these lines in the video description):
Scene 1 — A Blueprint for the Deep: Victor Micallef via Wikimedia Commons, CC BY-SA 4.0 (https://commons.wikimedia.org/wiki/File:Octopus_eyes_closeup.jpg)
```

The CC BY-SA picture is the interesting one. Share-alike licenses sit in the "review" tier of [chapter 5](../../guide/05-pictures.md): the credit line is easy, but share-alike can bind the video itself, so a channel decides once whether it accepts that. This series did, with the credit.

Back to the [playbook](../../README.md).
