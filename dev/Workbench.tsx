import { useState } from 'react'
import { ApprovalGate, StatusIndicator } from '../src'
import type { ApprovalRequest, SessionState } from '../src'
import { SessionDemo } from './SessionDemo'

// The refactor example the design was argued over: three safe things and two
// that cannot be undone.
const REQUESTS: ApprovalRequest[] = [
  { id: 'write', consequence: 'Writes 3 files in src', detail: 'src/auth.ts, src/session.ts, src/index.ts', reversible: true },
  { id: 'test', consequence: 'Runs the test suite', detail: 'npm test', reversible: true },
  { id: 'commit', consequence: 'Commits locally. Nothing is pushed.', detail: 'git commit -am "refactor auth"', reversible: true },
  { id: 'delete', consequence: 'Deletes the legacy folder and everything in it', detail: 'rm -rf legacy', reversible: false },
  { id: 'push', consequence: 'Force pushes to main, overwriting what is there', detail: 'git push --force origin main', reversible: false },
]

function GateDemo() {
  const [pending, setPending] = useState(REQUESTS)
  const [log, setLog] = useState<string[]>([])

  const settle = (verb: string) => (ids: string[]) => {
    setPending((current) => current.filter((request) => !ids.includes(request.id)))
    setLog((current) => [...current, `${verb}: ${ids.join(', ')}`])
  }

  return (
    <>
      <ApprovalGate
        requests={pending}
        onApprove={settle('approved')}
        onDeny={settle('denied')}
        onDismiss={() => setLog((current) => [...current, 'dismissed, nothing decided'])}
      />
      {log.length > 0 ? (
        <ul className="wb-log">
          {log.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      ) : null}
      {pending.length === 0 ? (
        <button type="button" className="wb-reset" onClick={() => setPending(REQUESTS)}>
          Reset
        </button>
      ) : null}
    </>
  )
}

// The local workbench. Not part of the published package.
//
// Every component gets a panel here first, so you can look at it while you
// build it. The docs site comes later and reuses the same examples.

const ALL_STATES: SessionState[] = [
  'idle',
  'working',
  'running',
  'needsYou',
  'error',
  'done',
]

export function Workbench() {
  return (
    <main className="wb">
      <header className="wb-head">
        <h1>agent-state-ui</h1>
        <p>Local workbench. Save a file and this page updates without reloading.</p>
      </header>

      <section className="wb-panel">
        <h2>StatusIndicator</h2>
        <p className="wb-note">
          Six states. Only Running moves, because only Running is alive without
          progressing. Error is a ring rather than a fill, so it is told apart by
          shape and not by hue.
        </p>

        <ul className="wb-states">
          {ALL_STATES.map((state) => (
            <li key={state}>
              <StatusIndicator state={state} showLabel />
              <code>{state}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="wb-panel">
        <h2>ApprovalGate</h2>
        <p className="wb-note">
          Three reversible requests batch into one button. The two that cannot be
          undone sit below the rule with no approve control at all until you open
          them. Dismissing decides nothing and everything stays pending.
        </p>
        <div className="wb-gate">
          <GateDemo />
        </div>
      </section>

      <section className="wb-panel">
        <h2>Why two busy states</h2>
        <p className="wb-note">
          Two real sessions. The first writes, runs a command, writes again and
          finishes. The second starts a command that never exits. Watch the
          second one: it stays alive, it never asks for anything, and the only
          thing telling you it has gone wrong is that Running a command has been
          on screen far too long. Merge the two states and that signal is gone.
        </p>
        <SessionDemo />
      </section>

      <section className="wb-panel">
        <h2>Sizes</h2>
        <p className="wb-note">Dot only, which is how a dense list would use it.</p>
        <div className="wb-row">
          <StatusIndicator state="needsYou" size="sm" />
          <StatusIndicator state="needsYou" size="md" />
          <StatusIndicator state="needsYou" size="lg" />
        </div>
      </section>

      <section className="wb-panel">
        <h2>In a line of text</h2>
        <p className="wb-note">
          The dot sits on the text baseline and takes its size from the type
          around it. <StatusIndicator state="running" showLabel /> is what a
          session looks like inline.
        </p>
      </section>

      <footer className="wb-foot">
        <span>Week 1</span>
        <span>React 19, Vite 8, TypeScript 6</span>
      </footer>
    </main>
  )
}
