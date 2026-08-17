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

Every animation in the scene shares one 6.2 second timeline and schedules itself
with percentages. The capture script pauses them all, sets `currentTime` by
hand, and screenshots each frame.

Nothing is recorded in real time, which is the point: the 1.2 second hold comes
out as exactly 1.2 seconds rather than however long the machine felt like
taking that afternoon. It also means a slow laptop and a fast one produce
identical files.

## Editing the scene

The timeline is written as percentages of 7 seconds, and the comment at the top
of the HTML lists what happens when. The moments that matter:

- **18.6 to 23.5 percent**, a quick click that starts the fill and lets go. It
  exists so the clip shows that a click does not work here before it shows what
  does.
- **35.5 to 54.8 percent**, the hold. Exactly 1.2 of the 6.2 seconds, linear,
  matching the real component.
- **57.5 to 61.5 percent**, the gate leaves, because the request has been
  answered and the host has taken it away. Nothing announces an outcome.
- **92 to 98 percent**, the reset, done while the frame is empty so the loop
  has no visible seam.

If you change the total duration, every percentage moves. Easier to keep 6.2
seconds and change what happens inside it.

## Checking it against the real component

`hold-to-approve.html` is **hand-copied markup, not the component.** It can
drift, and it has. On 16 August 2026 it was found rendering an "Approved,
deliberately." confirmation that the package has never had, and compensating for
three missing CSS rules with an invented margin.

`node audit-clip.js` puts the mock and the real component side by side in the
same scenario, on the same canvas. It needs the workbench running (`npm run dev`,
port 5173) and writes `docs-shots/audit-real.png` and `docs-shots/audit-mock.png`.

Compare them before shipping any change to the clip:

    magick audit-real.png audit-mock.png -metric AE -compare -format "%[distortion]" info:

Under about 0.002 is text antialiasing between a `<button>` and a `<span>`.
Anything larger is drift and should be chased down.

## Specs

- 560x320 at `deviceScaleFactor: 2`, so it captures at 1120x640
- 20fps, 6.2s, 124 frames
- GIF: 128 colours, bayer dithering, about 175kB
- MP4: h264, crf 20, `scale=-2` because h264 needs even dimensions

## Adapted from

The Session Indicator preview pipeline in the portfolio repo, at
`assets/previews/SI-previews/`.
