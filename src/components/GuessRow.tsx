import type { GuessResult } from '../types'
import FieldCell from './FieldCell'

interface Props {
  result: GuessResult
}

const columns = [
  { key: 'gender',      label: 'Género' },
  { key: 'race',        label: 'Raza' },
  { key: 'hairColor',   label: 'Cabello' },
  { key: 'affiliation', label: 'Afiliación' },
  { key: 'typeOfSkill', label: 'Habilidad' },
  { key: 'height',      label: 'Altura' },
  { key: 'arc',         label: 'Arco' },
] as const

export default function GuessRow({ result }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
    }}>
      {/* Imagen y nombre del personaje intentado */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '80px',
      }}>
        <img
          src={result.guessImageUrl}
          alt={result.guessName}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '8px',
            objectFit: 'cover',
            border: result.isCorrect ? '3px solid #4caf50' : '2px solid #555',
          }}
        />
        <span style={{ fontSize: '10px', marginTop: '4px', textAlign: 'center' }}>
          {result.guessName}
        </span>
      </div>

      {/* Celdas de comparación */}
      {columns.map(col => (
        <FieldCell
          key={col.key}
          value={result[col.key].value}
          status={result[col.key].status}
          label={col.label}
        />
      ))}
    </div>
  )
}