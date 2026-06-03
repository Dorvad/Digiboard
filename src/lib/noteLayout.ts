const NOTE_COLORS = [
  'var(--note-cream)',
  'var(--note-yellow)',
  'var(--note-pink)',
  'var(--note-blue)',
  'var(--note-sage)',
  'var(--note-peach)',
  'var(--note-lilac)',
] as const

const PIN_TONES = ['rust', 'brass', 'navy', 'ivory', 'forest'] as const

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export interface NoteLayout {
  color: string
  pin: string
  position_x: number
  position_y: number
  rotation: number
}

// Board canvas per side: ~640 wide, ~700 tall (accounting for header)
// Note size: 184 × 184px
// Grid: 4 cols × 5 rows = 20 cells per side
// Position is derived purely from noteId hash — no race condition possible
const COLS = 4
const ROWS = 5
const SIDE_W = 640
const SIDE_H = 700
const HEADER_OFFSET = 90

export function generateNoteLayout(noteId: string): NoteLayout {
  const hash = hashString(noteId)

  // Derive grid cell purely from hash — immune to concurrent submissions
  const cellIdx = hash % (COLS * ROWS)
  const col = cellIdx % COLS
  const row = Math.floor(cellIdx / COLS)

  const cellW = SIDE_W / COLS  // 160px
  const cellH = SIDE_H / ROWS  // 140px

  // Small jitter within the cell for organic look (note is intentionally larger than cell)
  const jitterX = seededRandom(hash) * 24
  const jitterY = seededRandom(hash + 1) * 20

  const position_x = col * cellW + jitterX + 8
  const position_y = row * cellH + jitterY + HEADER_OFFSET + 4

  const rotation = (seededRandom(hash + 2) - 0.5) * 16

  const color = NOTE_COLORS[hash % NOTE_COLORS.length]
  const pin = PIN_TONES[(hash + 3) % PIN_TONES.length]

  return { color, pin, position_x, position_y, rotation }
}

export function resolveNoteLayout(note: {
  id: string
  color: string | null
  pin: string | null
  position_x: number | null
  position_y: number | null
  rotation: number | null
}): NoteLayout {
  if (
    note.position_x !== null &&
    note.position_y !== null &&
    note.color &&
    note.pin &&
    note.rotation !== null
  ) {
    return {
      color: note.color,
      pin: note.pin,
      position_x: note.position_x,
      position_y: note.position_y,
      rotation: note.rotation,
    }
  }
  return generateNoteLayout(note.id)
}
