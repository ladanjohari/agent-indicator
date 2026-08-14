import { useEffect, useRef, useState } from 'react'

/**
 * Whether the person has asked for less motion.
 *
 * Defaults to false so that the common case renders correctly on the first
 * paint, then corrects itself after mounting. Guarded because test
 * environments do not implement matchMedia.
 */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Approving something that cannot be undone, by holding rather than clicking.
 *
 * A click is the same motion that cleared the reversible requests a moment
 * earlier. A hold is not: it is continuous, it cannot be produced by a stray
 * press, and it costs about as long as it takes to read the line you are
 * agreeing to. Apple reaches for the same idea when an action must not happen
 * by accident, which is why Apple Pay wants a double click of the side button
 * rather than a tap.
 *
 * Timings are deliberate and come from two different rules:
 *
 * - The fill takes 2 seconds and is **linear**, because it maps to real
 *   elapsed time and easing would misrepresent how much is left. This is the
 *   person deciding, so it is slow.
 * - The release takes 200ms and eases out. This is the system responding, so
 *   it is fast. Everything else in this library stays under 300ms for the same
 *   reason.
 *
 * Nobody is required to hold anything:
 *
 * - **Keyboard** confirms on Enter or Space, with no hold. Reaching this
 *   control already took a deliberate act, because the request had to be
 *   opened first, so the separation still holds without demanding that someone
 *   keep a key down for two seconds.
 * - **Reduce Motion** falls back to a plain button for the same reason.
 */
export function HoldToConfirm({ onConfirm }: { onConfirm: () => void }) {
  const reducedMotion = usePrefersReducedMotion()
  const [pressing, setPressing] = useState(false)
  // The transition end handler needs the current value, not the one captured
  // when the handler was created.
  const pressingNow = useRef(false)

  const release = () => {
    pressingNow.current = false
    setPressing(false)
  }

  if (reducedMotion) {
    return (
      <button type="button" className="agent-gate__approve-one" onClick={onConfirm}>
        Approve this one
      </button>
    )
  }

  return (
    <button
      type="button"
      className="agent-gate__hold"
      data-pressing={pressing ? 'true' : undefined}
      onPointerDown={(event) => {
        // Primary button only. A right click must never start this.
        if (event.button !== 0) return
        // Capture keeps the hold alive if the pointer slides off the button.
        // Losing capture should degrade the hold, never break it, so a missing
        // or unhappy implementation is swallowed rather than thrown.
        try {
          event.currentTarget.setPointerCapture?.(event.pointerId)
        } catch {
          // No capture available. The hold still works while the pointer stays
          // on the control.
        }
        pressingNow.current = true
        setPressing(true)
      }}
      onPointerUp={release}
      onPointerCancel={release}
      // A long press on touch would otherwise raise the system context menu
      // in the middle of the hold.
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onConfirm()
        }
      }}
    >
      <span
        className="agent-gate__hold-fill"
        aria-hidden="true"
        onTransitionEnd={(event) => {
          // Only the fill reaching the far side counts. The 200ms retreat after
          // an early release fires this too, and is ignored because the pointer
          // is no longer down.
          if (event.propertyName === 'clip-path' && pressingNow.current) {
            release()
            onConfirm()
          }
        }}
      />
      <span className="agent-gate__hold-label">Hold to approve</span>
    </button>
  )
}
