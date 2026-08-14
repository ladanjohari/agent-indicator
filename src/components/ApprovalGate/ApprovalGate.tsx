import { useState } from 'react'
import type { ApprovalGateProps, ApprovalRequest } from './types'
import { HoldToConfirm } from './HoldToConfirm'
import './ApprovalGate.css'

/** Only an explicit `true` is safe. Everything else is held back. */
function isReversible(request: ApprovalRequest) {
  return request.reversible === true
}

/** Someone actually looked at this and said it is permanent. */
function isDeclaredPermanent(request: ApprovalRequest) {
  return request.reversible === false
}

/** For styling from the outside, and for reading the state back off the DOM. */
function reversibility(request: ApprovalRequest) {
  if (request.reversible === true) return 'yes'
  if (request.reversible === false) return 'no'
  return 'unknown'
}

/**
 * The line above the group that cannot be batched.
 *
 * Two registers, because they are two different claims. "This cannot be undone"
 * is a fact somebody vouched for. When nobody vouched for anything the honest
 * sentence is quieter, and it is quieter on purpose: painting an undeclared web
 * search in alarm red is exactly how a gate teaches people to stop seeing alarm
 * red.
 */
function note(requests: ApprovalRequest[]) {
  const anyConfirmed = requests.some(isDeclaredPermanent)

  if (requests.length === 1) {
    return anyConfirmed
      ? 'This cannot be undone. Open it to answer.'
      : 'This might not be possible to undo. Open it to answer.'
  }

  if (requests.every(isDeclaredPermanent)) {
    return 'These cannot be undone. Each one is answered on its own.'
  }
  if (!anyConfirmed) {
    return 'These might not be possible to undo. Each one is answered on its own.'
  }
  return 'Some of these cannot be undone. Each one is answered on its own.'
}

/**
 * Asks for a human decision without becoming a toll booth.
 *
 * Reversible requests batch: one button clears all of them at once, because
 * being asked four separate times about four safe things is what trains people
 * to stop reading.
 *
 * Everything else never batches. It sits below a rule, collapsed, with no
 * approve control at all until it has been opened, and then it is held rather
 * than clicked. That is the point: the motion that approves the safe ones
 * cannot reach it. Separating a destructive action by position does not work,
 * because a hand already moving does not stop at a horizontal rule. Separating
 * it by gesture does.
 *
 * "Everything else" is deliberate. A request nobody declared safe is handled
 * exactly like one declared permanent. Only the wording softens, because in
 * that case the component knows less and should not pretend otherwise.
 *
 * There are no timers here and there is no automatic decision. Dismissing is
 * neither yes nor no, and the requests survive it.
 */
export function ApprovalGate({
  requests,
  onApprove,
  onDeny,
  onDismiss,
  title = 'Waiting for you',
  className,
}: ApprovalGateProps) {
  const [openIds, setOpenIds] = useState<string[]>([])

  if (requests.length === 0) return null

  const safe = requests.filter(isReversible)
  const held = requests.filter((request) => !isReversible(request))
  const safeIds = safe.map((request) => request.id)

  const toggle = (id: string) =>
    setOpenIds((open) =>
      open.includes(id) ? open.filter((each) => each !== id) : [...open, id],
    )

  return (
    <section
      // The landmark keeps its name even when the visible heading is off, so
      // nothing is taken away from anyone navigating by region.
      aria-label={title === false ? 'Waiting for you' : title}
      className={['agent-gate', className].filter(Boolean).join(' ')}
    >
      {title === false && !onDismiss ? null : (
        <header className="agent-gate__head">
          {/* Deliberately not a heading tag. This component does not know whether
              it sits under an h1 or an h3 in your page, and guessing wrong breaks
              the document outline for anyone navigating by headings. The section
              already carries the name through aria-label, so assistive technology
              still announces it. */}
          {title === false ? null : <p className="agent-gate__title">{title}</p>}
          {onDismiss ? (
            <button type="button" className="agent-gate__dismiss" onClick={onDismiss}>
              Not now
            </button>
          ) : null}
        </header>
      )}

      {safe.length > 0 ? (
        <div className="agent-gate__group">
          <ul className="agent-gate__list">
            {safe.map((request) => (
              <li
                key={request.id}
                className="agent-gate__item"
                data-reversible={reversibility(request)}
              >
                <span className="agent-gate__consequence">{request.consequence}</span>
                {request.detail ? (
                  <code className="agent-gate__detail">{request.detail}</code>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="agent-gate__actions">
            <button
              type="button"
              className="agent-gate__approve"
              onClick={() => onApprove(safeIds)}
            >
              {safe.length === 1 ? 'Approve' : `Approve all ${safe.length}`}
            </button>
            <button
              type="button"
              className="agent-gate__deny"
              onClick={() => onDeny(safeIds)}
            >
              Deny
            </button>
          </div>
        </div>
      ) : null}

      {held.length > 0 ? (
        <div className="agent-gate__group agent-gate__group--destructive">
          <p
            className="agent-gate__note"
            data-tone={held.some(isDeclaredPermanent) ? 'alarm' : 'caution'}
          >
            {note(held)}
          </p>
          <ul className="agent-gate__list">
            {held.map((request) => {
              const isOpen = openIds.includes(request.id)
              return (
                <li
                  key={request.id}
                  className="agent-gate__item"
                  data-reversible={reversibility(request)}
                >
                  <button
                    type="button"
                    className="agent-gate__reveal"
                    aria-expanded={isOpen}
                    onClick={() => toggle(request.id)}
                  >
                    <span className="agent-gate__consequence">{request.consequence}</span>
                    <span className="agent-gate__reveal-hint">
                      {isOpen ? 'Close' : 'Review'}
                    </span>
                  </button>

                  {/* The approve control does not exist until this is opened.
                      Not hidden, not disabled. Absent. */}
                  {isOpen ? (
                    <div className="agent-gate__revealed">
                      {request.detail ? (
                        <code className="agent-gate__detail">{request.detail}</code>
                      ) : null}
                      <div className="agent-gate__actions">
                        <HoldToConfirm onConfirm={() => onApprove([request.id])} />
                        <button
                          type="button"
                          className="agent-gate__deny"
                          onClick={() => onDeny([request.id])}
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
