/**
 * What kind of thing happened.
 *
 * `ask` and `error` are the exceptions, and exceptions are never folded away.
 * Everything else is ordinary and may be collapsed when it repeats.
 */
export type ActivityKind = 'read' | 'edit' | 'run' | 'ask' | 'error' | 'note'

export interface Activity {
  /** Your own identifier. */
  id: string
  kind: ActivityKind
  /** What happened, in plain words. "Read src/auth.ts" */
  summary: string
  /** The command, the path, the message. Shown smaller. Optional. */
  detail?: string
  /** When, already formatted. "14:02", "2m ago". No date logic lives here. */
  at?: string
}

export interface ActivityTrailProps {
  /** Oldest first. The trail reads downwards, the way it happened. */
  activities: Activity[]
  /**
   * How many rows to show before the older ones fold into a single line at the
   * top. Defaults to 8. Groups count as one row.
   */
  maxVisible?: number
  /**
   * The wording for a collapsed group, given the kind and how many were folded
   * into it. Replace it for other languages or other vocabularies.
   *
   * The default says things like "Read 12 files" and "Ran 3 commands".
   */
  summarise?: (kind: ActivityKind, count: number) => string
  /** Accessible name for the list. Defaults to "Activity". */
  label?: string
  /** Your own class, for spacing and positioning from the outside. */
  className?: string
}
