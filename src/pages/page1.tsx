import type { SearchResult } from '../types'
import { useDailyGame } from '../hooks/useDailyGame'
import { useStreak } from '../hooks/useStreak'
import SearchBox from '../components/SearchBox'
import GuessRow from '../components/GuessRow'
import GameOverModal from '../components/GameOverModal'
import Countdown from '../components/Countdown'
import HintCard from '../components/HintCard'

const LOGO_URL = 'https://res.cloudinary.com/dsidu0tej/image/upload/v1775107062/NNTDLELogo3_b5mv8z.png'
const BG_URL   = 'https://res.cloudinary.com/dsidu0tej/image/upload/v1774757940/BackgroundNNTDLE_hdtqrt.jpg'

export default function App() {
  const { streak, incrementStreak, resetStreak } = useStreak()

  const {
    target, daily, loading, error,
    showModal, makeGuess, closeModal, getTimeUntilReset,
  } = useDailyGame({
    onWin:  incrementStreak,
    onLose: resetStreak,
  })

  const handleGuess = async (selected: SearchResult) => {
    if (!daily || daily.gameOver) return
    await makeGuess(selected.id)
  }

  if (loading) return (
    <div style={styles.centered}>
      <p style={{ color: '#fff', fontSize: '18px' }}>Cargando personaje del día...</p>
    </div>
  )

  if (error) return (
    <div style={styles.centered}>
      <p style={{ color: '#e53935' }}>{error}</p>
    </div>
  )

  const guesses    = daily?.guesses    ?? []
  const hints      = daily?.hints      ?? { magic: null, firstAppearance: null }
  const gameOver   = daily?.gameOver   ?? false
  const won        = daily?.won        ?? false
  const guessedIds = new Set(daily?.guessedIds ?? [])

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <div style={styles.inner}>

          {/* Racha fija arriba a la derecha */}
          <div style={styles.streakBox}>
            <span style={{ fontSize: '12px', color: '#aaa' }}>Racha</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#ffc107' }}>
              {streak.current}
            </span>
            <span style={{ fontSize: '11px', color: '#aaa' }}>Mejor: {streak.best}</span>
          </div>

          {/* Header */}
          <div style={styles.header}>
            <a href="/">
              <img src={LOGO_URL} alt="NanatsuDle" style={styles.logo} />
            </a>
          </div>

          {/* Tarjetas de pistas */}
          <div style={styles.hintsRow}>
            <HintCard
              icon="✨"
              label="Magia"
              unlocksAt={5}
              currentAttempts={guesses.length}
              value={hints.magic}
            />
            <HintCard
              icon="📖"
              label="Primera aparición"
              unlocksAt={7}
              currentAttempts={guesses.length}
              value={hints.firstAppearance}
            />
          </div>

          {/* Buscador o countdown */}
          {!gameOver ? (
            <div style={styles.searchArea}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
              }}>
                <SearchBox
                  onSelect={handleGuess}
                  disabled={gameOver}
                  excludeIds={guessedIds}
                />
                {guesses.length > 0 && (
                  <p style={{ color: '#aaa', fontSize: '12px' }}>
                    Intentos: {guesses.length} / 10
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '28px' }}>
              <Countdown getTimeUntilReset={getTimeUntilReset} />
            </div>
          )}

          {/* Tabla de intentos */}
          {guesses.length > 0 && (
            <div style={styles.tableWrapper}>
              <div style={styles.tableHeader}>
                <div style={styles.colPersonaje}>Personaje</div>
                {['Género', 'Raza', 'Cabello', 'Afiliación', 'Habilidad', 'Altura', 'Arco'].map(col => (
                  <div key={col} style={styles.colHeader}>{col}</div>
                ))}
              </div>
              <div style={styles.guessList}>
                {[...guesses].reverse().map((g, i) => (
                  <GuessRow key={guesses.length - 1 - i} result={g} rowIndex={i} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal fin de juego */}
      {showModal && target && (
        <GameOverModal
          won={won}
          attempts={guesses.length}
          target={target}
          onClose={closeModal}
        />
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
    marginLeft: '-72px',        // ← cancela el margin del main
    paddingLeft: '72px',        // ← mantiene el contenido en su lugar
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f0f1a',
    gap: '16px',
  },
  streakBox: {
    position: 'fixed',
    top: '16px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(26, 26, 46, 0.95)',
    padding: '10px 20px',
    borderRadius: '14px',
    border: '1px solid #ffc10733',
    gap: '2px',
    zIndex: 100,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '16px',
    width: '100%',
  },
  logo: {
    height: '180px',
    objectFit: 'contain',
    marginBottom: '8px',
  },
  hintsRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  searchArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '28px',
    width: '100%',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    borderBottom: '1px solid #ffffff22',
    paddingBottom: '8px',
    minWidth: 'max-content',
  },
  colPersonaje: {
    width: '80px',
    minWidth: '80px',
    textAlign: 'center' as const,
    fontSize: '11px',
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    fontWeight: 700,
    background: 'rgba(10, 10, 26, 0.75)',
    padding: '6px 4px',
    borderRadius: '6px',
  },
  colHeader: {
    width: '110px',
    minWidth: '110px',
    textAlign: 'center' as const,
    fontSize: '11px',
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    fontWeight: 700,
    background: 'rgba(10, 10, 26, 0.75)',
    padding: '6px 4px',
    borderRadius: '6px',
  },
  guessList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 'max-content',
  },
}