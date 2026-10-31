import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { GAMES, createMatch, emptyEntry } from './lib/scoring'

beforeEach(() => localStorage.clear())

async function startFour() {
  const user = userEvent.setup()
  render(<App />)
  await user.type(screen.getByLabelText('Nombre jugador 1'), 'Ana')
  await user.click(screen.getByRole('button', { name: 'Empezar' }))
  return user
}

describe('App', () => {
  it('starts a match with three players', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '3 jugadores' }))
    expect(screen.queryByLabelText('Nombre jugador 4')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Empezar' }))
    expect(screen.getByRole('status').textContent).toContain('−370')
  })

  it('shows what is missing and clears it when the total matches', async () => {
    const user = await startFour()
    await user.click(screen.getByRole('button', { name: '7♣ de Ana' }))
    await user.click(screen.getByRole('button', { name: 'Última de Ana' }))
    expect(screen.getByRole('status').textContent).toContain('faltan 130')
    const more = screen.getByRole('button', { name: 'Basas Ana más' })
    for (let i = 0; i < 13; i++) await user.click(more)
    expect(more).toHaveProperty('disabled', true)
    const status = screen.getByRole('status').textContent
    expect(status).toContain('−330 / −330')
    expect(status).not.toContain('faltan')
  })

  it('keeps the seven of clubs with a single owner', async () => {
    const user = await startFour()
    await user.click(screen.getByRole('button', { name: '7♣ de Ana' }))
    await user.click(screen.getByRole('button', { name: '7♣ de Jugador 2' }))
    expect(screen.getByRole('button', { name: '7♣ de Ana' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('restores the match after a reload', async () => {
    const user = await startFour()
    await user.click(screen.getByRole('button', { name: 'Última de Ana' }))
    cleanup()
    render(<App />)
    expect(screen.getByRole('button', { name: 'Última de Ana' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('moves a complete match to the history', async () => {
    const match = createMatch(['A', 'B', 'C', 'D'], 1, 'm1')
    for (const g of GAMES) {
      const entry = emptyEntry(4)
      entry.tally[0] = { tricks: 13, hearts: 13, queens: 4 }
      entry.seven = 0
      entry.last = 0
      match.entries[g.id] = entry
    }
    match.entries.domino.winner = 1
    localStorage.setItem('cocktail:v1', JSON.stringify({ current: match, history: [] }))

    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Terminar partida' }))
    expect(screen.getByText(/A −400/)).toBeTruthy()
  })
})
