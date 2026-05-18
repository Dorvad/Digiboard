interface PushpinProps {
  tone?: string
  noteId: string
}

const PALETTES: Record<string, { head: string; hi: string; sh: string }> = {
  rust:   { head: '#c95a3e', hi: '#ff9276', sh: '#7d2e1c' },
  brass:  { head: '#d4a64c', hi: '#fde0a0', sh: '#7a5a1a' },
  navy:   { head: '#42577a', hi: '#92a8c8', sh: '#1d2a44' },
  ivory:  { head: '#ecdfc1', hi: '#fff6e0', sh: '#a89770' },
  forest: { head: '#4a6e52', hi: '#9bbf99', sh: '#23391f' },
}

export default function Pushpin({ tone = 'rust', noteId }: PushpinProps) {
  const pal = PALETTES[tone] ?? PALETTES.rust
  const gradId = `pin-${noteId.replace(/[^a-z0-9]/gi, '').slice(0, 12)}`

  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id={`${gradId}-needle`} cx=".5" cy="0" r="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#888" />
        </radialGradient>
        <radialGradient id={`${gradId}-head`} cx=".35" cy=".30" r=".75">
          <stop offset="0"   stopColor={pal.hi} />
          <stop offset=".55" stopColor={pal.head} />
          <stop offset="1"   stopColor={pal.sh} />
        </radialGradient>
      </defs>
      {/* needle shadow */}
      <ellipse cx="16" cy="22" rx="2.4" ry=".9" fill="rgba(0,0,0,.30)" />
      {/* needle */}
      <rect x="15.2" y="14" width="1.6" height="8" rx=".8"
        fill={`url(#${gradId}-needle)`} />
      {/* head */}
      <circle cx="16" cy="11.5" r="9" fill={`url(#${gradId}-head)`} />
      {/* specular */}
      <ellipse cx="13" cy="7.5" rx="3.6" ry="2.2" fill="rgba(255,255,255,.55)" />
      <ellipse cx="13" cy="7.5" rx="1.2" ry=".7" fill="rgba(255,255,255,.85)" />
      {/* rim shadow */}
      <circle cx="16" cy="11.5" r="9" fill="none"
        stroke="rgba(0,0,0,.18)" strokeWidth=".5" />
    </svg>
  )
}
