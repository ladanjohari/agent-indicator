# agent-state-ui

React components for the states an AI agent is actually in.

**Compress the ordinary. Never compress the exception.**

Every agent product needs the same small set of interface pieces, and every team
rebuilds them badly. The hard part was never drawing a dot. It is deciding what
may be summarised away and what must always stand at full size, and getting that
backwards is how a permission prompt turns into something people click without
reading.

> Status: pre-release, in active development. Nothing is published to npm yet.

## The four components

| Component | What it does | How the rule shows up |
| --- | --- | --- |
| `StatusIndicator` | One session's state | Colour goes only to the states that are exceptions |
| `ApprovalGate` | Asks for a human decision | Batches reversible requests, never batches destructive ones |
| `SessionStrip` | Many sessions at a glance | Folds calm sessions, never folds the ones needing a person |
| `ActivityTrail` | What the agent did | Folds runs of ordinary steps, never folds questions or failures |

There will not be a fifth.

## Install

```bash
npm install agent-state-ui
```

```jsx
import { StatusIndicator } from 'agent-state-ui'
import 'agent-state-ui/styles.css'

export function Row() {
  return <StatusIndicator state="needsYou" showLabel />
}
```

React 18 or 19. TypeScript types are included, so your editor lists the props
and refuses the ones that are not allowed.

## What you can change, and what you cannot

Every colour is a token you can retint, and each component writes its state into
the page as a `data-` attribute so you can style any state from your own CSS.
**You own the values. The components own the meaning.**

Not configurable, on purpose:

- Which state means what.
- The ring rather than a fill on error, which is what keeps error and "waiting
  for you" apart for anyone who cannot separate red from amber.
- Reduce Motion, which is obeyed rather than offered.
- A destructive approval never being batched, never being pre-approved, and
  never being accepted by default.
- Labels staying readable by a screen reader even when hidden from view.

## Where the state model comes from

Session Indicator, a macOS menu bar app that watches real agent sessions. These
are the six states that survived using it daily, including the split most
products get wrong: **Writing** is the agent producing, **Running a command** is
something it started that is still going. One will always finish. The other can
hang forever and never come back to ask you for anything.

## Local development

```bash
npm install       # fetch the dependencies listed in package.json
npm run dev       # component workbench
npm run dev:docs  # the docs site
npm test          # run the test suite once
npm run build     # produce the publishable files in dist/
```

## Layout

```
src/    the published library, everything here can ship
dev/    the local workbench, never published
docs/   the docs site, deployed to GitHub Pages
demo/   standalone pages that explain one decision each
```

## Licence

MIT, see [LICENSE](LICENSE).
