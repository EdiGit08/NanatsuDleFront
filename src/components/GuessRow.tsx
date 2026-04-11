import { useEffect, useState } from 'react'
import type { GuessResult } from '../types'
import FieldCell from './FieldCell'

interface Props {
  result: GuessResult
  rowIndex: number
}

const columns = [
  { key: 'gender'},
  { key: 'race'},
  { key: 'hairColor'},
  { key: 'affiliation'},
  { key: 'typeOfSkill'},
  { key: 'height'},
  { key: 'arc'},
] as const

export default function GuessRow({ result, rowIndex }: Props) {
  const [rowVisible, setRowVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRowVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      opacity: rowVisible ? 1 : 0,
      transform: rowVisible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>
      {/* Imagen — ancho fijo igual al colPersonaje del header */}
      <div style={{
        width: '80px',
        minWidth: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <img
          src={result.guessImageUrl}
          alt={result.guessName}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '8px',
            objectFit: 'cover',
            border: result.isCorrect ? '3px solid #4caf50' : '2px solid #555',
          }}
        />
        <span style={{
          fontSize: '10px',
          marginTop: '3px',
          textAlign: 'center',
          color: '#ccc',
          maxWidth: '78px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {result.guessName}
        </span>
      </div>

      {/* Celdas con delay escalonado */}
      {columns.map((col, i) => (
        <FieldCell
          key={col.key}
          value={result[col.key].value}
          status={result[col.key].status}
          delay={i * 400}
        />
      ))}
    </div>
  )
}