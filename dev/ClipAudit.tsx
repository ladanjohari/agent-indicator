import { ApprovalGate } from '../src'
import type { ApprovalRequest } from '../src'

/**
 * The clip's scenario, rendered by the real component.
 *
 * `previews/hold-to-approve.html` is hand-copied markup, not the component, so
 * it can drift from what actually ships. It already did once: it rendered an
 * "Approved, deliberately." confirmation the package has never had.
 *
 * This page exists so the clip can be checked against the truth by putting the
 * two side by side. Same canvas, same background, same single request. Anything
 * that differs is either a bug in the clip or a bug in the component, and both
 * are worth knowing about.
 */
const REQUEST: ApprovalRequest[] = [
  {
    id: 'delete',
    consequence: 'Charges $200 to the card on file',
    detail: 'annual plan, renews automatically',
    reversible: false,
  },
]

export function ClipAudit() {
  return (
    <div className="clip-audit">
      <ApprovalGate
        requests={REQUEST}
        onApprove={() => {}}
        onDeny={() => {}}
        onDismiss={() => {}}
      />
    </div>
  )
}
