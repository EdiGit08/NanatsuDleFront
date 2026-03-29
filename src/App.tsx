import { useState, useEffect } from 'react'
import type { TargetCharacter, GuessResult, HintResult, SearchResult } from './types'
import { getRandomCharacter, guessCharacter, getHints } from './services/api'
import { useStreak } from './hooks/useStreak'
import SearchBox from './components/SearchBox'
import GuessRow from './components/GuessRow'

export default function App() {
  const [target, setTarget]       = useState<TargetCharacter | null>(null)
  const [guesses, setGuesses]     = useState<GuessResult[]>([])
  const [hints, setHints]         = useState<HintResult>({ magic: null, firstAppearance: null })
  const [gameOver, setGameOver]   = useState(false)
  const [won, setWon]             = useState(false)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const { streak, incrementStreak, resetStreak } = useStreak()

  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = async () => {
    setLoading(true)
    setError(null)
    setGuesses([])
    setHints({ magic: null, firstAppearance: null })
    setGameOver(false)
    setWon(false)
    try {
      const character = await getRandomCharacter()
      setTarget(character)
    } catch {
      setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?')
    } finally {
      setLoading(false)
    }
  }

  const handleGuess = async (selected: SearchResult) => {
    if (!target || gameOver) return

    try {
      const result = await guessCharacter(target.id, selected.id)
      const newGuesses = [...guesses, result]
      setGuesses(newGuesses)

      // Desbloquear pistas según intentos
      const attempts = newGuesses.length
      if (attempts >= 5 || attempts >= 7) {
        const newHints = await getHints(target.id, attempts)
        setHints(newHints)
      }

      if (result.isCorrect) {
        setWon(true)
        setGameOver(true)
        incrementStreak()
      }
    } catch {
      setError('Error al enviar el intento. Intenta de nuevo.')
    }
  }

  const handleGiveUp = () => {
    setGameOver(true)
    setWon(false)
    resetStreak()
  }

  if (loading) return (
    <div style={styles.centered}>
      <p style={{ color: '#fff' }}>Cargando personaje...</p>
    </div>
  )

  if (error) return (
    <div style={styles.centered}>
      <p style={{ color: '#e53935' }}>{error}</p>
      <button onClick={startNewGame} style={styles.button}>Reintentar</button>
    </div>
  )

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>NanatsuDle</h1>
        <div style={styles.streakBox}>
          <span style={{ fontSize: '12px', color: '#aaa' }}>Racha actual</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#ffc107' }}>
            {streak.current}
          </span>
          <span style={{ fontSize: '11px', color: '#aaa' }}>Mejor: {streak.best}</span>
        </div>
      </div>

      {/* Pistas desbloqueadas */}
      {(hints.magic || hints.firstAppearance) && (
        <div style={styles.hintsBox}>
          {hints.magic && (
            <div style={styles.hintItem}>
              <span style={{ color: '#aaa', fontSize: '12px' }}>Magia</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{hints.magic}</span>
            </div>
          )}
          {hints.firstAppearance && (
            <div style={styles.hintItem}>
              <span style={{ color: '#aaa', fontSize: '12px' }}>Primera aparición</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{hints.firstAppearance}</span>
            </div>
          )}
        </div>
      )}

      {/* Buscador */}
      {!gameOver && (
        <div style={styles.searchArea}>
          <SearchBox onSelect={handleGuess} disabled={gameOver} />
          <button onClick={handleGiveUp} style={styles.giveUpButton}>
            Rendirse
          </button>
        </div>
      )}

      {/* Mensaje de fin de juego */}
      {gameOver && (
        <div style={{
          ...styles.resultBox,
          borderColor: won ? '#4caf50' : '#e53935',
        }}>
          <p style={{ color: won ? '#4caf50' : '#e53935', fontSize: '20px', fontWeight: 700 }}>
            {won ? '¡Correcto!' : 'Mejor suerte la próxima vez'}
          </p>
          {!won && target && (
            <p style={{ color: '#aaa' }}>El personaje era del arco: {target.arc}</p>
          )}
          <button onClick={startNewGame} style={styles.button}>
            Jugar de nuevo
          </button>
        </div>
      )}

      {/* Contador de intentos */}
      {guesses.length > 0 && (
        <p style={{ color: '#aaa', fontSize: '13px', margin: '8px 0' }}>
          Intentos: {guesses.length}
          {guesses.length >= 5 && !hints.magic && ' · Pista de magia disponible en el intento 5'}
          {guesses.length >= 7 && !hints.firstAppearance && ' · Pista de aparición disponible en el intento 7'}
        </p>
      )}

      {/* Encabezado de la tabla */}
      {guesses.length > 0 && (
        <div style={styles.tableHeader}>
          <div style={{ minWidth: '80px' }} />
          {['Género', 'Raza', 'Cabello', 'Afiliación', 'Habilidad', 'Altura', 'Arco'].map(col => (
            <div key={col} style={styles.colHeader}>{col}</div>
          ))}
        </div>
      )}

      {/* Filas de intentos */}
      <div style={styles.guessList}>
        {guesses.map((g, i) => (
          <GuessRow key={i} result={g} />
        ))}
      </div>

    </div>
  )
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#0f0f1a',
    color: '#fff',
    fontFamily: 'sans-serif',
    padding: '24px',
    overflowX: 'auto',
  },
  centered: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f0f1a',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#ffc107',
    margin: 0,
  },
  streakBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#1a1a2e',
    padding: '8px 20px',
    borderRadius: '12px',
    border: '1px solid #333',
  },
  hintsBox: {
    display: 'flex',
    gap: '24px',
    background: '#1a1a2e',
    padding: '12px 20px',
    borderRadius: '10px',
    border: '1px solid #ffc10744',
    marginBottom: '16px',
  },
  hintItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  searchArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  giveUpButton: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: '2px solid #e53935',
    background: 'transparent',
    color: '#e53935',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
  },
  button: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: 'none',
    background: '#ffc107',
    color: '#000',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 700,
    marginTop: '8px',
  },
  resultBox: {
    background: '#1a1a2e',
    border: '2px solid',
    borderRadius: '12px',
    padding: '20px 28px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
    paddingLeft: '4px',
  },
  colHeader: {
    minWidth: '90px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  guessList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
}