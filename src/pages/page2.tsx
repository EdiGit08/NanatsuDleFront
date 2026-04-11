import { useState } from 'react'
import { useDaily2Game } from '../hooks/useDaily2Game'
import { useStreak } from '../hooks/useStreak'
import { searchCharacters } from '../services/api'
import Countdown from '../components/Countdown'
import type { SearchResult } from '../types'

const LOGO_URL = 'https://res.cloudinary.com/dsidu0tej/image/upload/v1775107062/NNTDLELogo3_b5mv8z.png'
const BG_URL   = 'https://res.cloudinary.com/dsidu0tej/image/upload/v1774757940/BackgroundNNTDLE_hdtqrt.jpg'

const getTimeUntilReset = (): string => {
  const now        = new Date()
  const utcMs      = now.getTime() + now.getTimezoneOffset() * 60000
  const colombiaMs = utcMs - 5 * 3600000
  const colombia   = new Date(colombiaMs)
  const tomorrow   = new Date(colombia)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const diff    = tomorrow.getTime() - colombia.getTime()
  const hours   = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function Juego2() {
  const { streak, incrementStreak, resetStreak } = useStreak()
  const { daily2, loading, error, showModal, makeGuess, closeModal } = useDaily2Game({
    onWin:  incrementStreak,
    onLose: resetStreak,
  })

  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState<SearchResult[]>([])
  const [open, setOpen]             = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [showMagic, setShowMagic]   = useState(false)
  const [showFirstAppearance, setShowFirstAppearance] = useState(false)

  const usedNames = new Set(daily2?.guesses.map(g => g.name.toLowerCase()) ?? [])

  const handleSearch = async (value: string) => {
    setQuery(value)
    setActiveIndex(-1)
    if (value.length < 1) { setResults([]); setOpen(false); return }
    const data = await searchCharacters(value)
    const filtered = data.filter(c => !usedNames.has(c.name.toLowerCase()))
    setResults(filtered)
    setOpen(filtered.length > 0)
  }

  const handleSelect = async (name: string) => {
    setQuery('')
    setResults([])
    setOpen(false)
    setActiveIndex(-1)
    await makeGuess(name)
  }

  if (loading) return (
    <div style={styles.centered}>
      <p style={{ color: '#fff' }}>Cargando personaje del día...</p>
    </div>
  )

  if (error) return (
    <div style={styles.centered}>
      <p style={{ color: '#e53935' }}>{error}</p>
    </div>
  )

  const attempts  = daily2?.attempts  ?? 0
  const guesses   = daily2?.guesses   ?? []
  const hints     = daily2?.hints     ?? { magic: null, firstAppearance: null }
  const gameOver  = daily2?.gameOver  ?? false
  const won       = daily2?.won       ?? false
  const image2Url = daily2?.image2Url ?? ''
  const blurAmount = gameOver ? 0 : Math.max(14 - attempts * 0.8, 2)

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <div style={styles.inner}>

          {/* Racha */}
          <div style={styles.streakBox}>
            <span style={{ fontSize: '12px', color: '#aaa' }}>Racha</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#ffc107' }}>{streak.current}</span>
            <span style={{ fontSize: '11px', color: '#aaa' }}>Mejor: {streak.best}</span>
          </div>

          {/* Título */}
          <div style={styles.header}>
            <img src={LOGO_URL} alt="NanatsuDle" style={styles.logo} />
            <p style={{
              color: '#fff',
              fontSize: '16px',
              textAlign: 'center',
              fontFamily: "'Cinzel Decorative', cursive",
              letterSpacing: '1px',
              marginBottom: '20px',
            }}>
              ¿Qué personaje aparece en esta imagen?
            </p>
          </div>
          {/* Marco con imagen */}
          <div style={{
            width: '360px',
            background: 'rgba(30, 20, 10, 0.55)',
            border: '2px solid rgba(200, 160, 80, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            backdropFilter: 'blur(4px)',
          }}>
            {/* Imagen borrosa */}
            <div style={{
              width: '100%',
              height: '300px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: gameOver
                ? `3px solid ${won ? '#4caf50' : '#e53935'}`
                : '2px solid rgba(200,160,80,0.3)',
            }}>
              <img
                src={image2Url}
                alt="¿Quién es?"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: `blur(${blurAmount}px) grayscale(${gameOver ? 0 : 90}%)`,
                  transform: 'scale(1.1)',
                  transition: 'filter 0.8s ease',
                }}
              />
            </div>

            {/* Pistas */}
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              {/* Magia */}
              <div
                onClick={() => attempts >= 5 && hints.magic && setShowMagic(p => !p)}
                style={{
                  flex: 1,
                  background: attempts >= 5
                    ? 'rgba(255,193,7,0.15)'
                    : 'rgba(255,255,255,0.05)',
                  border: attempts >= 5
                    ? '1px solid rgba(255,193,7,0.4)'
                    : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: attempts >= 5 ? 'pointer' : 'default',
                  minHeight: '80px',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{
                  fontSize: '22px',
                  filter: attempts >= 5 ? 'none' : 'grayscale(1) opacity(0.25)',
                }}>✨</span>
                <span style={{ fontSize: '10px', color: attempts >= 5 ? '#aaa' : '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Magia
                </span>
                {attempts >= 5 && hints.magic ? (
                  showMagic
                    ? <span style={{ fontSize: '13px', color: '#ffc107', fontWeight: 700, textAlign: 'center' }}>{hints.magic}</span>
                    : <span style={{ fontSize: '10px', color: '#ffc10799' }}>Toca para revelar</span>
                ) : (
                  <span style={{ fontSize: '10px', color: '#444' }}>En 5 intentos</span>
                )}
              </div>

              {/* Primera aparición */}
              <div
                onClick={() => attempts >= 7 && hints.firstAppearance && setShowFirstAppearance(p => !p)}
                style={{
                  flex: 1,
                  background: attempts >= 7
                    ? 'rgba(255,193,7,0.15)'
                    : 'rgba(255,255,255,0.05)',
                  border: attempts >= 7
                    ? '1px solid rgba(255,193,7,0.4)'
                    : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: attempts >= 7 ? 'pointer' : 'default',
                  minHeight: '80px',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{
                  fontSize: '22px',
                  filter: attempts >= 7 ? 'none' : 'grayscale(1) opacity(0.25)',
                }}>📖</span>
                <span style={{ fontSize: '10px', color: attempts >= 7 ? '#aaa' : '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Primera aparición
                </span>
                {attempts >= 7 && hints.firstAppearance ? (
                  showFirstAppearance
                    ? <span style={{ fontSize: '13px', color: '#ffc107', fontWeight: 700, textAlign: 'center' }}>{hints.firstAppearance}</span>
                    : <span style={{ fontSize: '10px', color: '#ffc10799' }}>Toca para revelar</span>
                ) : (
                  <span style={{ fontSize: '10px', color: '#444' }}>En 7 intentos</span>
                )}
              </div>
            </div>
          </div>

          {/* Contador */}
          {attempts > 0 && !gameOver && (
            <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '12px' }}>
              Intentos: {attempts} / 10
            </p>
          )}

          {/* Buscador o countdown */}
          {!gameOver ? (
            <div style={{ position: 'relative', width: '360px', marginBottom: '24px' }}>
              <input
                type="text"
                value={query}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(p => Math.min(p + 1, results.length - 1)) }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(p => Math.max(p - 1, 0)) }
                  else if (e.key === 'Enter') {
                    e.preventDefault()
                    if (activeIndex >= 0 && results[activeIndex]) handleSelect(results[activeIndex].name)
                    else if (results.length > 0) handleSelect(results[0].name)
                  }
                  else if (e.key === 'Escape') { setOpen(false); setActiveIndex(-1) }
                }}
                placeholder="Nombre del personaje..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #555',
                  background: 'rgba(26,26,46,0.95)',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
              {open && (
                <div style={{
                  position: 'absolute',
                  top: '100%', left: 0, right: 0,
                  background: '#16213e',
                  border: '1px solid #555',
                  borderRadius: '8px',
                  marginTop: '4px',
                  zIndex: 10,
                  maxHeight: '240px',
                  overflowY: 'auto',
                }}>
                  {results.map((char, index) => (
                    <div
                      key={char.id}
                      onClick={() => handleSelect(char.name)}
                      onMouseEnter={() => setActiveIndex(index)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #333',
                        background: activeIndex === index ? '#0f3460' : 'transparent',
                      }}
                    >
                      <img src={char.imageUrl} alt={char.name} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                      <span style={{ color: '#fff', fontSize: '14px' }}>{char.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '24px' }}>
              <Countdown getTimeUntilReset={getTimeUntilReset} />
            </div>
          )}

          {/* Historial de intentos */}
          {guesses.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              width: '360px',
            }}>
              {[...guesses].reverse().map((g, i) => (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  width: '100%',
                  background: won && i === 0 ? 'rgba(76,175,80,0.4)' : 'rgba(229,57,53,0.4)',
                  border: `1px solid ${won && i === 0 ? '#4caf5066' : '#e5393566'}`,
                  borderRadius: '10px',
                  padding: '10px 12px',
                }}>
                  {g.imageUrl ? (
                    <img
                      src={g.imageUrl}
                      alt={g.name}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: `2px solid ${won && i === 0 ? '#4caf50' : '#e53935'}`,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '8px',
                      background: '#333', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: '#666', fontSize: '10px' }}>?</span>
                    </div>
                  )}
                  <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{g.name}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: '#1a1a2e',
            border: `2px solid ${won ? '#4caf50' : '#e53935'}`,
            borderRadius: '20px', padding: '40px 48px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '16px', maxWidth: '380px', width: '100%', position: 'relative',
          }}>
            <button onClick={closeModal} style={{
              position: 'absolute', top: '14px', right: '16px',
              background: 'transparent', border: 'none',
              color: '#888', fontSize: '22px', cursor: 'pointer',
            }}>✕</button>

            <div style={{ fontSize: '56px' }}>{won ? '🎉' : '😔'}</div>

            <h2 style={{ color: won ? '#4caf50' : '#e53935', fontSize: '24px', fontWeight: 800, margin: 0 }}>
              {won ? '¡Lo adivinaste!' : '¡Casi!'}
            </h2>

            <img
              src={image2Url}
              alt="personaje"
              style={{
                width: '160px', height: '160px',
                objectFit: 'cover', borderRadius: '14px',
                border: `3px solid ${won ? '#4caf50' : '#e53935'}`,
              }}
            />

            {daily2?.correctName && (
              <p style={{ color: '#ffc107', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                {daily2.correctName}
              </p>
            )}

            <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>
              {won
                ? `Lo lograste en ${attempts} intento${attempts === 1 ? '' : 's'}`
                : 'Inténtalo mañana'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundImage: `url(${BG_URL})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    color: '#fff',
    fontFamily: "'Segoe UI', sans-serif",
    marginLeft: '-72px',
    paddingLeft: '72px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '8px',
    width: '100%',
  },
  logo: {
    height: '180px',
    objectFit: 'contain',
    marginBottom: '8px',
  },
  overlay: {
    minHeight: '100vh',
    background: 'rgba(10, 10, 26, 0.82)',
    padding: '24px 0 48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: '960px',
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  centered: {
    minHeight: '100vh',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: '#0f0f1a', gap: '16px',
  },
  streakBox: {
    position: 'fixed', top: '16px', right: '24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'rgba(26, 26, 46, 0.95)',
    padding: '10px 20px', borderRadius: '14px',
    border: '1px solid #ffc10733', gap: '2px', zIndex: 100,
  },
}