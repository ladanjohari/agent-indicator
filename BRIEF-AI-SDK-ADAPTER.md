# AI SDK adapter, session brief

Written 13 August 2026. Run this in a **new session**. The prompt to paste is at
the bottom.

## The gap, in one paragraph

Vercel's AI SDK lets you mark a tool `needsApproval`. When the model wants to run
that tool, the developer receives a tool part in the `approval-requested` state,
carrying the tool name, the input the model chose, and an `approval.id`. The SDK
then gives them a function, `addToolApprovalResponse({ id, approved })`, to send
the answer back.

**It ships no interface at all.** The official cookbook tells developers to build
their own approve and deny buttons.

`@ai-sdk/react` is installed about 7.3 million times a week. Every team that
turns on `needsApproval` writes that UI by hand, usually in an afternoon, usually
as two unstyled buttons with no sense of which actions can be undone.

`ApprovalGate` is already that interface. It just does not speak their data shape.

## Why this and not something else

The competing components that people actually install, assistant-ui and
CopilotKit, are **frameworks**. They want to own the whole chat surface. There is
no standalone, drop-in approval UI for teams who already have their own
interface and just need this one piece done properly.

That is the same position Sonner took against the toast libraries of its day: one
focused thing you drop into an app you already built, rather than a system you
have to move into.

## What to build

A subpath export, `agent-indicator/ai-sdk`, so that:

- the core package stays free of any AI SDK dependency
- AI SDK is an **optional peer dependency**, and nothing breaks for people who do
  not use it
- someone using AI SDK imports from the subpath and gets a working gate in one
  step

Rough shape, to be designed properly in the session rather than copied from here:

- a function that turns AI SDK tool parts in the `approval-requested` state into
  `ApprovalRequest` objects
- a component or hook that wires the gate's `onApprove` and `onDeny` straight to
  `addToolApprovalResponse`

## The one real design problem

`ApprovalRequest` requires `reversible`, and **AI SDK tool parts carry no such
field**. The adapter has to get it from somewhere. Options to weigh in the
session:

- a map from tool name to reversibility, supplied by the developer
- a predicate, `(toolName, input) => boolean`, which also handles cases like
  `runCommand` where the input decides
- reading a convention off the tool definition

**Whatever is chosen, the default when nothing is specified must be
irreversible.** An omission has to fail towards asking. That rule is the whole
point of the component and the adapter must not weaken it.

The second design problem: `consequence` is meant to be plain words, and AI SDK
gives you a tool name and a JSON input. The adapter needs a sensible default
rendering plus a way for the developer to write a better sentence per tool.

## Verified, 13 August 2026

Checked against the shipped type definitions of `ai@7.0.65`,
`@ai-sdk/react@4.0.68` and `@ai-sdk/provider-utils@5.0.27`, downloaded from the
registry, rather than against the documentation pages, because the two doc pages
contradicted each other.

**Correct as written above:** the state is `approval-requested`, the part carries
the tool name, the input and `approval.id`, and the answer goes back through
`addToolApprovalResponse`.

**Wrong or incomplete:**

- `needsApproval` on a tool is **deprecated**, word for word: "Tool approval is
  handled on a `generateText` / `streamText` level now." The current form is a
  `toolApproval` configuration returning `not-applicable`, `approved`, `denied`
  or `user-approval`. Vercel's own cookbook still teaches the deprecated form.
  This is all server side, so it does not change the adapter, only the docs.
- `addToolApprovalResponse` also accepts an optional `reason`.
- **`approval.isAutomatic`.** The SDK can settle an approval without a person and
  the part still arrives. Not filtering these would ask someone to decide
  something already decided.
- **More states than one.** `approval-responded` and `output-denied` exist
  alongside `approval-requested`. Matching on "has an approval object" would
  leave answered requests in the gate forever.
- **Two part shapes.** Static tools arrive as `tool-<name>`, runtime ones, which
  in practice means MCP, arrive as `dynamic-tool` with the name in its own field.
- **`toolMetadata`.** A tool author can write `metadata` on the server and the
  SDK copies it onto the client part. Verified in the compiled source. This is
  the mechanism the brief guessed might exist, and it is what made option three
  real.
- The id to answer with is `approval.id`, not `toolCallId`.

**Decided in the session:** `reversible` gained a third value, `'unknown'`,
because "nobody said" is a different claim from "this is permanent" and printing
the second when you only know the first is a lie the reader eventually catches.
Same barrier, quieter sentence. Apple does the same thing: every permission API
they own has a `notDetermined` case in front of `denied`.

## Definition of done

- `agent-indicator/ai-sdk` exported, typed, and covered by tests that do not
  require a live model
- a docs page whose title matches what people actually search, along the lines of
  "approval UI for the AI SDK"
- the README says the package works with AI SDK out of the box
- an example someone can copy in under a minute
- version bumped and published

## Rules that still apply

- Explain before generating. She is a designer learning to be trusted in a real
  codebase.
- **No em dashes anywhere in this repo.** Check with grep before committing.
- Read `SPRINT.md` first, it is the live state of the project.
- Verify against the registry rather than the terminal after any publish step.
- Four components only. An adapter is not a fifth component, so this is in scope.

## Starter prompt for the new session

> Read `SPRINT.md` and `BRIEF-AI-SDK-ADAPTER.md` in `~/projects/agent-indicator`
> before anything else. SPRINT.md is the live state, the brief is the job.
>
> I want to build the AI SDK adapter for `ApprovalGate`. The reason is that
> Vercel's AI SDK gives developers an `approval-requested` state and no interface
> at all, and its own docs tell them to build the buttons themselves. My gate is
> already that interface, it just does not speak their data shape yet.
>
> Start by verifying the AI SDK's current human-in-the-loop API against their live
> documentation, because my brief was written on 13 August 2026 and may already be
> out of date. Tell me what has changed before writing anything.
>
> Then walk me through the design decision I actually have to make: AI SDK tool
> parts do not say whether an action can be undone, and my whole component rests
> on that distinction. Show me the options and recommend one. The default when
> nobody says must always be irreversible.
>
> I am a designer, not an engineer. Explain each piece in plain language before
> you build it. I have been shipping this package for a week, I published it to
> npm myself, and I understand components, props and state, so do not start from
> zero, but do not assume I know anything about the AI SDK.
