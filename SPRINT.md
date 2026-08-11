# Where we are

**Read this first if you have been away.** It is kept short on purpose. Last
updated Monday 11 August 2026.

## The one sentence version

Four React components that show what an AI agent is doing, published so other
teams can install them instead of rebuilding the same pieces badly.

## The idea the whole library is about

**Compress the ordinary. Never compress the exception.**

The hard part was never drawing a dot. It is deciding what may be summarised
away and what must always stand at full size. Get it backwards and a permission
prompt becomes something people click without reading.

## Who installs it

An engineer at a company shipping AI features. Their agent runs in the
background and they need to show what it is doing, whether it is stuck, and
whether it needs permission. Today they spend two days building a worse version
of this.

Distribution is work and it is not automatic. Most libraries get almost no
installs. The page, the README and telling people are the part that decides it.

## The four components, and there will not be a fifth

| Component | What it does |
| --- | --- |
| StatusIndicator | One session's state. Reports only, never a control. |
| ApprovalGate | Asks for a human decision without becoming a toll booth. |
| SessionStrip | Many parallel sessions read at a glance. |
| ActivityTrail | What the agent did, scannable, not a log dump. |

## Where we actually are

Day 5 of 57, in a sprint ending Friday 2 October 2026. The other two
deliverables that sprint carries are tracked outside this repo.

**Done.** The workshop: Vite, React, TypeScript, tests, CI, local workbench,
licence, readme.

**Done.** All four components, 34 tests, typecheck and lint clean, verified in
light and dark.

**Done.** The docs site: live interactive examples, props tables, a locked list
per component. Its own Vite app in `docs/`, deployed by
`.github/workflows/pages.yml`.

**Next.** Publish to npm, which makes the install line real.

## Decided, do not reopen

- **Name: `agent-state-ui`.**
- **Six states, not five.** `working` is the agent producing, `running` is a
  command it started that is still going. One will always finish. The other can
  hang forever and never come back to ask for anything. Labelled **Writing** and
  **Running a command**, because "Active" and "Running" were synonyms in English
  and nobody could hold them apart.
- **StatusIndicator reports, it never controls.** No click handler, no children.
  A status you can click has become an approval.
- **Placement is not a prop.** A component owns itself and nothing outside
  itself. This is also why no component injects a heading tag: it cannot know
  whether it sits under an h1 or an h3.
- **They own the colour values, we own the meaning.** Every colour is a token,
  and each component writes its state into the page as a `data-` attribute so
  any state can be restyled from outside without a prop for every colour.
- **ApprovalGate is one gate, not two.** The destructive item is separated by
  *gesture*, not position: it has no approve control in the page until it has
  been opened. Position alone fails, because a hand already pressing Approve
  does not stop at a horizontal rule. A second modal was rejected because it
  would force the installing app to give up its screen.
- **Destructive actions never batch, never pre-approve, never default to yes.**
  Reversible ones may batch and may be dismissed. A missing `reversible` flag
  counts as irreversible, so an omission fails towards asking.
- **No timers and no automatic decisions anywhere.**

## Open questions

None blocking.

## How to pick this back up

Say: "read SPRINT.md in agent-state-ui and carry on from the next step."

Working rules: explain before generating, plain language before any new tool is
installed, and **no em dashes anywhere in this repo**.

## What does not belong in this file

This repository is public. Keep this file about the work: what it is, who
installs it, what is decided. Anything about career, hiring, money or personal
circumstances lives in `~/projects/career-path`, never here, because git history
survives deleting a file.
