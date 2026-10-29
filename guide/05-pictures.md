# 5. Pictures and their licenses

The picture is what the viewer looks at while the voice talks. In a faceless video it has to do the work a presenter's face would do: hold attention, confirm that the narration is about something real, and not contradict what is being said. This chapter is about finding the right picture for a scene, judging it honestly, falling back when there is none, and keeping the paperwork that lets you publish.

## What a scene's picture has to do

A good scene picture shows **the subject the narration names**, with the **right identity, period and action**. Those three words carry most of the craft:

- **Identity.** When the narration says "the Apollo 11 capsule", a picture of any capsule is a wrong picture, even if it is beautiful. When it says "a capsule", any capsule will do. The more specific the sentence, the more specific the picture must be, and a generic picture under a specific sentence is worse than a plain background, because it tells the viewer the video does not know what it is talking about.
- **Period.** A scene about an eighteenth-century lighthouse keeper illustrated with a modern lighthouse is the most common failure in automated history video. Period is part of identity.
- **Action.** "Light scattering in the atmosphere" is a process; it wants motion or a diagram, not a portrait. "The engineer who designed it" is a person; it wants a photograph or a painting, not stock footage of a sunrise.

The picture also has to be clean: no watermark, no logo, no burned-in caption from another video, no large text that fights your own captions, no collage of several images.

## Writing the search

Stock and archive libraries are searched and tagged in English, by photographers and archivists, and the search words that find the right picture are the words they would have used.

- **Write it as a photographer would tag it.** Two to five words, the main subject first: "Tower of Hercules lighthouse", "prism splitting sunlight", "Curiosity rover Mars surface". Not a sentence, not the narration.
- **No style words and no camera words.** "Cinematic", "beautiful", "4K", "illustration" find nothing in a library and filter out the pictures that are there.
- **Keep every entity, prepare alternatives in the wording.** A second and third search should vary the descriptive words while keeping the names, the dates and the physical facts that identify the scene. "Apollo 11" must not become "a rocket"; "1872" must not disappear if 1872 is what distinguishes the event.
- **Decide what kind of picture the scene wants.** Motion and process want video; a person, an artefact, a document or a moment in history wants an image. A library full of drone footage will happily offer video for a scene that needs a portrait.

Go Motion writes this plan for every scene from the final narration, including the alternatives and the preferred kind, and plans scenes in batches so that neighbouring scenes give each other context (a series about one lighthouse should not drift to a different lighthouse in scene seven).

## Search wide, then judge by looking

No single library is good at everything. Stock sites are strong on modern, generic, well-lit footage; archives are where history, science and places live. Go Motion searches several at once: Pexels, Pixabay and Unsplash for stock, the Internet Archive, NASA and Wikimedia Commons for archival and public-domain material.

The result of a search is a list of candidates, and the mistake almost every pipeline makes is to pick by the title. Titles lie, or rather they are written for a different purpose: "Mars" on a stock site is a red desert in Utah. The honest way to choose is to **look at the candidates as pictures** and ask, for each one, whether the narrated subject is visibly there.

Go Motion does this with a vision model that is shown the candidates and the narration together and asked to judge what is visible, with rules that are worth copying if you choose by hand:

- **The title is evidence, not proof.** A library description can support the identity of what is shown; it cannot make something visible that is not in the frame.
- **A contradiction vetoes.** A picture that shows the wrong person, the wrong period, the wrong action or an impossible physical relationship is out, however good it looks. Meaning beats beauty.
- **Clutter counts against.** Watermarks, logos, burned-in captions, large text, collages and screenshots lose points even when the subject is right.
- **A video is judged by a frame.** One still from the clip is what the viewer will see at the cut; if that frame does not show the subject, the clip does not either.
- **Uncertain is an answer.** When the evidence is not there, the honest judgement is "unknown", not a guess, and an unknown should lose to a confident match.

## When nothing fits: illustrations with a house style

Some scenes have no photograph: an extinct animal, a medieval workshop, a process nobody can film. For those, a generated illustration is better than a loosely related stock clip, with three conditions:

- **One visual style for the whole series.** Decide the medium (a documentary photograph, an oil painting, a flat diagram), the palette and the lighting once, and apply it to every generated picture. A series that mixes a photoreal render, a watercolour and a 3D cartoon looks like what it is.
- **Each picture states its own period.** The style says "oil painting"; the scene says "fourteenth-century Venice", and everything in the frame (clothing, ships, buildings) belongs to it. Nothing modern leaks in.
- **No text in the frame.** Generated text is wrong often enough to be a tell, and your captions already own the typography. No signs, no labels, no logos.

Go Motion writes the series style once, describes the exact frame it would need for every scene, and only paints it when no library candidate was judged good enough. Illustrations are marked as illustrative in the project, because a painting of a lighthouse keeper is not documentary evidence of one, and the credit line should say so.

## Framing

A library picture is rarely the shape of your frame. A tall nineteenth-century photograph placed in a wide video is either cropped to a band across its middle or shown whole with bars at the sides. Both are legitimate; the mistake is not deciding.

- **Crop to fill when the subject is in the middle** and the edges are sky and ground; most landscape footage and most portraits of a face survive it.
- **Show it whole, on a background, when the edges carry the meaning**: a document, a map, a painting with its composition, a building photographed full height.
- **Check the subject's position.** A crop that fills the frame can slice through the one thing the scene is about. Go Motion asks its picture judge to mark where the narrated subject sits in each image it scores, which is the information a crop needs; when you choose pictures by hand, look at the edges before you accept the crop.

## Licenses, in four tiers

Every picture has an owner and terms, and a video that ignores them is one complaint away from being taken down. The terms sort into four tiers, and the tier decides what you do.

| Tier | Typical sources | What you owe |
| --- | --- | --- |
| No credit required | Pixabay, Pexels, Unsplash under their own licenses; public domain | Nothing, though a courtesy credit never hurts |
| Credit required | Creative Commons BY licenses, NASA and JPL imagery, many archive items | A credit line naming the author and the license, in the video description or on screen |
| Review before use | Non-commercial (NC), no-derivatives (ND), share-alike (SA), unstated terms | A decision per channel: a monetised video is commercial, a captioned cut is a derivative, share-alike can bind your own video |
| Blocked | All rights reserved, editorial-only | Do not use |

Go Motion records the source, author, license and whether credit is required for every picture it places, shows them in the studio, and the skill writes them into a `CREDITS.txt` next to the exported MP4, credits that are required first. The example in this repository needed one credit line (a NASA photograph from Wikimedia Commons) and none for its three stock clips and its one illustration.

Three habits keep you safe:

- **Keep the paperwork with the video.** Source, author, license and link for every picture, kept where the video is kept, not reconstructed later.
- **Put required credit lines in the description** at publish time, in the form the license asks for (author, title where known, license name and link).
- **Decide the review tier once, as a policy**, rather than per picture at midnight before publishing. A channel that monetises should treat non-commercial licenses as blocked.

## Your own material

Nothing beats footage you own: it is exact, it is yours, and it needs no credit. Upload it and place it on the scene it belongs to; a library of your own clips, photographs and diagrams grows with the channel and makes every later video faster. Mix it freely with library pictures; the viewer does not care where a picture came from, only whether it is the right one.

## Checklist

- Every scene's picture shows the named subject, in the right period, doing the right thing.
- Search words were written as tags, main subject first, with alternatives that keep every entity.
- Candidates were judged by looking, with contradictions vetoing and clutter counting against.
- Scenes with no real picture use illustrations in one series style, with no text in the frame, marked as illustrations.
- Tall or wide pictures were cropped or framed deliberately, with the subject kept.
- Every picture has its source, author and license on file; required credit lines are in the description.

Previous: [4. Captions](04-captions.md) · Next: [6. Composition and publishing](06-compose-and-publish.md).
