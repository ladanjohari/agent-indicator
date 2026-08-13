import type { SessionState, StatusIndicatorProps } from './types'
import './StatusIndicator.css'

/**
 * The wording each state shows by default. Pass `label` to replace it.
 *
 * "Writing" and "Running a command" say who is doing the work. The earlier
 * pair, "Active" and "Running", were synonyms in English and nobody could hold
 * them apart, including the person who designed them.
 */
const DEFAULT_LABEL: Record<SessionState, string> = {
  idle: 'Idle',
  working: 'Writing',
  running: 'Running a command',
  needsYou: 'Waiting for you',
  error: 'Error',
  done: 'Done',
}

/**
 * One session's state, as a dot with an optional label.
 *
 * Motion means state, colour means exception. Only `running` moves, because
 * only `running` is the case of being alive without progressing, and a breath
 * is what that looks like. `error` is told apart by shape rather than hue, so
 * it still reads for anyone who cannot separate red from amber.
 *
 * This component reports. It is never a control. It has no click handler and
 * takes no children on purpose: the moment a status can be clicked it has
 * become an approval, and approvals are ApprovalGate's job.
 */
export function StatusIndicator({
  state,
  label,
  showLabel = false,
  size = 'md',
  className,
}: StatusIndicatorProps) {
  const text = label ?? DEFAULT_LABEL[state]

  return (
    <span
      // data-state is here so you can style any state from your own CSS
      // without this component needing to expose a prop for every colour.
      data-state={state}
      className={['agent-status', `agent-status--${size}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="agent-status__dot" aria-hidden="true" />
      <span className={showLabel ? 'agent-status__label' : 'agent-status__label agent-sr-only'}>
        {text}
      </span>
    </span>
  )
}
