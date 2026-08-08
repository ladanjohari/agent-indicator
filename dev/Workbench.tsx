// The local workbench. Not part of the published package.
//
// Every component gets a panel here first, so you can look at it while you
// build it. The docs site comes later and reuses the same examples.
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
          Nothing here yet. This panel fills in once the component exists.
        </p>
      </section>

      <footer className="wb-foot">
        <span>Week 1</span>
        <span>React 19, Vite 8, TypeScript 6</span>
      </footer>
    </main>
  )
}
