import { useState } from 'react'
import { GAMES, gameStatus, isComplete } from '../lib/scoring'
import type { GameEntry, GameId, Match } from '../lib/scoring'
import { useMessages } from '../i18n/messages'
import { GameForm } from './GameForm'
import { GameGlyph } from './GameSymbol'
import { ScoreTable } from './ScoreTable'

interface Props {
  match: Match
  onChange: (game: GameId, entry: GameEntry) => void
  onFinish: () => void
  onDiscard: () => void
}

const DOT = { empty: 'bg-transparent', ok: 'bg-emerald-400', off: 'bg-red-400' }

export function MatchView({ match, onChange, onFinish, onDiscard }: Props) {
  const t = useMessages()
  const [active, setActive] = useState<GameId>('trebol')
  const game = GAMES.find((g) => g.id === active)!
  const complete = isComplete(match)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-6 gap-1.5">
        {GAMES.map((g, i) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActive(g.id)}
            aria-pressed={active === g.id}
            aria-label={`${i + 1}. ${t.games[g.id]}`}
            title={t.games[g.id]}
            className={`relative flex h-12 items-center justify-center rounded-lg text-sm font-medium ${
              active === g.id ? 'bg-emerald-700 text-white' : 'bg-raised'
            }`}
          >
            <GameGlyph id={g.id} />
            <span
              className={`absolute top-1 right-1 size-2 rounded-full ${DOT[gameStatus(g, match.entries[g.id]).state]}`}
            />
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
          {t.finish}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t.discardConfirm)) onDiscard()
          }}
          className="rounded-xl bg-surface px-4 py-3 text-muted"
        >
          {t.discard}
        </button>
      </div>
    </div>
  )
}
