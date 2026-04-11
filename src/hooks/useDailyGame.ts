import { useState, useEffect } from 'react'
import type { GuessResult, HintResult, TargetCharacter } from '../types'
import { getDailyCharacter, getDailyDate, getDailyHints, guessCharacter } from '../services/api'

const STORAGE_KEY = 'nanatsu_daily'

interface DailyState {
  date: string
  guesses: GuessResult[]
  guessedIds: number[]
  hints: HintResult
  gameOver: boolean
  won: boolean
}

const emptyState = (date: string): DailyState => ({
  date,
  guesses: [],
  guessedIds: [],
  hints: { magic: null, firstAppearance: null },
  gameOver: false,
  won: false,
})

const loadDaily = (): DailyState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const saveDaily = (state: DailyState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

interface UseDailyGameOptions {
  onWin?: () => void
  onLose?: () => void
}

export const useDailyGame = ({ onWin, onLose }: UseDailyGameOptions = {}) => {
  const [target, setTarget]       = useState<TargetCharacter | null>(null)
  const [daily, setDaily]         = useState<DailyState | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    setLoading(true)
    setError(null)
    try {
      const todayDate = await getDailyDate()
      const testDate  = todayDate
      const character = await getDailyCharacter(testDate)

      setTarget(character)

      const saved = loadDaily()
      if (saved && saved.date === testDate) {
        setDaily(saved)
        if (saved.gameOver) setShowModal(true)
      } else {
        const fresh = emptyState(testDate)
        setDaily(fresh)
        saveDaily(fresh)
      }
    } catch {
      setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?')
    } finally {
      setLoading(false)
    }
  }

  const makeGuess = async (guessId: number) => {
    if (!target || !daily || daily.gameOver) return

    try {
      const result     = await guessCharacter(target.id, guessId)
      const newGuesses = [...daily.guesses, result]
      const newIds     = [...daily.guessedIds, guessId]
      const attempts   = newGuesses.length

      let newHints = daily.hints
      if (attempts >= 5 || attempts >= 7) {
        newHints = await getDailyHints(attempts, daily.date)
      }

      const won      = result.isCorrect
      const gameOver = won || attempts >= 10

      // ← aquí llamamos los callbacks con valores locales, no de estado
      if (gameOver) {
        if (won) onWin?.()
        else     onLose?.()
      }

      const next: DailyState = {
        ...daily,
        guesses:    newGuesses,
        guessedIds: newIds,
        hints:      newHints,
        gameOver,
        won,
      }

      setDaily(next)
      saveDaily(next)

      if (gameOver) setShowModal(true)

    } catch {
      setError('Error al enviar el intento. Intenta de nuevo.')
    }
  }

  const closeModal = () => setShowModal(false)

  const getTimeUntilReset = (): string => {
    const now        = new Date()
    const utcMs      = now.getTime() + now.getTimezoneOffset() * 60000
    const colombiaMs = utcMs - 5 * 3600000
    const colombia   = new Date(colombiaMs)

    const tomorrow = new Date(colombia)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const diff    = tomorrow.getTime() - colombia.getTime()
    const hours   = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return {
    target,
    daily,
    loading,
    error,
    showModal,
    makeGuess,
    closeModal,
    getTimeUntilReset,
  }
}