import { useState } from 'react'
import type { StreakData } from '../types'

const STORAGE_KEY = 'nanatsu_streak'

const loadStreak = (): StreakData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : { current: 0, best: 0 }
  } catch {
    return { current: 0, best: 0 }
  }
}

const saveStreak = (data: StreakData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const useStreak = () => {
  const [streak, setStreak] = useState<StreakData>(loadStreak)

  const incrementStreak = () => {
    setStreak(prev => {
      const next = {
        current: prev.current + 1,
        best: Math.max(prev.best, prev.current + 1),
      }
      saveStreak(next)
      return next
    })
  }

  const resetStreak = () => {
    setStreak(prev => {
      const next = { current: 0, best: prev.best }
      saveStreak(next)
      return next
    })
  }

  return { streak, incrementStreak, resetStreak }
}