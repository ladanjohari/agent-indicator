# Docs page, session brief

Written 14 August 2026. The page is built and committed but **not pushed and not
published**. Ladan wants to finish it in its own session.

## Where it stands

`docs/Docs.tsx` and `docs/docs.css`, committed locally. Run `npm run dev:docs`
and open http://localhost:5174.

The page is a quiet terminal: Session Indicator palette (`#0e0e12`, `#17171c`,
`#26262c`), monospace for page furniture, a `$` prompt above the title, `#` section
markers. The components inside it are macOS surfaces: system font, vibrancy at
`rgba(38,38,44,0.82)` with 30px blur, hairline borders, concentric radii, exact
capsules at 28px with a 14px radius, blue only on the two navigational controls,
red only on the one destructive action.

**The card styling lives in the docs, not the package.** It uses only the class
names and data attributes the component already exposes. The published component
still ships neutral and inherits from its host. This was deliberate: it keeps the
package honest and doubles as proof that restyling works.

Length went from 9,639px to 5,696px by deleting five props tables, every "not
configurable" block, and four duplicate component paragraphs.

## A regression introduced by the rewrite, fix this first

**The page is now dark only.** The stylesheet it replaced had a light and a dark
version through `prefers-color-scheme`, and the rewrite has zero occurrences of
it. Anyone on a light system gets the dark page.

That was not a decision, it was an oversight. The Session Indicator prototype has
both appearances and its light tokens are already written down in
`~/projects/session-indicator/index.html` under `body.lm`, so the values exist and
only need porting.

## What Ladan flagged and is not yet resolved

**It may still be too long at 5,696px.** The remaining cut is structural rather
than editorial: lead with `ApprovalGate` alone, because it is the lead product
and the AI SDK gap is the thing people actually search for, and move
StatusIndicator, SessionStrip and ActivityTrail to a second page. That lands
around 3,000px. It is a positioning decision, not a tidy-up.

**The card look could ship as the package default instead.** Right now the
package is neutral and adapts to any host, which is correct engineering: a dark
vibrancy panel would look wrong dropped into a light dashboard. But Emil's rule
is that good defaults matter more than options, and this look is the value. A
middle path is an optional stylesheet, something like
`agent-indicator/theme-macos.css`, that a team opts into in one line. Not built.

## Rules that still apply

- **No em dashes anywhere in this repo.** Check with grep before committing.
- Read `SPRINT.md` first, it is the live state.
- Verify against the registry rather than the terminal after any publish step.
- Her viewer strips CSS from HTML files, so review always goes as a rendered PNG.
  `previews/shoot-docs.js` and `previews/shoot-full.js` do this against the running
  dev server.

## Starter prompt

> Read `SPRINT.md` and `BRIEF-DOCS-PAGE.md` in `~/projects/agent-indicator`, then
> run `npm run dev:docs` and show me the page as PNGs rather than asking me to open
> HTML, because my viewer strips the styles.
>
> The page is built and I want to finish it. The open question is whether it is
> still too long at 5,696px, and whether ApprovalGate should lead on its own page
> with the other three components moved behind a link. Show me both before I decide.
>
> Nothing gets pushed or published until I say so.
