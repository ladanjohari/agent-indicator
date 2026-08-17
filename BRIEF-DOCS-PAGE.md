# Docs page, session brief

Updated 16 August 2026. **The page is finished and committed locally. It is not
pushed and not published.**

## Where it stands

`docs/Docs.tsx`, `docs/Hero.tsx`, `docs/Example.tsx` and `docs/docs.css`. Run
`npm run dev:docs` and open http://localhost:5174.

**3,748px, in both light and dark.** Down from 5,696px, and down from 9,639px
before that.

The look is unchanged and still right: a quiet terminal page carrying macOS
cards. Session Indicator palette, monospace for page furniture, a `$` prompt
above the title, `#` section markers. The card styling still lives in the docs
rather than the package, so the package ships neutral and this doubles as proof
that restyling works.

## The shape, decided 16 August 2026

Taken from what the good single-component pages actually do (sonner, vaul,
react-hot-toast, and Apple's own framework page and package readme). Every one of
them is: touch the thing, install it, see the one problem it solves, glance at the
rest, link out for reference.

1. Name, one line, and **ApprovalGate as the hook**, before any reading.
2. **Install.** Two code blocks and one sentence.
3. **Approval UI for the AI SDK.** The gap named, with the live example.
4. **Also in the box.** The other three shown, one line of caption each.
5. **One rule.** The sentence, and nothing else.

**What came off the page and where it went.** The state model's origin, the three
values of `reversible`, the adapter's three place lookup, the gesture versus
position argument, and the four bullet rule list are all now in
`ARTICLE-DRAFT.md`, marked `[from the docs page]` and quoted verbatim. They are
the article's spine, not filler.

**What is deliberately not on the page,** matching the research: props tables, an
API reference, a philosophy section, an accessibility section, a troubleshooting
section.

## Fixed

**Light mode is back.** The whole palette now has a `prefers-color-scheme: light`
block, and the macOS card dressing reads from tokens rather than hard coded
values, so both appearances come from one set. `previews/shoot-both.js` captures
the full page in both, which is how this stays fixed.

## Still open, not blocking the announcement

**The card look could ship as the package default.** Right now the package is
neutral and adapts to any host, which is correct engineering. A middle path is an
optional stylesheet, `agent-indicator/theme-macos.css`, that a team opts into in
one line. Not built.

## Rules that still apply

- **No em dashes anywhere in this repo.** Check with grep before committing.
- Read `SPRINT.md` first, it is the live state.
- Verify against the registry rather than the terminal after any publish step.
- Her viewer strips CSS from HTML files, so review always goes as a rendered PNG.
  `previews/shoot-both.js` does this against the running dev server.
- Nothing gets pushed or published without her saying so.
