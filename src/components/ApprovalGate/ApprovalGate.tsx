import { useState } from 'react'
import type { ApprovalGateProps, ApprovalRequest } from './types'
import './ApprovalGate.css'

/** Anything not explicitly reversible is treated as irreversible. */
function isReversible(request: ApprovalRequest) {
  return request.reversible === true
}

/**
 * Asks for a human decision without becoming a toll booth.
 *
 * Reversible requests batch: one button clears all of them at once, because
 * being asked four separate times about four safe things is what trains people
 * to stop reading.
 *
 * Irreversible requests never batch. They sit below a rule, collapsed, and
 * they have no approve button at all until they have been opened. That is the
 * point: the motion that approves the safe ones cannot reach them. Separating
 * a destructive action by position does not work, because a hand already
 * moving does not stop at a horizontal rule. Separating it by gesture does.
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
  const destructive = requests.filter((request) => !isReversible(request))
  const safeIds = safe.map((request) => request.id)

  const toggle = (id: string) =>
    setOpenIds((open) =>
      open.includes(id) ? open.filter((each) => each !== id) : [...open, id],
    )

  return (
    <section
      aria-label={title}
      className={['asu-gate', className].filter(Boolean).join(' ')}
    >
      <header className="asu-gate__head">
        <h2 className="asu-gate__title">{title}</h2>
        {onDismiss ? (
          <button type="button" className="asu-gate__dismiss" onClick={onDismiss}>
            Not now
          </button>
        ) : null}
      </header>

      {safe.length > 0 ? (
        <div className="asu-gate__group">
          <ul className="asu-gate__list">
            {safe.map((request) => (
              <li key={request.id} className="asu-gate__item">
                <span className="asu-gate__consequence">{request.consequence}</span>
                {request.detail ? (
                  <code className="asu-gate__detail">{request.detail}</code>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="asu-gate__actions">
            <button
              type="button"
              className="asu-gate__approve"
              onClick={() => onApprove(safeIds)}
            >
              {safe.length === 1 ? 'Approve' : `Approve all ${safe.length}`}
            </button>
            <button
              type="button"
              className="asu-gate__deny"
              onClick={() => onDeny(safeIds)}
            >
              Deny
            </button>
          </div>
        </div>
      ) : null}

      {destructive.length > 0 ? (
        <div className="asu-gate__group asu-gate__group--destructive">
          <p className="asu-gate__note">
            {destructive.length === 1
              ? 'This cannot be undone. Open it to answer.'
              : 'These cannot be undone. Each one is answered on its own.'}
          </p>
          <ul className="asu-gate__list">
            {destructive.map((request) => {
              const isOpen = openIds.includes(request.id)
              return (
                <li key={request.id} className="asu-gate__item">
                  <button
                    type="button"
                    className="asu-gate__reveal"
                    aria-expanded={isOpen}
                    onClick={() => toggle(request.id)}
                  >
                    <span className="asu-gate__consequence">{request.consequence}</span>
                    <span className="asu-gate__reveal-hint">
                      {isOpen ? 'Close' : 'Review'}
                    </span>
                  </button>

                  {/* The approve control does not exist until this is opened.
                      Not hidden, not disabled. Absent. */}
                  {isOpen ? (
                    <div className="asu-gate__revealed">
                      {request.detail ? (
                        <code className="asu-gate__detail">{request.detail}</code>
                      ) : null}
                      <div className="asu-gate__actions">
                        <button
                          type="button"
                          className="asu-gate__approve-one"
                          onClick={() => onApprove([request.id])}
                        >
                          Approve this one
                        </button>
                        <button
                          type="button"
                          className="asu-gate__deny"
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
