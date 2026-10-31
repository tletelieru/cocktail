import { useEffect, useState } from 'react'
import { useStore } from './store'
import { useInstall } from './useInstall'
import { pickLocale, preferredLocaleKey } from './i18n/locales'
import type { Locale } from './i18n/locales'
import { LocaleContext, messages } from './i18n/messages'
import { pickTextSize, textSizeKey, textSizeScale } from './lib/textSize'
import type { TextSize } from './lib/textSize'
import { colorModeKey, pickColorMode, prefersDark } from './lib/theme'
import type { ColorMode } from './lib/theme'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { History } from './components/History'
import { MatchView } from './components/MatchView'
import { Rules } from './components/Rules'
import { Settings } from './components/Settings'
import { Setup } from './components/Setup'

type View = 'match' | 'history' | 'rules'

export default function App() {
  const store = useStore()
  const install = useInstall()
  const [view, setView] = useState<View>('match')
  const [locale, setLocale] = useState<Locale>(() =>
    pickLocale(localStorage.getItem(preferredLocaleKey), navigator.languages),
  )
  const [mode, setMode] = useState<ColorMode>(() =>
    pickColorMode(localStorage.getItem(colorModeKey), prefersDark()),
  )
  const [textSize, setTextSize] = useState<TextSize>(() =>
    pickTextSize(localStorage.getItem(textSizeKey)),
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const t = messages[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.classList.toggle('dark', mode === 'dark')
    document.documentElement.style.colorScheme = mode
    document.documentElement.style.fontSize = textSizeScale[textSize]
  }, [locale, mode, textSize])

  const tab = (id: View, label: string) => (
    <button
      type="button"
      onClick={() => setView(id)}
      aria-pressed={view === id}
      className={`rounded-lg py-1.5 text-sm font-medium ${
        view === id ? 'bg-emerald-700 text-white' : 'bg-surface text-muted'
      }`}
    >
      {label}
    </button>
  )

  return (
    <LocaleContext value={locale}>
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 p-4">
        <Header
          mode={mode}
          onLocale={(next) => {
            localStorage.setItem(preferredLocaleKey, next)
            setLocale(next)
          }}
          onToggleMode={() => {
            const next = mode === 'dark' ? 'light' : 'dark'
            localStorage.setItem(colorModeKey, next)
            setMode(next)
          }}
          onInstall={install}
          settingsOpen={settingsOpen}
          onSettings={() => setSettingsOpen(!settingsOpen)}
          compact={textSize !== 'normal'}
        />
        {settingsOpen && (
          <Settings
            size={textSize}
            onSize={(next) => {
              localStorage.setItem(textSizeKey, next)
              setTextSize(next)
            }}
          />
        )}
        <nav className="grid grid-cols-3 gap-1.5">
          {tab('match', t.match)}
          {tab('history', t.history)}
          {tab('rules', t.rules)}
        </nav>
        {view === 'rules' ? (
          <Rules />
        ) : view === 'history' ? (
          <History matches={store.history} onRemove={store.remove} />
        ) : store.current ? (
          <MatchView
            match={store.current}
            onChange={store.updateEntry}
            onFinish={() => {
              store.finish()
              setView('history')
            }}
            onDiscard={store.discard}
          />
        ) : (
          <Setup lastPlayers={store.history[0]?.players} onStart={store.start} />
        )}
        <Footer />
      </div>
    </LocaleContext>
  )
}
