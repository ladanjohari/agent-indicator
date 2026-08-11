export interface ApprovalRequest {
  /** Your own identifier. Handed back to you when the person answers. */
  id: string
  /**
   * What happens if this is approved, in plain words, from the point of view of
   * the person reading it. "Deletes 3 files in src", not "rm -rf src".
   *
   * This leads, because people approve commands they have not actually parsed.
   */
  consequence: string
  /** The literal command or path. Shown smaller, underneath. Optional. */
  detail?: string
  /**
   * Whether this can be undone. Required on purpose.
   *
   * Anything that is not explicitly `true` is treated as irreversible, so a
   * field left out fails towards asking rather than towards approving.
   */
  reversible: boolean
}

export interface ApprovalGateProps {
  /** Everything currently waiting on a decision. Empty renders nothing. */
  requests: ApprovalRequest[]
  /** Called with the ids being approved. Reversible ones may arrive together. */
  onApprove: (ids: string[]) => void
  /** Called with the ids being refused. */
  onDeny: (ids: string[]) => void
  /**
   * Called when the person puts this away without deciding.
   *
   * Dismissing is not approval and not refusal. The requests are still
   * pending afterwards. Leave this out and the gate cannot be dismissed.
   */
  onDismiss?: () => void
  /** Heading. Defaults to "Waiting for you". */
  title?: string
  /** Your own class, for spacing and positioning from the outside. */
  className?: string
}
