export type HairStyle = 'bald' | 'buzz' | 'short' | 'medium' | 'long' | 'spiky' | 'curly'
export type HatStyle = 'none' | 'cap' | 'helmet' | 'beanie' | 'beret'
export type GlassesStyle = 'none' | 'round' | 'square' | 'shades'
export type FacialHairStyle = 'none' | 'stubble' | 'mustache' | 'beard'

export interface CharacterAppearance {
  name: string
  skinTone: string
  hairStyle: HairStyle
  hairColor: string
  hat: HatStyle
  hatColor: string
  glasses: GlassesStyle
  facialHair: FacialHairStyle
  facialHairColor: string
  bootColor: string
}

export const DEFAULT_CHARACTER: CharacterAppearance = {
  name: '',
  skinTone: '#e8b88a',
  hairStyle: 'short',
  hairColor: '#3d2314',
  hat: 'none',
  hatColor: '#1e3a8a',
  glasses: 'none',
  facialHair: 'none',
  facialHairColor: '#3d2314',
  bootColor: '#1c1917',
}

export const SKIN_TONES = [
  '#f5d7c3',
  '#e8b88a',
  '#d4a574',
  '#c68642',
  '#a0714f',
  '#8d5524',
  '#6b4423',
  '#4a3728',
]

export const HAIR_COLORS = [
  '#1a1a1a',
  '#3d2314',
  '#6b4423',
  '#b8860b',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#2563eb',
  '#f8fafc',
]

export const HAT_COLORS = [
  '#1e3a8a',
  '#dc2626',
  '#166534',
  '#1c1917',
  '#78716c',
  '#f8fafc',
  '#ca8a04',
  '#7c3aed',
]

export const BOOT_COLORS = [
  '#1c1917',
  '#44403c',
  '#57534e',
  '#1e3a8a',
  '#7f1d1d',
  '#365314',
]

const STORAGE_KEY = 'team-war-character-v1'
const MAX_SOLDIER_NAME_LENGTH = 24

export function sanitizeSoldierName(raw: string): string {
  return raw
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, MAX_SOLDIER_NAME_LENGTH)
}

export function loadCharacterAppearance(): CharacterAppearance {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_CHARACTER }
    const saved = JSON.parse(raw) as Partial<CharacterAppearance>
    return {
      ...DEFAULT_CHARACTER,
      ...saved,
      name: sanitizeSoldierName(saved.name ?? ''),
    }
  } catch {
    return { ...DEFAULT_CHARACTER }
  }
}

export function saveCharacterAppearance(appearance: CharacterAppearance) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...appearance, name: sanitizeSoldierName(appearance.name) }),
  )
}

export function darkenHex(hex: string, amount = 0.22): string {
  const n = hex.replace('#', '')
  const r = Math.max(0, parseInt(n.slice(0, 2), 16) * (1 - amount)) | 0
  const g = Math.max(0, parseInt(n.slice(2, 4), 16) * (1 - amount)) | 0
  const b = Math.max(0, parseInt(n.slice(4, 6), 16) * (1 - amount)) | 0
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
