# Changelog

Notable changes to `agent-indicator`. Newest first.

This is a 0.x library and the API may still change before 1.0. When something
about the behaviour changes rather than the API, it is called out here in plain
words, because a version number that hides a change is worse than no version
number at all.

## 0.4.0

### Changed

- **The hold on an irreversible request is now 1.2 seconds, down from 2.**
  This is a deliberate change to how the control feels, not a fix, which is why
  this is a minor release rather than a patch. A reflex press is around 150ms, so
  by a second the gesture already cannot happen by accident. The second second
  bought no further safety and only spent patience, on a control some people will
  meet several times a day. The rule that carries the meaning is the asymmetry,
  slow to press and fast to release, and the release is unchanged at 200ms.
  Nothing in the API moved, so upgrading needs no code change. If you had written
  "two seconds" in your own copy, it is now wrong.

- The package now describes itself by what it is for. The npm description leads
  with the approval interface and the AI SDK, the keywords cover `ai-sdk`,
  `approval`, `human-in-the-loop` and `tool-approval`, and `homepage` points at
  the documentation site rather than the README.

### Fixed

- **The divider above the destructive group appeared when it had nothing to
  separate.** It was cancelled by `:first-child`, which only covers a gate with
  no header. Give the gate a header with nothing batched, which is the ordinary
  single request case, and the rule came back and sat under the title dividing it
  from nothing. It now uses an adjacent sibling selector, which says what was
  meant all along: separate these two groups, and only these two.

## 0.3.0

- The AI SDK adapter, `agent-indicator/ai-sdk`. Vercel's AI SDK hands your app an
  `approval-requested` tool part and no interface, and its own cookbook tells you
  to build the buttons yourself. This is that interface. The adapter reads the
  shape of a message rather than importing from the SDK, so there is no peer
  dependency and no version to keep in step.
- `reversible` gained a third value, `'unknown'`. Additive, so nothing already
  written breaks.

## 0.2.0

- Hold to approve on irreversible requests. A two second linear fill drawn with
  `clip-path`, released in 200ms. Keyboard and Reduce Motion skip the hold.

## 0.1.0

- First release. `StatusIndicator`, `ApprovalGate`, `SessionStrip` and
  `ActivityTrail`, with types and tests.
