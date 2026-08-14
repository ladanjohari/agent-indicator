import type { ApprovalGateProps, Reversibility } from '../components/ApprovalGate/types'

/**
 * The narrowest possible description of an AI SDK message.
 *
 * This adapter deliberately does **not** import the `ai` package, not even for
 * types. It reads the shape of a tool part instead of borrowing a definition of
 * it. Three reasons:
 *
 * - Nothing to install. There is no peer dependency to satisfy and nothing
 *   breaks for people who never touch the AI SDK.
 * - No version pin. The SDK renumbers often, and a package that names a version
 *   is a package that goes stale on somebody else's schedule.
 * - TypeScript is structural, so a real `UIMessage[]` is assignable to this
 *   without a cast.
 *
 * The trade is that we validate at runtime rather than trusting a type, which
 * is the correct trade for data arriving from another library.
 */
export interface AgentMessageLike {
  parts?: readonly unknown[]
}

/**
 * How to answer "can this be undone" for one tool.
 *
 * A plain `true` or `false` covers most tools. The function form exists for the
 * ones where the arguments decide, `runCommand` being the obvious case: `ls`
 * and `rm -rf` are the same tool with the same name.
 */
export type ReversibleRule =
  | Reversibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((input: any) => Reversibility)

/**
 * Where the gate learns which actions can be undone.
 *
 * Either a lookup keyed by tool name, or one function asked about everything.
 * A tool that is missing from the map, or a function returning `undefined`,
 * falls through to whatever the tool declared about itself, and then to
 * `'unknown'`. Silence is never read as consent.
 */
export type ReversibleOption =
  | Record<string, ReversibleRule>
  | ((toolName: string, input: unknown) => Reversibility | undefined)

/**
 * How to turn a tool call into the sentence a person actually reads.
 *
 * Without this the gate falls back to the tool's own name, tidied up. That is
 * an honest label rather than a written sentence, which is the right default:
 * a fabricated sentence that sounds considered is worse than a plain one that
 * admits what it is.
 */
export type DescribeOption =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Record<string, (input: any) => string>
  | ((toolName: string, input: unknown) => string | undefined)

export interface ToApprovalRequestsOptions {
  reversible?: ReversibleOption
  describe?: DescribeOption
}

export interface AgentApprovalGateProps
  extends Pick<ApprovalGateProps, 'title' | 'className' | 'onDismiss'>,
    ToApprovalRequestsOptions {
  /** `messages` straight from `useChat`. */
  messages: readonly AgentMessageLike[]
  /** `addToolApprovalResponse` straight from `useChat`. */
  addToolApprovalResponse: (response: { id: string; approved: boolean }) => void
}
