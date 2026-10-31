import { describe, expect, it } from 'vitest'
import {
  GAMES,
  createMatch,
  emptyEntry,
  expectedTotal,
  formatPoints,
  gameScores,
  fitsHand,
  gameStatus,
  handSize,
  isComplete,
  matchTotals,
  minTricks,
  ruleSummary,
  settleTricks,
  upgradeMatch,
} from './scoring'
import { messages } from '../i18n/messages'
import type { GameEntry, GameId, Match } from './scoring'

const game = (id: GameId) => GAMES.find((g) => g.id === id)!

function fullEntry(playerCount: number): GameEntry {
  const entry = emptyEntry(playerCount)
  entry.tally[0] = { tricks: handSize(playerCount), hearts: 13 }
  entry.queens = [0, 0, 0, 0]
  entry.seven = 0
  entry.last = 0
  return entry
}

describe('expectedTotal', () => {
  it.each([
    ['trebol', -330, -370],
    ['corazones', 310, 350],
    ['quinas', -380, -420],
    ['todo', 660, 700],
    ['nada', -660, -700],
  ] as const)('%s', (id, four, three) => {
    expect(expectedTotal(game(id), 4)).toBe(four)
    expect(expectedTotal(game(id), 3)).toBe(three)
  })

  it('has no fixed total for domino', () => {
    expect(expectedTotal(game('domino'), 4)).toBeNull()
  })
})

describe('gameScores', () => {
  it('counts the last trick as a normal trick plus the bonus', () => {
    const entry = emptyEntry(4)
    entry.tally[1].tricks = 1
    entry.last = 1
    expect(gameScores(game('trebol'), entry)[1]).toBe(-60)
  })

  it('charges the seven of clubs in trebol', () => {
    const entry = emptyEntry(4)
    entry.seven = 2
    expect(gameScores(game('trebol'), entry)[2]).toBe(-150)
  })

  it('ignores fields that do not apply to the game', () => {
    const entry = emptyEntry(4)
    entry.tally[0] = { tricks: 1, hearts: 5 }
    entry.queens = [0, null, 0, null]
    entry.seven = 0
    expect(gameScores(game('corazones'), entry)[0]).toBe(60)
    expect(gameScores(game('quinas'), entry)[0]).toBe(-110)
  })

  it('scores todo and nada as mirrors', () => {
    const entry = emptyEntry(3)
    entry.tally[0] = { tricks: 2, hearts: 3 }
    entry.queens = [null, 0, null, null]
    entry.seven = 0
    entry.last = 0
    expect(gameScores(game('todo'), entry)[0]).toBe(300)
    expect(gameScores(game('nada'), entry)[0]).toBe(-300)
  })

  it('scores domino', () => {
    const entry = emptyEntry(4)
    entry.winner = 3
    entry.remaining = [4, 0, 7, 2]
    expect(gameScores(game('domino'), entry).map(formatPoints)).toEqual(['−40', '0', '−70', '+300'])
  })
})

describe('minTricks', () => {
  it('fits one card per player in each trick', () => {
    const three = emptyEntry(3)
    three.queens = [0, 0, 0, 0]
    expect(minTricks(game('quinas'), three, 0)).toBe(2)
    three.queens = [0, 0, 0, null]
    expect(minTricks(game('quinas'), three, 0)).toBe(1)
    const four = emptyEntry(4)
    four.queens = [0, 0, 0, 0]
    expect(minTricks(game('quinas'), four, 0)).toBe(1)
  })

  it('counts the seven and the last trick', () => {
    const entry = emptyEntry(3)
    entry.seven = 1
    entry.last = 2
    expect(minTricks(game('trebol'), entry, 1)).toBe(1)
    expect(minTricks(game('trebol'), entry, 2)).toBe(1)
    expect(minTricks(game('corazones'), entry, 1)).toBe(0)
  })

  it('does not count the queen of hearts twice', () => {
    const entry = emptyEntry(3)
    entry.tally[0].hearts = 3
    entry.queens = [null, 0, null, null]
    expect(minTricks(game('todo'), entry, 0)).toBe(1)
  })

  it('raises tricks and detects a hand that no longer fits', () => {
    const entry = emptyEntry(4)
    entry.tally[1].tricks = 13
    entry.seven = 0
    expect(settleTricks(game('trebol'), entry).tally[0].tricks).toBe(1)
    expect(fitsHand(game('trebol'), entry)).toBe(false)
  })
})

describe('gameStatus', () => {
  it('is empty when nothing was entered', () => {
    expect(gameStatus(game('trebol'), emptyEntry(4)).state).toBe('empty')
  })

  it.each(GAMES.filter((g) => g.rule).map((g) => g.id))('is ok when %s matches', (id) => {
    expect(gameStatus(game(id), fullEntry(4)).state).toBe('ok')
    expect(gameStatus(game(id), fullEntry(3)).state).toBe('ok')
  })

  it('reports missing points on a negative game', () => {
    const entry = fullEntry(4)
    entry.tally[0].tricks = 11
    expect(gameStatus(game('trebol'), entry)).toMatchObject({
      state: 'off',
      total: -310,
      issue: { kind: 'missing', amount: 20 },
    })
  })

  it('reports extra points', () => {
    const entry = fullEntry(4)
    entry.tally[1].tricks = 5
    expect(gameStatus(game('quinas'), entry)).toMatchObject({
      state: 'off',
      issue: { kind: 'extra', amount: 50 },
    })
  })

  it('requires a winner in domino', () => {
    const entry = emptyEntry(4)
    entry.remaining[0] = 3
    expect(gameStatus(game('domino'), entry)).toMatchObject({
      state: 'off',
      issue: { kind: 'noWinner' },
    })
    entry.winner = 1
    expect(gameStatus(game('domino'), entry)).toMatchObject({
      state: 'off',
      issue: { kind: 'noCards' },
    })
    entry.remaining = [3, 0, 1, 2]
    expect(gameStatus(game('domino'), entry).state).toBe('ok')
  })
})

describe('match', () => {
  it('upgrades stored queen counts to owners', () => {
    const match = createMatch(['A', 'B', 'C', 'D'], 1, 'id')
    const stored = JSON.parse(JSON.stringify(match))
    stored.entries.quinas.tally[1].queens = 2
    stored.entries.quinas.tally[3].queens = 1
    for (const id of Object.keys(stored.entries)) delete stored.entries[id].queens
    expect(upgradeMatch(stored).entries.quinas.queens).toEqual([1, 1, 3, null])
    expect(upgradeMatch(stored).entries.trebol.queens).toEqual([null, null, null, null])
  })

  function played(): Match {
    const match = createMatch(['A', 'B', 'C', 'D'], 1, 'id')
    for (const g of GAMES) match.entries[g.id] = fullEntry(4)
    match.entries.domino.winner = 1
    match.entries.domino.remaining = [3, 0, 2, 1]
    return match
  }

  it('sums totals across games', () => {
    expect(matchTotals(played())).toEqual([-430, 300, -20, -10])
  })

  it('is complete only when every game is ok', () => {
    const match = played()
    expect(isComplete(match)).toBe(true)
    match.entries.todo.last = null
    expect(isComplete(match)).toBe(false)
  })
})

describe('format', () => {
  it('formats points', () => {
    expect(formatPoints(310)).toBe('+310')
    expect(formatPoints(-330)).toBe('−330')
    expect(formatPoints(0)).toBe('0')
  })

  it('summarizes a rule', () => {
    expect(ruleSummary(game('trebol'), messages.es.rule)).toBe('Basa −10 · 7♣ −150 · Última −50')
    expect(ruleSummary(game('domino'), messages.es.rule)).toBe('Ganador +300 · Demás −10 por carta')
  })
})
