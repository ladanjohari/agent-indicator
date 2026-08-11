import type { SessionState } from '../StatusIndicator/types'

export interface Session {
  /** Your own identifier. Handed back by onSelect. */
  id: string
  /** What the session is called. */
  name: string
  state: SessionState
  /** How long it has been in this state, already formatted. "2m", "1h". */
  elapsed?: string
}

export interface SessionStripProps {
  sessions: Session[]
  /**
   * How many quiet sessions to show as rows before folding the rest into the
   * summary line. Defaults to 4.
   *
   * Sessions that need a person are never folded, no matter what this is set
   * to. The strip compresses the quiet, never the actionable.
   */
  maxQuiet?: number
  /**
   * Makes each row selectable. Leave it out and the strip is a read out with
   * nothing to click, which is the default on purpose.
   */
  onSelect?: (id: string) => void
  /** Accessible name for the list. Defaults to "Sessions". */
  label?: string
  /** Your own class, for spacing and positioning from the outside. */
  className?: string
}
