import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusIndicator } from './StatusIndicator'
import type { SessionState } from './types'

const ALL_STATES: SessionState[] = [
  'idle',
  'working',
  'running',
  'needsYou',
  'error',
  'done',
]

describe('StatusIndicator', () => {
  it('says what state it is in, for every state', () => {
    const expected: Record<SessionState, string> = {
      idle: 'Idle',
      working: 'Writing',
      running: 'Running a command',
      needsYou: 'Waiting for you',
      error: 'Error',
      done: 'Done',
    }

    for (const state of ALL_STATES) {
      const { unmount } = render(<StatusIndicator state={state} />)
      expect(screen.getByText(expected[state])).toBeInTheDocument()
      unmount()
    }
  })

  // The guarantee that matters most. A coloured dot on its own tells a blind
  // user nothing, so the words must be in the page whether or not they show.
  it('keeps the label readable by screen readers when it is hidden from view', () => {
    render(<StatusIndicator state="needsYou" />)
    expect(screen.getByText('Waiting for you')).toBeInTheDocument()
  })

  it('shows the label visibly when asked', () => {
    render(<StatusIndicator state="done" showLabel />)
    expect(screen.getByText('Done')).not.toHaveClass('agent-sr-only')
  })

  it('lets the wording be replaced, for other languages and vocabularies', () => {
    render(<StatusIndicator state="idle" label="Angehalten" showLabel />)
    expect(screen.getByText('Angehalten')).toBeInTheDocument()
    expect(screen.queryByText('Idle')).not.toBeInTheDocument()
  })

  it('exposes the state as a data attribute so it can be styled from outside', () => {
    const { container } = render(<StatusIndicator state="running" />)
    expect(container.querySelector('[data-state="running"]')).toBeInTheDocument()
  })

  it('keeps its own classes when given one of yours', () => {
    const { container } = render(<StatusIndicator state="idle" className="mine" />)
    const root = container.querySelector('.agent-status')
    expect(root).toHaveClass('mine')
    expect(root).toHaveClass('agent-status--md')
  })

  it('hides the dot from screen readers, because the label already says it', () => {
    const { container } = render(<StatusIndicator state="error" />)
    expect(container.querySelector('.agent-status__dot')).toHaveAttribute('aria-hidden', 'true')
  })
})
