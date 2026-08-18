import { useEffect, useRef } from 'react'
import { ApprovalGate } from '../src'
import type { ApprovalRequest } from '../src'

/**
 * The interaction, legible without touching it.
 *
 * One request at four moments. It used to be four scaled down copies of the
 * whole five request gate, which hid the only part that differs between the
 * frames, so it is deliberately the smallest case: a single thing that cannot
 * be undone.
 *
 * The frames are frozen. `pointerEvents: none` rather than a separate static
 * copy, because a picture of the component is a thing that can drift from the
 * component, and this page has been caught by that once already.
 */
const ONE: ApprovalRequest[] = [
  {
    id: 'charge',
    consequence: 'Charges $200 to the card on file',
    detail: 'annual plan, renews automatically',
    reversible: false,
  },
]

const FRAMES: { caption: string; lead: string; open?: boolean; fill?: number; answered?: boolean }[] = [
  {
    lead: 'Waiting.',
    caption: 'There is no approve control in the page yet. Only a way to open it and read it.',
  },
  {
    lead: 'Opened.',
    caption: 'The approve control appears only now, once the consequence has been read.',
    open: true,
  },
  {
    lead: 'Holding.',
    caption: 'One and a bit seconds. Let go early and it snaps back and nothing happens.',
    open: true,
    fill: 0.55,
  },
  {
    lead: 'Answered.',
    caption: 'Gone, because your app removed it. The gate never claims an outcome it did not see.',
    answered: true,
  },
]

function Frame({ frame }: { frame: (typeof FRAMES)[number] }) {
  const box = useRef<HTMLDivElement>(null)

  // The frames are the real component, driven into each state rather than
  // redrawn as pictures of it. A picture is a thing that can drift, and this
  // page has already shipped one clip that had drifted.
  useEffect(() => {
    const root = box.current
    if (!root) return
    let a = 0
    let b = 0

    // Both steps wait for a paint. StrictMode mounts, runs effects, then
    // unmounts and mounts again with fresh component state, so anything done
    // synchronously in the first pass is thrown away. And the fill does not
    // exist in the DOM until the request is open, which is a render later.
    a = requestAnimationFrame(() => {
      if (frame.open) {
        const reveal = root.querySelector<HTMLButtonElement>('.agent-gate__reveal')
        if (reveal?.getAttribute('aria-expanded') === 'false') reveal.click()
      }

      b = requestAnimationFrame(() => {
        if (frame.fill == null) return
        const fill = root.querySelector<HTMLElement>('.agent-gate__hold-fill')
        if (!fill) return
        // No transition: this frame is a moment, not a movement.
        fill.style.transition = 'none'
        fill.style.clipPath = `inset(0 ${Math.round((1 - frame.fill) * 100)}% 0 0)`
      })
    })

    return () => {
      cancelAnimationFrame(a)
      cancelAnimationFrame(b)
    }
  }, [frame])

  return (
    <div className="strip__stage" ref={box}>
      <ApprovalGate
        requests={frame.answered ? [] : ONE}
        onApprove={() => {}}
        onDeny={() => {}}
      />
      {frame.answered ? <p className="strip__empty">Nothing left waiting.</p> : null}
    </div>
  )
}

export function Filmstrip() {
  return (
    <ol className="strip">
      {FRAMES.map((frame, i) => (
        <li key={frame.lead} className="strip__frame">
          <Frame frame={frame} />
          <p className="strip__caption">
            <b>
              {i + 1}. {frame.lead}
            </b>{' '}
            {frame.caption}
          </p>
        </li>
      ))}
    </ol>
  )
}
