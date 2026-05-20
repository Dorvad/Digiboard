import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { insertNote } from '@/lib/session'
import { generateNoteLayout } from '@/lib/noteLayout'
import type { Session } from '@/types/database'
import TextNoteField from './TextNoteField'
import SuccessState from './SuccessState'

const STORAGE_KEY = (slug: string) => `digiboard-submitted-${slug}`

export default function ParticipantForm() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<Session | null>(null)
  const [visible, setVisible] = useState('')
  const [hidden, setHidden] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [hasLocalSubmit, setHasLocalSubmit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingSession, setLoadingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load session and check local storage
  useEffect(() => {
    if (!sessionId) return

    if (localStorage.getItem(STORAGE_KEY(sessionId))) {
      setHasLocalSubmit(true)
    }

    const loadSession = async () => {
      try {
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('slug', sessionId)
          .single()
        setSession(data)
      } catch {
        // Session might not exist yet — that's fine
      } finally {
        setLoadingSession(false)
      }
    }

    loadSession()
  }, [sessionId])

  // Subscribe to session lock updates
  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel(`join-session-${session.id}`)
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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.id])

  const canSend = visible.trim().length > 0 || hidden.trim().length > 0

  const handleSubmit = async () => {
    if (!canSend || !session || loading) return
    setLoading(true)
    setError(null)

    try {
      const visibleNotes = session ? (await supabase.from('notes').select('id').eq('session_id', session.id).eq('type', 'visible')).data?.length ?? 0 : 0
      const hiddenNotes = session ? (await supabase.from('notes').select('id').eq('session_id', session.id).eq('type', 'hidden')).data?.length ?? 0 : 0

      if (visible.trim()) {
        const id = crypto.randomUUID()
        const layout = generateNoteLayout(id, visibleNotes)
        await insertNote({
          id,
          session_id: session.id,
          type: 'visible',
          content: visible.trim(),
          ...layout,
        })
      }

      if (hidden.trim()) {
        const id = crypto.randomUUID()
        const layout = generateNoteLayout(id, hiddenNotes)
        await insertNote({
          id,
          session_id: session.id,
          type: 'hidden',
          content: hidden.trim(),
          ...layout,
        })
      }

      if (sessionId) {
        localStorage.setItem(STORAGE_KEY(sessionId), 'true')
      }
      setSubmitted(true)
    } catch (e) {
      setError('שגיאה בשליחה. אנא נסה שוב.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnother = () => {
    if (sessionId) localStorage.removeItem(STORAGE_KEY(sessionId))
    setHasLocalSubmit(false)
    setSubmitted(false)
    setVisible('')
    setHidden('')
    setError(null)
  }

  // Success state
  if (submitted) {
    return (
      <div className="mobile-bg" dir="rtl" style={{ minHeight: '100vh' }}>
        <SuccessState onSubmitAnother={handleSubmitAnother} />
      </div>
    )
  }

  // Board locked
  if (session?.is_locked && !hasLocalSubmit) {
    return (
      <div className="mobile-bg locked-overlay" dir="rtl">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 500,
          color: 'var(--ink)',
          margin: '0 0 12px',
        }}>
          השליחה ללוח נעולה כרגע
        </h2>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 15,
          color: 'var(--ink-3)',
          maxWidth: 280,
        }}>
          המנחה ינעל ויפתח את הלוח. ממתין...
        </p>
      </div>
    )
  }

  // Already submitted — show override option
  if (hasLocalSubmit && !submitted) {
    return (
      <div className="mobile-bg" dir="rtl" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 24,
          fontWeight: 500,
          color: 'var(--ink)',
          margin: '0 0 10px',
        }}>
          כבר שלחת פתקים
        </h2>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 14,
          color: 'var(--ink-3)',
          margin: '0 0 24px',
          maxWidth: 280,
        }}>
          הפתקים שלך כבר על הלוח, ממתינים לגילוי.
        </p>
        <button
          onClick={handleSubmitAnother}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            color: 'var(--ink-3)',
            background: 'transparent',
            border: '1px solid var(--line)',
            borderRadius: 999,
            padding: '10px 22px',
            cursor: 'pointer',
          }}
        >
          שליחה נוספת בכל זאת
        </button>
      </div>
    )
  }

  return (
    <div className="mobile-bg" dir="rtl" style={{ minHeight: '100vh' }}>
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 24px 28px',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 22, marginTop: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-ui)',
            fontSize: 11.5,
            color: 'var(--ink-4)',
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: session?.is_locked ? '#e07070' : '#7fb98a',
              boxShadow: session?.is_locked ? 'none' : '0 0 0 3px rgba(127,185,138,.18)',
            }} />
            <span>{session?.is_locked ? 'הלוח נעול' : 'סבב פתוח · אנונימי'}</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 34,
            margin: '0 0 8px',
            color: 'var(--ink)',
            lineHeight: 1.05,
            letterSpacing: '.3px',
          }}>
            {loadingSession ? '...' : 'לוח השעם הדיגיטלי'}
          </h1>

          <p style={{
            margin: 0,
            fontFamily: 'var(--font-ui)',
            fontSize: 14.5,
            color: 'var(--ink-3)',
            lineHeight: 1.5,
          }}>
            הוסיפו פתקים קצרים, אנונימיים — מה שמצליח ומה שפחות. הם יעלו ללוח בחדר.
          </p>
        </div>

        {/* Fields */}
        <TextNoteField
          title="הצלחה"
          helper="משהו אחד קטן שהצלחתי ליישם או לבדוק מאז המפגש הקודם"
          value={visible}
          onChange={setVisible}
          noteColor="var(--note-cream)"
          pinTone="rust"
        />

        <TextNoteField
          title="פלונטר"
          helper="הפרעה או פדיחה מהחודש האחרון (שינוי ברגע האחרון, כיבוי שריפות, משהו שלא עבד)"
          value={hidden}
          onChange={setHidden}
          noteColor="var(--note-pink)"
          pinTone="navy"
        />

        <div style={{ flex: 1 }} />

        {error && (
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            color: '#b94040',
            textAlign: 'center',
            margin: '0 0 12px',
          }}>
            {error}
          </p>
        )}

        <button
          className="btn-primary"
          disabled={!canSend || loading || session?.is_locked}
          onClick={handleSubmit}
        >
          {loading ? 'שולח...' : 'שלח/י'}
          {!loading && (
            <span className="hand" style={{ marginInlineStart: 10, opacity: .7, fontSize: 19 }}>↩</span>
          )}
        </button>

        <p style={{
          textAlign: 'center',
          margin: '12px 0 0',
          fontFamily: 'var(--font-ui)',
          fontSize: 11,
          color: 'var(--ink-4)',
          letterSpacing: '.3px',
        }}>
          אין שמות. אין שמירת זהות. אף אחד לא יידע מי כתב מה.
        </p>
      </div>
    </div>
  )
}
