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

**Done.** Pushed and public, 11 August 2026. CI green, docs site deployed.

- Repo: https://github.com/ladanjohari/agent-indicator
- Docs: https://ladanjohari.com/agent-indicator/
- npm: https://www.npmjs.com/package/agent-indicator

**Published to npm as v0.1.0 on 11 August 2026.** Verified by installing it from
the public registry into a clean project and rendering a component.

npm 2FA on this account is a **passkey**, not an authenticator app, so there is
no six digit code. `npm publish` has to be run from a real terminal, where it
can open the browser for Touch ID. Running it from a script fails with EOTP.

The docs live under the portfolio domain rather than github.io, because
GitHub Pages serves project sites from whatever custom domain the account
already has, and hers is ladanjohari.com.

**Next, in priority order:**

1. **The AI SDK adapter.** Highest leverage by a distance, and it runs in its own
   session. See `BRIEF-AI-SDK-ADAPTER.md`. The AI SDK ships an
   `approval-requested` state and no interface, and tells developers to build the
   buttons themselves. `@ai-sdk/react` is installed around 7.3 million times a
   week. Becoming the default answer to a question people already search beats
   any amount of announcing.
2. **The docs hook**, above the fold: a live `ApprovalGate` where the visitor
   clears the safe requests by reflex and finds they cannot fat-finger the
   delete. Two seconds, no reading. This is the equivalent of watching Sonner's
   toasts stack.
3. **A motion clip in the README**, through the existing Puppeteer plus ffmpeg
   pipeline. GitHub is where people land first and it is currently all text.
4. **The article**, in the shape Emil used: the problem, the insight, the
   decisions with their reasons, the details nobody sees. After 1 to 3, because
   it needs something to point at.
5. **Announce**, once, with the clip.

**Positioning learned from the research on 13 August 2026:** the competitors that
are actually installed, assistant-ui and CopilotKit, are frameworks that want the
whole chat surface. Nothing standalone exists for a team that already has its own
interface and needs this one piece done properly. **ApprovalGate is the lead
product and the other three components are the supporting cast.** Lead with it
everywhere.

## Decided, do not reopen

- **Name: `agent-indicator`.** Settled 13 August 2026 after publishing once as
  `agent-state-ui` and renaming inside the free window. An indicator is the
  family this belongs to: modem lights, traffic lights, turn signals, dashboard
  lamps. It also continues Session Indicator, so the two read as one person
  returning to the same problem. Two alternatives were tried and rejected:
  `veille`, dropped because a name you do not feel is a name you will not say,
  and `blinker`, dropped because British blinkers are what stop a horse seeing
  sideways, because `<blink>` is a joke every frontend engineer knows, and above
  all because this library deliberately **breathes rather than blinks**. Motion
  means alive; blinking means alarm.
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

Say: "read SPRINT.md in agent-indicator and carry on from the next step."

Working rules: explain before generating, plain language before any new tool is
installed, and **no em dashes anywhere in this repo**.

## What does not belong in this file

This repository is public. Keep this file about the work: what it is, who
installs it, what is decided. Anything about career, hiring, money or personal
circumstances lives in `~/projects/career-path`, never here, because git history
survives deleting a file.
