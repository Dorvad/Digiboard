import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface QRModalProps {
  sessionSlug: string
  onClose: () => void
}

export default function QRModal({ sessionSlug, onClose }: QRModalProps) {
  const [copied, setCopied] = useState(false)
  const joinUrl = `${window.location.origin}/join/${sessionSlug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select the text
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} dir="rtl">
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 24,
          margin: '0 0 6px',
          color: 'var(--ink)',
        }}>הצטרפות ללוח</h2>

        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          color: 'var(--ink-3)',
          margin: '0 0 22px',
        }}>
          סרקו את הקוד כדי להוסיף פתקים
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 20,
          padding: 16,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,.08)',
        }}>
          <QRCodeSVG
            value={joinUrl}
            size={320}
            bgColor="#ffffff"
            fgColor="#2a241d"
            level="M"
          />
        </div>

        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          color: 'var(--ink-3)',
          marginBottom: 16,
          wordBreak: 'break-all',
          direction: 'ltr',
          textAlign: 'center',
        }}>
          {joinUrl}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={handleCopy}
            className="btn-primary"
            style={{ width: 'auto', padding: '12px 24px' }}
          >
            {copied ? '✓ הועתק' : 'העתק קישור'}
          </button>
          <button
            onClick={onClose}
            className="btn-cancel"
            style={{ padding: '12px 20px' }}
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  )
}
