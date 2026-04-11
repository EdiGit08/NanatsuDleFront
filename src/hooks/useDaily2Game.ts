import { useState, useEffect } from 'react'
import { getDaily2Character, getDailyDate, guess2Character } from '../services/api'
import { getDaily2Hints } from '../services/api'

const STORAGE_KEY = 'nanatsu_daily2'

interface Daily2State {
  date:        string
  targetId:    number
  image2Url:   string
  attempts:    number
  guesses:     { name: string; imageUrl: string | null }[]
  gameOver:    boolean
  won:         boolean
  correctName: string | null
  hints: { magic: string | null; firstAppearance: string | null }
}

const emptyState = (date: string, targetId: number, image2Url: string): Daily2State => ({
  date,
  targetId,
  image2Url,
  attempts:    0,
  guesses:     [],
  gameOver:    false,
  won:         false,
  correctName: null,
  hints: { magic: null, firstAppearance: null },
})

const loadDaily2 = (): Daily2State | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const saveDaily2 = (state: Daily2State) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

interface Options {
  onWin?:  () => void
  onLose?: () => void
}

export const useDaily2Game = ({ onWin, onLose }: Options = {}) => {
  const [daily2, setDaily2]       = useState<Daily2State | null>(null)
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
        getDaily2Character(),
      ])

      const saved = loadDaily2()
      if (saved && saved.date === todayDate) {
        setDaily2(saved)
        if (saved.gameOver) setShowModal(true)
      } else {
        const fresh = emptyState(todayDate, character.id, character.image2Url)
        setDaily2(fresh)
        saveDaily2(fresh)
      }
    } catch {
      setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?')
    } finally {
      setLoading(false)
    }
  }

  const makeGuess = async (answer: string) => {
    if (!daily2 || daily2.gameOver) return

    const newAttempts = daily2.attempts + 1

    try {
        const result   = await guess2Character(daily2.targetId, answer)
        const newGuesses = [...daily2.guesses, { name: answer, imageUrl: result.imageUrl }]

        let newHints = daily2.hints
        if (newAttempts >= 5 || newAttempts >= 7) {
        newHints = await getDaily2Hints(newAttempts)
        }

        const won      = result.isCorrect
        const gameOver = won || newAttempts >= 10

        if (gameOver) {
        if (won) onWin?.()
        else     onLose?.()
        }

        const next: Daily2State = {
        ...daily2,
        attempts:    newAttempts,
        guesses:     newGuesses,
        hints:       newHints,
        gameOver,
        won,
        correctName: result.correctName,
        }

        setDaily2(next)
        saveDaily2(next)
        if (gameOver) setShowModal(true)

    } catch {
        setError('Error al enviar el intento.')
    }
    }

  const closeModal = () => setShowModal(false)

  return { daily2, loading, error, showModal, makeGuess, closeModal }
}