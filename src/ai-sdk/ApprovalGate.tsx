import { useEffect, useMemo, useRef } from 'react'
import { ApprovalGate as Gate } from '../components/ApprovalGate/ApprovalGate'
import type { ApprovalRequest } from '../components/ApprovalGate/types'
import { toApprovalRequests } from './toApprovalRequests'
import type { AgentApprovalGateProps } from './types'

// Bundlers replace this expression at build time. Declared locally because this
// package does not depend on Node types, and read through a guard because some
// runtimes have no `process` at all.
declare const process: { env: { NODE_ENV?: string } }

function inDevelopment() {
  try {
    return process.env.NODE_ENV !== 'production'
  } catch {
    return true
  }
}

const ADVICE = `agent-indicator: every approval is being shown as "might not be possible to undo", because nothing has said which of your tools are reversible.

That is the safe answer, but it means all of them, including harmless ones, need the full two second hold. Ceremony on everything is how people learn to stop reading it.

Declare it in either place:

  on the tool     tool({ ..., metadata: { reversible: true } })
  or at the gate  <ApprovalGate reversible={{ searchWeb: true }} ... />

This message is not in production builds.`

/**
 * Warns once, and only when nobody has said anything at all.
 *
 * Deliberately not thrown and not rendered. A library that breaks a build over
 * a default has overstepped, and a library that puts its own scolding on screen
 * has taken over an interface that belongs to somebody else.
 */
function useUndeclaredWarning(requests: ApprovalRequest[], configured: boolean) {
  const warned = useRef(false)

  useEffect(() => {
    if (warned.current || configured || !inDevelopment()) return
    if (requests.length === 0) return
    if (!requests.every((request) => request.reversible === 'unknown')) return

    warned.current = true
    console.warn(ADVICE)
  }, [requests, configured])
}

/**
 * `ApprovalGate`, wired to the AI SDK.
 *
 * The SDK gives developers an `approval-requested` state and no interface at
 * all, and its own cookbook tells them to build the buttons themselves. This is
 * the interface. Hand it `messages` and `addToolApprovalResponse` from
 * `useChat` and it works.
 *
 * ```tsx
 * import { ApprovalGate } from 'agent-indicator/ai-sdk'
 * import 'agent-indicator/styles.css'
 *
 * const { messages, addToolApprovalResponse } = useChat()
 *
 * <ApprovalGate
 *   messages={messages}
 *   addToolApprovalResponse={addToolApprovalResponse}
 *   reversible={{ searchWeb: true, readFile: true }}
 * />
 * ```
 *
 * Renders nothing when there is nothing to answer, so it can sit permanently in
 * a layout without being conditionally mounted.
 */
export function ApprovalGate({
  messages,
  addToolApprovalResponse,
  reversible,
  describe,
  ...rest
}: AgentApprovalGateProps) {
  const requests = useMemo(
    () => toApprovalRequests(messages, { reversible, describe }),
    [messages, reversible, describe],
  )

  useUndeclaredWarning(requests, reversible !== undefined)

  // Reversible requests can arrive together, so an answer can cover several
  // ids. The SDK takes them one at a time.
  const answer = (ids: string[], approved: boolean) => {
    for (const id of ids) addToolApprovalResponse({ id, approved })
  }

  return (
    <Gate
      requests={requests}
      onApprove={(ids) => answer(ids, true)}
      onDeny={(ids) => answer(ids, false)}
      {...rest}
    />
  )
}
