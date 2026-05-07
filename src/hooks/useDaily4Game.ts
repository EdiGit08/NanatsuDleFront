import { useState, useEffect } from 'react'
import { getDailyDate, getDaily4, guess4Character, guessCategory } from '../services/api'
import type { Daily4State, CharacterGuess4 } from '../types'

const STORAGE_KEY = 'nanatsu_daily4'

const emptyState = (date: string): Daily4State => ({
  date,
  characterGuesses:  [],
  categoryGuess:     null,
  gameOver:          false,
  won:               false,
  correctCategory:   null,
  correctTipo:       null,
  categoryAttempted: false,
})

const loadDaily4 = (): Daily4State | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

const saveDaily4 = (state: Daily4State) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

interface Options {
  onWin?:  () => void
  onLose?: () => void
}

export const useDaily4Game = ({ onWin, onLose }: Options = {}) => {
  const [daily4, setDaily4]       = useState<Daily4State | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { init() }, [])

  const init = async () => {
    setLoading(true)
    setError(null)
    try {
      const [todayDate] = await Promise.all([getDailyDate(), getDaily4()])
      const saved = loadDaily4()
      if (saved && saved.date === todayDate) {
        setDaily4(saved)
        if (saved.gameOver) setShowModal(true)
      } else {
        const fresh = emptyState(todayDate)
        setDaily4(fresh)
        saveDaily4(fresh)
      }
    } catch {
      setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?')
    } finally {
      setLoading(false)
    }
  }

  const makeCharacterGuess = async (guessId: number) => {
    if (!daily4 || daily4.gameOver) return
    if (daily4.characterGuesses.length >= 10) return
    if (daily4.characterGuesses.some(g => g.id === guessId)) return

    try {
      const result = await guess4Character(guessId)
      const newGuess: CharacterGuess4 = {
        id:      result.guessId,
        name:    result.guessName,
        imageUrl: result.guessImageUrl,
        correct: result.resultado.status === 'correct',
      }

      const next: Daily4State = {
        ...daily4,
        characterGuesses: [...daily4.characterGuesses, newGuess],
      }

      setDaily4(next)
      saveDaily4(next)
    } catch {
      setError('Error al enviar el intento.')
    }
  }

  const makeCategoryGuess = async (answerTipo: string, answerValue: string) => {
    if (!daily4 || daily4.gameOver || daily4.categoryAttempted) return

    try {
      const result = await guessCategory(answerTipo, answerValue)
      const won    = result.isCorrect

      if (won) onWin?.()
      else     onLose?.()

      const next: Daily4State = {
        ...daily4,
        categoryGuess:     answerValue,
        categoryAttempted: true,
        gameOver:          true,
        won,
        correctCategory: result.correctCategory,
        correctTipo:     result.correctTipo,
      }

      setDaily4(next)
      saveDaily4(next)
      setShowModal(true)
    } catch {
      setError('Error al enviar la categoría.')
    }
  }

  const closeModal = () => setShowModal(false)

  return { daily4, loading, error, showModal, makeCharacterGuess, makeCategoryGuess, closeModal }
}