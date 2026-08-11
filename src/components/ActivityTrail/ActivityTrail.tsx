import { useState } from 'react'
import type { Activity, ActivityKind, ActivityTrailProps } from './types'
import './ActivityTrail.css'

/**
 * Exceptions never fold. A question the agent asked and a thing that failed are
 * the two events a person came here to find, so they always stand on their own,
 * however many of them there are.
 */
function isException(kind: ActivityKind) {
  return kind === 'ask' || kind === 'error'
}

const PLURAL: Record<ActivityKind, [one: string, many: string]> = {
  read: ['file', 'files'],
  edit: ['file', 'files'],
  run: ['command', 'commands'],
  ask: ['question', 'questions'],
  error: ['failure', 'failures'],
  note: ['note', 'notes'],
}

const VERB: Record<ActivityKind, string> = {
  read: 'Read',
  edit: 'Edited',
  run: 'Ran',
  ask: 'Asked',
  error: 'Failed',
  note: 'Noted',
}

function defaultSummarise(kind: ActivityKind, count: number) {
  const [one, many] = PLURAL[kind]
  return `${VERB[kind]} ${count} ${count === 1 ? one : many}`
}

type Row =
  | { type: 'single'; key: string; activity: Activity }
  | { type: 'group'; key: string; kind: ActivityKind; activities: Activity[] }

/**
 * Runs of the same ordinary thing become one row. Runs are consecutive only,
 * because the order is the story: five reads, then a command, then five more
 * reads is three rows, not two.
 */
function toRows(activities: Activity[]): Row[] {
  const rows: Row[] = []

  for (const activity of activities) {
    const previous = rows[rows.length - 1]

    if (isException(activity.kind)) {
      rows.push({ type: 'single', key: activity.id, activity })
      continue
    }

    if (previous?.type === 'group' && previous.kind === activity.kind) {
      previous.activities.push(activity)
      continue
    }

    if (previous?.type === 'single' && previous.activity.kind === activity.kind) {
      rows[rows.length - 1] = {
        type: 'group',
        key: previous.activity.id,
        kind: activity.kind,
        activities: [previous.activity, activity],
      }
      continue
    }

    rows.push({ type: 'single', key: activity.id, activity })
  }

  return rows
}

/**
 * What the agent did, compressed and scannable.
 *
 * A log dump is a list of everything that happened, in the order it happened,
 * at the same volume. Nobody reads one. This is the same information with the
 * repetition folded up and the two things worth finding, the questions and the
 * failures, left standing at full size.
 *
 * It is a record. There is nothing to click except opening a folded group.
 */
export function ActivityTrail({
  activities,
  maxVisible = 8,
  summarise = defaultSummarise,
  label = 'Activity',
  className,
}: ActivityTrailProps) {
  const [openKeys, setOpenKeys] = useState<string[]>([])

  if (activities.length === 0) return null

  const rows = toRows(activities)
  const limit = Math.max(0, maxVisible)
  const hidden = Math.max(0, rows.length - limit)
  const shown = hidden > 0 ? rows.slice(hidden) : rows

  const earlier = rows
    .slice(0, hidden)
    .reduce((total, row) => total + (row.type === 'group' ? row.activities.length : 1), 0)

  const toggle = (key: string) =>
    setOpenKeys((open) =>
      open.includes(key) ? open.filter((each) => each !== key) : [...open, key],
    )

  return (
    <section
      aria-label={label}
      className={['asu-trail', className].filter(Boolean).join(' ')}
    >
      {earlier > 0 ? (
        <p className="asu-trail__earlier">{earlier} earlier steps</p>
      ) : null}

      <ol className="asu-trail__list">
        {shown.map((row) => {
          if (row.type === 'single') {
            const { activity } = row
            return (
              <li
                key={row.key}
                className="asu-trail__item"
                data-kind={activity.kind}
              >
                <span className="asu-trail__node" aria-hidden="true" />
                <span className="asu-trail__body">
                  <span className="asu-trail__summary">{activity.summary}</span>
                  {activity.detail ? (
                    <code className="asu-trail__detail">{activity.detail}</code>
                  ) : null}
                </span>
                {activity.at ? <span className="asu-trail__at">{activity.at}</span> : null}
              </li>
            )
          }

          const isOpen = openKeys.includes(row.key)
          return (
            <li key={row.key} className="asu-trail__item" data-kind={row.kind}>
              <span className="asu-trail__node" aria-hidden="true" />
              <span className="asu-trail__body">
                <button
                  type="button"
                  className="asu-trail__group"
                  aria-expanded={isOpen}
                  onClick={() => toggle(row.key)}
                >
                  <span className="asu-trail__summary">
                    {summarise(row.kind, row.activities.length)}
                  </span>
                  <span className="asu-trail__group-hint">{isOpen ? 'Hide' : 'Show'}</span>
                </button>

                {isOpen ? (
                  <ol className="asu-trail__sublist">
                    {row.activities.map((activity) => (
                      <li key={activity.id} className="asu-trail__subitem">
                        <span className="asu-trail__summary">{activity.summary}</span>
                        {activity.detail ? (
                          <code className="asu-trail__detail">{activity.detail}</code>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
