export type GameId = 'trebol' | 'corazones' | 'quinas' | 'todo' | 'nada' | 'domino'

export type TallyField = 'tricks' | 'hearts' | 'queens'

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
  name: string
  rule: Rule | null
}

export interface Tally {
  tricks: number
  hearts: number
  queens: number
}

export interface GameEntry {
  tally: Tally[]
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

export interface GameStatus {
  state: 'empty' | 'ok' | 'off'
  total: number
  expected: number | null
  message: string
}

export const GAMES: GameDef[] = [
  { id: 'trebol', name: '7 de trébol', rule: { sign: -1, tricks: 10, hearts: 0, queens: 0, seven: 150, last: 50 } },
  { id: 'corazones', name: 'Corazones', rule: { sign: 1, tricks: 10, hearts: 10, queens: 0, seven: 0, last: 50 } },
  { id: 'quinas', name: 'Quinas', rule: { sign: -1, tricks: 10, hearts: 0, queens: 50, seven: 0, last: 50 } },
  { id: 'todo', name: 'Todo', rule: { sign: 1, tricks: 10, hearts: 10, queens: 50, seven: 150, last: 50 } },
  { id: 'nada', name: 'Nada', rule: { sign: -1, tricks: 10, hearts: 10, queens: 50, seven: 150, last: 50 } },
  { id: 'domino', name: 'Dominó', rule: null },
]

export const HEARTS = 13
export const QUEENS = 4
export const DOMINO_WIN = 300
export const DOMINO_CARD = 10

export function handSize(playerCount: number): number {
  return playerCount === 3 ? 17 : 13
}

export function emptyEntry(playerCount: number): GameEntry {
  return {
    tally: Array.from({ length: playerCount }, () => ({ tricks: 0, hearts: 0, queens: 0 })),
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

export function gameScores(game: GameDef, entry: GameEntry): number[] {
  const { rule } = game
  if (!rule) {
    return entry.remaining.map((cards, i) => (entry.winner === i ? DOMINO_WIN : -DOMINO_CARD * cards))
  }
  return entry.tally.map((t, i) => {
    const points =
      t.tricks * rule.tricks +
      t.hearts * rule.hearts +
      t.queens * rule.queens +
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
    entry.tally.every((t) => t.tricks === 0 && t.hearts === 0 && t.queens === 0)
  )
}

export function gameStatus(game: GameDef, entry: GameEntry): GameStatus {
  const total = gameScores(game, entry).reduce((a, b) => a + b, 0)
  const expected = expectedTotal(game, entry.tally.length)
  if (isEmpty(entry)) return { state: 'empty', total: 0, expected, message: '' }
  if (expected === null) {
    return entry.winner === null
      ? { state: 'off', total, expected, message: 'falta ganador' }
      : { state: 'ok', total, expected, message: '' }
  }
  const diff = Math.abs(expected) - Math.abs(total)
  if (diff === 0) return { state: 'ok', total, expected, message: '' }
  return { state: 'off', total, expected, message: diff > 0 ? `faltan ${diff}` : `sobran ${-diff}` }
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

export function ruleSummary(game: GameDef): string {
  const { rule } = game
  if (!rule) return `Ganador ${formatPoints(DOMINO_WIN)} · Demás ${formatPoints(-DOMINO_CARD)} por carta`
  const parts: [string, number][] = [
    ['Basa', rule.tricks],
    ['Corazón', rule.hearts],
    ['Quina', rule.queens],
    ['7♣', rule.seven],
    ['Última', rule.last],
  ]
  return parts
    .filter(([, value]) => value > 0)
    .map(([label, value]) => `${label} ${formatPoints(rule.sign * value)}`)
    .join(' · ')
}
