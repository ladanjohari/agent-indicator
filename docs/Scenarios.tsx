import { useState } from 'react'
import { ApprovalGate } from '../src'
import type { ApprovalRequest } from '../src'

/**
 * Three situations, one component.
 *
 * The categories are not invented. Vercel's own tool approval documentation
 * says a tool needs approval when it can modify data, spend money, execute
 * code, send messages or access private data. Three of those are here, in three
 * different products, because the page used to show nothing but git commands
 * and told anyone outside a coding agent that this was not for them.
 *
 * Each scenario is deliberately a mixed pair: one thing that can be undone and
 * one that cannot. That is the whole argument in miniature, and it is what the
 * SDK cannot express on its own.
 */
interface Scenario {
  id: string
  label: string
  who: string
  requests: ApprovalRequest[]
}

const SCENARIOS: Scenario[] = [
  {
    id: 'money',
    label: 'Spends money',
    who: 'A support agent working a refund queue.',
    requests: [
      {
        id: 'read-order',
        consequence: 'Reads the order and the refund policy',
        detail: 'GET /orders/4473',
        reversible: true,
      },
      {
        id: 'refund',
        consequence: 'Refunds $240 to the customer',
        detail: 'outside the 30 day window',
        reversible: false,
      },
    ],
  },
  {
    id: 'send',
    label: 'Sends messages',
    who: 'A lifecycle agent preparing a launch.',
    requests: [
      {
        id: 'draft',
        consequence: 'Drafts the announcement',
        detail: 'saved as a draft, nothing sent',
        reversible: true,
      },
      {
        id: 'send',
        consequence: 'Sends it to 412 customers',
        detail: 'cannot be recalled once it is sent',
        reversible: false,
      },
    ],
  },
  {
    id: 'private',
    label: 'Reads private data',
    who: 'An analytics agent answering a question about churn.',
    requests: [
      {
        id: 'lookup',
        consequence: "Looks up one customer's plan",
        detail: 'GET /customers/8812',
        reversible: true,
      },
      {
        id: 'export',
        consequence: 'Exports 2,400 customer records to CSV',
        detail: 'includes email and billing address',
        reversible: false,
      },
    ],
  },
]

export function Scenarios() {
  const [chosen, setChosen] = useState(SCENARIOS[0].id)
  // Keyed on the scenario so switching resets the gate rather than leaving a
  // request open from the situation before.
  const scenario = SCENARIOS.find((s) => s.id === chosen) ?? SCENARIOS[0]

  return (
    <div className="scenarios">
      <div className="scenarios__picker" role="group" aria-label="Choose a situation">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="scenarios__chip"
            aria-pressed={s.id === chosen}
            onClick={() => setChosen(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="scenarios__who">{scenario.who}</p>

      <div className="scenarios__stage">
        <ApprovalGate
          key={scenario.id}
          requests={scenario.requests}
          onApprove={() => {}}
          onDeny={() => {}}
          title={false}
        />
      </div>
    </div>
  )
}
