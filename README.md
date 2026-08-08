# agent-state-ui

React components for the states an AI agent is actually in.

Every agent product now needs the same small set of interface pieces, and every
team rebuilds them badly: a dot that says whether the thing is alive, a way to
ask the person for a decision without turning them into a gatekeeper, a way to
read many parallel sessions at a glance, and a record of what happened that a
human can actually scan.

This is those four pieces, designed once, properly.

> Status: pre-release, in active development. Nothing is published to npm yet.

## The four components

| Component | What it is for |
| --- | --- |
| `StatusIndicator` | One session's state. Motion signals state, colour signals exception. |
| `ApprovalGate` | Asks for a human decision without becoming a toll booth. |
| `SessionStrip` | Many parallel sessions, read at a glance. Weather, not telemetry. |
| `ActivityTrail` | What the agent did, compressed and scannable, not a log dump. |

Each one ships with TypeScript types, a controlled and an uncontrolled mode,
light and dark, and keyboard plus screen reader behaviour. Accessibility is a
feature of the package, not a later pass.

There will not be a fifth component.

## Local development

```bash
npm install     # fetch the dependencies listed in package.json
npm run dev     # workbench at http://localhost:5173
npm test        # run the test suite once
npm run build   # produce the publishable files in dist/
```

## Layout

```
src/          the published library, everything here can ship
  index.ts    the public front door, only what is exported here is public
dev/          the local workbench, never published
```

## Origin

The state model comes from Session Indicator, a macOS menu bar app that watches
real agent sessions and reports what they are doing. The states here are the
ones that survived using it every day, not a list invented for a component
library.

## Licence

MIT, see [LICENSE](LICENSE).
