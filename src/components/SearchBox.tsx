import { useState, useEffect, useRef } from 'react'
import type { SearchResult } from '../types'
import { searchCharacters } from '../services/api'

interface Props {
  onSelect: (character: SearchResult) => void
  disabled?: boolean
  excludeIds?: Set<number>
}

export default function SearchBox({ onSelect, disabled, excludeIds }: Props) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen]       = useState(false)
  const timeoutRef            = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    if (query.length < 1) {
      setActiveIndex(-1)
      setResults([])
      setOpen(false)
      return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      const data = await searchCharacters(query)
      // Filtra los personajes ya intentados
      const filtered = excludeIds
        ? data.filter(c => !excludeIds.has(c.id))
        : data
      setResults(filtered)
      setOpen(filtered.length > 0)
    }, 300)
  }, [query, excludeIds])

  const handleSelect = (character: SearchResult) => {
    onSelect(character)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative', width: '520px' }}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(prev => Math.min(prev + 1, results.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(prev => Math.max(prev - 1, 0))
          } else if (e.key === 'Enter') {
            e.preventDefault()
            if (activeIndex >= 0 && results[activeIndex]) {
              handleSelect(results[activeIndex])
            } else if (results.length > 0) {
              handleSelect(results[0])
            }
          } else if (e.key === 'Escape') {
            setOpen(false)
            setActiveIndex(-1)
          }
        }}
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
          {results.map((char, index) => (
            <div
              key={char.id}
              onClick={() => handleSelect(char)}
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