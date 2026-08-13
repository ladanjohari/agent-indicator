import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionStrip } from './SessionStrip'
import type { Session } from './types'

const SESSIONS: Session[] = [
  { id: 'a', name: 'write-docs', state: 'working', elapsed: '1m' },
  { id: 'b', name: 'deploy', state: 'done', elapsed: '8m' },
  { id: 'c', name: 'run-tests', state: 'error', elapsed: '2m' },
  { id: 'd', name: 'build', state: 'running', elapsed: '4m' },
  { id: 'e', name: 'analyze', state: 'needsYou', elapsed: '5m' },
]

function names() {
  return screen.getAllByRole('listitem').map((item) => {
    const name = item.querySelector('.agent-strip__name')
    return name ? name.textContent : ''
  })
}

describe('SessionStrip', () => {
  it('renders nothing when there are no sessions', () => {
    const { container } = render(<SessionStrip sessions={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('puts the sessions that need a person first', () => {
    render(<SessionStrip sessions={SESSIONS} />)
    expect(names().slice(0, 2)).toEqual(['run-tests', 'analyze'])
  })

  // The rule the component exists for: compress the calm, never the urgent.
  it('never folds away an actionable session, however tight the limit', () => {
    render(<SessionStrip sessions={SESSIONS} maxQuiet={0} />)
    expect(names()).toEqual(['run-tests', 'analyze'])
    expect(screen.getByText('2 running, 1 done')).toBeInTheDocument()
  })

  it('folds the quiet ones into a summary once past the limit', () => {
    render(<SessionStrip sessions={SESSIONS} maxQuiet={1} />)
    expect(names()).toEqual(['run-tests', 'analyze', 'write-docs'])
    expect(screen.getByText('1 running, 1 done')).toBeInTheDocument()
  })

  it('shows no summary when nothing was folded', () => {
    render(<SessionStrip sessions={SESSIONS} />)
    expect(screen.queryByText(/running/)).not.toBeInTheDocument()
  })

  it('spells out the state only on rows that need a person', () => {
    render(<SessionStrip sessions={SESSIONS} />)
    // Present for everyone, because the label is always readable by a screen
    // reader even when it is not on screen.
    expect(screen.getByText('Waiting for you')).toBeInTheDocument()
    expect(screen.getByText('Waiting for you')).not.toHaveClass('agent-sr-only')
    expect(screen.getByText('Writing')).toHaveClass('agent-sr-only')
  })

  it('is a read out with nothing to click by default', () => {
    render(<SessionStrip sessions={SESSIONS} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('hands back the id when a row is chosen', async () => {
    const onSelect = vi.fn()
    render(<SessionStrip sessions={SESSIONS} onSelect={onSelect} />)

    await userEvent.click(screen.getByRole('button', { name: /run-tests/ }))
    expect(onSelect).toHaveBeenCalledWith('c')
  })
})
