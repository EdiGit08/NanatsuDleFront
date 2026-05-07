import axios from 'axios'
import type { GuessResult, HintResult, RowResult, SearchResult, TargetCharacter } from '../types'

const api = axios.create({
  baseURL: 'http://localhost:5064/api',
})

// Personaje del día
export const getDailyCharacter = async (date: string): Promise<TargetCharacter> => {
  const { data } = await api.get('/characters/daily', { params: { date } })
  return data
}

// Fecha del personaje de hoy en Colombia
export const getDailyDate = async (): Promise<string> => {
  const { data } = await api.get('/characters/daily-date')
  return data.date
}

// Enviar intento
export const guessCharacter = async (
  targetId: number,
  guessId: number
): Promise<GuessResult> => {
  const { data } = await api.post('/characters/guess', { targetId, guessId })
  return data
}

//Obtiene el segundo personaje para el juego 2
export const getDaily2Character = async (): Promise<{ id: number; image2Url: string }> => {
  const { data } = await api.get('/characters/daily2')
  return data
}

// Enviar intento para el juego 2
export const guess2Character = async (
  targetId: number,
  answer: string
): Promise<{ isCorrect: boolean; correctName: string | null; imageUrl: string | null }> => {
  const { data } = await api.post('/characters/guess2', { targetId, answer })
  return data
}

// Obtiene el tercer personaje para el juego 3
export const getDaily3Character = async (): Promise<{ id: number; height: number; race: string; hairColor: string; gender: string; affiliation: string; imageUrl: string;}> => {
  const { data } = await api.get('/characters/daily3')
  return data
}

// Enviar intento para el juego 3
export const guess3Character = async (
  targetId: number,
  answer: string
): Promise<{ isCorrect: boolean; correctName: string | null; imageUrl: string | null; correctImageUrl: string | null }> => {
  const { data } = await api.post('/characters/guess3', { targetId, answer })
  return data
}

// Buscar personajes
export const searchCharacters = async (name: string): Promise<SearchResult[]> => {
  const { data } = await api.get('/characters/search', { params: { name } })
  return data
}

// Pistas del personaje diario
export const getDailyHints = async (attempts: number, date: string): Promise<HintResult> => {
  const { data } = await api.get('/characters/daily-hint', { params: { attempts, date } })
  return data
}

export const getDaily2Hints = async (attempts: number): Promise<HintResult> => {
  const { data } = await api.get('/characters/daily2-hint', { params: { attempts } })
  return data
}

export const getRowGame3 = async (attempts: number): Promise<RowResult> => {
  const { data } = await api.get('/characters/row-game3', { params: { attempts } })
  return data
}

export const getDaily4 = async (): Promise<void> => {
  await api.get('/characters/daily4')
}

export const guess4Character = async (
  guessId: number
): Promise<{
  guessId: number
  guessName: string
  guessImageUrl: string
  resultado: { value: string; status: string }
  tipo: string
}> => {
  const { data } = await api.post('/characters/guess4', { guessId })
  return data
}

export const guessCategory = async (
  answerTipo: string,
  answerValue: string
): Promise<{ isCorrect: boolean; correctCategory: string; correctTipo: string }> => {
  const { data } = await api.post('/characters/guess-category', { answerTipo, answerValue })
  return data
}