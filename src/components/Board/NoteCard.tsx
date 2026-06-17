import { useState, useEffect, useRef } from 'react'
import Pushpin from './Pushpin'
import type { Note } from '@/types/database'
import type { NoteLayout } from '@/lib/noteLayout'

interface NoteCardProps {
  note: Note
  layout: NoteLayout
  onReveal: (id: string) => void
  onClose: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
  scale: number
  isNew?: boolean
}

type FlipPhase = 'flipping' | 'flipping-rev' | null

const FLIP_DURATION = 1200
const DRAG_THRESHOLD = 6 // px in board-space before drag mode kicks in

export default function NoteCard({ note, layout, onReveal, onClose, onMove, scale, isNew = false }: NoteCardProps) {
  const [phase, setPhase] = useState<FlipPhase>(null)
  const [showLanding, setShowLanding] = useState(isNew)
  const [localPos, setLocalPos] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const dragRef = useRef<{ startMouseX: number; startMouseY: number; startNoteX: number; startNoteY: number; moved: boolean } | null>(null)

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setShowLanding(false), 900)
      timers.current.push(t)
    }
    return () => timers.current.forEach(clearTimeout)
  }, [isNew])

  const isOpen = note.status === 'revealed'

  function triggerFlip() {
    if (phase !== null) return
    if (!isOpen) {
      setPhase('flipping')
      const t1 = setTimeout(() => onReveal(note.id), 50)
      const t2 = setTimeout(() => setPhase(null), FLIP_DURATION)
      timers.current.push(t1, t2)
    } else {
      setPhase('flipping-rev')
      const t1 = setTimeout(() => onClose(note.id), 50)
      const t2 = setTimeout(() => setPhase(null), FLIP_DURATION)
      timers.current.push(t1, t2)
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (phase !== null) return
    e.preventDefault()

    const startNoteX = layout.position_x
    const startNoteY = layout.position_y

    dragRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNoteX,
      startNoteY,
      moved: false,
    }

    function onMouseMove(ev: MouseEvent) {
      if (!dragRef.current) return
      const dx = (ev.clientX - dragRef.current.startMouseX) / scale
      const dy = (ev.clientY - dragRef.current.startMouseY) / scale

      if (!dragRef.current.moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
        dragRef.current.moved = true
        setIsDragging(true)
      }

      setLocalPos({
        x: dragRef.current.startNoteX + dx,
        y: dragRef.current.startNoteY + dy,
      })
    }

    function onMouseUp(ev: MouseEvent) {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)

      if (dragRef.current?.moved) {
        const dx = (ev.clientX - dragRef.current.startMouseX) / scale
        const dy = (ev.clientY - dragRef.current.startMouseY) / scale
        const finalX = dragRef.current.startNoteX + dx
        const finalY = dragRef.current.startNoteY + dy
        onMove(note.id, finalX, finalY)
        setLocalPos(null)
        setIsDragging(false)
      } else {
        setLocalPos(null)
        setIsDragging(false)
        triggerFlip()
      }

      dragRef.current = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const showOpen = phase === 'flipping'
    ? true
    : phase === 'flipping-rev'
      ? false
      : isOpen

  const posX = localPos ? localPos.x : layout.position_x
  const posY = localPos ? localPos.y : layout.position_y

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
        left: `${posX}px`,
        top: `${posY}px`,
        transform: `rotate(${layout.rotation}deg)`,
        '--note-bg': layout.color,
        '--note-rot': `${layout.rotation}deg`,
        cursor: phase ? 'default' : isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 100 : undefined,
        transition: isDragging ? 'none' : undefined,
      } as React.CSSProperties}
      onMouseDown={handleMouseDown}
      role="button"
      aria-label={isOpen ? 'סגור פתק' : 'גלה פתק'}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          triggerFlip()
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
