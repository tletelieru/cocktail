import {
  HEARTS,
  QUEENS,
  formatPoints,
  gameScores,
  gameStatus,
  handSize,
  ruleSummary,
} from '../lib/scoring'
import type { GameDef, GameEntry, Tally, TallyField } from '../lib/scoring'
import { Stepper } from './Stepper'

interface Props {
  game: GameDef
  players: string[]
  entry: GameEntry
  onChange: (entry: GameEntry) => void
}

function Toggle({
  text,
  label,
  on,
  onClick,
}: {
  text: string
  label: string
  on: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-medium ${
        on ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
      }`}
    >
      {text}
    </button>
  )
}

export function GameForm({ game, players, entry, onChange }: Props) {
  const { rule } = game
  const hand = handSize(players.length)
  const scores = gameScores(game, entry)
  const status = gameStatus(game, entry)

  const fields: { field: TallyField; label: string; max: number }[] = rule
    ? [
        { field: 'tricks' as const, label: 'Basas', max: hand },
        ...(rule.hearts ? [{ field: 'hearts' as const, label: 'Corazones', max: HEARTS }] : []),
        ...(rule.queens ? [{ field: 'queens' as const, label: 'Quinas', max: QUEENS }] : []),
      ]
    : []

  const setTally = (i: number, patch: Partial<Tally>) =>
    onChange({
      ...entry,
      tally: entry.tally.map((t, j) => (j === i ? { ...t, ...patch } : t)),
    })

  const setRemaining = (i: number, value: number) =>
    onChange({ ...entry, remaining: entry.remaining.map((c, j) => (j === i ? value : c)) })

  const pick = (key: 'seven' | 'last' | 'winner', i: number) =>
    onChange({ ...entry, [key]: entry[key] === i ? null : i })

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold">{game.name}</h2>
        <p className="text-sm text-slate-400">{ruleSummary(game)}</p>
      </div>

      {players.map((player, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl bg-slate-800 p-3">
          <div className="flex items-baseline justify-between">
            <span className="font-medium">{player}</span>
            <span className="font-semibold tabular-nums">{formatPoints(scores[i])}</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            {fields.map(({ field, label, max }) => (
              <Stepper
                key={field}
                label={label}
                player={player}
                value={entry.tally[i][field]}
                max={max}
                onChange={(value) => setTally(i, { [field]: value })}
              />
            ))}
            {!rule && entry.winner !== i && (
              <Stepper
                label="Cartas"
                player={player}
                value={entry.remaining[i]}
                max={hand}
                onChange={(value) => setRemaining(i, value)}
              />
            )}
            <div className="flex gap-1">
              {rule && rule.seven > 0 && (
                <Toggle
                  text="7♣"
                  label={`7♣ de ${player}`}
                  on={entry.seven === i}
                  onClick={() => pick('seven', i)}
                />
              )}
              {rule && (
                <Toggle
                  text="Última"
                  label={`Última de ${player}`}
                  on={entry.last === i}
                  onClick={() => pick('last', i)}
                />
              )}
              {!rule && (
                <Toggle
                  text="Ganó"
                  label={`Ganó de ${player}`}
                  on={entry.winner === i}
                  onClick={() => pick('winner', i)}
                />
              )}
            </div>
          </div>
        </div>
      ))}

      <p
        role="status"
        className={`text-right font-semibold tabular-nums ${
          status.state === 'off' ? 'text-red-400' : 'text-slate-300'
        }`}
      >
        Total {formatPoints(status.total)}
        {status.expected !== null && ` / ${formatPoints(status.expected)}`}
        {status.message && ` · ${status.message}`}
      </p>
    </section>
  )
}
