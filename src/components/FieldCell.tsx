import { useEffect, useState } from 'react'

interface Props {
  value: string
  status: 'correct' | 'incorrect' | 'partial' | 'higher' | 'lower'
  label?: string
  delay?: number
}

const statusStyles: Record<string, React.CSSProperties> = {
  correct:   { background: '#4caf50', color: '#fff' },
  incorrect: { background: '#e53935', color: '#fff' },
  partial:   { background: '#ffc107', color: '#fff' },
  higher:    { background: '#e53935', color: '#fff' },
  lower:     { background: '#e53935', color: '#fff' },
}

const statusIcon: Record<string, string> = {
  correct:   '',
  incorrect: '',
  partial:   '',
  higher:    ' ↑',
  lower:     ' ↓',
}

export default function FieldCell({ value, status, label, delay = 0 }: Props) {
  const [visible, setVisible] = useState(false)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), delay)
    const t2 = setTimeout(() => setFlipped(true), delay + 150)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [delay])

  return (
    <div style={{
      width: '110px',
      minWidth: '110px',
      height: '64px',
      perspective: '600px',
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        padding: '6px 4px',
        textAlign: 'center',
        transformStyle: 'preserve-3d',
        transition: flipped
          ? 'transform 0.5s ease, opacity 0.3s ease'
          : 'opacity 0.3s ease',
        transform: flipped ? 'rotateX(0deg)' : 'rotateX(90deg)',
        opacity: visible ? 1 : 0,
        overflow: 'hidden',
        ...(flipped ? statusStyles[status] : { background: '#2a2a3e', color: '#fff' }),
      }}>
        {label && (
          <span style={{ fontSize: '10px', opacity: 0.8, marginBottom: '2px', whiteSpace: 'nowrap' }}>
            {label}
          </span>
        )}
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          lineHeight: '1.2',
          wordBreak: 'break-word',
          padding: '0 4px',
        }}>
          {flipped ? `${value}${statusIcon[status]}` : ''}
        </span>
      </div>
    </div>
  )
}