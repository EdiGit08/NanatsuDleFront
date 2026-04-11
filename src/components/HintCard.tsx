import { useState } from 'react'

interface Props {
  icon: string
  label: string
  unlocksAt: number
  currentAttempts: number
  value: string | null
}

export default function HintCard({ icon, label, unlocksAt, currentAttempts, value }: Props) {
  const [open, setOpen] = useState(false)
  const unlocked = currentAttempts >= unlocksAt

  return (
    <div
      onClick={() => unlocked && setOpen(prev => !prev)}
      style={{
        width: '140px',
        minHeight: '120px',
        background: 'rgba(26, 26, 46, 0.92)',
        border: `2px solid ${unlocked ? '#ffc10799' : '#ffffff22'}`,
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '16px 12px',
        cursor: unlocked ? 'pointer' : 'default',
        transition: 'border-color 0.3s ease, transform 0.2s ease',
        transform: unlocked && open ? 'scale(1.03)' : 'scale(1)',
        textAlign: 'center',
      }}
    >
      {/* Icono */}
      <span style={{
        fontSize: '32px',
        filter: unlocked ? 'none' : 'grayscale(1) opacity(0.3)',
        transition: 'filter 0.3s ease',
      }}>
        {icon}
      </span>

      {/* Contenido */}
      {!unlocked ? (
        <>
          <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </span>
          <span style={{ fontSize: '11px', color: '#555' }}>
            En {unlocksAt} intentos
          </span>
        </>
      ) : open && value ? (
        <>
          <span style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </span>
          <span style={{ fontSize: '14px', color: '#ffc107', fontWeight: 700, lineHeight: 1.3 }}>
            {value}
          </span>
        </>
      ) : (
        <>
          <span style={{ fontSize: '11px', color: '#ffc107', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </span>
          <span style={{ fontSize: '11px', color: '#aaa' }}>
            Toca para revelar
          </span>
        </>
      )}
    </div>
  )
}