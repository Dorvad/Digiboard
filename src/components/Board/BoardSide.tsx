import NoteCard from './NoteCard'
import type { Note } from '@/types/database'
import { resolveNoteLayout } from '@/lib/noteLayout'

interface BoardSideProps {
  title: string
  notes: Note[]
  alignment: 'right' | 'left'
  onReveal: (id: string) => void
  onClose: (id: string) => void
  newNoteIds: Set<string>
}

export default function BoardSide({ title, notes, alignment, onReveal, onClose, newNoteIds }: BoardSideProps) {
  return (
    <div
      className="board-side"
      style={{ padding: '0 0 32px' }}
    >
      {/* Title */}
      <div
        className="board-side-title"
        style={{ [alignment]: 36 }}
      >
        {title}
        <div className="board-side-title-bar" style={{
          marginLeft: alignment === 'right' ? 'auto' : 0,
          marginRight: alignment === 'left' ? 'auto' : 0,
        }} />
      </div>

      {/* Note canvas — overflow visible so landing animation can start off-screen */}
      <div className="board-side-canvas">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            layout={resolveNoteLayout(note)}
            onReveal={onReveal}
            onClose={onClose}
            isNew={newNoteIds.has(note.id)}
          />
        ))}
      </div>
    </div>
  )
}
