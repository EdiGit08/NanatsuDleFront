import { useState, useEffect, useRef } from 'react'
import type { SearchResult } from '../types'
import { searchCharacters } from '../services/api'

interface Props {
  onSelect: (character: SearchResult) => void
  disabled?: boolean
}

export default function SearchBox({ onSelect, disabled }: Props) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen]       = useState(false)
  const timeoutRef            = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 1) {
      setResults([])
      setOpen(false)
      return
    }

    // Espera 300ms después de que el usuario deja de escribir
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      const data = await searchCharacters(query)
      setResults(data)
      setOpen(data.length > 0)
    }, 300)
  }, [query])

  const handleSelect = (character: SearchResult) => {
    onSelect(character)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative', width: '320px' }}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Escribe el nombre de un personaje..."
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '8px',
          border: '2px solid #555',
          background: '#1a1a2e',
          color: '#fff',
          fontSize: '14px',
          boxSizing: 'border-box',
        }}
      />

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#16213e',
          border: '1px solid #555',
          borderRadius: '8px',
          marginTop: '4px',
          zIndex: 10,
          maxHeight: '240px',
          overflowY: 'auto',
        }}>
          {results.map(char => (
            <div
              key={char.id}
              onClick={() => handleSelect(char)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #333',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0f3460')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <img
                src={char.imageUrl}
                alt={char.name}
                style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
              />
              <span style={{ color: '#fff', fontSize: '14px' }}>{char.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}