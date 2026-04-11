import { useState, useEffect } from 'react'

interface Props {
  getTimeUntilReset: () => string
}

export default function Countdown({ getTimeUntilReset }: Props) {
  const [time, setTime] = useState(getTimeUntilReset())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeUntilReset())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      background: 'rgba(26,26,46,0.9)',
      padding: '12px 24px',
      borderRadius: '12px',
      border: '1px solid #ffffff22',
    }}>
      <span style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Nuevo personaje en
      </span>
      <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffc107', letterSpacing: '2px' }}>
        {time}
      </span>
    </div>
  )
}