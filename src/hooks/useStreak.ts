import { useState } from 'react'

const STORAGE_KEY = 'nanatsu_streak'

interface StreakData {
  current: number
  best: number
  lastWonDate: string | null
}

const getColombiaDate = (): string => {
  const now        = new Date()
  const utcMs      = now.getTime() + now.getTimezoneOffset() * 60000
  const colombiaMs = utcMs - 5 * 3600000
  const colombia   = new Date(colombiaMs)
  return colombia.toISOString().split('T')[0]
}

const getYesterdayColombiaDate = (): string => {
  const now        = new Date()
  const utcMs      = now.getTime() + now.getTimezoneOffset() * 60000
  const colombiaMs = utcMs - 5 * 3600000
  const colombia   = new Date(colombiaMs)
  colombia.setDate(colombia.getDate() - 1)
  return colombia.toISOString().split('T')[0]
}

const loadStreak = (): StreakData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { current: 0, best: 0, lastWonDate: null }

    const data: StreakData = JSON.parse(saved)
    const today     = getColombiaDate()
    const yesterday = getYesterdayColombiaDate()

    // Si la última vez que ganó no fue ayer ni hoy, resetea la racha
    if (data.lastWonDate !== today && data.lastWonDate !== yesterday) {
      const reset = { current: 0, best: data.best, lastWonDate: null }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset))
      return reset
    }

    return data
  } catch {
    return { current: 0, best: 0, lastWonDate: null }
  }
}

const saveStreak = (data: StreakData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const useStreak = () => {
  const [streak, setStreak] = useState<StreakData>(loadStreak)

  const incrementStreak = () => {
    const today = getColombiaDate()
    setStreak(prev => {
      const next = {
        current:     prev.current + 1,
        best:        Math.max(prev.best, prev.current + 1),
        lastWonDate: today,
      }
      saveStreak(next)
      return next
    })
  }

  const resetStreak = () => {
    setStreak(prev => {
      const next = { current: 0, best: prev.best, lastWonDate: prev.lastWonDate }
      saveStreak(next)
      return next
    })
  }

  return { streak, incrementStreak, resetStreak }
}