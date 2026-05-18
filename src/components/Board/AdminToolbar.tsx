import type { Session, Note } from '@/types/database'

interface AdminToolbarProps {
  session: Session
  notes: Note[]
  realtimeStatus: 'connected' | 'connecting' | 'error'
  onLockToggle: () => void
  onReset: () => void
  onShowQR: () => void
}

function LiveDot({ status }: { status: 'connected' | 'connecting' | 'error' }) {
  const color = status === 'connected' ? '#7fd09a' : status === 'error' ? '#e07070' : '#e0c060'
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: color,
        animation: status === 'connected' ? 'livePulse 1.8s infinite' : undefined,
        display: 'block',
      }} />
    </span>
  )
}

export default function AdminToolbar({
  session,
  notes,
  realtimeStatus,
  onLockToggle,
  onReset,
  onShowQR,
}: AdminToolbarProps) {
  const total = notes.length
  const opened = notes.filter(n => n.status === 'revealed').length
  const closed = total - opened

  return (
    <div style={{
      position: 'absolute',
      bottom: 22,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      zIndex: 10,
    }}>
      {/* Live status */}
      <div className="tool-chip no-select">
        <LiveDot status={realtimeStatus} />
        <span style={{ opacity: .85 }}>
          {realtimeStatus === 'connected' ? 'שידור חי' : realtimeStatus === 'error' ? 'שגיאת חיבור' : 'מתחבר...'}
        </span>
      </div>

      {/* Note counts */}
      <div className="tool-chip no-select" style={{ gap: 14 }}>
        <span>
          <b style={{ color: '#fff7e0', fontWeight: 700 }}>{total}</b>
          <span style={{ opacity: .6, marginInlineStart: 6 }}>פתקים</span>
        </span>
        <span style={{ width: 1, height: 16, background: 'rgba(255,220,170,.18)', display: 'inline-block' }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span className="tool-dot" style={{ background: '#e6c674' }} />
          <span style={{ opacity: .75 }}>{closed} סגורים</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span className="tool-dot" style={{ background: '#7fd09a' }} />
          <span style={{ opacity: .75 }}>{opened} גלויים</span>
        </span>
      </div>

      {/* QR code */}
      <button onClick={onShowQR} className="tool-chip" aria-label="הצג קוד QR">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="#f4ead4" strokeWidth="1.8" />
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="#f4ead4" strokeWidth="1.8" />
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="#f4ead4" strokeWidth="1.8" />
          <rect x="14" y="14" width="3" height="3" fill="#f4ead4" />
          <rect x="18" y="14" width="3" height="3" fill="#f4ead4" />
          <rect x="14" y="18" width="3" height="3" fill="#f4ead4" />
          <rect x="18" y="18" width="3" height="3" fill="#f4ead4" />
        </svg>
        <span style={{ opacity: .85 }}>קישור הצטרפות</span>
      </button>

      {/* Lock / Unlock */}
      <button
        onClick={onLockToggle}
        className="tool-chip"
        aria-label={session.is_locked ? 'פתח לוח' : 'נעל לוח'}
        style={{ background: session.is_locked ? 'rgba(80,30,10,.65)' : undefined }}
      >
        {session.is_locked ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="#f4ead4" strokeWidth="1.8" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#f4ead4" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill="#f4ead4" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="#f4ead4" strokeWidth="1.8" />
            <path d="M8 11V7a4 4 0 0 1 8 0" stroke="#f4ead4" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
        <span style={{ opacity: .85 }}>
          {session.is_locked ? 'פתח שליחה' : 'נעל שליחה'}
        </span>
      </button>

      {/* Reset */}
      <button onClick={onReset} className="tool-chip" aria-label="איפוס לוח">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"
            stroke="#f4ead4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ opacity: .85 }}>איפוס לוח</span>
      </button>
    </div>
  )
}
