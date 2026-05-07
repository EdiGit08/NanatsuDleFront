import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const BG_URL   = 'https://res.cloudinary.com/dsidu0tej/image/upload/v1774757940/BackgroundNNTDLE_hdtqrt.jpg'
const LOGO_URL = 'https://res.cloudinary.com/dsidu0tej/image/upload/v1775107062/NNTDLELogo3_b5mv8z.png'

const GAMES = [
  {
    path:        '/page1',
    iconUrl:     '/juego1.png',
    hoverBg:     '/meliodasbc.png',
    title:       'Clásico',
    description: 'Adivina el personaje con pistas de sus atributos',
  },
  {
    path:        '/page2',
    iconUrl:     '/juego2.png',
    hoverBg:     'banbc.jpg',
    title:       'Imagen',
    description: 'Adivina el personaje por su imagen borrosa',
  },
  {
    path:        '/page3',
    iconUrl:     '/juego3.png',
    hoverBg:     'escanorbc.jpg',
    title:       'Pistas',
    description: 'Adivina el personaje con pistas progresivas',
  },
  {
    path:        '/page4',
    iconUrl:     '/juego4.png',
    hoverBg:     'camilabc.jpg',
    title:       'Próximamente',
    description: 'Nuevo modo de juego en camino',
  },
]

export default function Home() {
  const navigate    = useNavigate()
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div style={{
      ...styles.container,
      backgroundImage: hovered !== null && GAMES[hovered].hoverBg
        ? `url(${GAMES[hovered].hoverBg})`
        : `url(${BG_URL})`,
      transition: 'background-image 0.4s ease',
    }}>
      <div style={styles.overlay}>

        {/* Logo */}
        <img src={LOGO_URL} alt="NanatsuDle" style={styles.logo} />

        <p style={styles.subtitle}>
          Adivina los personajes de los Siete Pecados Capitales
        </p>

        {/* Tarjetas de juegos */}
        <div style={styles.gamesWrapper}>

          <div style={styles.gamesList}>
            {GAMES.map((game, i) => (
              <div
                key={i}
                onClick={() => navigate(game.path)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  ...styles.gameCard,
                  opacity: 1,
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transform:     hovered === i ? 'translateX(6px)' : 'translateX(0)',
                  borderColor:   hovered === i
                    ? 'rgba(255,193,7,0.6)'
                    : 'rgba(255,193,7,0.2)',
                }}
              >
                {/* Icono */}
                <div style={styles.iconWrapper}>
                  <img src={game.iconUrl} alt={game.title} style={styles.icon} />
                </div>

                {/* Texto */}
                <div style={styles.cardText}>
                  <span style={styles.cardTitle}>{game.title}</span>
                  <span style={styles.cardDesc}>{game.description}</span>
                </div>

                {/* Flecha */}
                <span style={{
                  ...styles.arrow,
                  opacity: hovered === i ? 1 : 0.4,
                  transform: hovered === i ? 'translateX(4px)' : 'translateX(0)',
                  transition: 'all 0.2s ease',
                }}>›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight:            '100vh',
    backgroundSize:       'cover',
    backgroundPosition:   'center',
    backgroundAttachment: 'fixed',
    fontFamily:           "'Segoe UI', sans-serif",
  },
  overlay: {
    minHeight:      '100vh',
    background:     'rgba(10, 10, 26, 0.82)',
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '40px 24px',
    gap:            '16px',
    transition:     'background 0.4s ease',
  },
  logo: {
    height:       '180px',
    objectFit:    'contain',
    marginBottom: '8px',
  },
  subtitle: {
    color:         '#aaa',
    fontSize:      '14px',
    textAlign:     'center',
    marginBottom:  '32px',
    letterSpacing: '0.5px',
  },
  gamesWrapper: {
    position:   'relative',
    width:      '100%',
    maxWidth:   '480px',
    display:    'flex',
    alignItems: 'stretch',
  },
  gamesList: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    gap:           '12px',
  },
  gameCard: {
    display:        'flex',
    alignItems:     'center',
    gap:            '16px',
    background:     'rgba(26, 26, 46, 0.85)',
    border:         '1px solid rgba(255, 193, 7, 0.2)',
    borderRadius:   '14px',
    padding:        '14px 18px',
    transition:     'transform 0.2s ease, border-color 0.2s ease',
    backdropFilter: 'blur(6px)',
  },
  iconWrapper: {
    width:          '52px',
    height:         '52px',
    borderRadius:   '12px',
    background:     'rgba(255,193,7,0.1)',
    border:         '1px solid rgba(255,193,7,0.3)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  icon: {
    width:     '36px',
    height:    '36px',
    objectFit: 'contain',
  },
  cardText: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    gap:           '3px',
  },
  cardTitle: {
    color:      '#fff',
    fontSize:   '18px',
    fontWeight: 700,
  },
  cardDesc: {
    color:    '#aaa',
    fontSize: '13px',
  },
  arrow: {
    color:      '#ffc107',
    fontSize:   '28px',
    fontWeight: 700,
    lineHeight: 1,
    flexShrink: 0,
  },
}