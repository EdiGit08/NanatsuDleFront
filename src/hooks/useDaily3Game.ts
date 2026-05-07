import { useState, useEffect } from 'react'
import { getDaily3Character, getDailyDate, guess3Character, getRowGame3 } from '../services/api'

const STORAGE_KEY = 'nanatsu_daily3'

interface Daily3State {
  date:            string
  targetId:        number
  attempts:        number
  guesses:         { name: string; imageUrl: string | null }[]
  height:          number
  gender:          string
  race:            string
  hairColor:       string
  affiliation:     string
  gameOver:        boolean
  won:             boolean
  correctName:     string | null
  correctImageUrl: string | null   // ← raíz, no dentro de rows
  rows: {
    height:      number | null
    gender:      string | null
    race:        string | null
    hairColor:   string | null
    affiliation: string | null
  }
}

const emptyState = (
  date:        string,
  targetId:    number,
  height:      number,
  gender:      string,
  race:        string,
  hairColor:   string,
  affiliation: string
): Daily3State => ({
  date,
  targetId,
  attempts:        0,
  guesses:         [],
  height,
  gender,
  race,
  hairColor,
  affiliation,
  gameOver:        false,
  won:             false,
  correctName:     null,
  correctImageUrl: null,
  rows: { height: null, gender: null, race: null, hairColor: null, affiliation: null },
})

const loadDaily3 = (): Daily3State | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const saveDaily3 = (state: Daily3State) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

interface Options {
  onWin?:  () => void
  onLose?: () => void
}

export const useDaily3Game = ({ onWin, onLose }: Options = {}) => {
  const [daily3, setDaily3]       = useState<Daily3State | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { init() }, [])

  const init = async () => {
    setLoading(true)
    setError(null)
    try {
      const [todayDate, character] = await Promise.all([
        getDailyDate(),
        getDaily3Character(),
      ])

      const saved = loadDaily3()
      if (saved && saved.date === todayDate) {
        setDaily3(saved)
        if (saved.gameOver) setShowModal(true)
      } else {
        const initialRows = await getRowGame3(0)
        const fresh = emptyState(
          todayDate,
          character.id,
          character.height,
          character.gender,
          character.race,
          character.hairColor,
          character.affiliation,
        )
        const freshWithRows = { ...fresh, rows: initialRows }
        setDaily3(freshWithRows)
        saveDaily3(freshWithRows)
      }
    } catch {
      setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?')
    } finally {
      setLoading(false)
    }
  }

  const makeGuess = async (answer: string) => {
    if (!daily3 || daily3.gameOver) return

    const newAttempts = daily3.attempts + 1

    try {
      const result     = await guess3Character(daily3.targetId, answer)
      const newGuesses = [...daily3.guesses, { name: answer, imageUrl: result.imageUrl }]
      const newRows    = await getRowGame3(newAttempts)

      const won      = result.isCorrect
      const gameOver = won || newAttempts >= 5

      if (gameOver) {
        if (won) onWin?.()
        else     onLose?.()
      }

      const next: Daily3State = {
        ...daily3,
        attempts:        newAttempts,
        guesses:         newGuesses,
        rows:            newRows,
        gameOver,
        won,
        correctName:     result.correctName,
        correctImageUrl: gameOver ? (result.correctImageUrl ?? null) : null,
      }

      setDaily3(next)
      saveDaily3(next)
      if (gameOver) setShowModal(true)

    } catch {
      setError('Error al enviar el intento.')
    }
  }

  const closeModal = () => setShowModal(false)

  return { daily3, loading, error, showModal, makeGuess, closeModal }
}