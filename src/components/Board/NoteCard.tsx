import { useState, useEffect, useRef } from 'react'
import Pushpin from './Pushpin'
import type { Note } from '@/types/database'
import type { NoteLayout } from '@/lib/noteLayout'

interface NoteCardProps {
  note: Note
  layout: NoteLayout
  onReveal: (id: string) => void
  onClose: (id: string) => void
  isNew?: boolean
}

type FlipPhase = 'flipping' | 'flipping-rev' | null

const FLIP_DURATION = 1200

export default function NoteCard({ note, layout, onReveal, onClose, isNew = false }: NoteCardProps) {
  const [phase, setPhase] = useState<FlipPhase>(null)
  const [showLanding, setShowLanding] = useState(isNew)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setShowLanding(false), 900)
      timers.current.push(t)
    }
    return () => timers.current.forEach(clearTimeout)
  }, [isNew])

  const isOpen = note.status === 'revealed'

  function handleClick() {
    if (phase !== null) return

    if (!isOpen) {
      // Flip open
      setPhase('flipping')
      const t1 = setTimeout(() => onReveal(note.id), 50)
      const t2 = setTimeout(() => setPhase(null), FLIP_DURATION)
      timers.current.push(t1, t2)
    } else {
      // Flip back closed
      setPhase('flipping-rev')
      const t1 = setTimeout(() => onClose(note.id), 50)
      const t2 = setTimeout(() => setPhase(null), FLIP_DURATION)
      timers.current.push(t1, t2)
    }
  }

  // During forward flip: note is heading to open (show open face after midpoint)
  // During reverse flip: note is heading to closed (show closed face after midpoint)
  // Without animation: just reflect DB status
  const showOpen = phase === 'flipping'
    ? true
    : phase === 'flipping-rev'
      ? false
      : isOpen

  const classes = [
    'note-card',
    showOpen && !phase ? 'note-open' : '',
    phase === 'flipping' ? 'note-flipping' : '',
    phase === 'flipping-rev' ? 'note-flipping-rev' : '',
    showLanding ? 'note-landing' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      style={{
        left: `${layout.position_x}px`,
        top: `${layout.position_y}px`,
        transform: `rotate(${layout.rotation}deg)`,
        '--note-bg': layout.color,
        '--note-rot': `${layout.rotation}deg`,
        cursor: phase ? 'default' : 'pointer',
      } as React.CSSProperties}
      onClick={handleClick}
      role="button"
      aria-label={isOpen ? 'סגור פתק' : 'גלה פתק'}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className="pin">
        <Pushpin tone={layout.pin} noteId={note.id} />
      </div>
      <div className="note-inner">
        <div className="note-face note-front" aria-hidden={showOpen}>
          <div style={{
            position: 'absolute',
            bottom: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-hand)',
            fontSize: 22,
            color: 'rgba(60,40,20,.16)',
            letterSpacing: 4,
          }}>···</div>
        </div>
        <div className="note-face note-back" aria-hidden={!showOpen}>
          <div className="note-back-text">{note.content}</div>
        </div>
      </div>
    </div>
  )
}
