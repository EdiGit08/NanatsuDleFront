import type { TargetCharacter } from '../types'

interface Props {
  won: boolean
  attempts: number
  target: TargetCharacter
  onClose: () => void
}

export default function GameOverModal({ won, attempts, target, onClose}: Props) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '24px',
    }}>
      <div style={{
        background: '#1a1a2e',
        border: `2px solid ${won ? '#4caf50' : '#e53935'}`,
        borderRadius: '20px',
        padding: '40px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: `0 0 40px ${won ? '#4caf5033' : '#e5393533'}`,
        animation: 'modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
      }}>

        {/* X para cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '22px',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '4px 8px',
            borderRadius: '6px',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#888')}
        >
          ✕
        </button>

        {/* Emoji resultado */}
        <div style={{ fontSize: '56px', color: won ? '#4caf50' : '#e53935',}}>
          {won ? '----🎉----' : '----😔----'}
        </div>

        {/* Título */}
        <h2 style={{
          fontSize: '26px',
          fontWeight: 800,
          color: won ? '#4caf50' : '#e53935',
          margin: 0,
          textAlign: 'center',
        }}>
          {won ? '¡Lo adivinaste!' : '¡Casi!'}
        </h2>

        {/* Imagen del personaje revelada */}
        <div style={{
          position: 'relative',
          width: '140px',
          height: '140px',
          borderRadius: '14px',
          overflow: 'hidden',
          border: `3px solid ${won ? '#4caf50' : '#e53935'}`,
        }}>
          <img
            src={target.imageUrl}
            alt="personaje"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Intentos usados */}
        <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>
          {won
            ? `Lo lograste en ${attempts} intento${attempts === 1 ? '' : 's'}`
            : 'Buen intento, ¡te esperamos aqui mañana!'}
        </p>
      </div>
    </div>
  )
}