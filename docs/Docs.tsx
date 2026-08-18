import { useState } from 'react'
import {
  ActivityTrail,
  SessionStrip,
  StatusIndicator,
} from '../src'
import type { Activity, Session, SessionState } from '../src'
import { ApprovalGate as SdkApprovalGate } from '../src/ai-sdk'
import { Example } from './Example'
import { Filmstrip } from './Filmstrip'
import { Hero } from './Hero'
import { Scenarios } from './Scenarios'

const STATES: SessionState[] = ['idle', 'working', 'running', 'needsYou', 'error', 'done']

// Eight agents doing eight different jobs, on purpose. A fleet of build steps
// would say this is for coding agents, and it is not.
const FLEET: Session[] = [
  { id: 'triage-inbox', name: 'triage-inbox', state: 'working', elapsed: '1m' },
  { id: 'reconcile-invoices', name: 'reconcile-invoices', state: 'done', elapsed: '8m' },
  { id: 'run-tests', name: 'run-tests', state: 'error', elapsed: '2m' },
  { id: 'index-documents', name: 'index-documents', state: 'running', elapsed: '4m' },
  { id: 'refund-queue', name: 'refund-queue', state: 'needsYou', elapsed: '5m' },
  { id: 'draft-outreach', name: 'draft-outreach', state: 'working', elapsed: '2m' },
  { id: 'sync-crm', name: 'sync-crm', state: 'idle', elapsed: '20m' },
  { id: 'nightly-report', name: 'nightly-report', state: 'done', elapsed: '31m' },
]

// A refund agent working a queue, so the trail is not a build log either.
const TRAIL: Activity[] = [
  { id: '1', kind: 'read', summary: 'Read order #4471', at: '14:01' },
  { id: '2', kind: 'read', summary: 'Read order #4472', at: '14:01' },
  { id: '3', kind: 'read', summary: 'Read order #4473', at: '14:02' },
  { id: '4', kind: 'read', summary: 'Read order #4474', at: '14:02' },
  { id: '5', kind: 'ask', summary: 'Asked to refund $240 to order #4473', detail: 'outside the 30 day window', at: '14:03' },
  { id: '6', kind: 'edit', summary: 'Marked order #4471 resolved', at: '14:04' },
  { id: '7', kind: 'edit', summary: 'Marked order #4472 resolved', at: '14:04' },
  { id: '8', kind: 'run', summary: 'Sent the resolution emails', detail: '2 recipients', at: '14:05' },
  { id: '9', kind: 'error', summary: 'One email bounced', detail: 'mailbox full, order #4472', at: '14:06' },
  { id: '10', kind: 'edit', summary: 'Flagged order #4472 for a callback', at: '14:08' },
  { id: '11', kind: 'run', summary: 'Sent the resolution emails', detail: '1 recipient', at: '14:09' },
]

// Real AI SDK message parts, in the shape `useChat` hands them over. Nothing is
// mocked here beyond the messages themselves: the gate below is doing exactly
// what it would do against a live model.
const SDK_MESSAGES = [
  {
    parts: [
      { type: 'tool-searchWeb', toolCallId: 'c1', state: 'approval-requested', input: { query: 'refund policy 2026' }, approval: { id: 'a1' } },
      { type: 'tool-readOrder', toolCallId: 'c2', state: 'approval-requested', input: { id: '4473' }, approval: { id: 'a2' } },
      { type: 'tool-refundOrder', toolCallId: 'c3', state: 'approval-requested', input: { id: '4473', amount: 240 }, approval: { id: 'a3' } },
    ],
  },
]

function SdkExample() {
  const [declared, setDeclared] = useState(false)
  const [answered, setAnswered] = useState<string[]>([])
  const [log, setLog] = useState<string[]>([])

  const messages = SDK_MESSAGES.map((message) => ({
    parts: message.parts.filter((part) => !answered.includes(part.approval.id)),
  }))

  const reset = () => {
    setAnswered([])
    setLog([])
  }

  return (
    <div className="gate-example">
      <button
        type="button"
        className="gate-example__reset"
        onClick={() => {
          setDeclared((current) => !current)
          reset()
        }}
      >
        {declared ? 'Take the declaration away' : 'Declare which tools are reversible'}
      </button>

      <SdkApprovalGate
        messages={messages}
        addToolApprovalResponse={({ id, approved }) => {
          setAnswered((current) => [...current, id])
          setLog((current) => [...current, (approved ? 'approved' : 'denied') + ': ' + id])
        }}
        reversible={declared ? { searchWeb: true, readOrder: true } : undefined}
        title={false}
      />

      {log.length > 0 ? (
        <ul className="gate-example__log">
          {log.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      ) : null}
      {answered.length === 3 ? (
        <button type="button" className="gate-example__reset" onClick={reset}>
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

/**
 * The page is an introduction, not a reference.
 *
 * The order is deliberate and follows the shape every good single-component page
 * uses: touch the thing, install it, see the one problem it solves that nobody
 * else solves, then a glance at the rest. Reasoning belongs in the article, and
 * the API belongs in the types and the readme.
 */
export function Docs() {
  return (
    <>
      <header className="head">
        <p className="head__prompt">
          <span className="head__sigil">$</span> npm install agent-indicator
        </p>
        <h1>agent-indicator</h1>
        <p className="head__line">
          When an agent needs a person, this is the interface.
        </p>
        <p className="head__sub">
          React components for the moment an agent stops and asks. Works with
          Vercel&apos;s AI SDK out of the box.
        </p>

        <p className="head__status">
          <a href="https://www.npmjs.com/package/agent-indicator">v0.3.0 on npm</a>
          {'. Source on '}
          <a href="https://github.com/ladanjohari/agent-indicator">GitHub</a>
          {'. MIT licensed.'}
        </p>
      </header>

      <main className="page">
        {/* Who this is for, before why it is good. Somebody landing cold does
            not have an approval gate in their head yet, because the category is
            new enough that nobody does. */}
        <section id="when" className="component">
          <h2>When you need this</h2>
          <p>
            Vercel&apos;s AI SDK says a tool needs approval when it can{' '}
            <a href="https://ai-sdk.dev/docs/agents/tool-approvals">
              modify data, spend money, execute code, send messages or access
              private data
            </a>
            . Here is what three of those look like. Each one pairs something
            that can be undone with something that cannot.
          </p>
          <Scenarios />
        </section>

        <section id="approvalgate" className="component">
          <h2>The approval gate</h2>
          <p>
            One request that cannot be undone, at four moments. Reading it takes
            no clicks. The live one is underneath.
          </p>
          <Filmstrip />
          <Hero />
        </section>

        <section id="install" className="component">
          <h2>Install</h2>
          <pre className="block">
            <code>{`npm install agent-indicator`}</code>
          </pre>
          <pre className="block">
            <code>{`import { ApprovalGate } from 'agent-indicator'
import 'agent-indicator/styles.css'

<ApprovalGate
  requests={requests}
  onApprove={(ids) => ids.forEach(run)}
  onDeny={(ids) => ids.forEach(refuse)}
/>`}</code>
          </pre>
          <p>
            A request is an <code>id</code>, a <code>consequence</code> in plain
            words, an optional <code>detail</code> such as the command, and{' '}
            <code>reversible</code>. React 18 or 19. Every prop is typed, so the
            reference is in your editor when you need it, and in the{' '}
            <a href="https://github.com/ladanjohari/agent-indicator#readme">readme</a>{' '}
            when you want to read it.
          </p>
        </section>

        <section id="ai-sdk" className="component">
          <h2>Approval UI for the AI SDK</h2>
          <p>
            Mark a tool as needing approval and Vercel&apos;s AI SDK pauses, hands
            your app a tool part in the <code>approval-requested</code> state, and
            gives you <code>addToolApprovalResponse</code> to send the answer back.
            The approve and deny interface is yours to build, as{' '}
            <a href="https://ai-sdk.dev/cookbook/next/human-in-the-loop">
              Vercel&apos;s own cookbook shows
            </a>
            . This is one you can install instead.
          </p>

          <pre className="block">
            <code>{`import { ApprovalGate } from 'agent-indicator/ai-sdk'
import 'agent-indicator/styles.css'

const { messages, addToolApprovalResponse } = useChat()

<ApprovalGate
  messages={messages}
  addToolApprovalResponse={addToolApprovalResponse}
  reversible={{ searchWeb: true, readOrder: true }}
/>`}</code>
          </pre>

          <Example
            note="Three real requests, in the shape useChat hands them over. Add or remove one line of configuration and watch what it does. Undeclared, everything is held one at a time, because nothing in the SDK says what can be undone. Declared, the two safe ones collapse into a single press and the refund stays exactly where it was."
          >
            <SdkExample />
          </Example>
        </section>

        <section id="more" className="component">
          <h2>Also in the box</h2>

          <Example
            note="StatusIndicator. Six states. Only Running moves, because only Running is alive without progressing. Error is a ring rather than a fill, so it is told apart by shape and not by hue."
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
            note="SessionStrip. Eight sessions. The two that need a person sort to the top and are the only ones that spell out their state. The rest fold into a line of counts."
            code={`<SessionStrip sessions={sessions} maxQuiet={4} />`}
          >
            <StripExample />
          </Example>

          <Example
            note="ActivityTrail. Eleven steps, seven rows. Runs of the same ordinary step fold into one row you can open. Questions and failures never fold, and they are the only rows carrying colour."
            code={`<ActivityTrail activities={activities} maxVisible={8} />`}
          >
            <ActivityTrail activities={TRAIL} />
          </Example>

          <p className="restyle">
            Every colour is a token you can retint, and each component writes its
            state into the page as a <code>data-</code> attribute, so you can style
            any state from your own CSS. The cards on this page are styled that
            way. The package itself ships neutral and inherits from whatever it is
            dropped into.
          </p>
        </section>

        <section id="rule" className="rule">
          <h2>One rule</h2>
          <p className="rule__line">Compress the ordinary. Never compress the exception.</p>
          <p>
            Nine routine requests can collapse into one row. The one that deletes a
            table cannot. Every decision in the library came from that sentence,
            and the state model behind it came from Session Indicator, a macOS app
            that watches real agent sessions.
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
