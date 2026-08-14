import { useState } from 'react'
import { ApprovalGate } from '../src'
import type { ApprovalRequest } from '../src'

// The five requests the design was argued over: three that can be undone, two
// that cannot.
const REQUESTS: ApprovalRequest[] = [
  { id: 'write', consequence: 'Writes 3 files in src', detail: 'src/auth.ts, src/session.ts, src/index.ts', reversible: true },
  { id: 'test', consequence: 'Runs the test suite', detail: 'npm test', reversible: true },
  { id: 'commit', consequence: 'Commits locally. Nothing is pushed.', detail: 'git commit -am "refactor auth"', reversible: true },
  { id: 'delete', consequence: 'Deletes the legacy folder and everything in it', detail: 'rm -rf legacy', reversible: false },
  { id: 'push', consequence: 'Force pushes to main, overwriting what is there', detail: 'git push --force origin main', reversible: false },
]

const SAFE_IDS = ['write', 'test', 'commit']

type Outcome =
  | { kind: 'none' }
  | { kind: 'batch' }
  | { kind: 'destructive' }
  | { kind: 'denied' }
  | { kind: 'dismissed' }

/**
 * The reflex test.
 *
 * The visitor is invited to go fast, goes fast, and discovers afterwards that
 * the speed they just used could not reach the two things that cannot be undone.
 * That is the entire argument for the component, made in about two seconds and
 * without asking anyone to read a paragraph first.
 */
export function Hero() {
  const [pending, setPending] = useState(REQUESTS)
  const [outcome, setOutcome] = useState<Outcome>({ kind: 'none' })

  const remove = (ids: string[]) =>
    setPending((current) => current.filter((request) => !ids.includes(request.id)))

  // The unit that means something here is clicks, not seconds. Three actions
  // clear in one press, and the two that cannot be undone are untouched by it.
  const handleApprove = (ids: string[]) => {
    const isBatch = ids.length > 1 || (ids.length === 1 && SAFE_IDS.includes(ids[0]))
    setOutcome({ kind: isBatch ? 'batch' : 'destructive' })
    remove(ids)
  }

  const reset = () => {
    setPending(REQUESTS)
    setOutcome({ kind: 'none' })
  }

  return (
    <section className="hero">
      <p className="hero__ask">
        Your agent wants to do five things. Clear them as fast as you can.
      </p>

      <div className="hero__stage">
        <ApprovalGate
          requests={pending}
          onApprove={handleApprove}
          onDeny={(ids) => {
            remove(ids)
            setOutcome({ kind: 'denied' })
          }}
          onDismiss={() => setOutcome({ kind: 'dismissed' })}
        />

        {pending.length === 0 && outcome.kind !== 'none' ? (
          <p className="hero__empty">Nothing left waiting.</p>
        ) : null}
      </div>

      {outcome.kind === 'batch' ? (
        <p className="hero__result">
          <strong>One click, three approved, nothing deleted.</strong> The two
          that cannot be undone had no approve button to hit, and they still do
          not until you open one and read it. Whatever speed you just used could
          not reach them.
        </p>
      ) : null}

      {outcome.kind === 'destructive' ? (
        <p className="hero__result">
          <strong>You opened it first.</strong> You saw exactly what it would do,
          and then chose it deliberately. That is the only difference this
          component is trying to make.
        </p>
      ) : null}

      {outcome.kind === 'denied' ? (
        <p className="hero__result">
          <strong>Refused.</strong> Denying is as cheap as approving here, which is
          the point. A gate that makes refusing expensive is a gate people stop
          reading.
        </p>
      ) : null}

      {outcome.kind === 'dismissed' ? (
        <p className="hero__result">
          <strong>Dismissing decides nothing.</strong> Everything is still waiting,
          and the session is still stopped. Putting it away is not the same as
          saying yes, and it is not the same as saying no.
        </p>
      ) : null}

      {outcome.kind !== 'none' ? (
        <button type="button" className="hero__reset" onClick={reset}>
          Try it again
        </button>
      ) : null}
    </section>
  )
}
