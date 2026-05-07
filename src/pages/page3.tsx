import { useState } from 'react'
import { useDaily3Game } from '../hooks/useDaily3Game'
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

interface HintRowProps {
  icon:            string
  label:           string
  unlocksAt:       number
  currentAttempts: number
  value:           string | number | null
  guessImageUrl:   string | null
  won:             boolean
  attempted:       boolean  // ← si ya hubo un intento en esa posición
}

function HintRow({ icon, label, unlocksAt, currentAttempts, value, guessImageUrl, won, attempted }: HintRowProps) {
  const unlocked = currentAttempts >= unlocksAt && value !== null

  // Color de la barra:
  // - No intentado aún → gris
  // - Intentado y ganó → verde
  // - Intentado y no ganó → rojo
  // - Ganó pero esta fila no fue intentada (faltante) → gris pero con valor visible
  const barBackground = !attempted
    ? 'rgb(26, 26, 46, 0.8)'
    : won
      ? 'rgba(76,175,80,0.8)'
      : 'rgba(229,57,53,0.8)'

  const barBorder = !attempted
    ? '1px solid rgba(255,255,255,0.15)'
    : won
      ? '1px solid #4caf5088'
      : '1px solid #e5393588'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>

      {/* Barra de pista */}
      <div style={{
        flex: 1,
        background: barBackground,
        border: barBorder,
        borderRadius: '10px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12px',
        minHeight: '64px',
        transition: 'all 0.3s ease',
      }}>
        {/* Icono */}
        <span style={{
          fontSize: '24px',
          filter: unlocked ? 'none' : 'grayscale(1) opacity(0.3)',
          flexShrink: 0,
        }}>
          {icon}
        </span>

        {/* Label */}
        <span style={{
          fontSize: '13px',
          color: unlocked ? '#ddd' : '#555',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          minWidth: '110px',
          flexShrink: 0,
          fontWeight: 600,
        }}>
          {label}
        </span>

        {/* Valor o texto de espera */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{
              fontSize: '16px',
              color: '#fff',
              fontWeight: 800,
              textAlign: 'right',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}>
              {value}
            </span>
        </div>
      </div>

      {/* Imagen del intento */}
      <div style={{
        width: '56px',
        height: '56px',
        flexShrink: 0,
        borderRadius: '8px',
        overflow: 'hidden',
        border: !attempted
          ? '2px solid rgba(255,255,255,0.1)'
          : won
            ? '2px solid #4caf50'
            : '2px solid #e53935',
        background: 'rgb(26, 26, 46)',
      }}>
        {attempted && guessImageUrl ? (
          <img
            src={guessImageUrl}
            alt="intento"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#333', fontSize: '18px' }}>?</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Juego3() {
  const { streak, incrementStreak, resetStreak } = useStreak()
  const { daily3, loading, error, showModal, makeGuess, closeModal } = useDaily3Game({
    onWin:  incrementStreak,
    onLose: resetStreak,
  })

  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<SearchResult[]>([])
  const [open, setOpen]           = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const usedNames = new Set(daily3?.guesses.map(g => g.name.toLowerCase()) ?? [])

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

  const attempts = daily3?.attempts  ?? 0
  const guesses  = daily3?.guesses   ?? []
  const rows     = daily3?.rows      ?? { height: null, gender: null, race: null, hairColor: null, affiliation: null }
  const gameOver = daily3?.gameOver  ?? false
  const won      = daily3?.won       ?? false

  // Imagen del intento que desbloqueó cada pista
  const imageAt = (unlockAt: number): string | null =>
    guesses[unlockAt]?.imageUrl ?? null

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

          {/* Header */}
          <div style={styles.header}>
            <a href="/">
              <img src={LOGO_URL} alt="NanatsuDle" style={styles.logo} />
            </a>
            <p style={{
              color: '#fff',
              fontSize: '16px',
              textAlign: 'center',
              fontFamily: "'Cinzel Decorative', cursive",
              letterSpacing: '1px',
              marginBottom: '20px',
            }}>
              Adivina el personaje con las pistas
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', width: '65%', gap: '10px', marginBottom: '32px' }}>
            <HintRow
              icon="💇"
              label="Color de cabello"
              unlocksAt={0}
              currentAttempts={attempts}
              value={rows.hairColor}
              guessImageUrl={imageAt(0)}
              won={won && guesses.length - 1 === 0}
              attempted={guesses.length > 0}
            />
            <HintRow
              icon="📏"
              label="Altura"
              unlocksAt={1}
              currentAttempts={attempts}
              value={won && guesses.length - 1 < 1 ? null : rows.height !== null ? `${rows.height} cm` : null}
              guessImageUrl={imageAt(1)}
              won={won && guesses.length - 1 === 1}
              attempted={guesses.length > 1}
            />
            <HintRow
              icon="🧬"
              label="Raza"
              unlocksAt={2}
              currentAttempts={attempts}
              value={won && guesses.length - 1 < 2 ? null : rows.race}
              guessImageUrl={imageAt(2)}
              won={won && guesses.length - 1 === 2}
              attempted={guesses.length > 2}
            />
            <HintRow
              icon="⚥"
              label="Género"
              unlocksAt={3}
              currentAttempts={attempts}
              value={won && guesses.length - 1 < 3 ? null : rows.gender}
              guessImageUrl={imageAt(3)}
              won={won && guesses.length - 1 === 3}
              attempted={guesses.length > 3}
            />
            <HintRow
              icon="🏰"
              label="Afiliación"
              unlocksAt={4}
              currentAttempts={attempts}
              value={won && guesses.length - 1 < 4 ? null : rows.affiliation}
              guessImageUrl={imageAt(4)}
              won={won && guesses.length - 1 === 4}
              attempted={guesses.length > 4}
            />
          </div>

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

            {daily3?.correctImageUrl && (
              <img
                src={daily3.correctImageUrl}
                alt="personaje"
                style={{
                  width: '120px', height: '120px',
                  objectFit: 'cover', borderRadius: '12px',
                  border: `3px solid ${won ? '#4caf50' : '#e53935'}`,
                }}
              />
            )}

            {daily3?.correctName && (
              <p style={{ color: '#ffc107', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                {daily3.correctName}
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