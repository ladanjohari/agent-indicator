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
/**
 * The line above the group that cannot be batched.
 *
 * It exists because the reason those rows have no approve control is an
 * absence, and nobody notices a button that is not there. Its only job is to
 * say why these are separated from the ones above.
 *
 * "Review to answer" rather than "Review to approve": denying is meant to cost
 * exactly what approving costs, and naming one outcome and not the other puts a
 * thumb on the scale in the one place this component exists to keep level.
 */
function note(requests: ApprovalRequest[]) {
  const anyConfirmed = requests.some(isDeclaredPermanent)

  if (requests.length === 1) {
    return anyConfirmed
      ? 'Cannot be undone. Review to answer.'
      : 'Might not be possible to undo. Review to answer.'
  }

  if (requests.every(isDeclaredPermanent)) {
    return 'Cannot be undone. Review each to answer.'
  }
  if (!anyConfirmed) {
    return 'Might not be possible to undo. Review each to answer.'
  }
  return 'Some cannot be undone. Review each to answer.'
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
  const [collapsed, setCollapsed] = useState(false)

  if (requests.length === 0) return null

  const safe = requests.filter(isReversible)
  const held = requests.filter((request) => !isReversible(request))
  const safeIds = safe.map((request) => request.id)
  const total = requests.length

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
            /* A disclosure, not a verb.
             *
             * "Not now" removed the card, and a card that vanishes is easy to
             * forget. This collapses to a line that keeps saying what is still
             * waiting, including how many of them are permanent, because the
             * state someone is least likely to look at is exactly the state
             * where the exception most needs naming.
             *
             * onDismiss still fires, so a host that wants to know the person put
             * it away still finds out. What changed is that putting it away no
             * longer makes it silent. */
            <button
              type="button"
              className="agent-gate__disclose"
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Show the requests' : 'Collapse'}
              onClick={() => {
                setCollapsed((was) => !was)
                if (!collapsed) onDismiss()
              }}
            >
              <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
                <path
                  d="M3.5 8.75 L7 5.25 L10.5 8.75"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
        </header>
      )}

      {collapsed ? (
        /* Collapsed, and still saying so. The count is ordinary and may be
           summarised. How many cannot be undone is the exception, and it is
           named here for the same reason it is never batched. */
        <p className="agent-gate__waiting" data-tone={held.length > 0 ? 'alarm' : undefined}>
          {total} {total === 1 ? 'request needs' : 'requests need'} your approval.
          {held.length > 0 ? (
            <span className="agent-gate__waiting-held">
              {' '}
              {held.length} cannot be undone.
            </span>
          ) : null}
        </p>
      ) : null}

      {!collapsed && safe.length > 0 ? (
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

      {!collapsed && held.length > 0 ? (
        <div className="agent-gate__group agent-gate__group--destructive">
          <p
            className="agent-gate__note"
            data-tone={held.some(isDeclaredPermanent) ? 'alarm' : 'caution'}
            /* Nothing has been opened yet, so nothing is being decided yet. The
               colour arrives with the hold, at the moment the risk is actually
               being taken. A warning that shouts while the page is at rest is
               one people stop seeing. */
            data-resting={held.every((r) => !openIds.includes(r.id)) ? 'true' : undefined}
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
