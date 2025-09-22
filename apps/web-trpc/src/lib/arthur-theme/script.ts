/** biome-ignore-all lint/style/noNestedTernary: I want to use it, so what !? */

export type ScriptParams<Theme extends string> = {
  media: string
  storageKey: string
  defaultTheme: Theme
  themes: readonly Theme[]
}

export function script<Theme extends string>({
  defaultTheme,
  media,
  storageKey,
  themes,
}: ScriptParams<Theme>) {
  function IsTheme(value: string): value is Theme {
    return themes.includes(value as Theme)
  }

  const localStorageTheme = localStorage.getItem(storageKey) ?? defaultTheme

  const theme = IsTheme(localStorageTheme) ? localStorageTheme : defaultTheme

  const resolved =
    theme === 'system'
      ? window.matchMedia(media).matches
        ? 'dark'
        : 'light'
      : theme

  document.documentElement.className = resolved
}
