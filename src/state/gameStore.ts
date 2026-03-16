import { create } from 'zustand'

export type GameScreen =
  | 'BOOT'
  | 'REVEAL'
  | 'GARAGE'
  | 'COUNTDOWN'
  | 'RACE'
  | 'FINISH'

interface GameState {
  screen: GameScreen
  setScreen: (screen: GameScreen) => void
  skillsCollected: string[]
  collectSkill: (skill: string) => void
  resetSkills: () => void
  lapTime: number
  setLapTime: (t: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'BOOT',
  setScreen: (screen) => set({ screen }),
  skillsCollected: [],
  collectSkill: (skill) =>
    set((s) => ({
      skillsCollected: s.skillsCollected.includes(skill)
        ? s.skillsCollected
        : [...s.skillsCollected, skill],
    })),
  resetSkills: () => set({ skillsCollected: [] }),
  lapTime: 0,
  setLapTime: (lapTime) => set({ lapTime }),
}))