// The front door of the package.
//
// Anything exported from this file is public: it is what someone gets when they
// write `import { Thing } from 'agent-state-ui'`. Anything not exported here is
// private to the library, no matter how many files inside src use it.

export { StatusIndicator } from './components/StatusIndicator/StatusIndicator'
export type { SessionState, StatusIndicatorProps } from './components/StatusIndicator/types'
