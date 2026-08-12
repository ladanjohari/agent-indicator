# Worklog

## 2026-08-11

- **Did:** built and shipped `agent-state-ui@0.1.0`, four components with 34 tests, a docs site at ladanjohari.com/agent-state-ui, CI and Pages deploys, repo public, v0.1.0 tagged and released.
- **Broke:** CI failed on the first push because the dependency ranges in `package.json` were written by hand and one of them, `jest-dom@^6.10.1`, does not exist; five tests failed because Testing Library never tore down between them without Vitest globals; `ApprovalGate` hard-coded an `h2` that broke the heading outline of any page it was dropped into; `SPRINT.md` carried notes that did not belong in a public repo and was purged from history before the first push.
- **Decided:** six states not five, renamed to Writing and Running a command because the old pair were synonyms; one approval gate with the destructive item separated by gesture rather than position; the kit has one rule, compress the ordinary and never compress the exception; and reading code gives recognition rather than recall, so the approval-state logic gets rebuilt from a blank file unaided.
