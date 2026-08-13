import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { VCardPhoneContent } from '../../pages/admin/card-management/TemplateBuilderPage'

export interface ScrollingVCardHandle {
  toggle: () => void
  pause: () => void
  resume: () => void
}

interface ScrollingVCardProps {
  sections: unknown
  centres?: unknown
  heightClass?: string
  widthClass?: string
  className?: string
  onStateChange?: (active: boolean) => void
  protection?: { enabled: boolean; password: string; hint: string; sections: string[] }
}

/* Auto-scrolling phone preview.
 *
 * Behavior:
 *  - Does NOT scroll on open — it starts paused.
 *  - Desktop: hovering the card starts the scroll, moving the mouse off pauses it.
 *  - Mobile: tapping the card toggles scroll on/off; pressing and holding pauses it.
 *  - The card scrolls through every section, stops on the last one (holding it on
 *    screen), then jumps straight back to the top — it never keeps scrolling to
 *    reveal the top again.
 *  - Uses a real scroll container so the Share/Exchange/Redeem tabs (rendered by
 *    VCardPhoneContent) can jump straight to a centre, which pauses the auto-scroll.
 */
export default forwardRef<ScrollingVCardHandle, ScrollingVCardProps>(function ScrollingVCard(
  { sections, centres, heightClass = 'h-[70vh]', widthClass = 'w-[300px] sm:w-[340px]', className = '', onStateChange, protection },
  ref
) {
  const [active, setActive] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const hoveredRef = useRef(false)
  const manualPauseRef = useRef(false)
  const holdTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    onStateChange?.(active)
  }, [active, onStateChange])

  /* Pause auto-scroll whenever a Share/Exchange/Redeem tab is used. */
  useEffect(() => {
    const onJump = () => {
      manualPauseRef.current = true
      setActive(false)
    }
    window.addEventListener('vcard-jump', onJump)
    return () => window.removeEventListener('vcard-jump', onJump)
  }, [])

  /* Real auto-scroll loop: scroll to the bottom, hold there, jump back to top. */
  useEffect(() => {
    if (!active) return
    const el = scrollerRef.current
    if (!el) return
    let raf = 0
    let hold = 0
    let prev = performance.now()
    const step = (now: number) => {
      const max = el.scrollHeight - el.clientHeight
      if (max > 0) {
        const dur = Math.min(45, Math.max(10, Math.round(max / 45)))
        const pxPerSec = max / dur
        const dt = Math.min(64, now - prev)
        prev = now
        if (el.scrollTop >= max - 1) {
          hold += dt
          if (hold >= 1800) {
            el.scrollTop = 0
            hold = 0
          }
        } else {
          el.scrollTop = Math.min(max, el.scrollTop + (pxPerSec * dt) / 1000)
        }
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [active])

  const setScrolling = (val: boolean) => {
    manualPauseRef.current = false
    setActive(val)
  }

  const handleEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    hoveredRef.current = true
    if (!manualPauseRef.current) setActive(true)
  }

  const handleLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    hoveredRef.current = false
    manualPauseRef.current = false
    setActive(false)
  }

  const handleClick = () => {
    if (hoveredRef.current) {
      manualPauseRef.current = !manualPauseRef.current
      setActive(!manualPauseRef.current)
    } else {
      setActive(a => !a)
    }
  }

  const handleHoldStart = () => {
    window.clearTimeout(holdTimerRef.current)
    holdTimerRef.current = window.setTimeout(() => {
      manualPauseRef.current = true
      setActive(false)
    }, 450)
  }
  const handleHoldEnd = () => window.clearTimeout(holdTimerRef.current)

  useImperativeHandle(ref, () => ({
    toggle: () => handleClick(),
    pause: () => setScrolling(false),
    resume: () => setScrolling(true),
  }), [])

  return (
    <div className={`rounded-[32px] border-[8px] border-gray-900 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden ${className}`}>
      <div
        ref={viewportRef}
        className={`${heightClass} ${widthClass} overflow-hidden relative bg-gray-50 dark:bg-gray-900 cursor-pointer`}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onClick={handleClick}
        onContextMenu={e => { e.preventDefault(); manualPauseRef.current = true; setActive(false) }}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
        onTouchMove={handleHoldEnd}
      >
        <div ref={scrollerRef} className="h-full overflow-y-auto scrollbar-hide overscroll-contain">
          <VCardPhoneContent sections={sections as never} centres={centres as never} protection={protection} />
        </div>
        <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-black/50 text-white text-[9px]">
            {active ? 'Auto-scrolling — click to pause' : 'Hover or tap to scroll'}
          </span>
        </div>
      </div>
    </div>
  )
})
