import { StatusIndicator } from '../StatusIndicator/StatusIndicator'
import type { SessionState } from '../StatusIndicator/types'
import type { Session, SessionStripProps } from './types'
import './SessionStrip.css'

/** A session the person can actually do something about right now. */
function isActionable(session: Session) {
  return session.state === 'needsYou' || session.state === 'error'
}

/**
 * "3 running, 1 done, 2 idle". Weather, not telemetry.
 *
 * Writing and Running a command are counted together here on purpose. At a
 * glance the useful fact is how many are busy. Which kind of busy matters when
 * you look at a single session, not when you are counting them.
 */
function summarise(sessions: Session[]) {
  const count = (states: SessionState[]) =>
    sessions.filter((session) => states.includes(session.state)).length

  const parts: string[] = []
  const running = count(['working', 'running'])
  const done = count(['done'])
  const idle = count(['idle'])

  if (running > 0) parts.push(`${running} running`)
  if (done > 0) parts.push(`${done} done`)
  if (idle > 0) parts.push(`${idle} idle`)
  return parts.join(', ')
}

/**
 * Many parallel sessions, read at a glance.
 *
 * Two rules hold this together. Sessions that need a person come first and are
 * never folded away, however many there are. Everything else is allowed to
 * collapse into a single line of counts, because a list of twelve calm rows is
 * telemetry, and nobody reads telemetry.
 *
 * Rows do not animate when they reorder. A session that starts needing you
 * jumps to the top immediately, with no transition, matching the menu bar.
 * Motion belongs to a single dot describing itself, not to a list rearranging
 * under someone's eyes.
 */
export function SessionStrip({
  sessions,
  maxQuiet = 4,
  onSelect,
  label = 'Sessions',
  className,
}: SessionStripProps) {
  if (sessions.length === 0) return null

  const actionable = sessions.filter(isActionable)
  const quiet = sessions.filter((session) => !isActionable(session))

  const shownQuiet = quiet.slice(0, Math.max(0, maxQuiet))
  const foldedQuiet = quiet.slice(shownQuiet.length)

  const rows = [...actionable, ...shownQuiet]
  const summary = summarise(foldedQuiet)

  return (
    <section
      aria-label={label}
      className={['asu-strip', className].filter(Boolean).join(' ')}
    >
      <ul className="asu-strip__list">
        {rows.map((session) => {
          // One StatusIndicator per row, never two. A second one would read the
          // state out twice to a screen reader.
          //
          // The word is shown only on rows that need a person. On a calm row the
          // dot is enough, and twelve rows each spelling out "Idle" is the
          // telemetry this component exists to avoid.
          const content = (
            <>
              <StatusIndicator
                state={session.state}
                showLabel={isActionable(session)}
                className="asu-strip__status"
              />
              <span className="asu-strip__name">{session.name}</span>
              {session.elapsed ? (
                <span className="asu-strip__elapsed">{session.elapsed}</span>
              ) : null}
            </>
          )

          return (
            <li
              key={session.id}
              className="asu-strip__item"
              data-state={session.state}
              data-actionable={isActionable(session) ? 'true' : undefined}
            >
              {onSelect ? (
                <button
                  type="button"
                  className="asu-strip__row asu-strip__row--button"
                  onClick={() => onSelect(session.id)}
                >
                  {content}
                </button>
              ) : (
                <span className="asu-strip__row">{content}</span>
              )}
            </li>
          )
        })}
      </ul>

      {summary ? <p className="asu-strip__summary">{summary}</p> : null}
    </section>
  )
}
