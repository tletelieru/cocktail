import {
  HEARTS,
  SUITS,
  fitsHand,
  formatPoints,
  gameScores,
  gameStatus,
  handSize,
  minTricks,
  ruleSummary,
  settleTricks,
} from '../lib/scoring'
import type { GameDef, GameEntry, Tally, TallyField } from '../lib/scoring'
import { issueText, useMessages } from '../i18n/messages'
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
  disabled,
  onClick,
}: {
  text: string
  label: string
  on: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium disabled:opacity-30 ${
        on ? 'bg-emerald-600 text-white' : 'bg-raised text-muted'
      }`}
    >
      {text}
    </button>
  )
}

export function GameForm({ game, players, entry, onChange }: Props) {
  const t = useMessages()
  const { rule } = game
  const hand = handSize(players.length)
  const scores = gameScores(game, entry)
  const status = gameStatus(game, entry)

  const fields: { field: TallyField; label: string; max: number }[] = rule
    ? [
        { field: 'tricks' as const, label: t.tricks, max: hand },
        ...(rule.hearts ? [{ field: 'hearts' as const, label: t.hearts, max: HEARTS }] : []),
      ]
    : []

  const commit = (next: GameEntry) => onChange(settleTricks(game, next))
  const fits = (next: GameEntry) => fitsHand(game, next)

  const withTally = (i: number, patch: Partial<Tally>): GameEntry => ({
    ...entry,
    tally: entry.tally.map((t, j) => (j === i ? { ...t, ...patch } : t)),
  })

  const withQueen = (suit: number, i: number): GameEntry => ({
    ...entry,
    queens: entry.queens.map((owner, j) => (j === suit ? (owner === i ? null : i) : owner)),
  })

  const withPick = (key: 'seven' | 'last', i: number): GameEntry => ({
    ...entry,
    [key]: entry[key] === i ? null : i,
  })

  const fieldMax = (field: TallyField, max: number, i: number) => {
    const room = max - entry.tally.reduce((sum, t, j) => (j === i ? sum : sum + t[field]), 0)
    if (field === 'tricks') return room
    let top = room
    while (top > entry.tally[i].hearts && !fits(withTally(i, { hearts: top }))) top -= 1
    return top
  }

  const setRemaining = (i: number, value: number) =>
    onChange({ ...entry, remaining: entry.remaining.map((c, j) => (j === i ? value : c)) })

  const pickWinner = (i: number) => {
    const winner = entry.winner === i ? null : i
    const remaining =
      winner === null
        ? entry.remaining
        : entry.remaining.map((cards, j) => (j === winner ? cards : Math.max(cards, 1)))
    onChange({ ...entry, winner, remaining })
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold">{t.games[game.id]}</h2>
        <p className="text-sm text-muted">{ruleSummary(game, t.rule)}</p>
      </div>

      {players.map((player, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl bg-surface p-3">
          <div className="flex items-baseline justify-between">
            <span className="font-medium">{player}</span>
            <span className="font-semibold tabular-nums">{formatPoints(scores[i])}</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            {rule && (
              <div className="flex flex-1 flex-wrap justify-between gap-2">
                {fields.map(({ field, label, max }) => (
                  <Stepper
                    key={field}
                    label={label}
                    player={player}
                    value={entry.tally[i][field]}
                    min={field === 'tricks' ? minTricks(game, entry, i) : 0}
                    max={fieldMax(field, max, i)}
                    onChange={(value) => commit(withTally(i, { [field]: value }))}
                  />
                ))}
              </div>
            )}
            {!rule && entry.winner !== i && (
              <Stepper
                label={t.cards}
                player={player}
                value={entry.remaining[i]}
                min={entry.winner === null ? 0 : 1}
                max={hand}
                onChange={(value) => setRemaining(i, value)}
              />
            )}
            <div className={`flex flex-wrap justify-between gap-2 ${rule?.queens ? 'w-full' : ''}`}>
              {rule && rule.queens > 0 && (
                <div className="flex gap-1">
                  {SUITS.map((suit, s) => (
                    <Toggle
                      key={suit}
                      text={`Q${suit}︎`}
                      label={`Q${suit} ${t.of} ${player}`}
                      on={entry.queens[s] === i}
                      disabled={
                        entry.queens[s] !== i && (entry.queens[s] !== null || !fits(withQueen(s, i)))
                      }
                      onClick={() => commit(withQueen(s, i))}
                    />
                  ))}
                </div>
              )}
              <div className="ml-auto flex gap-1">
                {rule && rule.seven > 0 && (
                  <Toggle
                    text={t.sevenShort}
                    label={`${t.sevenShort} ${t.of} ${player}`}
                    on={entry.seven === i}
                    disabled={entry.seven !== i && !fits(withPick('seven', i))}
                    onClick={() => commit(withPick('seven', i))}
                  />
                )}
                {rule && (
                  <Toggle
                    text={t.lastTrick}
                    label={`${t.lastTrick} ${t.of} ${player}`}
                    on={entry.last === i}
                    disabled={entry.last !== i && !fits(withPick('last', i))}
                    onClick={() => commit(withPick('last', i))}
                  />
                )}
                {!rule && (
                  <Toggle
                    text={t.won}
                    label={`${t.won} ${t.of} ${player}`}
                    on={entry.winner === i}
                    onClick={() => pickWinner(i)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <p
        role="status"
        className={`text-right font-semibold tabular-nums ${
          status.state === 'off' ? 'text-bad' : 'text-muted'
        }`}
      >
        {t.total} {formatPoints(status.total)}
        {status.expected !== null && ` / ${formatPoints(status.expected)}`}
        {status.issue && ` · ${issueText(status.issue, t)}`}
      </p>
    </section>
  )
}
