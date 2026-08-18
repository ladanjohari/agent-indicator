import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApprovalGate } from './ApprovalGate'
import { toApprovalRequests } from './toApprovalRequests'
import type { AgentMessageLike } from './types'

// Hand built AI SDK message parts. Shapes taken from the type definitions
// shipped in ai@7, checked rather than remembered, so these tests need no
// model, no server and no network.
function pending(toolName: string, input: unknown, extra: Record<string, unknown> = {}) {
  return {
    type: `tool-${toolName}`,
    toolCallId: `call-${toolName}`,
    state: 'approval-requested',
    input,
    approval: { id: `approval-${toolName}` },
    ...extra,
  }
}

function message(...parts: unknown[]): AgentMessageLike {
  return { parts }
}

describe('toApprovalRequests', () => {
  it('finds what is waiting on a person and names the tool in plain words', () => {
    const requests = toApprovalRequests([
      message({ type: 'text', text: 'One moment' }, pending('deleteFile', { path: 'src/old.ts' })),
    ])

    expect(requests).toEqual([
      {
        id: 'approval-deleteFile',
        consequence: 'Delete file',
        detail: '{"path":"src/old.ts"}',
        reversible: 'unknown',
      },
    ])
  })

  // The rule the whole adapter turns on. Their data has no concept of undoable,
  // so silence must never come out as consent.
  it('defaults to unknown, never to reversible', () => {
    const [request] = toApprovalRequests([message(pending('wireMoney', { amount: 5000 }))])
    expect(request.reversible).toBe('unknown')
  })

  it('ignores anything the SDK already decided on its own', () => {
    const requests = toApprovalRequests([
      message(pending('searchWeb', { q: 'x' }, { approval: { id: 'a', isAutomatic: true } })),
    ])
    expect(requests).toEqual([])
  })

  // There are separate states for answered and denied calls. Matching on "has
  // an approval object" would leave settled requests in the gate forever.
  it('ignores requests that have already been answered', () => {
    const requests = toApprovalRequests([
      message(
        { ...pending('a', {}), state: 'approval-responded', approval: { id: 'x', approved: true } },
        { ...pending('b', {}), state: 'output-denied', approval: { id: 'y', approved: false } },
        { ...pending('c', {}), state: 'output-available', output: 'done' },
        { ...pending('d', {}), state: 'input-streaming' },
      ),
    ])
    expect(requests).toEqual([])
  })

  it('reads tools that were discovered at runtime, not just ones known up front', () => {
    const requests = toApprovalRequests([
      message({
        type: 'dynamic-tool',
        toolName: 'notion_delete_page',
        state: 'approval-requested',
        input: { page: 'Roadmap' },
        approval: { id: 'mcp-1' },
      }),
    ])
    expect(requests[0]).toMatchObject({ id: 'mcp-1', consequence: 'Notion delete page' })
  })

  it('never shows a request nobody could answer', () => {
    const requests = toApprovalRequests([
      message(
        { ...pending('a', {}), approval: {} },
        { ...pending('b', {}), approval: { id: '' } },
        { type: 'tool-', state: 'approval-requested', input: {}, approval: { id: 'z' } },
      ),
    ])
    expect(requests).toEqual([])
  })

  it('counts one approval once, however many times it appears', () => {
    const part = pending('deploy', {})
    const requests = toApprovalRequests([message(part), message(part)])
    expect(requests).toHaveLength(1)
  })

  describe('where reversibility comes from', () => {
    const messages = [message(pending('searchWeb', { q: 'weather' }))]

    it('takes a plain answer from the developer', () => {
      const [request] = toApprovalRequests(messages, { reversible: { searchWeb: true } })
      expect(request.reversible).toBe(true)
    })

    // One tool name, and the arguments decide. `ls` and `rm -rf` are the same
    // tool.
    it('lets the arguments decide when the tool name cannot', () => {
      // Same tool, two calls, so two distinct approvals.
      const run = [
        message(pending('runCommand', { command: 'ls -la' }, { approval: { id: 'one' } })),
        message(pending('runCommand', { command: 'rm -rf build' }, { approval: { id: 'two' } })),
      ]
      const requests = toApprovalRequests(run, {
        reversible: {
          runCommand: (input: { command: string }) => input.command.startsWith('ls'),
        },
      })
      expect(requests.map((request) => request.reversible)).toEqual([true, false])
    })

    it('accepts one function asked about everything', () => {
      const [request] = toApprovalRequests(messages, {
        reversible: (toolName) => toolName.startsWith('search'),
      })
      expect(request.reversible).toBe(true)
    })

    it('reads what the tool declared about itself', () => {
      const declared = [
        message(pending('searchWeb', { q: 'weather' }, { toolMetadata: { reversible: true } })),
      ]
      const [request] = toApprovalRequests(declared)
      expect(request.reversible).toBe(true)
    })

    // The developer owns the app, so they can override a third party tool that
    // is wrong about itself.
    it('lets the developer overrule the tool', () => {
      const declared = [
        message(pending('searchWeb', { q: 'x' }, { toolMetadata: { reversible: true } })),
      ]
      const [request] = toApprovalRequests(declared, { reversible: { searchWeb: false } })
      expect(request.reversible).toBe(false)
    })

    it('refuses a declaration that is not a real boolean', () => {
      const lying = [
        message(pending('searchWeb', {}, { toolMetadata: { reversible: 'true' } })),
      ]
      expect(toApprovalRequests(lying)[0].reversible).toBe('unknown')
    })

    it('cannot be fooled by a tool named after something on Object', () => {
      const sneaky = [message(pending('toString', {}))]
      expect(toApprovalRequests(sneaky, { reversible: {} })[0].reversible).toBe('unknown')
    })

    it('falls through to unknown when a rule declines to answer', () => {
      const [request] = toApprovalRequests(messages, { reversible: () => undefined })
      expect(request.reversible).toBe('unknown')
    })
  })

  it('lets a developer write the sentence themselves', () => {
    const [request] = toApprovalRequests([message(pending('deleteFile', { path: 'src' }))], {
      describe: { deleteFile: (input: { path: string }) => `Deletes everything in ${input.path}` },
    })
    expect(request.consequence).toBe('Deletes everything in src')
  })

  it('survives input it cannot serialise', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular
    const [request] = toApprovalRequests([message(pending('loop', circular))])
    expect(request.detail).toBeUndefined()
    expect(request.consequence).toBe('Loop')
  })

  it('does not fall over on messages that are not shaped like messages', () => {
    expect(toApprovalRequests(undefined)).toEqual([])
    expect(toApprovalRequests([{}, { parts: null }] as unknown as AgentMessageLike[])).toEqual([])
  })
})

describe('ApprovalGate wired to the AI SDK', () => {
  it('sends the answer back with the approval id, not the tool call id', async () => {
    const addToolApprovalResponse = vi.fn()
    render(
      <ApprovalGate
        messages={[message(pending('searchWeb', { q: 'weather' }))]}
        addToolApprovalResponse={addToolApprovalResponse}
        reversible={{ searchWeb: true }}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Approve' }))
    expect(addToolApprovalResponse).toHaveBeenCalledWith({
      id: 'approval-searchWeb',
      approved: true,
    })
  })

  it('sends one response per request when several are cleared together', async () => {
    const addToolApprovalResponse = vi.fn()
    render(
      <ApprovalGate
        messages={[message(pending('searchWeb', {}), pending('readFile', {}))]}
        addToolApprovalResponse={addToolApprovalResponse}
        reversible={{ searchWeb: true, readFile: true }}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Approve all 2' }))
    expect(addToolApprovalResponse.mock.calls.map(([call]) => call.id)).toEqual([
      'approval-searchWeb',
      'approval-readFile',
    ])
  })

  it('reports a refusal rather than silently dropping it', async () => {
    const addToolApprovalResponse = vi.fn()
    render(
      <ApprovalGate
        messages={[message(pending('searchWeb', {}))]}
        addToolApprovalResponse={addToolApprovalResponse}
        reversible={{ searchWeb: true }}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Deny' }))
    expect(addToolApprovalResponse).toHaveBeenCalledWith({
      id: 'approval-searchWeb',
      approved: false,
    })
  })

  // The end to end version of the rule, through real AI SDK shaped data.
  it('will not batch a request nobody has vouched for', async () => {
    const addToolApprovalResponse = vi.fn()
    render(
      <ApprovalGate
        messages={[message(pending('searchWeb', {}), pending('deleteFile', { path: 'src' }))]}
        addToolApprovalResponse={addToolApprovalResponse}
        reversible={{ searchWeb: true }}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Approve' }))
    expect(addToolApprovalResponse).toHaveBeenCalledTimes(1)
    expect(addToolApprovalResponse).toHaveBeenCalledWith({
      id: 'approval-searchWeb',
      approved: true,
    })
    expect(
      screen.getByText('Might not be possible to undo. Review to answer.'),
    ).toBeInTheDocument()
  })

  it('renders nothing at all when there is nothing to answer', () => {
    const { container } = render(
      <ApprovalGate
        messages={[message({ type: 'text', text: 'All done' })]}
        addToolApprovalResponse={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('says so, once, when nobody has declared anything', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { rerender } = render(
      <ApprovalGate
        messages={[message(pending('searchWeb', {}))]}
        addToolApprovalResponse={vi.fn()}
      />,
    )
    rerender(
      <ApprovalGate
        messages={[message(pending('searchWeb', {}), pending('readFile', {}))]}
        addToolApprovalResponse={vi.fn()}
      />,
    )

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('reversible')
    warn.mockRestore()
  })

  it('stays quiet once the developer has answered the question', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <ApprovalGate
        messages={[message(pending('searchWeb', {}))]}
        addToolApprovalResponse={vi.fn()}
        reversible={{ readFile: true }}
      />,
    )
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
