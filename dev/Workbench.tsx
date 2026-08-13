import { useState } from 'react'
import { ActivityTrail, ApprovalGate, SessionStrip, StatusIndicator } from '../src'
import type { Activity, ApprovalRequest, Session, SessionState } from '../src'
import { SessionDemo } from './SessionDemo'

const TRAIL: Activity[] = [
  { id: '1', kind: 'read', summary: 'Read src/auth.ts', at: '14:01' },
  { id: '2', kind: 'read', summary: 'Read src/session.ts', at: '14:01' },
  { id: '3', kind: 'read', summary: 'Read src/index.ts', at: '14:02' },
  { id: '4', kind: 'read', summary: 'Read src/tokens.ts', at: '14:02' },
  { id: '5', kind: 'ask', summary: 'Asked to delete the legacy folder', detail: 'rm -rf legacy', at: '14:03' },
  { id: '6', kind: 'edit', summary: 'Edited src/auth.ts', at: '14:04' },
  { id: '7', kind: 'edit', summary: 'Edited src/session.ts', at: '14:04' },
  { id: '8', kind: 'run', summary: 'Ran the test suite', detail: 'npm test', at: '14:05' },
  { id: '9', kind: 'error', summary: 'Test suite failed', detail: 'exit code 1, 2 tests failing', at: '14:06' },
  { id: '10', kind: 'edit', summary: 'Edited src/auth.test.ts', at: '14:08' },
  { id: '11', kind: 'run', summary: 'Ran the test suite', detail: 'npm test', at: '14:09' },
]

const FLEET: Session[] = [
  { id: 'write-docs', name: 'write-docs', state: 'working', elapsed: '1m' },
  { id: 'deploy-pipeline', name: 'deploy-pipeline', state: 'done', elapsed: '8m' },
  { id: 'run-tests', name: 'run-tests', state: 'error', elapsed: '2m' },
  { id: 'build-assets', name: 'build-assets', state: 'running', elapsed: '4m' },
  { id: 'analyze-code', name: 'analyze-code', state: 'needsYou', elapsed: '5m' },
  { id: 'refactor-api', name: 'refactor-api', state: 'working', elapsed: '2m' },
  { id: 'lint-check', name: 'lint-check', state: 'idle', elapsed: '20m' },
  { id: 'sync-assets', name: 'sync-assets', state: 'done', elapsed: '31m' },
]

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
        <h1>agent-indicator</h1>
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
        <h2>ActivityTrail</h2>
        <p className="wb-note">
          Eleven steps, seven rows. Four reads become one line you can open, and
          so do two edits. The question and the failure never fold, and they are
          the only things carrying colour, so they are findable without reading a
          word.
        </p>
        <div className="wb-strip">
          <ActivityTrail activities={TRAIL} />
        </div>
      </section>

      <section className="wb-panel">
        <h2>SessionStrip</h2>
        <p className="wb-note">
          Eight sessions. The two that need you are pulled to the top and spell
          out why. Four calm ones follow. The rest fold into a line of counts,
          because twelve calm rows is telemetry and nobody reads telemetry.
        </p>
        <div className="wb-strip">
          <SessionStrip sessions={FLEET} />
        </div>

        <p className="wb-note wb-note--tight">
          Same eight with the limit at zero. The calm ones all fold. The two that
          need you never do.
        </p>
        <div className="wb-strip">
          <SessionStrip sessions={FLEET} maxQuiet={0} />
        </div>
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
