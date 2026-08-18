import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApprovalGate } from './ApprovalGate'
import type { ApprovalRequest } from './types'

const SAFE: ApprovalRequest[] = [
  { id: 'write', consequence: 'Writes 3 files in src', reversible: true },
  { id: 'test', consequence: 'Runs the test suite', detail: 'npm test', reversible: true },
  { id: 'commit', consequence: 'Commits locally, nothing is pushed', reversible: true },
]

const DESTRUCTIVE: ApprovalRequest[] = [
  { id: 'delete', consequence: 'Deletes the legacy folder', detail: 'rm -rf legacy', reversible: false },
  { id: 'push', consequence: 'Force pushes to main', reversible: false },
]

// Nobody has assessed this one. Deliberately something harmless sounding, so
// the tests prove the barrier does not soften even when the action reads as
// nothing to worry about.
const UNKNOWN: ApprovalRequest[] = [
  {
    id: 'search',
    consequence: 'Searches the web for competitor pricing',
    detail: 'GET https://example.com/pricing',
    reversible: 'unknown',
  },
]

describe('ApprovalGate', () => {
  it('renders nothing when there is nothing to decide', () => {
    const { container } = render(
      <ApprovalGate requests={[]} onApprove={vi.fn()} onDeny={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('batches the reversible ones into a single decision', async () => {
    const onApprove = vi.fn()
    render(<ApprovalGate requests={SAFE} onApprove={onApprove} onDeny={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Approve all 3' }))
    expect(onApprove).toHaveBeenCalledWith(['write', 'test', 'commit'])
  })

  // The rule this whole component exists to enforce.
  it('never lets a destructive request into the batch', async () => {
    const onApprove = vi.fn()
    render(
      <ApprovalGate
        requests={[...SAFE, ...DESTRUCTIVE]}
        onApprove={onApprove}
        onDeny={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Approve all 3' }))
    expect(onApprove).toHaveBeenCalledWith(['write', 'test', 'commit'])
    expect(onApprove.mock.calls[0][0]).not.toContain('delete')
    expect(onApprove.mock.calls[0][0]).not.toContain('push')
  })

  it('gives a destructive request no approve control until it is opened', async () => {
    render(
      <ApprovalGate requests={DESTRUCTIVE} onApprove={vi.fn()} onDeny={vi.fn()} />,
    )

    expect(screen.queryByRole('button', { name: 'Hold to approve' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Deletes the legacy folder/ }))
    expect(screen.getByRole('button', { name: 'Hold to approve' })).toBeInTheDocument()
  })

  // The fill reaching the far side is what completes the hold, so the test
  // drives the same transition the browser would.
  it('approves a destructive request only once the hold completes', async () => {
    const onApprove = vi.fn()
    const { container } = render(
      <ApprovalGate requests={DESTRUCTIVE} onApprove={onApprove} onDeny={vi.fn()} />,
    )

    await userEvent.click(screen.getByRole('button', { name: /Deletes the legacy folder/ }))
    const hold = screen.getByRole('button', { name: 'Hold to approve' })
    const fill = container.querySelector('.agent-gate__hold-fill') as Element

    fireEvent.transitionEnd(fill, { propertyName: 'clip-path' })
    expect(onApprove).not.toHaveBeenCalled()

    fireEvent.pointerDown(hold, { button: 0, pointerId: 1 })
    fireEvent.transitionEnd(fill, { propertyName: 'clip-path' })
    expect(onApprove).toHaveBeenCalledWith(['delete'])
  })

  // Letting go early is the whole reason a hold is safer than a click.
  it('does nothing when the hold is released before it finishes', async () => {
    const onApprove = vi.fn()
    const { container } = render(
      <ApprovalGate requests={DESTRUCTIVE} onApprove={onApprove} onDeny={vi.fn()} />,
    )

    await userEvent.click(screen.getByRole('button', { name: /Deletes the legacy folder/ }))
    const hold = screen.getByRole('button', { name: 'Hold to approve' })
    const fill = container.querySelector('.agent-gate__hold-fill') as Element

    fireEvent.pointerDown(hold, { button: 0, pointerId: 1 })
    fireEvent.pointerUp(hold, { pointerId: 1 })
    // The fill retreating fires the same event, and must not count.
    fireEvent.transitionEnd(fill, { propertyName: 'clip-path' })
    expect(onApprove).not.toHaveBeenCalled()
  })

  it('ignores a right click, which must never begin a hold', async () => {
    const onApprove = vi.fn()
    const { container } = render(
      <ApprovalGate requests={DESTRUCTIVE} onApprove={onApprove} onDeny={vi.fn()} />,
    )

    await userEvent.click(screen.getByRole('button', { name: /Deletes the legacy folder/ }))
    const hold = screen.getByRole('button', { name: 'Hold to approve' })
    const fill = container.querySelector('.agent-gate__hold-fill') as Element

    fireEvent.pointerDown(hold, { button: 2, pointerId: 1 })
    fireEvent.transitionEnd(fill, { propertyName: 'clip-path' })
    expect(onApprove).not.toHaveBeenCalled()
  })

  // Nobody should have to hold a key down at all to use this.
  it('lets the keyboard confirm without holding anything', async () => {
    const onApprove = vi.fn()
    render(
      <ApprovalGate requests={DESTRUCTIVE} onApprove={onApprove} onDeny={vi.fn()} />,
    )

    await userEvent.click(screen.getByRole('button', { name: /Deletes the legacy folder/ }))
    screen.getByRole('button', { name: 'Hold to approve' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(onApprove).toHaveBeenCalledWith(['delete'])
  })

  it('treats an undeclared reversible flag as irreversible', async () => {
    const sneaky = [{ id: 'x', consequence: 'Does something' }] as unknown as ApprovalRequest[]
    render(<ApprovalGate requests={sneaky} onApprove={vi.fn()} onDeny={vi.fn()} />)

    expect(screen.queryByRole('button', { name: /Approve all/ })).not.toBeInTheDocument()
    expect(
      screen.getByText('Might not be possible to undo. Review to answer.'),
    ).toBeInTheDocument()
  })

  // The behaviour must be identical to a declared permanent action. If not
  // knowing were ever cheaper than knowing, the default would stop being a
  // default and start being a suggestion.
  it('gives an undeclared request exactly the same barrier as a permanent one', async () => {
    const onApprove = vi.fn()
    render(
      <ApprovalGate requests={UNKNOWN} onApprove={onApprove} onDeny={vi.fn()} />,
    )

    expect(screen.queryByRole('button', { name: /Approve all/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hold to approve' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Searches the web/ }))
    expect(screen.getByRole('button', { name: 'Hold to approve' })).toBeInTheDocument()
  })

  // Only the claim changes, because the component knows less in one case and
  // must not print a fact it cannot support.
  it('states what it knows, and no more', () => {
    const { unmount } = render(
      <ApprovalGate requests={[DESTRUCTIVE[0]]} onApprove={vi.fn()} onDeny={vi.fn()} />,
    )
    expect(screen.getByText('Cannot be undone. Review to answer.')).toBeInTheDocument()
    unmount()

    render(<ApprovalGate requests={UNKNOWN} onApprove={vi.fn()} onDeny={vi.fn()} />)
    expect(
      screen.getByText('Might not be possible to undo. Review to answer.'),
    ).toBeInTheDocument()
  })

  it('does not spend alarm colour on something nobody has assessed', () => {
    const { container, unmount } = render(
      <ApprovalGate requests={UNKNOWN} onApprove={vi.fn()} onDeny={vi.fn()} />,
    )
    expect(container.querySelector('.agent-gate__note')).toHaveAttribute(
      'data-tone',
      'caution',
    )
    unmount()

    const second = render(
      <ApprovalGate requests={DESTRUCTIVE} onApprove={vi.fn()} onDeny={vi.fn()} />,
    )
    expect(second.container.querySelector('.agent-gate__note')).toHaveAttribute(
      'data-tone',
      'alarm',
    )
  })

  it('speaks for the whole group when one of them is known to be permanent', () => {
    render(
      <ApprovalGate
        requests={[...UNKNOWN, DESTRUCTIVE[0]]}
        onApprove={vi.fn()}
        onDeny={vi.fn()}
      />,
    )
    expect(
      screen.getByText('Some cannot be undone. Review each to answer.'),
    ).toBeInTheDocument()
  })

  it('writes each request state into the page for styling from outside', () => {
    const { container } = render(
      <ApprovalGate
        requests={[SAFE[0], DESTRUCTIVE[0], ...UNKNOWN]}
        onApprove={vi.fn()}
        onDeny={vi.fn()}
      />,
    )
    const states = [...container.querySelectorAll('.agent-gate__item')].map((item) =>
      item.getAttribute('data-reversible'),
    )
    expect(states).toEqual(['yes', 'no', 'unknown'])
  })

  // Inline in a conversation the heading is dead weight, but the landmark name
  // is not, so it stays.
  it('can drop the visible heading without taking the landmark name away', () => {
    render(
      <ApprovalGate requests={SAFE} title={false} onApprove={vi.fn()} onDeny={vi.fn()} />,
    )
    expect(screen.queryByText('Waiting for you')).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Waiting for you' })).toBeInTheDocument()
  })

  it('collapses without deciding anything', async () => {
    const onApprove = vi.fn()
    const onDeny = vi.fn()
    const onDismiss = vi.fn()
    render(
      <ApprovalGate
        requests={SAFE}
        onApprove={onApprove}
        onDeny={onDeny}
        onDismiss={onDismiss}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Collapse' }))
    expect(onDismiss).toHaveBeenCalled()
    expect(onApprove).not.toHaveBeenCalled()
    expect(onDeny).not.toHaveBeenCalled()
  })

  // Putting it away must not make it quiet. The count is ordinary and may be
  // summarised; how many cannot be undone is the exception and is named.
  it('keeps saying what is waiting once it is collapsed', async () => {
    render(
      <ApprovalGate
        requests={[...SAFE, ...DESTRUCTIVE]}
        onApprove={vi.fn()}
        onDeny={vi.fn()}
        onDismiss={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Collapse' }))
    const total = SAFE.length + DESTRUCTIVE.length
    expect(screen.getByText(new RegExp(total + ' requests need your approval'))).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(DESTRUCTIVE.length + ' cannot be undone')),
    ).toBeInTheDocument()
  })

  it('opens again from collapsed', async () => {
    render(
      <ApprovalGate requests={SAFE} onApprove={vi.fn()} onDeny={vi.fn()} onDismiss={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Collapse' }))
    expect(screen.queryByRole('button', { name: /Approve/ })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Show the requests' }))
    expect(screen.getByRole('button', { name: /Approve/ })).toBeInTheDocument()
  })

  it('cannot be collapsed when the host gives no way to', () => {
    render(<ApprovalGate requests={SAFE} onApprove={vi.fn()} onDeny={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Collapse' })).not.toBeInTheDocument()
  })

  // A library cannot know whether it sits under an h1 or an h3, so it injects
  // no heading at all and lets the section landmark carry the name.
  it('puts no heading into the host page outline', () => {
    render(<ApprovalGate requests={SAFE} onApprove={vi.fn()} onDeny={vi.fn()} />)
    expect(screen.queryAllByRole('heading')).toHaveLength(0)
    expect(screen.getByRole('region', { name: 'Waiting for you' })).toBeInTheDocument()
  })
})
