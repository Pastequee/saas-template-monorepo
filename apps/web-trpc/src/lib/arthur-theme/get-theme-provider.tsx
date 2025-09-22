import { MEDIA } from './constants'
import { type ScriptParams, script } from './script'

type ThemeScriptProps<Theme extends string> = {
  defaultTheme: Theme
  storageKey: string
  themes: readonly Theme[]
}

export const getThemeProvider = <Theme extends string>({
  defaultTheme,
  storageKey,
  themes,
}: ThemeScriptProps<Theme>) => {
  const params: ScriptParams<Theme> = {
    defaultTheme,
    media: MEDIA,
    storageKey,
    themes,
  }

  return () => {
    return (
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: need to inject script before hydration
        dangerouslySetInnerHTML={{
          __html: `(${script.toString()})(${JSON.stringify(params)})`,
        }}
      />
    )
  }
}
