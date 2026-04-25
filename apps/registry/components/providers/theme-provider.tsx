"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
  attribute?: "class"
  children: React.ReactNode
  defaultTheme?: Theme
  disableTransitionOnChange?: boolean
  enableColorScheme?: boolean
  enableSystem?: boolean
  storageKey?: string
}

type ThemeContextValue = {
  forcedTheme?: never
  resolvedTheme: "light" | "dark" | undefined
  setTheme: React.Dispatch<React.SetStateAction<string>>
  systemTheme: "light" | "dark" | undefined
  theme: Theme | undefined
  themes: Theme[]
}

const MEDIA_QUERY = "(prefers-color-scheme: dark)"
const STORAGE_FALLBACK_THEME: Theme = "system"
const THEME_VALUES: Theme[] = ["light", "dark", "system"]

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme() {
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light"
}

function getStoredTheme(storageKey: string, defaultTheme: Theme) {
  try {
    const storedTheme = window.localStorage.getItem(storageKey)

    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      return storedTheme
    }
  } catch {}

  return defaultTheme
}

function applyTheme(theme: Theme, enableColorScheme: boolean) {
  const root = document.documentElement
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme

  root.classList.remove("light", "dark")
  root.classList.add(resolvedTheme)

  if (enableColorScheme) {
    root.style.colorScheme = resolvedTheme
  }
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    window.setTimeout(() => {
      document.head.removeChild(style)
    }, 1)
  }
}

export function ThemeProvider({
  children,
  defaultTheme = STORAGE_FALLBACK_THEME,
  disableTransitionOnChange = false,
  enableColorScheme = true,
  enableSystem = true,
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme | undefined>(undefined)
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark" | undefined>(undefined)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(MEDIA_QUERY)
    const syncSystemTheme = () => setSystemTheme(getSystemTheme())

    syncSystemTheme()
    setThemeState(getStoredTheme(storageKey, defaultTheme))

    mediaQuery.addEventListener("change", syncSystemTheme)

    return () => {
      mediaQuery.removeEventListener("change", syncSystemTheme)
    }
  }, [defaultTheme, storageKey])

  React.useEffect(() => {
    if (!theme) {
      return
    }

    const cleanup = disableTransitionOnChange ? disableTransitionsTemporarily() : undefined
    const nextTheme = enableSystem ? theme : theme === "system" ? "light" : theme

    applyTheme(nextTheme, enableColorScheme)
    cleanup?.()
  }, [disableTransitionOnChange, enableColorScheme, enableSystem, theme])

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) {
        return
      }

      setThemeState(getStoredTheme(storageKey, defaultTheme))
    }

    window.addEventListener("storage", onStorage)

    return () => {
      window.removeEventListener("storage", onStorage)
    }
  }, [defaultTheme, storageKey])

  const setTheme = React.useCallback<React.Dispatch<React.SetStateAction<string>>>(
    (value) => {
      setThemeState((currentTheme) => {
        const nextValue = typeof value === "function" ? value(currentTheme ?? defaultTheme) : value
        const normalizedTheme =
          nextValue === "light" || nextValue === "dark" || nextValue === "system"
            ? nextValue
            : defaultTheme

        try {
          window.localStorage.setItem(storageKey, normalizedTheme)
        } catch {}

        return normalizedTheme
      })
    },
    [defaultTheme, storageKey]
  )

  const resolvedTheme = theme === "light" || theme === "dark" ? theme : systemTheme

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      resolvedTheme,
      setTheme,
      systemTheme,
      theme,
      themes: THEME_VALUES,
    }),
    [resolvedTheme, setTheme, systemTheme, theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return (
    React.useContext(ThemeContext) ?? {
      resolvedTheme: undefined,
      setTheme: () => undefined,
      systemTheme: undefined,
      theme: undefined,
      themes: THEME_VALUES,
    }
  )
}
