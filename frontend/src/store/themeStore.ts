import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  dark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        const next = !get().dark
        set({ dark: next })
        document.documentElement.classList.toggle('dark', next)
      },
    }),
    { name: 'devoir-ai-theme' }
  )
)

// Appliquer le thème au chargement
export function initTheme() {
  const stored = localStorage.getItem('devoir-ai-theme')
  if (stored) {
    const { state } = JSON.parse(stored)
    if (state?.dark) {
      document.documentElement.classList.add('dark')
    }
  }
}
