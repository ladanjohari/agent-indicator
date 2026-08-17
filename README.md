# agent-indicator

React components for the states an AI agent is actually in.

**Compress the ordinary. Never compress the exception.**

<img src="https://raw.githubusercontent.com/ladanjohari/agent-indicator/main/assets/hold-to-approve.gif" alt="An approval request that cannot be undone. A click starts the fill and it snaps straight back, doing nothing. Holding for 1.2 seconds fills it and approves." width="560" />

A click is the same motion that just cleared three safe requests, so an action
that cannot be undone does not accept one. It is held for 1.2 seconds instead.
Let go early and nothing happens.

Every agent product needs the same small set of interface pieces, and every team
rebuilds them badly. The hard part was never drawing a dot. It is deciding what
may be summarised away and what must always stand at full size, and getting that
backwards is how a permission prompt turns into something people click without
reading.

[![npm](https://img.shields.io/npm/v/agent-indicator)](https://www.npmjs.com/package/agent-indicator)

**[Live docs and interactive examples](https://ladanjohari.com/agent-indicator/)**

> Status: v0.3.0, early. The API may still change before 1.0.

## Works with Vercel's AI SDK out of the box

The AI SDK lets you mark a tool as needing approval, then hands your app an
`approval-requested` tool part and no interface at all. Its own cookbook tells
you to build the buttons yourself. `ApprovalGate` is that interface, and the
adapter speaks the SDK's data shape:

```jsx
import { ApprovalGate } from 'agent-indicator/ai-sdk'
import 'agent-indicator/styles.css'

const { messages, addToolApprovalResponse } = useChat()

<ApprovalGate
  messages={messages}
  addToolApprovalResponse={addToolApprovalResponse}
  reversible={{ searchWeb: true, readFile: true }}
/>
```

Approvals the SDK settled on its own never appear, answered ones drop out, and
tools from an MCP server are handled like any other. There is **no dependency on
the AI SDK and no peer dependency**: the adapter reads the shape of a message
rather than importing the library, so there is no version to keep in step.

The SDK carries no notion of whether an action can be undone, so the adapter
asks in order: what you said in `reversible`, then what the tool declared with
`metadata: { reversible: true }` on the server, then `'unknown'`. Silence is
never read as consent. [Full details in the docs](https://ladanjohari.com/agent-indicator/#ai-sdk).

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
npm install agent-indicator
```

```jsx
import { StatusIndicator } from 'agent-indicator'
import 'agent-indicator/styles.css'

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
  never being accepted by default. It takes a 1.2 second hold rather than a
  click, because a click is the same motion that just cleared the safe ones.
  Keyboard and Reduce Motion skip the hold.
- Not knowing never being cheaper than knowing. `reversible` takes three values:
  `true` batches, `false` is permanent, and `'unknown'` means nobody has said.
  Unknown gets exactly the same barrier as permanent and only a quieter
  sentence, because a gate that prints "this cannot be undone" over a web search
  is spending credibility it will need later.
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
