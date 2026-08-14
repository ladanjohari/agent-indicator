# Preview capture

Source for the motion clip in the main README. Not part of the published
package, and not imported by anything in `src`.

| File | What it is |
| --- | --- |
| `hold-to-approve.html` | A self contained 560x320 scene, 7 seconds, using the component's own CSS |
| `capture.js` | Puppeteer frame capture, then ffmpeg into a GIF and an MP4 |

## Regenerate

```bash
cd previews
npm install        # one time, installs puppeteer
node capture.js
```

Outputs land in `../assets/hold-to-approve.gif` and `.mp4`. Commit them.

Requires `node` and `ffmpeg`.

## Why it captures the way it does

Every animation in the scene shares one 7 second timeline and schedules itself
with percentages. The capture script pauses them all, sets `currentTime` by
hand, and screenshots each frame.

Nothing is recorded in real time, which is the point: the two second hold comes
out as exactly two seconds rather than however long the machine felt like
taking that afternoon. It also means a slow laptop and a fast one produce
identical files.

## Editing the scene

The timeline is written as percentages of 7 seconds, and the comment at the top
of the HTML lists what happens when. The moments that matter:

- **18.6 to 23.5 percent**, a quick click that starts the fill and lets go. It
  exists so the clip shows that a click does not work here before it shows what
  does.
- **31.4 to 60 percent**, the hold. Exactly two of the seven seconds, linear,
  matching the real component.
- **92.9 to 99 percent**, the reset. The result fades out before the controls
  fade back in, never together, because two overlapping half transparent labels
  read as a bug rather than as a loop.

If you change the total duration, every percentage moves. Easier to keep 7
seconds and change what happens inside it.

## Specs

- 560x320 at `deviceScaleFactor: 2`, so it captures at 1120x640
- 20fps, 7s, 140 frames
- GIF: 128 colours, bayer dithering, about 60kB
- MP4: h264, crf 20, `scale=-2` because h264 needs even dimensions

## Adapted from

The Session Indicator preview pipeline in the portfolio repo, at
`assets/previews/SI-previews/`.
