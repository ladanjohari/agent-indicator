import type { ApprovalRequest, Reversibility } from '../components/ApprovalGate/types'
import type {
  AgentMessageLike,
  DescribeOption,
  ReversibleOption,
  ToApprovalRequestsOptions,
} from './types'

/** The one state that means a person still has to answer. */
const AWAITING = 'approval-requested'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Own properties only, so a tool called `toString` cannot inherit a rule. */
function own(source: object, key: string) {
  return Object.prototype.hasOwnProperty.call(source, key)
}

/**
 * Tools known at build time arrive as `tool-deleteFile`. Tools discovered at
 * runtime, which in practice means anything from an MCP server, arrive as
 * `dynamic-tool` with the name in its own field.
 */
function toolNameOf(part: Record<string, unknown>) {
  const type = part.type
  if (typeof type !== 'string') return undefined
  if (type === 'dynamic-tool') {
    return typeof part.toolName === 'string' ? part.toolName : undefined
  }
  return type.startsWith('tool-') ? type.slice(5) : undefined
}

/**
 * A tool part that is genuinely still waiting on a human.
 *
 * Three things get filtered out here, and leaving any of them in would be a
 * bug you would only notice in front of a user:
 *
 * - Anything not in the `approval-requested` state. There are separate states
 *   for answered and denied calls, and an adapter that matched on "has an
 *   approval object" would leave settled requests in the gate forever.
 * - Anything the SDK decided on its own. Those still arrive as parts, and
 *   showing them would ask a person to decide something already decided.
 * - Anything without a usable id, because the id is what the answer is sent
 *   back with, and a request nobody can answer must never be displayed.
 */
function awaitingAnswer(part: unknown) {
  if (!isRecord(part) || part.state !== AWAITING) return undefined

  const approval = part.approval
  if (!isRecord(approval) || approval.isAutomatic === true) return undefined

  const id = approval.id
  if (typeof id !== 'string' || id === '') return undefined

  const toolName = toolNameOf(part)
  if (toolName === undefined || toolName === '') return undefined

  return { id, toolName, input: part.input, metadata: part.toolMetadata }
}

/** `deleteFile` becomes "Delete file". `read_HTML_file` becomes "Read html file". */
function humanise(name: string) {
  const spaced = name
    .replace(/[_-]+/g, ' ')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
  if (spaced === '') return name
  const lower = spaced.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/**
 * The arguments, shown small underneath the sentence.
 *
 * Never shortened. A safety surface that truncates is a safety surface that
 * hides the interesting half of `rm -rf`, and the stylesheet already wraps
 * long values rather than letting them push the layout around.
 */
function detailOf(input: unknown) {
  if (input === undefined || input === null) return undefined
  if (typeof input === 'string') return input === '' ? undefined : input
  try {
    const text = JSON.stringify(input)
    return text === undefined || text === '{}' || text === '[]' ? undefined : text
  } catch {
    // Circular or otherwise unserialisable. Better no detail than a crash.
    return undefined
  }
}

/** Only a real boolean counts. A string "true" is not a declaration. */
function asReversibility(value: unknown): Reversibility | undefined {
  if (value === true || value === false) return value
  if (value === 'unknown') return 'unknown'
  return undefined
}

/**
 * Three places an answer can come from, asked in order.
 *
 * 1. What the developer said at the gate. They own the app, so they can
 *    override a third party tool that is wrong about itself.
 * 2. What the tool declared about itself, via `metadata` on the server, which
 *    the SDK copies onto the part as `toolMetadata`. This is the one that
 *    scales, because the person who wrote the tool is the person who knows.
 * 3. Nobody said, so `'unknown'`.
 *
 * There is no fourth step where something becomes reversible by accident.
 */
function resolveReversible(
  toolName: string,
  input: unknown,
  metadata: unknown,
  option: ReversibleOption | undefined,
): Reversibility {
  if (typeof option === 'function') {
    const answer = asReversibility(option(toolName, input))
    if (answer !== undefined) return answer
  } else if (isRecord(option) && own(option, toolName)) {
    const rule = option[toolName]
    const answer = asReversibility(typeof rule === 'function' ? rule(input) : rule)
    if (answer !== undefined) return answer
  }

  if (isRecord(metadata)) {
    const declared = asReversibility(metadata.reversible)
    if (declared !== undefined) return declared
  }

  return 'unknown'
}

function resolveConsequence(
  toolName: string,
  input: unknown,
  describe: DescribeOption | undefined,
) {
  let written: unknown
  if (typeof describe === 'function') {
    written = describe(toolName, input)
  } else if (isRecord(describe) && own(describe, toolName)) {
    const rule = describe[toolName]
    if (typeof rule === 'function') written = rule(input)
  }
  return typeof written === 'string' && written !== '' ? written : humanise(toolName)
}

/**
 * Turns AI SDK messages into the requests `ApprovalGate` understands.
 *
 * Pure, so it can be tested without a model, a server or a browser. Pass
 * `messages` from `useChat` straight in.
 */
export function toApprovalRequests(
  messages: readonly AgentMessageLike[] | undefined,
  options: ToApprovalRequestsOptions = {},
): ApprovalRequest[] {
  const requests: ApprovalRequest[] = []
  const seen = new Set<string>()

  for (const message of messages ?? []) {
    const parts = isRecord(message) ? message.parts : undefined
    if (!Array.isArray(parts)) continue

    for (const part of parts) {
      const pending = awaitingAnswer(part)
      // One approval is one decision, however many times it appears.
      if (!pending || seen.has(pending.id)) continue
      seen.add(pending.id)

      requests.push({
        id: pending.id,
        consequence: resolveConsequence(pending.toolName, pending.input, options.describe),
        detail: detailOf(pending.input),
        reversible: resolveReversible(
          pending.toolName,
          pending.input,
          pending.metadata,
          options.reversible,
        ),
      })
    }
  }

  return requests
}
