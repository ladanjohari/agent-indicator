import { StatusIndicator } from '../src'
import type { SessionState } from '../src'

// The local workbench. Not part of the published package.
//
// Every component gets a panel here first, so you can look at it while you
// build it. The docs site comes later and reuses the same examples.

const ALL_STATES: SessionState[] = [
  'idle',
  'working',
  'running',
  'needsYou',
  'error',
  'done',
]

export function Workbench() {
  return (
    <main className="wb">
      <header className="wb-head">
        <h1>agent-state-ui</h1>
        <p>Local workbench. Save a file and this page updates without reloading.</p>
      </header>

      <section className="wb-panel">
        <h2>StatusIndicator</h2>
        <p className="wb-note">
          Six states. Only Running moves, because only Running is alive without
          progressing. Error is a ring rather than a fill, so it is told apart by
          shape and not by hue.
        </p>

        <ul className="wb-states">
          {ALL_STATES.map((state) => (
            <li key={state}>
              <StatusIndicator state={state} showLabel />
              <code>{state}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="wb-panel">
        <h2>Sizes</h2>
        <p className="wb-note">Dot only, which is how a dense list would use it.</p>
        <div className="wb-row">
          <StatusIndicator state="needsYou" size="sm" />
          <StatusIndicator state="needsYou" size="md" />
          <StatusIndicator state="needsYou" size="lg" />
        </div>
      </section>

      <section className="wb-panel">
        <h2>In a line of text</h2>
        <p className="wb-note">
          The dot sits on the text baseline and takes its size from the type
          around it. <StatusIndicator state="running" showLabel /> is what a
          session looks like inline.
        </p>
      </section>

      <footer className="wb-foot">
        <span>Week 1</span>
        <span>React 19, Vite 8, TypeScript 6</span>
      </footer>
    </main>
  )
}
