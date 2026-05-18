export default function LoadingState({ message = 'טוען...' }: { message?: string }) {
  return (
    <div className="state-center">
      <div className="spinner" />
      <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--ink-3)', margin: 0 }}>
        {message}
      </p>
    </div>
  )
}
