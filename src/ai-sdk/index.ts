// The front door of `agent-indicator/ai-sdk`.
//
// Kept in its own subpath so the main package stays free of anything AI SDK
// shaped. Nobody who imports `agent-indicator` pays for this file, and nobody
// who imports this file has to install anything extra: the adapter reads the
// shape of AI SDK messages rather than importing the library, so there is no
// peer dependency and no version to keep in step.

export { ApprovalGate } from './ApprovalGate'
export { toApprovalRequests } from './toApprovalRequests'
export type {
  AgentApprovalGateProps,
  AgentMessageLike,
  DescribeOption,
  ReversibleOption,
  ReversibleRule,
  ToApprovalRequestsOptions,
} from './types'
export type { ApprovalRequest, Reversibility } from '../components/ApprovalGate/types'
