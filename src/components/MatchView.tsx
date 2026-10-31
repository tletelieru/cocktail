import { useState } from 'react'
import { GAMES, gameStatus, isComplete } from '../lib/scoring'
import type { GameEntry, GameId, Match } from '../lib/scoring'
import { GameForm } from './GameForm'
import { ScoreTable } from './ScoreTable'

interface Props {
  match: Match
  onChange: (game: GameId, entry: GameEntry) => void
  onFinish: () => void
  onDiscard: () => void
}

const DOT = { empty: 'bg-slate-600', ok: 'bg-emerald-400', off: 'bg-red-400' }

export function MatchView({ match, onChange, onFinish, onDiscard }: Props) {
  const [active, setActive] = useState<GameId>('trebol')
  const game = GAMES.find((g) => g.id === active)!
  const complete = isComplete(match)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-1.5">
        {GAMES.map((g, i) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActive(g.id)}
            aria-pressed={active === g.id}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-1 py-2 text-sm ${
              active === g.id ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <span className={`size-2 rounded-full ${DOT[gameStatus(g, match.entries[g.id]).state]}`} />
            {i + 1}. {g.name}
          </button>
        ))}
      </div>

      <GameForm
        game={game}
        players={match.players}
        entry={match.entries[active]}
        onChange={(entry) => onChange(active, entry)}
      />

      <ScoreTable match={match} />

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!complete}
          onClick={onFinish}
          className="flex-1 rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:opacity-40"
        >
          Terminar partida
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('¿Descartar esta partida? No queda en el historial.')) onDiscard()
          }}
          className="rounded-xl bg-slate-800 px-4 py-3 text-slate-300"
        >
          Descartar
        </button>
      </div>
    </div>
  )
}
