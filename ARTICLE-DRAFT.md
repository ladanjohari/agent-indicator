# Article draft

Started 16 August 2026, when the docs page was cut down to Emil's shape and the
explanations had to go somewhere. Everything below marked **[from the docs page]**
is finished prose that was already written and approved, lifted out of
`docs/Docs.tsx` verbatim. It is not filler. It is the spine.

**Shape, decided earlier:** the problem, the insight, the decisions with their
reasons, the details nobody sees. Emil's shape.

**The spine the adapter gave it:** a component with an opinion meets a data format
with no opinion, and the honest answer was a third state rather than a guess.

**Working title options:** none chosen yet.

---

## 1. The problem

Vercel's AI SDK lets you mark a tool as needing approval. When the model reaches
for it, the SDK pauses and hands your app a tool part in the `approval-requested`
state, then gives you `addToolApprovalResponse` to send the answer back.

The approve and deny interface is the developer's to build. [Vercel's own
cookbook](https://ai-sdk.dev/cookbook/next/human-in-the-loop) demonstrates it that
way, which is why most teams end up with two unstyled buttons under a raw tool
name.

**Say it like that, with the link, and not "it ships no interface".** The SDK's
scope stops at the data, deliberately, and Vercel's own AI SDK 6 announcement says
human-in-the-loop needs "no custom code", which is true of the control flow. State
what happens, cite their page, and let the reader draw the conclusion. Describe
your own thing; make every fact about someone else's a link.

`@ai-sdk/react` was installed 7.3 million times in the week to 9 August 2026,
checked against npm rather than repeated from memory. The competitors that are
actually installed, assistant-ui and CopilotKit, are frameworks that want the
whole chat surface. Nothing standalone exists for a team that already has its own
interface and needs this one piece done properly.

## 2. The insight

**Compress the ordinary. Never compress the exception.**

**[from the docs page]** Every agent product needs the same small set of interface
pieces, and every team rebuilds them badly. The hard part is not drawing a dot. It
is deciding what may be summarised away and what must always stand at full size,
and getting that backwards is how a permission prompt turns into something people
click without reading.

How the rule lands in each of the four:

- **StatusIndicator** gives colour only to the states that are exceptions.
- **ApprovalGate** batches reversible requests and never batches destructive ones.
- **SessionStrip** folds calm sessions and never folds the ones that need a person.
- **ActivityTrail** folds runs of ordinary steps and never folds questions or failures.

**[from the docs page]** The state model is not invented for a component library.
It comes from Session Indicator, a macOS app that watches real agent sessions, and
these are the states that survived using it every day.

## 3. The decisions, with their reasons

### Separation by gesture, not by position

**[from the docs page]** Separating a destructive action by position does not work,
because a hand already pressing Approve does not stop at a horizontal rule.
Separating it by gesture does.

The destructive item has no approve control in the page until it has been opened.
A second modal was rejected because it would force the installing app to give up
its screen.

### Hold, do not click

1.2 seconds, a linear fill drawn with `clip-path`, released in 200ms. A click
starts the fill and it snaps straight back, doing nothing. Keyboard and Reduce
Motion skip the hold entirely.

**The timing rule, which looks like a contradiction and is not.** A 1.2 second hold
and the 300ms ceiling govern different things. A transition is the system
responding, and stays under 300ms. A dwell is the person deciding, and takes as
long as the decision deserves. Slow where the person is deciding, fast where the
system is responding.

The hold is drawn as a CSS transition rather than a JavaScript timer, which means
it pauses when the tab is hidden and cannot drift.

### The consequence leads, not the command

**[from the docs page]** An `ApprovalRequest` is an `id`, a `consequence` in plain
words, an optional `detail` such as the command, and `reversible`. The consequence
leads because people approve commands they have not parsed.

### Three values for `reversible`, not two

This is the spine of the article. A component with an opinion met a data format
with no opinion, and the honest answer was a third state rather than a guess.

**[from the docs page]** `reversible` takes three values, not two. `true` batches.
`false` means somebody checked and it is permanent. `'unknown'` means nobody has
said, which is a different claim and gets a quieter sentence, because a gate that
prints "this cannot be undone" over a web search is spending credibility it will
need later. The barrier does not move: unknown is held exactly like permanent.

**[from the docs page]** The SDK carries no notion of whether an action can be
undone, so this adapter looks in three places in order: what you said in
`reversible`, then what the tool declared about itself with
`metadata: { reversible: true }` on the server, then `'unknown'`. There is no
fourth step where something becomes reversible by accident. Declaring it on the
tool is the better habit, because the person who wrote the tool is the person who
knows.

A missing `reversible` flag counts as irreversible, so an omission fails towards
asking.

### Things deliberately not built

- **StatusIndicator reports, it never controls.** No click handler, no children. A
  status you can click has become an approval.
- **Placement is not a prop.** A component owns itself and nothing outside itself.
  This is also why no component injects a heading tag: it cannot know whether it
  sits under an h1 or an h3.
- **They own the colour values, we own the meaning.** Every colour is a token, and
  each component writes its state into the page as a `data-` attribute.
- **No timers and no automatic decisions anywhere.**
- **Six states, not five.** `working` is the agent producing, `running` is a
  command it started that is still going. One will always finish. The other can
  hang forever and never come back to ask for anything. Labelled Writing and
  Running a command, because "Active" and "Running" were synonyms in English and
  nobody could hold them apart.

## 4. The details nobody sees

**[from the docs page]** Six states. Only Running moves, because only Running is
alive without progressing. Error is a ring rather than a fill, so it is told apart
by shape and not by hue.

**[from the docs page]** Every colour is a token you can retint, and the component
writes `data-state` into the page so you can style any state from your own CSS.
You own the values. The component owns the meaning.

**[from the docs page]** Eight sessions. The two that need a person sort to the top
and are the only ones that spell out their state. The rest fold into a line of
counts.

**[from the docs page]** Eleven steps, seven rows. Runs of the same ordinary step
fold into one row you can open. Questions and failures never fold, and they are
the only rows carrying colour.

**[from the docs page]** Reduce Motion is obeyed rather than offered, labels stay
readable by a screen reader even when hidden from view, and the keyboard never has
to hold anything down.

The adapter depends on the AI SDK for nothing, not even types. It reads the shape
of a message, so there is no peer dependency and no version to keep in step.

The docs page dresses the components in macOS surfaces using only the class names
and data attributes the package already exposes. The published package ships
neutral. That was deliberate: it keeps the package honest and doubles as proof
that restyling works.

## 5. What is still missing from this draft

- An opening that is not the problem statement. Emil usually opens on a specific
  moment, not on a market gap.
- The `needsApproval` deprecation finding from `BRIEF-AI-SDK-ADAPTER.md`, which is
  a good detail and is not yet placed.
- A closing. Probably the rule, said once more, without the components attached.
- Where it gets published, and whether it links to the docs page or the reverse.

---

**Rules that apply to this file:** no em dashes anywhere in this repo, checked with
grep before committing.
