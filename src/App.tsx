import { useState } from 'react'
import { useStore } from './store'
import { History } from './components/History'
import { MatchView } from './components/MatchView'
import { Setup } from './components/Setup'

type View = 'match' | 'history'

export default function App() {
  const store = useStore()
  const [view, setView] = useState<View>('match')

  const tab = (id: View, label: string) => (
    <button
      type="button"
      onClick={() => setView(id)}
      aria-pressed={view === id}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
        view === id ? 'bg-emerald-800 text-white' : 'text-slate-400'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 p-4 text-slate-100">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Cocktail</h1>
        <nav className="flex gap-1">
          {tab('match', 'Partida')}
          {tab('history', 'Historial')}
        </nav>
      </header>
      {view === 'history' ? (
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
    </div>
  )
}
