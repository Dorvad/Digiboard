interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  message = 'אירעה שגיאה בטעינת הנתונים',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="state-center" dir="rtl">
      <div style={{ fontSize: 40 }}>⚠️</div>
      <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--ink-2)', margin: 0, textAlign: 'center' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-cancel"
          style={{ marginTop: 8 }}
        >
          נסה שוב
        </button>
      )}
    </div>
  )
}
