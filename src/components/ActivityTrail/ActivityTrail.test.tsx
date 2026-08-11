import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivityTrail } from './ActivityTrail'
import type { Activity } from './types'

const TRAIL: Activity[] = [
  { id: '1', kind: 'read', summary: 'Read src/auth.ts', at: '14:01' },
  { id: '2', kind: 'read', summary: 'Read src/session.ts', at: '14:01' },
  { id: '3', kind: 'read', summary: 'Read src/index.ts', at: '14:02' },
  { id: '4', kind: 'ask', summary: 'Asked to delete the legacy folder', at: '14:03' },
  { id: '5', kind: 'edit', summary: 'Edited src/auth.ts', at: '14:04' },
  { id: '6', kind: 'edit', summary: 'Edited src/session.ts', at: '14:04' },
  { id: '7', kind: 'run', summary: 'Ran npm test', detail: 'npm test', at: '14:05' },
  { id: '8', kind: 'error', summary: 'Test suite failed', detail: 'exit code 1', at: '14:06' },
]

function rowText() {
  return screen
    .getAllByRole('listitem')
    .map((item) => item.querySelector('.asu-trail__summary')?.textContent ?? '')
}

describe('ActivityTrail', () => {
  it('renders nothing when nothing has happened', () => {
    const { container } = render(<ActivityTrail activities={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('folds a run of the same ordinary thing into one row', () => {
    render(<ActivityTrail activities={TRAIL} />)
    expect(screen.getByText('Read 3 files')).toBeInTheDocument()
    expect(screen.getByText('Edited 2 files')).toBeInTheDocument()
    expect(screen.queryByText('Read src/auth.ts')).not.toBeInTheDocument()
  })

  it('leaves a single ordinary step alone rather than calling it a group', () => {
    render(<ActivityTrail activities={TRAIL} />)
    expect(screen.getByText('Ran npm test')).toBeInTheDocument()
    expect(screen.queryByText('Ran 1 command')).not.toBeInTheDocument()
  })

  // The rule the whole kit shares: compress the ordinary, never the exception.
  it('never folds a question or a failure', () => {
    const noisy: Activity[] = [
      { id: 'a', kind: 'error', summary: 'First failure' },
      { id: 'b', kind: 'error', summary: 'Second failure' },
      { id: 'c', kind: 'ask', summary: 'First question' },
      { id: 'd', kind: 'ask', summary: 'Second question' },
    ]
    render(<ActivityTrail activities={noisy} />)
    expect(rowText()).toEqual([
      'First failure',
      'Second failure',
      'First question',
      'Second question',
    ])
  })

  it('keeps the order, so the same kind either side of something else stays apart', () => {
    render(<ActivityTrail activities={TRAIL} />)
    expect(rowText()).toEqual([
      'Read 3 files',
      'Asked to delete the legacy folder',
      'Edited 2 files',
      'Ran npm test',
      'Test suite failed',
    ])
  })

  it('opens a folded group to show what was in it', async () => {
    render(<ActivityTrail activities={TRAIL} />)

    await userEvent.click(screen.getByRole('button', { name: /Read 3 files/ }))
    expect(screen.getByText('Read src/auth.ts')).toBeInTheDocument()
    expect(screen.getByText('Read src/index.ts')).toBeInTheDocument()
  })

  it('folds the oldest steps away and counts them, keeping the newest', () => {
    render(<ActivityTrail activities={TRAIL} maxVisible={2} />)
    expect(screen.getByText('6 earlier steps')).toBeInTheDocument()
    expect(rowText()).toEqual(['Ran npm test', 'Test suite failed'])
  })

  it('lets the group wording be replaced for another language', () => {
    render(
      <ActivityTrail
        activities={TRAIL}
        summarise={(kind, count) => `${count} x ${kind}`}
      />,
    )
    expect(screen.getByText('3 x read')).toBeInTheDocument()
    expect(screen.queryByText('Read 3 files')).not.toBeInTheDocument()
  })

  it('is a record, with nothing to press except opening a group', () => {
    const single: Activity[] = [{ id: 'x', kind: 'run', summary: 'Ran npm test' }]
    render(<ActivityTrail activities={single} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})
