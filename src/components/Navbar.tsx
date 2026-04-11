import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface NavItem {
  iconUrl: string
  label: string
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { iconUrl: '/juego1.png', label: 'Seven Deadly Sins', path: '/' },
  { iconUrl: '/juego2.png', label: 'Juego 2',           path: '../pages/page2' },
  { iconUrl: '/juego3.png', label: 'Juego 3',           path: '../pages/page3' },
  { iconUrl: '/juego4.png', label: 'Juego 4',           path: '../pages/page4' },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [tooltip, setTooltip] = useState<string | null>(null)

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: '72px',
      zIndex: 200,
      overflow: 'hidden',
    }}>
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        background: 'rgba(10, 10, 26, 0.85)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }} />

      {/* Iconos centrados verticalmente */}
      <div style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        zIndex: 1,
      }}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = location.pathname === item.path
          return (
            <div
              key={i}
              style={{ position: 'relative' }}
              onMouseEnter={() => setTooltip(item.label)}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Icono */}
              <div
                onClick={() => navigate(item.path)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: isActive
                    ? 'rgba(255,193,7,0.2)'
                    : 'rgba(255,255,255,0.05)',
                  border: isActive
                    ? '1.5px solid rgba(255,193,7,0.5)'
                    : '1.5px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <img
                  src={item.iconUrl}
                  alt={item.label}
                  style={{
                    width: '32px',
                    height: '32px',
                    objectFit: 'contain',
                    opacity: isActive ? 1 : 0.5,
                    transition: 'opacity 0.2s ease',
                  }}
                />
              </div>

              {/* Tooltip */}
              {tooltip === item.label && (
                <div style={{
                  position: 'absolute',
                  left: '58px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(26,26,46,0.98)',
                  color: '#fff',
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  border: '1px solid rgba(255,255,255,0.12)',
                  pointerEvents: 'none',
                  zIndex: 300,
                }}>
                  {item.label}
                  {/* Flecha del tooltip */}
                  <div style={{
                    position: 'absolute',
                    left: '-5px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderRight: '5px solid rgba(26,26,46,0.98)',
                  }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}