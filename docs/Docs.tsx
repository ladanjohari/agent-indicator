import { useState } from 'react'
import {
  ActivityTrail,
  ApprovalGate,
  SessionStrip,
  StatusIndicator,
} from '../src'
import type { Activity, ApprovalRequest, Session, SessionState } from '../src'
import { Example, Locked, PropsTable } from './Example'

const STATES: SessionState[] = ['idle', 'working', 'running', 'needsYou', 'error', 'done']

const REQUESTS: ApprovalRequest[] = [
  { id: 'write', consequence: 'Writes 3 files in src', detail: 'src/auth.ts, src/session.ts, src/index.ts', reversible: true },
  { id: 'test', consequence: 'Runs the test suite', detail: 'npm test', reversible: true },
  { id: 'commit', consequence: 'Commits locally. Nothing is pushed.', detail: 'git commit -am "refactor auth"', reversible: true },
  { id: 'delete', consequence: 'Deletes the legacy folder and everything in it', detail: 'rm -rf legacy', reversible: false },
  { id: 'push', consequence: 'Force pushes to main, overwriting what is there', detail: 'git push --force origin main', reversible: false },
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

function GateExample() {
  const [pending, setPending] = useState(REQUESTS)
  const [log, setLog] = useState<string[]>([])

  const settle = (verb: string) => (ids: string[]) => {
    setPending((current) => current.filter((request) => !ids.includes(request.id)))
    setLog((current) => [...current, verb + ': ' + ids.join(', ')])
  }

  return (
    <div className="gate-example">
      <ApprovalGate
        requests={pending}
        onApprove={settle('approved')}
        onDeny={settle('denied')}
        onDismiss={() => setLog((current) => [...current, 'dismissed, nothing decided'])}
      />
      {log.length > 0 ? (
        <ul className="gate-example__log">
          {log.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      ) : null}
      {pending.length === 0 ? (
        <button type="button" className="gate-example__reset" onClick={() => setPending(REQUESTS)}>
          Reset
        </button>
      ) : null}
    </div>
  )
}

function StripExample() {
  const [chosen, setChosen] = useState<string | null>(null)
  return (
    <div>
      <SessionStrip sessions={FLEET} onSelect={setChosen} />
      <p className="picked">{chosen ? 'You chose ' + chosen : 'Choose a session'}</p>
    </div>
  )
}

export function Docs() {
  return (
    <>
      <header className="head">
        <h1>agent-indicator</h1>
        <p className="head__line">React components for the states an AI agent is actually in.</p>
        <pre className="head__install">
          <code>npm install agent-indicator</code>
        </pre>
        <p className="head__status">
          <a href="https://www.npmjs.com/package/agent-indicator">v0.1.0 on npm</a>
          {'. Source on '}
          <a href="https://github.com/ladanjohari/agent-indicator">GitHub</a>
          {'. MIT licensed.'}
        </p>
      </header>

      <main className="page">
        <section className="rule">
          <h2>One rule, four components</h2>
          <p className="rule__line">Compress the ordinary. Never compress the exception.</p>
          <p>
            Every agent product needs the same small set of interface pieces, and
            every team rebuilds them badly. The hard part is not drawing a dot. It
            is deciding what may be summarised away and what must always stand at
            full size, and getting that backwards is how a permission prompt turns
            into something people click without reading.
          </p>
          <ul className="rule__list">
            <li>
              <strong>StatusIndicator</strong> gives colour only to the states that
              are exceptions.
            </li>
            <li>
              <strong>ApprovalGate</strong> batches reversible requests and never
              batches destructive ones.
            </li>
            <li>
              <strong>SessionStrip</strong> folds calm sessions and never folds the
              ones that need a person.
            </li>
            <li>
              <strong>ActivityTrail</strong> folds runs of ordinary steps and never
              folds questions or failures.
            </li>
          </ul>
          <p>
            The state model is not invented for a component library. It comes from
            Session Indicator, a macOS app that watches real agent sessions, and
            these are the states that survived using it every day.
          </p>
        </section>

        <section id="statusindicator" className="component">
          <h2>StatusIndicator</h2>
          <p>
            One session&apos;s state. It reports and it never controls: no click
            handler and no children, because a status you can click has become an
            approval.
          </p>

          <Example
            note="Six states. Only Running moves, because only Running is alive without progressing. Error is a ring rather than a fill, so it is told apart by shape and not by hue."
            code={'<StatusIndicator state="needsYou" showLabel />'}
          >
            <ul className="states">
              {STATES.map((state) => (
                <li key={state}>
                  <StatusIndicator state={state} showLabel />
                  <code>{state}</code>
                </li>
              ))}
            </ul>
          </Example>

          <Example
            note="Dot only, which is how a dense list uses it. The label is still in the page for screen readers."
            code={'<StatusIndicator state="running" size="lg" />'}
          >
            <div className="row">
              <StatusIndicator state="running" size="sm" />
              <StatusIndicator state="running" size="md" />
              <StatusIndicator state="running" size="lg" />
            </div>
          </Example>

          <PropsTable
            rows={[
              { name: 'state', type: 'SessionState', required: true, description: 'Which state to show. Everything else is optional.' },
              { name: 'label', type: 'string', description: 'Replaces the wording. For other languages, or when your product says Paused where this says Idle.' },
              { name: 'showLabel', type: 'boolean', description: 'Show the label next to the dot. Defaults to false. This controls whether it is visible, not whether it exists.' },
              { name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Dot size. Named sizes only, so the error ring stays thick enough to read.' },
              { name: 'className', type: 'string', description: 'Your own class, for spacing and positioning from outside.' },
            ]}
          />

          <Locked
            items={[
              'Which state means what.',
              'The ring rather than a fill on error, and the colourblind safety it exists for.',
              'Motion signalling state while colour signals only exception.',
              'Reduce Motion, which is obeyed rather than offered.',
              'The label being readable by a screen reader even when hidden from view.',
            ]}
          />

          <p className="restyle">
            Every colour is a token you can retint, and the component writes{' '}
            <code>data-state</code> into the page so you can style any state from
            your own CSS. You own the values. The component owns the meaning.
          </p>
        </section>

        <section id="approvalgate" className="component">
          <h2>ApprovalGate</h2>
          <p>
            Asks for a human decision without becoming a toll booth. Try it: the
            three reversible requests clear in one press, and the two that cannot
            be undone have no approve control at all until you open them.
          </p>

          <Example
            note="Separating a destructive action by position does not work, because a hand already pressing Approve does not stop at a horizontal rule. Separating it by gesture does."
            code={`<ApprovalGate
  requests={requests}
  onApprove={(ids) => ids.forEach(run)}
  onDeny={(ids) => ids.forEach(refuse)}
  onDismiss={() => setOpen(false)}
/>`}
          >
            <GateExample />
          </Example>

          <PropsTable
            rows={[
              { name: 'requests', type: 'ApprovalRequest[]', required: true, description: 'Everything waiting on a decision. An empty array renders nothing.' },
              { name: 'onApprove', type: '(ids: string[]) => void', required: true, description: 'Called with the ids being approved. Reversible ones may arrive together, destructive ones never do.' },
              { name: 'onDeny', type: '(ids: string[]) => void', required: true, description: 'Called with the ids being refused.' },
              { name: 'onDismiss', type: '() => void', description: 'Called when it is put away without deciding. Leave it out and the gate cannot be dismissed.' },
              { name: 'title', type: 'string', description: 'Heading. Defaults to "Waiting for you".' },
              { name: 'className', type: 'string', description: 'Your own class, for spacing and positioning from outside.' },
            ]}
          />

          <p className="restyle">
            An <code>ApprovalRequest</code> is an <code>id</code>, a{' '}
            <code>consequence</code> in plain words, an optional <code>detail</code>{' '}
            such as the command, and <code>reversible</code>. The consequence leads
            because people approve commands they have not parsed.
          </p>

          <Locked
            items={[
              'An irreversible request is never batched with anything.',
              'Its approve control is absent from the page until it is opened, not hidden and not disabled.',
              'A missing reversible flag counts as irreversible, so an omission fails towards asking.',
              'No timers, no countdowns and no automatic decisions.',
              'Dismissing is neither approval nor refusal, and the requests survive it.',
            ]}
          />
        </section>

        <section id="sessionstrip" className="component">
          <h2>SessionStrip</h2>
          <p>Many parallel sessions, read at a glance. Weather, not telemetry.</p>

          <Example
            note="Eight sessions. The two that need a person sort to the top and are the only ones that spell out their state. The rest fold into a line of counts."
            code={`<SessionStrip
  sessions={sessions}
  maxQuiet={4}
  onSelect={(id) => open(id)}
/>`}
          >
            <StripExample />
          </Example>

          <Example
            note="The same eight with the limit at zero. Every calm session folds. The two that need you never do, whatever the limit is set to."
            code={'<SessionStrip sessions={sessions} maxQuiet={0} />'}
          >
            <SessionStrip sessions={FLEET} maxQuiet={0} />
          </Example>

          <PropsTable
            rows={[
              { name: 'sessions', type: 'Session[]', required: true, description: 'Every session. An empty array renders nothing.' },
              { name: 'maxQuiet', type: 'number', description: 'How many calm sessions to show as rows before folding the rest into the summary. Defaults to 4.' },
              { name: 'onSelect', type: '(id: string) => void', description: 'Makes rows selectable. Leave it out and the strip is a read out with nothing to click.' },
              { name: 'label', type: 'string', description: 'Accessible name for the list. Defaults to "Sessions".' },
              { name: 'className', type: 'string', description: 'Your own class, for spacing and positioning from outside.' },
            ]}
          />

          <Locked
            items={[
              'A session that needs a person is never folded away, whatever maxQuiet is set to.',
              'Only actionable rows spell out their state, because six rows each saying Writing is the telemetry this avoids.',
              'One StatusIndicator per row, so a screen reader never hears the state twice.',
              'Rows do not animate when they reorder.',
            ]}
          />
        </section>

        <section id="activitytrail" className="component">
          <h2>ActivityTrail</h2>
          <p>
            What the agent did, compressed and scannable. A log dump is everything
            that happened at the same volume, which is why nobody reads one.
          </p>

          <Example
            note="Eleven steps, seven rows. Runs of the same ordinary step fold into one row you can open. Questions and failures never fold, and they are the only rows carrying colour."
            code={`<ActivityTrail
  activities={activities}
  maxVisible={8}
/>`}
          >
            <ActivityTrail activities={TRAIL} />
          </Example>

          <PropsTable
            rows={[
              { name: 'activities', type: 'Activity[]', required: true, description: 'Oldest first. The trail reads downwards, the way it happened.' },
              { name: 'maxVisible', type: 'number', description: 'How many rows before the older ones fold into one line at the top. Defaults to 8.' },
              { name: 'summarise', type: '(kind, count) => string', description: 'The wording for a folded group. Replace it for other languages.' },
              { name: 'label', type: 'string', description: 'Accessible name for the list. Defaults to "Activity".' },
              { name: 'className', type: 'string', description: 'Your own class, for spacing and positioning from outside.' },
            ]}
          />

          <Locked
            items={[
              'Questions and failures are never folded, however many there are.',
              'Runs fold only when consecutive, because the order is the story.',
              'Colour appears on exceptions and nowhere else.',
              'A failure is a ring rather than a fill, matching StatusIndicator.',
            ]}
          />
        </section>

        <section className="component">
          <h2>Getting started</h2>
          <pre className="block">
            <code>{`npm install agent-indicator`}</code>
          </pre>
          <p>Import the component and the stylesheet once, anywhere in your app.</p>
          <pre className="block">
            <code>{`import { StatusIndicator } from 'agent-indicator'
import 'agent-indicator/styles.css'

export function Row() {
  return <StatusIndicator state="needsYou" showLabel />
}`}</code>
          </pre>
          <p>
            React 18 or 19. TypeScript types are included, so your editor will
            list the props and refuse the ones that are not allowed.
          </p>
        </section>
      </main>

      <footer className="foot">
        <span>MIT licensed</span>
        <a href="https://github.com/ladanjohari/agent-indicator">GitHub</a>
      </footer>
    </>
  )
}
