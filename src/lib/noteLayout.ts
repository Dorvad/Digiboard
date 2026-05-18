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

// Board canvas per side: ~680 wide, ~740 tall (accounting for header)
// Note size: 184 × 184px
// Grid: 3 cols × 4 rows = 12 cells per side
const COLS = 3
const ROWS = 4
const SIDE_W = 640
const SIDE_H = 700
const NOTE_W = 184
const NOTE_H = 184
const HEADER_OFFSET = 90

export function generateNoteLayout(noteId: string, sideIndex: number): NoteLayout {
  const hash = hashString(noteId)

  const col = sideIndex % COLS
  const row = Math.floor(sideIndex / COLS)

  const cellW = SIDE_W / COLS
  const cellH = SIDE_H / ROWS

  const maxOffsetX = Math.max(0, cellW - NOTE_W - 8)
  const maxOffsetY = Math.max(0, cellH - NOTE_H - 8)

  const offsetX = seededRandom(hash) * maxOffsetX
  const offsetY = seededRandom(hash + 1) * maxOffsetY

  const position_x = col * cellW + offsetX + 12
  const position_y = row * cellH + offsetY + HEADER_OFFSET

  const rotation = (seededRandom(hash + 2) - 0.5) * 16

  const color = NOTE_COLORS[hash % NOTE_COLORS.length]
  const pin = PIN_TONES[(hash + 3) % PIN_TONES.length]

  return { color, pin, position_x, position_y, rotation }
}

export function resolveNoteLayout(
  note: {
    id: string
    color: string | null
    pin: string | null
    position_x: number | null
    position_y: number | null
    rotation: number | null
  },
  sideIndex: number
): NoteLayout {
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
  return generateNoteLayout(note.id, sideIndex)
}
