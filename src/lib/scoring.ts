export type GameId = 'trebol' | 'corazones' | 'quinas' | 'todo' | 'nada' | 'domino'

export type TallyField = 'tricks' | 'hearts'

export type Suit = '♠' | '♥' | '♦' | '♣'

export interface Rule {
  sign: 1 | -1
  tricks: number
  hearts: number
  queens: number
  seven: number
  last: number
}

export interface GameDef {
  id: GameId
  rule: Rule | null
}

export interface Tally {
  tricks: number
  hearts: number
}

export interface GameEntry {
  tally: Tally[]
  queens: (number | null)[]
  seven: number | null
  last: number | null
  winner: number | null
  remaining: number[]
}

export interface Match {
  id: string
  players: string[]
  createdAt: number
  finishedAt: number | null
  entries: Record<GameId, GameEntry>
}

export interface GameIssue {
  kind: 'missing' | 'extra' | 'noWinner' | 'noCards' | 'noTricks'
  amount: number
}

export interface GameStatus {
  state: 'empty' | 'ok' | 'off'
  total: number
  expected: number | null
  issue: GameIssue | null
}

export interface RuleLabels {
  trick: string
  heart: string
  queen: string
  seven: string
  last: string
  winner: string
  others: string
  perCard: string
}

export const GAMES: GameDef[] = [
  { id: 'trebol', rule: { sign: -1, tricks: 10, hearts: 0, queens: 0, seven: 150, last: 50 } },
  { id: 'corazones', rule: { sign: 1, tricks: 10, hearts: 10, queens: 0, seven: 0, last: 50 } },
  { id: 'quinas', rule: { sign: -1, tricks: 10, hearts: 0, queens: 50, seven: 0, last: 50 } },
  { id: 'todo', rule: { sign: 1, tricks: 10, hearts: 10, queens: 50, seven: 150, last: 50 } },
  { id: 'nada', rule: { sign: -1, tricks: 10, hearts: 10, queens: 50, seven: 150, last: 50 } },
  { id: 'domino', rule: null },
]

export const HEARTS = 13
export const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
export const QUEENS = SUITS.length
export const DOMINO_WIN = 300
export const DOMINO_CARD = 10

export function handSize(playerCount: number): number {
  return playerCount === 3 ? 17 : 13
}

export function emptyEntry(playerCount: number): GameEntry {
  return {
    tally: Array.from({ length: playerCount }, () => ({ tricks: 0, hearts: 0 })),
    queens: SUITS.map(() => null),
    seven: null,
    last: null,
    winner: null,
    remaining: Array.from({ length: playerCount }, () => 0),
  }
}

export function createMatch(players: string[], now: number, id: string): Match {
  const entries = Object.fromEntries(GAMES.map((g) => [g.id, emptyEntry(players.length)]))
  return { id, players, createdAt: now, finishedAt: null, entries: entries as Record<GameId, GameEntry> }
}

export function upgradeMatch(match: Match): Match {
  const entries = Object.fromEntries(
    Object.entries(match.entries).map(([id, entry]) => {
      if (entry.queens) return [id, entry]
      const counts = entry.tally as (Tally & { queens?: number })[]
      const owners = counts.flatMap((t, i) => Array.from({ length: t.queens ?? 0 }, () => i))
      return [id, { ...entry, queens: SUITS.map((_, i) => owners[i] ?? null) }]
    }),
  )
  return { ...match, entries: entries as Record<GameId, GameEntry> }
}

export function minTricks(game: GameDef, entry: GameEntry, player: number): number {
  const { rule } = game
  if (!rule) return 0
  const owned = rule.queens ? SUITS.filter((_, s) => entry.queens[s] === player) : []
  const queens = owned.filter((suit) => !rule.hearts || suit !== '♥').length
  const hearts = rule.hearts
    ? Math.max(entry.tally[player].hearts, owned.includes('♥') ? 1 : 0)
    : 0
  const seven = rule.seven && entry.seven === player ? 1 : 0
  const cards = queens + hearts + seven
  return Math.max(Math.ceil(cards / entry.tally.length), entry.last === player ? 1 : 0)
}

export function settleTricks(game: GameDef, entry: GameEntry): GameEntry {
  return {
    ...entry,
    tally: entry.tally.map((t, i) => ({ ...t, tricks: Math.max(t.tricks, minTricks(game, entry, i)) })),
  }
}

export function fitsHand(game: GameDef, entry: GameEntry): boolean {
  const tricks = settleTricks(game, entry).tally.reduce((sum, t) => sum + t.tricks, 0)
  return tricks <= handSize(entry.tally.length)
}

export function gameScores(game: GameDef, entry: GameEntry): number[] {
  const { rule } = game
  if (!rule) {
    return entry.remaining.map((cards, i) => (entry.winner === i ? DOMINO_WIN : -DOMINO_CARD * cards))
  }
  return entry.tally.map((t, i) => {
    const points =
      t.tricks * rule.tricks +
      t.hearts * rule.hearts +
      entry.queens.filter((owner) => owner === i).length * rule.queens +
      (entry.seven === i ? rule.seven : 0) +
      (entry.last === i ? rule.last : 0)
    return rule.sign * points
  })
}

export function expectedTotal(game: GameDef, playerCount: number): number | null {
  const { rule } = game
  if (!rule) return null
  const points =
    handSize(playerCount) * rule.tricks + HEARTS * rule.hearts + QUEENS * rule.queens + rule.seven + rule.last
  return rule.sign * points
}

function isEmpty(entry: GameEntry): boolean {
  return (
    entry.seven === null &&
    entry.last === null &&
    entry.winner === null &&
    entry.remaining.every((c) => c === 0) &&
    entry.queens.every((owner) => owner === null) &&
    entry.tally.every((t) => t.tricks === 0 && t.hearts === 0)
  )
}

export function gameStatus(game: GameDef, entry: GameEntry): GameStatus {
  const total = gameScores(game, entry).reduce((a, b) => a + b, 0)
  const expected = expectedTotal(game, entry.tally.length)
  if (isEmpty(entry)) return { state: 'empty', total: 0, expected, issue: null }
  if (expected === null) {
    if (entry.winner === null) {
      return { state: 'off', total, expected, issue: { kind: 'noWinner', amount: 0 } }
    }
    const missing = entry.remaining.some((cards, i) => i !== entry.winner && cards === 0)
    return missing
      ? { state: 'off', total, expected, issue: { kind: 'noCards', amount: 0 } }
      : { state: 'ok', total, expected, issue: null }
  }
  const diff = Math.abs(expected) - Math.abs(total)
  if (diff === 0) {
    return entry.tally.some((t, i) => t.tricks < minTricks(game, entry, i))
      ? { state: 'off', total, expected, issue: { kind: 'noTricks', amount: 0 } }
      : { state: 'ok', total, expected, issue: null }
  }
  const issue: GameIssue = { kind: diff > 0 ? 'missing' : 'extra', amount: Math.abs(diff) }
  return { state: 'off', total, expected, issue }
}

export function matchTotals(match: Match): number[] {
  const totals = match.players.map(() => 0)
  for (const game of GAMES) {
    gameScores(game, match.entries[game.id]).forEach((score, i) => {
      totals[i] += score
    })
  }
  return totals
}

export function isComplete(match: Match): boolean {
  return GAMES.every((g) => gameStatus(g, match.entries[g.id]).state === 'ok')
}

export function formatPoints(n: number): string {
  if (n > 0) return `+${n}`
  if (n < 0) return `−${-n}`
  return '0'
}

export function ruleSummary(game: GameDef, labels: RuleLabels): string {
  const { rule } = game
  if (!rule) {
    return `${labels.winner} ${formatPoints(DOMINO_WIN)} · ${labels.others} ${formatPoints(-DOMINO_CARD)} ${labels.perCard}`
  }
  const parts: [string, number][] = [
    [labels.trick, rule.tricks],
    [labels.heart, rule.hearts],
    [labels.queen, rule.queens],
    [labels.seven, rule.seven],
    [labels.last, rule.last],
  ]
  return parts
    .filter(([, value]) => value > 0)
    .map(([label, value]) => `${label} ${formatPoints(rule.sign * value)}`)
    .join(' · ')
}
