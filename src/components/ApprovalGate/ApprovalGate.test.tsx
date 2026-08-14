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

  // Nobody should have to hold a key down for two seconds to use this.
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
    expect(screen.getByText('This cannot be undone. Open it to answer.')).toBeInTheDocument()
  })

  it('dismisses without deciding anything', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: 'Not now' }))
    expect(onDismiss).toHaveBeenCalled()
    expect(onApprove).not.toHaveBeenCalled()
    expect(onDeny).not.toHaveBeenCalled()
  })

  it('cannot be dismissed when the host gives no way to', () => {
    render(<ApprovalGate requests={SAFE} onApprove={vi.fn()} onDeny={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Not now' })).not.toBeInTheDocument()
  })

  // A library cannot know whether it sits under an h1 or an h3, so it injects
  // no heading at all and lets the section landmark carry the name.
  it('puts no heading into the host page outline', () => {
    render(<ApprovalGate requests={SAFE} onApprove={vi.fn()} onDeny={vi.fn()} />)
    expect(screen.queryAllByRole('heading')).toHaveLength(0)
    expect(screen.getByRole('region', { name: 'Waiting for you' })).toBeInTheDocument()
  })
})
