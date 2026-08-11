import type { ReactNode } from 'react'

/**
 * One documented example: the component actually running, with the code that
 * produced it underneath.
 *
 * The example imports the real library, so what is on the page cannot drift
 * from what is in the package.
 */
export function Example({
  children,
  code,
  note,
}: {
  children: ReactNode
  code: string
  note?: string
}) {
  return (
    <div className="example">
      {note ? <p className="example__note">{note}</p> : null}
      <div className="example__stage">{children}</div>
      <pre className="example__code">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export interface PropRow {
  name: string
  type: string
  required?: boolean
  description: string
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="props">
      <table className="props__table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
                {row.required ? <span className="props__required">required</span> : null}
              </td>
              <td>
                <code className="props__type">{row.type}</code>
              </td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Locked({ items }: { items: string[] }) {
  return (
    <div className="locked">
      <p className="locked__title">Not configurable, on purpose</p>
      <ul className="locked__list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
