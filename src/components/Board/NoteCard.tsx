import { useState, useEffect, useRef } from 'react'
import Pushpin from './Pushpin'
import type { Note } from '@/types/database'
import type { NoteLayout } from '@/lib/noteLayout'

interface NoteCardProps {
  note: Note
  layout: NoteLayout
  onReveal: (id: string) => void
  isNew?: boolean
}

type FlipPhase = 'flipping' | null

export default function NoteCard({ note, layout, onReveal, isNew = false }: NoteCardProps) {
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
    if (isOpen || phase !== null) return

    setPhase('flipping')
    // Persist reveal at the start of the flip
    const t1 = setTimeout(() => onReveal(note.id), 50)
    const t2 = setTimeout(() => setPhase(null), 1100)
    timers.current.push(t1, t2)
  }

  const classes = [
    'note-card',
    isOpen && !phase ? 'note-open' : '',
    phase === 'flipping' ? 'note-flipping' : '',
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
      } as React.CSSProperties}
      onClick={handleClick}
      role={isOpen ? undefined : 'button'}
      aria-label={isOpen ? undefined : 'גלה פתק'}
      tabIndex={isOpen ? undefined : 0}
      onKeyDown={e => {
        if (!isOpen && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className="pin">
        <Pushpin tone={layout.pin} noteId={note.id} />
      </div>
      <div className="note-inner">
        <div className="note-face note-front" aria-hidden={isOpen}>
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
        <div className="note-face note-back" aria-hidden={!isOpen}>
          <div className="note-back-text">{note.content}</div>
        </div>
      </div>
    </div>
  )
}
