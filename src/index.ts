// The front door of the package.
//
// Anything exported from this file is public: it is what someone gets when they
// write `import { Thing } from 'agent-indicator'`. Anything not exported here is
// private to the library, no matter how many files inside src use it.

export { StatusIndicator } from './components/StatusIndicator/StatusIndicator'
export type { SessionState, StatusIndicatorProps } from './components/StatusIndicator/types'

export { ApprovalGate } from './components/ApprovalGate/ApprovalGate'
export type { ApprovalGateProps, ApprovalRequest } from './components/ApprovalGate/types'

export { SessionStrip } from './components/SessionStrip/SessionStrip'
export type { Session, SessionStripProps } from './components/SessionStrip/types'

export { ActivityTrail } from './components/ActivityTrail/ActivityTrail'
export type { Activity, ActivityKind, ActivityTrailProps } from './components/ActivityTrail/types'
