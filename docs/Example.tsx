import type { ReactNode } from 'react'

/**
 * One documented example: the component actually running, with the code that
 * produced it underneath.
 *
 * The example imports the real library, so what is on the page cannot drift
 * from what is in the package.
 *
 * `code` is optional. Some examples sit under a code block that already showed
 * the call, and repeating it under the demo is noise.
 */
export function Example({
  children,
  code,
  note,
}: {
  children: ReactNode
  code?: string
  note?: string
}) {
  return (
    <div className="example">
      {note ? <p className="example__note">{note}</p> : null}
      <div className="example__stage">{children}</div>
      {code ? (
        <pre className="example__code">
          <code>{code}</code>
        </pre>
      ) : null}
    </div>
  )
}
