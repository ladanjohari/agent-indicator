import { useEffect, useState } from 'react'
import { StatusIndicator } from '../src'
import type { SessionState } from '../src'

// Two sessions playing on a loop, so the difference between Writing and
// Running a command can be watched rather than argued about.

type Step = { state: SessionState; hold: number }

// A normal task. It writes, it runs a command, it writes again, it finishes.
const HEALTHY: Step[] = [
  { state: 'idle', hold: 2000 },
  { state: 'working', hold: 4000 },
  { state: 'running', hold: 5000 },
  { state: 'working', hold: 3000 },
  { state: 'done', hold: 4000 },
]

// The same task, except the command it started never exits. A dev server, an
// interactive prompt nobody can see, a wedged build. It stays alive and it
// never comes back to ask for anything.
const STUCK: Step[] = [
  { state: 'idle', hold: 2000 },
  { state: 'working', hold: 4000 },
  { state: 'running', hold: 1000 * 60 * 60 },
]

function useScript(steps: Step[]) {
  const [index, setIndex] = useState(0)
  const [enteredAt, setEnteredAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())

  // Move to the next step when this one has had its time.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((current) => (current + 1) % steps.length)
      setEnteredAt(Date.now())
    }, steps[index].hold)
    return () => clearTimeout(timer)
  }, [index, steps])

  // Tick once a second so the elapsed time on screen stays honest.
  useEffect(() => {
    const ticker = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(ticker)
  }, [])

  return {
    state: steps[index].state,
    seconds: Math.floor((now - enteredAt) / 1000),
  }
}

function Row({ name, steps }: { name: string; steps: Step[] }) {
  const { state, seconds } = useScript(steps)

  return (
    <li className="demo-row">
      <StatusIndicator state={state} showLabel />
      <code>{name}</code>
      <span className="demo-elapsed">{seconds}s</span>
    </li>
  )
}

export function SessionDemo() {
  return (
    <ul className="demo-list">
      <Row name="write-docs" steps={HEALTHY} />
      <Row name="dev-server" steps={STUCK} />
    </ul>
  )
}
