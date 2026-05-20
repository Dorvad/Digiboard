import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { upsertSession, fetchNotes, revealNote, closeNote, deleteAllNotes, toggleSessionLock } from '@/lib/session'
import type { Session, Note } from '@/types/database'
import BoardSide from './BoardSide'
import AdminToolbar from './AdminToolbar'
import QRModal from './QRModal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import LoadingState from '@/components/shared/LoadingState'
import ErrorState from '@/components/shared/ErrorState'

type RealtimeStatus = 'connecting' | 'connected' | 'error'

export default function CorkBoard() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<Session | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [newNoteIds, setNewNoteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting')
  const [showQR, setShowQR] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [scale, setScale] = useState(1)

  // Viewport scaling
  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / 1440
      const scaleY = window.innerHeight / 880
      setScale(Math.min(scaleX, scaleY))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Load session + notes
  const loadData = useCallback(async () => {
    if (!sessionId) return
    try {
      setLoading(true)
      setError(null)
      const s = await upsertSession(sessionId)
      setSession(s)
      const n = await fetchNotes(s.id)
      setNotes(n)
    } catch (e) {
      setError('שגיאה בטעינת הלוח. בדוק את חיבור Supabase.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Realtime subscription
  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel(`board-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          filter: `session_id=eq.${session.id}`,
        },
        payload => {
          const newNote = payload.new as Note
          setNotes(prev => {
            if (prev.some(n => n.id === newNote.id)) return prev
            return [...prev, newNote]
          })
          setNewNoteIds(prev => {
            const next = new Set(prev)
            next.add(newNote.id)
            // Remove from new after animation
            setTimeout(() => {
              setNewNoteIds(s => {
                const n = new Set(s)
                n.delete(newNote.id)
                return n
              })
            }, 1000)
            return next
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `session_id=eq.${session.id}`,
        },
        payload => {
          const updated = payload.new as Note
          setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notes',
          filter: `session_id=eq.${session.id}`,
        },
        payload => {
          const deleted = payload.old as { id: string }
          if (deleted?.id) {
            setNotes(prev => prev.filter(n => n.id !== deleted.id))
          } else {
            // Fallback: refetch if we don't get the id
            fetchNotes(session.id).then(setNotes)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${session.id}`,
        },
        payload => {
          setSession(payload.new as Session)
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected')
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setRealtimeStatus('error')
        else setRealtimeStatus('connecting')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.id])

  const handleReveal = useCallback(async (noteId: string) => {
    setNotes(prev => prev.map(n =>
      n.id === noteId ? { ...n, status: 'revealed', revealed_at: new Date().toISOString() } : n
    ))
    try {
      await revealNote(noteId)
    } catch (e) {
      console.error('Failed to reveal note:', e)
    }
  }, [])

  const handleClose = useCallback(async (noteId: string) => {
    setNotes(prev => prev.map(n =>
      n.id === noteId ? { ...n, status: 'closed', revealed_at: null } : n
    ))
    try {
      await closeNote(noteId)
    } catch (e) {
      console.error('Failed to close note:', e)
    }
  }, [])

  const handleReset = useCallback(async () => {
    if (!session) return
    setShowConfirm(false)
    try {
      await deleteAllNotes(session.id)
      setNotes([])
    } catch (e) {
      console.error('Failed to reset board:', e)
    }
  }, [session])

  const handleLockToggle = useCallback(async () => {
    if (!session) return
    try {
      await toggleSessionLock(session.id, !session.is_locked)
      setSession(prev => prev ? { ...prev, is_locked: !prev.is_locked } : prev)
    } catch (e) {
      console.error('Failed to toggle lock:', e)
    }
  }, [session])

  const visibleNotes = notes.filter(n => n.type === 'visible')
  const hiddenNotes = notes.filter(n => n.type === 'hidden')

  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <LoadingState message="טוען את הלוח..." />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <ErrorState message={error ?? 'שגיאה בטעינת הסשן'} onRetry={loadData} />
      </div>
    )
  }

  return (
    <>
      {/* Full-viewport wrapper — centers the scaled board */}
      <div style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        background: '#1a100a',
      }}>
        {/* Cork frame — always 1440×880, scaled to viewport */}
        <div
          className="cork-frame no-select"
          style={{
            width: 1440,
            height: 880,
            flexShrink: 0,
            transformOrigin: 'center center',
            transform: `scale(${scale})`,
            position: 'relative',
          }}
        >
          <div
            className="cork-inner cork-surface"
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            {/* Projector header */}
            <div style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 14,
              alignItems: 'center',
              zIndex: 5,
              padding: '8px 18px 8px 14px',
              background: 'rgba(20,12,5,.45)',
              backdropFilter: 'blur(14px) saturate(140%)',
              WebkitBackdropFilter: 'blur(14px) saturate(140%)',
              border: '1px solid rgba(255,220,170,.10)',
              borderRadius: 999,
              color: '#f4ead4',
              boxShadow: '0 10px 24px -10px rgba(0,0,0,.55), 0 1px 0 rgba(255,220,170,.08) inset',
              direction: 'rtl',
              whiteSpace: 'nowrap',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#f4ead4" strokeWidth="1.5" strokeDasharray="3 4" />
                <circle cx="12" cy="12" r="2.4" fill="#c95a3e" />
              </svg>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: 18,
                letterSpacing: '.4px',
              }}>
                לוח השעם הדיגיטלי
              </div>
              <div style={{ width: 1, height: 18, background: 'rgba(255,220,170,.20)' }} />
              {/* NGG logo */}
              <div style={{
                background: 'rgba(255,255,255,0.10)',
                borderRadius: 6,
                padding: '2px 7px',
                display: 'flex',
                alignItems: 'center',
              }}>
                <img
                  src="/ngg-logo.png"
                  alt="NGG"
                  style={{ height: 26, display: 'block' }}
                />
              </div>
            </div>

            {/* Board layout */}
            <div className="board-layout" dir="rtl">
              {/* Right side: הצלחה (visible) */}
              <BoardSide
                title="הצלחה"
                notes={visibleNotes}
                alignment="right"
                onReveal={handleReveal}
                onClose={handleClose}
                newNoteIds={newNoteIds}
              />

              {/* Center divider */}
              <div className="shimmer-line" />

              {/* Left side: פלונטר (hidden) */}
              <BoardSide
                title="פלונטר"
                notes={hiddenNotes}
                alignment="left"
                onReveal={handleReveal}
                onClose={handleClose}
                newNoteIds={newNoteIds}
              />
            </div>

            {/* Empty state */}
            {notes.length === 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
                direction: 'rtl',
              }}>
                <div style={{
                  fontFamily: 'var(--font-hand)',
                  fontSize: 28,
                  color: 'rgba(255,235,200,.35)',
                  lineHeight: 1.6,
                }}>
                  ממתין לפתקים...
                </div>
              </div>
            )}

            {/* Admin toolbar */}
            <AdminToolbar
              session={session}
              notes={notes}
              realtimeStatus={realtimeStatus}
              onLockToggle={handleLockToggle}
              onReset={() => setShowConfirm(true)}
              onShowQR={() => setShowQR(true)}
            />
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <QRModal
          sessionSlug={session.slug}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* Reset confirmation */}
      {showConfirm && (
        <ConfirmDialog
          title="איפוס הלוח"
          message="כל הפתקים יימחקו לצמיתות. אין אפשרות לבטל פעולה זו."
          confirmLabel="מחק הכל"
          onConfirm={handleReset}
          onCancel={() => setShowConfirm(false)}
          danger
        />
      )}
    </>
  )
}
