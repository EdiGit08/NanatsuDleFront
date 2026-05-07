import { useState } from 'react'
import { useDaily4Game } from '../hooks/useDaily4Game'
import { useStreak } from '../hooks/useStreak'
import { searchCharacters } from '../services/api'
import Countdown from '../components/Countdown'
import type { SearchResult } from '../types'

const LOGO_URL = 'https://res.cloudinary.com/dsidu0tej/image/upload/v1775107062/NNTDLELogo3_b5mv8z.png'
const BG_URL   = 'https://res.cloudinary.com/dsidu0tej/image/upload/v1774757940/BackgroundNNTDLE_hdtqrt.jpg'

const TIPO_LABELS: Record<string, string> = {
  Gender:      'Género',
  Race:        'Raza',
  HairColor:   'Color de cabello',
  Arc:         'Arco',
  Affiliation: 'Afiliación',
  TypeOfSkill: 'Tipo de habilidad',
}

const CATEGORY_OPTIONS: Record<string, string[]> = {
  Gender:      ['Masculino', 'Femenino'],
  Race:        ['Demonio', 'Diosa', 'Humano', 'Hada', 'Gigante', 'Muñeco'],
  HairColor:   ['Rubio', 'Plateado', 'Castaño', 'Negro', 'Gris', 'Verde', 'Rosado', 'Naranja'],
  Arc:         ['Introduccion', 'Pecados Capitales', 'Bosque de las Hadas', 'Diez Mandamientos', 'Guerra Santa'],
  Affiliation: ['Siete Pecados Capitales', 'Caballeros Sagrados', 'Diez Mandamientos', 'Cuatro Arcangeles'],
  TypeOfSkill: ['Ofensivo', 'Apoyo', 'Defensivo', 'Ofensivo,Defensivo', 'Apoyo,Ofensivo', 'Defensivo,Ofensivo'],
}

const ALL_TIPOS = Object.keys(TIPO_LABELS)

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

export default function Juego4() {
  const { streak, incrementStreak, resetStreak } = useStreak()
  const { daily4, loading, error, showModal, makeCharacterGuess, makeCategoryGuess, closeModal } =
    useDaily4Game({ onWin: incrementStreak, onLose: resetStreak })

  const [query, setQuery]               = useState('')
  const [results, setResults]           = useState<SearchResult[]>([])
  const [open, setOpen]                 = useState(false)
  const [activeIndex, setActiveIndex]   = useState(-1)
  const [selectedTipo, setSelectedTipo] = useState('')
  const [selectedValue, setSelectedValue] = useState('')

  const characterGuesses = daily4?.characterGuesses ?? []
  const gameOver         = daily4?.gameOver         ?? false
  const won              = daily4?.won              ?? false
  const totalAttempts    = characterGuesses.length
  const correctCount     = characterGuesses.filter(g => g.correct).length
  const incorrectos      = characterGuesses.filter(g => !g.correct)
  const correctos        = characterGuesses.filter(g => g.correct)

  // Se desbloquea con 2 aciertos O con 10 intentos totales
  const canGuessCategory = (correctCount >= 2 || totalAttempts >= 10)
    && !daily4?.categoryAttempted
    && !gameOver

  // El buscador se bloquea si ya hay 10 intentos o el juego terminó
  const canGuessCharacter = totalAttempts < 10 && !gameOver

  const usedIds = new Set(characterGuesses.map(g => g.id))

  const handleSearch = async (value: string) => {
    setQuery(value)
    setActiveIndex(-1)
    if (value.length < 1) { setResults([]); setOpen(false); return }
    const data = await searchCharacters(value)
    setResults(data.filter(c => !usedIds.has(c.id)))
    setOpen(data.length > 0)
  }

  const handleSelectCharacter = async (char: SearchResult) => {
    setQuery('')
    setResults([])
    setOpen(false)
    setActiveIndex(-1)
    await makeCharacterGuess(char.id)
  }

  const handleCategoryGuess = async () => {
    if (!selectedTipo || !selectedValue) return
    await makeCategoryGuess(selectedTipo, selectedValue)
  }

  if (loading) return (
    <div style={styles.centered}>
      <p style={{ color: '#fff' }}>Cargando juego del día...</p>
    </div>
  )

  if (error) return (
    <div style={styles.centered}>
      <p style={{ color: '#e53935' }}>{error}</p>
    </div>
  )

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
            <img src={LOGO_URL} alt="Juego 4" style={styles.logo} />
            <p style={{
              color: '#fff', fontSize: '15px', textAlign: 'center',
              fontFamily: "'Cinzel Decorative', cursive",
              letterSpacing: '1px', marginBottom: '20px',
            }}>
              Adivina la categoría del día
            </p>
          </div>

          {/* Info de progreso */}
          <div style={{
            display: 'flex', gap: '20px', marginBottom: '24px',
          }}>
            <div style={{
              background: 'rgba(26, 26, 46, 0.80)', border: '1px solid #333',
              borderRadius: '10px', padding: '10px 20px', textAlign: 'center',
            }}>
              <p style={{ color: '#e53935', fontSize: '20px', fontWeight: 800, margin: 0 }}>{incorrectos.length}</p>
              <p style={{ color: '#aaa', fontSize: '11px', margin: 0, textTransform: 'uppercase' }}>Incorrectos</p>
            </div>
            <div style={{
              background: 'rgba(26, 26, 46, 0.80)', border: '1px solid #333',
              borderRadius: '10px', padding: '10px 20px', textAlign: 'center',
            }}>
              <p style={{ color: '#ffc107', fontSize: '20px', fontWeight: 800, margin: 0 }}>{totalAttempts} / 10</p>
              <p style={{ color: '#aaa', fontSize: '11px', margin: 0, textTransform: 'uppercase' }}>Intentos</p>
            </div>
            <div style={{
              background: 'rgba(26, 26, 46, 0.80)', border: '1px solid #333',
              borderRadius: '10px', padding: '10px 20px', textAlign: 'center',
            }}>
              <p style={{ color: '#4caf50', fontSize: '20px', fontWeight: 800, margin: 0 }}>{correctCount}</p>
              <p style={{ color: '#aaa', fontSize: '11px', margin: 0, textTransform: 'uppercase' }}>Correctos</p>
            </div>
          </div>

          {/* Cuadros de personajes */}
          <div style={{ display: 'flex', gap: '24px', width: '100%', marginBottom: '24px' }}>

            {/* Incorrectos */}
            <div style={{ flex: 1 }}>
              <p style={{ color: '#e53935', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Incorrectos
              </p>
              <div style={{
                minHeight: '180px', background: 'rgba(26, 26, 46, 0.80)',
                border: '1px solid #333', borderRadius: '14px',
                padding: '12px', display: 'flex', flexWrap: 'wrap',
                gap: '8px', alignContent: 'flex-start',
              }}>
                {incorrectos.map((g, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <img src={g.imageUrl} alt={g.name} style={{
                      width: '52px', height: '52px', borderRadius: '8px',
                      objectFit: 'cover', border: '2px solid #e53935',
                    }} />
                    <span style={{ fontSize: '9px', color: '#bbb', maxWidth: '52px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.name}
                    </span>
                  </div>
                ))}
                {incorrectos.length === 0 && (
                  <span style={{ color: '#333', fontSize: '12px', margin: 'auto' }}>—</span>
                )}
              </div>
            </div>

            {/* Correctos */}
            <div style={{ flex: 1 }}>
              <p style={{ color: '#4caf50', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Correctos
              </p>
              <div style={{
                minHeight: '180px', background: 'rgba(26, 26, 46, 0.80)',
                border: '1px solid #333', borderRadius: '14px',
                padding: '12px', display: 'flex', flexWrap: 'wrap',
                gap: '8px', alignContent: 'flex-start',
              }}>
                {correctos.map((g, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <img src={g.imageUrl} alt={g.name} style={{
                      width: '52px', height: '52px', borderRadius: '8px',
                      objectFit: 'cover', border: '2px solid #4caf50',
                    }} />
                    <span style={{ fontSize: '9px', color: '#bbb', maxWidth: '52px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.name}
                    </span>
                  </div>
                ))}
                {correctos.length === 0 && (
                  <span style={{ color: '#333', fontSize: '12px', margin: 'auto' }}>—</span>
                )}
              </div>
            </div>
          </div>

          {/* Buscador de personajes */}
          {canGuessCharacter && (
            <div style={{ position: 'relative', width: '420px', marginBottom: '28px' }}>
              <input
                type="text"
                value={query}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(p => Math.min(p + 1, results.length - 1)) }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(p => Math.max(p - 1, 0)) }
                  else if (e.key === 'Enter') {
                    e.preventDefault()
                    if (activeIndex >= 0 && results[activeIndex]) handleSelectCharacter(results[activeIndex])
                    else if (results.length > 0) handleSelectCharacter(results[0])
                  }
                  else if (e.key === 'Escape') { setOpen(false); setActiveIndex(-1) }
                }}
                placeholder="Busca un personaje..."
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '8px',
                  border: '2px solid #555', background: 'rgba(26,26,46,0.95)',
                  color: '#fff', fontSize: '14px', boxSizing: 'border-box',
                }}
              />
              {open && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: '#16213e', border: '1px solid #555',
                  borderRadius: '8px', marginTop: '4px', zIndex: 10,
                  maxHeight: '240px', overflowY: 'auto',
                }}>
                  {results.map((char, index) => (
                    <div
                      key={char.id}
                      onClick={() => handleSelectCharacter(char)}
                      onMouseEnter={() => setActiveIndex(index)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px 12px', cursor: 'pointer',
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
          )}

          {/* Mensaje cuando se bloquea el buscador */}
          {!canGuessCharacter && !gameOver && (
            <p style={{ color: '#ffc107', fontSize: '13px', marginBottom: '24px' }}>
              {totalAttempts >= 10
                ? 'Límite de intentos alcanzado — adivina la categoría'
                : ''}
            </p>
          )}

          {/* Sección de categoría */}
          <div style={{
            width: '100%', maxWidth: '560px',
            background: canGuessCategory ? 'rgba(255,193,7,0.08)' : 'rgba(255,255,255,0.03)',
            border: canGuessCategory ? '1px solid rgba(255,193,7,0.35)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '20px 24px',
            display: 'flex', flexDirection: 'column', gap: '12px',
            opacity: canGuessCategory || gameOver ? 1 : 0.4,
            transition: 'all 0.3s ease', marginBottom: '24px',
          }}>
            <p style={{
              color: canGuessCategory ? '#ffc107' : '#555',
              fontSize: '12px', textTransform: 'uppercase',
              letterSpacing: '0.8px', margin: 0, fontWeight: 700,
            }}>
              {gameOver
                ? 'Juego terminado'
                : canGuessCategory
                  ? 'Adivina la categoría — solo tienes un intento'
                  : `Se desbloquea con 2 aciertos o 10 intentos (${correctCount}/2 aciertos · ${totalAttempts}/10 intentos)`}
            </p>

            {!gameOver && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Selector de tipo */}
                <select
                  disabled={!canGuessCategory}
                  value={selectedTipo}
                  onChange={e => { setSelectedTipo(e.target.value); setSelectedValue('') }}
                  style={{
                    flex: 1, minWidth: '160px', padding: '10px 14px', borderRadius: '8px',
                    border: '2px solid #555', background: 'rgba(26,26,46,0.95)',
                    color: selectedTipo ? '#fff' : '#666', fontSize: '14px',
                    cursor: canGuessCategory ? 'pointer' : 'not-allowed',
                  }}
                >
                  <option value="" disabled>Categoría...</option>
                  {ALL_TIPOS.map(t => (
                    <option key={t} value={t}>{TIPO_LABELS[t]}</option>
                  ))}
                </select>

                {/* Selector de valor */}
                <select
                  disabled={!canGuessCategory || !selectedTipo}
                  value={selectedValue}
                  onChange={e => setSelectedValue(e.target.value)}
                  style={{
                    flex: 1, minWidth: '160px', padding: '10px 14px', borderRadius: '8px',
                    border: '2px solid #555', background: 'rgba(26,26,46,0.95)',
                    color: selectedValue ? '#fff' : '#666', fontSize: '14px',
                    cursor: canGuessCategory && selectedTipo ? 'pointer' : 'not-allowed',
                  }}
                >
                  <option value="" disabled>Valor...</option>
                  {selectedTipo && CATEGORY_OPTIONS[selectedTipo]?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                {/* Botón confirmar */}
                <button
                  disabled={!canGuessCategory || !selectedTipo || !selectedValue}
                  onClick={handleCategoryGuess}
                  style={{
                    padding: '10px 24px', borderRadius: '8px', border: 'none',
                    background: canGuessCategory && selectedTipo && selectedValue ? '#ffc107' : '#333',
                    color: canGuessCategory && selectedTipo && selectedValue ? '#000' : '#666',
                    fontSize: '14px', fontWeight: 700,
                    cursor: canGuessCategory && selectedTipo && selectedValue ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Confirmar
                </button>
              </div>
            )}

            {/* Resultado */}
            {daily4?.categoryAttempted && (
              <div style={{
                background: won ? 'rgba(26, 26, 46, 0.80)' : 'rgba(26, 26, 46, 0.80)',
                border: `1px solid ${won ? '#333' : '#333'}`,
                borderRadius: '8px', padding: '10px 14px',
              }}>
                <span style={{ color: won ? '#4caf50' : '#e53935', fontSize: '13px', fontWeight: 700 }}>
                  {won ? '¡Correcto!' : 'Incorrecto'}
                </span>
                {!won && (
                  <p style={{ color: '#aaa', fontSize: '12px', margin: '4px 0 0' }}>
                    Era: <strong style={{ color: '#ffc107' }}>{TIPO_LABELS[daily4.correctTipo ?? ''] ?? daily4.correctTipo}</strong> — <strong style={{ color: '#ffc107' }}>{daily4.correctCategory}</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Countdown */}
          {gameOver && (
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
            gap: '16px', maxWidth: '400px', width: '100%', position: 'relative',
          }}>
            <button onClick={closeModal} style={{
              position: 'absolute', top: '14px', right: '16px',
              background: 'transparent', border: 'none',
              color: '#888', fontSize: '22px', cursor: 'pointer',
            }}>✕</button>

            <div style={{ fontSize: '56px' }}>{won ? '🎉' : '😔'}</div>

            <h2 style={{ color: won ? '#4caf50' : '#e53935', fontSize: '24px', fontWeight: 800, margin: 0, textAlign: 'center' }}>
              {won ? '¡Adivinaste!' : '¡Casi!'}
            </h2>

            <div style={{
              background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.3)',
              borderRadius: '10px', padding: '12px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ color: '#aaa', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {TIPO_LABELS[daily4?.correctTipo ?? ''] ?? daily4?.correctTipo}
              </span>
              <span style={{ color: '#ffc107', fontSize: '22px', fontWeight: 800 }}>
                {daily4?.correctCategory}
              </span>
            </div>

            <p style={{ color: '#aaa', fontSize: '14px', margin: 0, textAlign: 'center' }}>
              {won
                ? `Lo lograste con ${correctCount} acierto${correctCount === 1 ? '' : 's'}`
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
  header: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', marginBottom: '16px', width: '100%',
  },
  logo: {
    height: '180px', objectFit: 'contain', marginBottom: '8px',
  },
}