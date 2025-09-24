'use client'

import { Store, useStore } from '@tanstack/react-store'
import { isServer, MEDIA, STORAGE_KEY } from './constants'
import { getThemeProvider } from './get-theme-provider'

const defaultThemes = ['light', 'dark', 'system'] as const

type DefaultTheme = (typeof defaultThemes)[number]

type CreateThemeClientParams<CustomTheme extends string = never> = {
  defaultTheme?: CustomTheme | DefaultTheme
  customThemes?: readonly CustomTheme[]
  storageKey?: string
  systemDarkTheme?: Exclude<CustomTheme | DefaultTheme, 'system'>
  systemLightTheme?: Exclude<CustomTheme | DefaultTheme, 'system'>
}

export const createThemeClient = <CustomTheme extends string = never>({
  customThemes = [],
  defaultTheme = 'system',
  storageKey = STORAGE_KEY,
  systemDarkTheme = 'dark',
  systemLightTheme = 'light',
}: CreateThemeClientParams<CustomTheme> = {}) => {
  const themes = [...new Set([...customThemes, ...defaultThemes])] as const

  type Theme = (typeof themes)[number]

  function isTheme(value: string): value is Theme {
    return themes.includes(value as Theme)
  }

  function saveThemeToLs(theme: Theme) {
    try {
      localStorage.setItem(storageKey, theme)
    } catch (_e) {
      // If localStorage is not available, platform is not supported
    }
  }

  function getThemeFromLs() {
    if (isServer) return defaultTheme

    try {
      const theme = localStorage.getItem(storageKey)
      if (theme && isTheme(theme)) return theme
    } catch (_e) {
      // If local storage is not available, platform is not supported
    }

    return defaultTheme
  }

  const themeStore = new Store<{ theme: Theme }>({
    theme: getThemeFromLs(),
  })

  function setTheme(newTheme: Theme) {
    themeStore.setState({ theme: newTheme })
    saveThemeToLs(newTheme)
  }

  const useTheme = () => {
    const theme = useStore(themeStore, (state) => state.theme)
    if (isServer)
      return { theme: undefined, setTheme, resolvedTheme: undefined }
    const resolvedTheme =
      theme === 'system'
        ? window.matchMedia(MEDIA).matches
          ? systemDarkTheme
          : systemLightTheme
        : theme

    return { theme, setTheme, resolvedTheme }
  }

  const ThemeProvider = getThemeProvider({ defaultTheme, storageKey, themes })

  return { themes, useTheme, ThemeProvider }
}
