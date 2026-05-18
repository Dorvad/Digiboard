import { motion } from 'framer-motion'

interface SuccessStateProps {
  onSubmitAnother?: () => void
}

export default function SuccessState({ onSubmitAnother }: SuccessStateProps) {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 32,
      position: 'relative',
      overflow: 'hidden',
      direction: 'rtl',
    }}>
      {/* Two floating notes */}
      <div style={{ position: 'relative', width: 220, height: 220, marginBottom: 28 }}>
        {/* Note A — הגלוי */}
        <motion.div
          initial={{ rotate: -8, y: 0 }}
          animate={{ rotate: -10, y: [-8, 0, -8] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', left: 24, top: 30,
            width: 92, height: 92,
            background: 'var(--note-yellow)',
            borderRadius: 3,
            boxShadow: '8px 12px 22px -4px rgba(60,40,15,.25)',
          }}
        >
          <div style={{
            position: 'absolute', top: -4, left: '50%', marginLeft: -7,
            width: 14, height: 14, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #ffd5b8, var(--pin-rust) 60%, #5a2a18)',
            boxShadow: '0 2px 3px rgba(0,0,0,.30)',
          }} />
          <div className="hand" style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: 'var(--ink-2)', padding: 12, lineHeight: 1.2,
          }}>
            הגלוי ✓
          </div>
        </motion.div>

        {/* Note B — הנסתר */}
        <motion.div
          initial={{ rotate: 7, y: 0 }}
          animate={{ rotate: 9, y: [0, -8, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', right: 18, top: 60,
            width: 96, height: 96,
            background: 'var(--note-pink)',
            borderRadius: 3,
            boxShadow: '8px 12px 22px -4px rgba(60,40,15,.25)',
          }}
        >
          <div style={{
            position: 'absolute', top: -4, left: '50%', marginLeft: -7,
            width: 14, height: 14, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #c5d4e8, var(--pin-navy) 60%, #15203a)',
            boxShadow: '0 2px 3px rgba(0,0,0,.30)',
          }} />
          <div className="hand" style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: 'var(--ink-2)', padding: 12, lineHeight: 1.2,
          }}>
            הנסתר ✓
          </div>
        </motion.div>

        {/* Sparkles */}
        {([[40, 200, 0], [200, 30, 0.6], [180, 180, 1.2]] as [number, number, number][]).map(
          ([x, y, delay], i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 2.6, delay, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', left: x, top: y,
                width: 8, height: 8,
                background: 'radial-gradient(circle, #f0c060 0 30%, transparent 70%)',
                borderRadius: '50%',
              }}
            />
          )
        )}
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 30,
          margin: '0 0 10px',
          color: 'var(--ink)',
        }}
      >
        הפתקים שלך עלו ללוח
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{
          margin: 0,
          fontFamily: 'var(--font-ui)',
          fontSize: 15,
          color: 'var(--ink-3)',
          lineHeight: 1.5,
          maxWidth: 280,
        }}
      >
        הם ממתינים שם, אנונימיים לחלוטין,<br />עד שנפתח אותם יחד.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        style={{ marginTop: 36, fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--ink-3)' }}
      >
        תודה ✦
      </motion.div>

      {onSubmitAnother && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          onClick={onSubmitAnother}
          style={{
            marginTop: 28,
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            color: 'var(--ink-4)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: '4px 8px',
          }}
        >
          שליחה נוספת
        </motion.button>
      )}
    </div>
  )
}
