import axios from 'axios'
import type { GuessResult, HintResult, SearchResult, TargetCharacter } from '../types'

const api = axios.create({
  baseURL: 'http://localhost:5064/api',
})

export const getRandomCharacter = async (): Promise<TargetCharacter> => {
  const { data } = await api.get('/characters/random')
  return data
}

export const guessCharacter = async (
  targetId: number,
  guessId: number
): Promise<GuessResult> => {
  const { data } = await api.post('/characters/guess', { targetId, guessId })
  return data
}

export const searchCharacters = async (name: string): Promise<SearchResult[]> => {
  const { data } = await api.get('/characters/search', { params: { name } })
  return data
}

export const getHints = async (
  characterId: number,
  attempts: number
): Promise<HintResult> => {
  const { data } = await api.get(`/characters/hint/${characterId}`, {
    params: { attempts },
  })
  return data
}