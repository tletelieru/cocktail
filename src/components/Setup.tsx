import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMessages } from '../i18n/messages'

interface Props {
  lastPlayers?: string[]
  onStart: (players: string[]) => void
}

export function Setup({ lastPlayers, onStart }: Props) {
  const t = useMessages()
  const [count, setCount] = useState(lastPlayers?.length ?? 4)
  const [names, setNames] = useState(() =>
    Array.from({ length: 4 }, (_, i) => lastPlayers?.[i] ?? ''),
  )

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onStart(names.slice(0, count).map((name, i) => name.trim() || t.defaultPlayer(i + 1)))
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{t.newMatch}</h2>
      <div className="grid grid-cols-2 gap-2">
        {[4, 3].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCount(n)}
            aria-pressed={count === n}
            className={`rounded-xl py-3 font-medium ${
              count === n ? 'bg-emerald-700 text-white' : 'bg-surface text-muted'
            }`}
          >
            {t.playerCount(n)}
          </button>
        ))}
      </div>
      {names.slice(0, count).map((name, i) => (
        <input
          key={i}
          value={name}
          aria-label={t.playerName(i + 1)}
          placeholder={t.defaultPlayer(i + 1)}
          onChange={(e) => setNames(names.map((n, j) => (j === i ? e.target.value : n)))}
          className="rounded-xl bg-surface px-4 py-3 outline-none placeholder:text-muted focus:ring-2 focus:ring-emerald-600"
        />
      ))}
      <button type="submit" className="rounded-xl bg-emerald-600 py-3 font-semibold text-white">
        {t.start}
      </button>
    </form>
  )
}
