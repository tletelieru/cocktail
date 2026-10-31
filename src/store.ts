import { useCallback, useEffect, useState } from 'react'
import { createMatch, upgradeMatch } from './lib/scoring'
import type { GameEntry, GameId, Match } from './lib/scoring'

export interface Persisted {
  current: Match | null
  history: Match[]
}

const KEY = 'cocktail:v1'

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { current: null, history: [] }
    const parsed = JSON.parse(raw) as Partial<Persisted>
    return {
      current: parsed.current ? upgradeMatch(parsed.current) : null,
      history: (parsed.history ?? []).map(upgradeMatch),
    }
  } catch {
    return { current: null, history: [] }
  }
}

export function useStore() {
  const [data, setData] = useState<Persisted>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data))
  }, [data])

  const start = useCallback((players: string[]) => {
    const match = createMatch(players, Date.now(), crypto.randomUUID())
    setData((d) => ({ ...d, current: match }))
  }, [])

  const updateEntry = useCallback((game: GameId, entry: GameEntry) => {
    setData((d) =>
      d.current
        ? { ...d, current: { ...d.current, entries: { ...d.current.entries, [game]: entry } } }
        : d,
    )
  }, [])

  const finish = useCallback(() => {
    setData((d) =>
      d.current
        ? { current: null, history: [{ ...d.current, finishedAt: Date.now() }, ...d.history] }
        : d,
    )
  }, [])

  const discard = useCallback(() => {
    setData((d) => ({ ...d, current: null }))
  }, [])

  const remove = useCallback((id: string) => {
    setData((d) => ({ ...d, history: d.history.filter((m) => m.id !== id) }))
  }, [])

  return { ...data, start, updateEntry, finish, discard, remove }
}
