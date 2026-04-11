// Resultado de un campo comparado (lo que devuelve el backend)
export interface FieldResult {
  value: string
  status: 'correct' | 'incorrect' | 'partial' | 'higher' | 'lower'
}

// Respuesta completa de POST /api/characters/guess
export interface GuessResult {
  guessId: number
  guessName: string
  guessImageUrl: string
  isCorrect: boolean
  gender: FieldResult
  race: FieldResult
  hairColor: FieldResult
  affiliation: FieldResult
  typeOfSkill: FieldResult
  height: FieldResult
  arc: FieldResult
}

// Personaje objetivo que devuelve GET /api/characters/random
export interface TargetCharacter {
  id: number
  imageUrl: string
  gender: string
  race: string
  arc: string
  arcOrder: number
  hairColor: string
  affiliation: string
  height: number
  typeOfSkill: string
}

export interface ImageCharacter {
  id: number
  name: string
  imageUrl: string
}

// Resultado de búsqueda para el autocompletado
export interface SearchResult {
  id: number
  name: string
  imageUrl: string
}

// Pistas desbloqueables
export interface HintResult {
  magic: string | null
  firstAppearance: string | null
}

// Estado de la racha guardado en LocalStorage
export interface StreakData {
  current: number
  best: number
}