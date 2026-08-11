/**
 * The states a session can be in.
 *
 * These are not invented for a component library. They are the states that
 * survived daily use of Session Indicator, a macOS app that watches real agent
 * sessions. The union below is the whole model: TypeScript refuses any value
 * that is not on this list.
 */
export type SessionState =
  /** Open, at the prompt, nothing happening. */
  | 'idle'
  /** The agent itself is producing. Progress is happening right now. */
  | 'working'
  /** A command the agent started is still going. Alive, but not progressing. */
  | 'running'
  /** Stopped, and it cannot continue until a person answers. */
  | 'needsYou'
  /** Something failed. */
  | 'error'
  /** Finished. */
  | 'done'

export interface StatusIndicatorProps {
  /** Which state to show. The only required prop. */
  state: SessionState
  /**
   * Replaces the built in wording. Use it for other languages, or when your
   * product says "Paused" where this says "Idle".
   */
  label?: string
  /**
   * Show the label next to the dot. Defaults to false.
   *
   * This controls whether the label is *visible*, not whether it exists. The
   * text is always in the page for screen readers, because a bare coloured dot
   * communicates nothing to someone who cannot see it.
   */
  showLabel?: boolean
  /** Dot size. Named sizes only, see the note in the component. */
  size?: 'sm' | 'md' | 'lg'
  /** Your own class, for spacing and positioning from the outside. */
  className?: string
}
