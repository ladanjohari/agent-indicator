# Worklog

## 2026-08-14

- **Did:** built the docs hook, a reflex test at the top of the page where the visitor clears three requests in one press and finds the two irreversible ones were never reachable; then built hold to approve for irreversible requests, a two second linear fill drawn with `clip-path`, released in 200ms, with keyboard and Reduce Motion skipping the hold entirely. 37 tests.
- **Broke:** the hook first shipped a stopwatch that always read 0.0 seconds, because the clock started on the same pointer press that approved; `setPointerCapture` threw in the test environment, which turned out to be worth guarding in real code too; and browser verification kept failing until it became clear the pane was not compositing, which freezes CSS transitions.
- **Decided:** timings come from two different rules, not one, so a 2 second hold and a 300ms ceiling do not conflict: slow where the person is deciding, fast where the system is responding. The hold is drawn as a CSS transition rather than a JavaScript timer, which means it pauses when the tab is hidden and cannot drift.

## 2026-08-13

- **Did:** renamed the package to `agent-indicator` across npm, GitHub, the docs site, the portfolio homepage and every local note; published `agent-indicator@0.1.0` and verified it by installing from the public registry; unpublished the old name inside the free window.
- **Broke:** the first publish failed with a bare `E404` because the npm session had expired, while the unpublish printed as though it had succeeded and had not, so the terminal and the registry disagreed for a while; renaming the GitHub repo moved the Pages path and left the live homepage pointing at a 404 until the fix was pushed.
- **Decided:** check the registry rather than the terminal before believing any publish step; a name you do not feel is a name you will not say, which is why `veille` was dropped after being chosen; and not `blinker`, because this library breathes rather than blinks, and blinking reads as alarm where breathing reads as alive.

## 2026-08-11

- **Did:** built and shipped `agent-indicator@0.1.0`, four components with 34 tests, a docs site at ladanjohari.com/agent-indicator, CI and Pages deploys, repo public, v0.1.0 tagged and released.
- **Broke:** CI failed on the first push because the dependency ranges in `package.json` were written by hand and one of them, `jest-dom@^6.10.1`, does not exist; five tests failed because Testing Library never tore down between them without Vitest globals; `ApprovalGate` hard-coded an `h2` that broke the heading outline of any page it was dropped into; `SPRINT.md` carried notes that did not belong in a public repo and was purged from history before the first push.
- **Decided:** six states not five, renamed to Writing and Running a command because the old pair were synonyms; one approval gate with the destructive item separated by gesture rather than position; the kit has one rule, compress the ordinary and never compress the exception; and reading code gives recognition rather than recall, so the approval-state logic gets rebuilt from a blank file unaided.
