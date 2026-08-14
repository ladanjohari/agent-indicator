/**
 * Whether an action can be undone.
 *
 * Three values, not two, because "nobody has said" is a different claim from
 * "this is permanent", and printing the second when you only know the first is
 * a lie the reader will eventually catch. Once they catch a gate overstating
 * danger on something harmless, they discount it everywhere, including on the
 * one that really was a deletion. That is the failure this component exists to
 * prevent, arrived at by the back door.
 *
 * Apple never conflates these either. Every permission API they own has a
 * `notDetermined` case sitting in front of `denied`.
 *
 * Only `true` is treated as safe. `false` and `'unknown'` behave identically:
 * never batched, no approve control until opened, held rather than clicked.
 * The behaviour does not move. Only the sentence does.
 */
export type Reversibility = boolean | 'unknown'

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
   * Required rather than optional so that a developer has to confront the
   * question, and `'unknown'` exists so they can answer it honestly when they
   * genuinely do not know. Anything that is not explicitly `true` is treated as
   * irreversible, so an omission still fails towards asking.
   */
  reversible: Reversibility
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
  /**
   * Heading. Defaults to "Waiting for you".
   *
   * Pass `false` to render no heading row at all, for when the gate sits inline
   * in a conversation and is plainly the only thing asking. The section is
   * still named for assistive technology.
   */
  title?: string | false
  /** Your own class, for spacing and positioning from the outside. */
  className?: string
}
