import { useRef, useState } from 'react'

interface TextNoteFieldProps {
  title: string
  helper: string
  value: string
  onChange: (v: string) => void
  noteColor: string
  pinTone: string
  maxLength?: number
}

export default function TextNoteField({
  title,
  helper,
  value,
  onChange,
  noteColor,
  pinTone,
  maxLength = 150,
}: TextNoteFieldProps) {
  const [_focused, setFocused] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  const count = value.length
  const pct = Math.min(1, count / maxLength)
  const warn = count > maxLength * 0.85

  const pinGradient = `radial-gradient(circle at 35% 30%, rgba(255,210,180,0.9), var(--pin-${pinTone}) 60%, rgba(30,10,0,0.8))`

  return (
    <div style={{ marginBottom: 22, position: 'relative' }}>
      {/* Header row: title chip + counter */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 10,
        padding: '0 6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Mini sticky chip with pin */}
          <span style={{ position: 'relative', display: 'inline-block', width: 22, height: 22 }}>
            <span style={{
              position: 'absolute', inset: 0,
              background: noteColor,
              borderRadius: 4,
              transform: 'rotate(-6deg)',
              boxShadow: '0 2px 4px rgba(60,40,15,.18)',
            }} />
            <span style={{
              position: 'absolute',
              top: -3, left: '50%', marginLeft: -4,
              width: 8, height: 8, borderRadius: '50%',
              background: pinGradient,
              boxShadow: '0 1px 2px rgba(0,0,0,.30)',
            }} />
          </span>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 28,
            margin: 0,
            color: 'var(--ink)',
            letterSpacing: '.3px',
          }}>{title}</h2>
        </div>

        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          fontVariantNumeric: 'tabular-nums',
          color: warn ? '#b25a3a' : 'var(--ink-4)',
          transition: 'color .25s',
        }}>
          {count}/{maxLength}
        </span>
      </div>

      {/* Helper text */}
      <p style={{
        margin: '0 6px 10px',
        fontFamily: 'var(--font-ui)',
        fontSize: 13.5,
        lineHeight: 1.45,
        color: 'var(--ink-3)',
        direction: 'rtl',
      }}>
        {helper}
      </p>

      {/* Field */}
      <div className="field">
        <textarea
          ref={ref}
          value={value}
          onChange={e => onChange(e.target.value.slice(0, maxLength))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=""
          rows={3}
          dir="rtl"
          style={{ paddingBottom: 32 }}
        />

        {/* Progress underline */}
        <div style={{
          position: 'absolute',
          left: 16, right: 16, bottom: 10,
          height: 2,
          background: 'rgba(0,0,0,.05)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${pct * 100}%`,
            background: warn
              ? 'linear-gradient(to left, #b25a3a, #d97f56)'
              : 'linear-gradient(to left, #b89760, #d9b67a)',
            transition: 'width .25s ease, background .25s',
          }} />
        </div>
      </div>
    </div>
  )
}
