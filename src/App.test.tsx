import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { GAMES, createMatch, emptyEntry } from './lib/scoring'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('preferred-lang', 'es')
})

async function startFour() {
  const user = userEvent.setup()
  render(<App />)
  await user.type(screen.getByLabelText('Nombre jugador 1'), 'Ana')
  await user.click(screen.getByRole('button', { name: 'Empezar' }))
  return user
}

async function startThree() {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: '3 jugadores' }))
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
    expect(screen.getByRole('status').textContent).toContain('faltan 120')
    const more = screen.getByRole('button', { name: 'Basas Ana más' })
    for (let i = 0; i < 13; i++) await user.click(more)
    expect(more).toHaveProperty('disabled', true)
    const status = screen.getByRole('status').textContent
    expect(status).toContain('−330 / −330')
    expect(status).not.toContain('faltan')
  })

  it('blocks adding once a count is fully assigned and frees it when lowered', async () => {
    const user = await startFour()
    const ana = screen.getByRole('button', { name: 'Basas Ana más' })
    const other = screen.getByRole('button', { name: 'Basas Jugador 2 más' })
    for (let i = 0; i < 12; i++) await user.click(ana)
    await user.click(other)
    expect(ana).toHaveProperty('disabled', true)
    expect(other).toHaveProperty('disabled', true)
    await user.click(screen.getByRole('button', { name: 'Basas Ana menos' }))
    expect(other).toHaveProperty('disabled', false)
  })

  it('assigns each queen by tapping and blocks it for the others', async () => {
    const user = await startFour()
    await user.click(screen.getByRole('button', { name: '3. Quinas' }))
    const mine = screen.getByRole('button', { name: 'Q♥ de Ana' })
    const theirs = screen.getByRole('button', { name: 'Q♥ de Jugador 2' })
    await user.click(mine)
    expect(mine.getAttribute('aria-pressed')).toBe('true')
    expect(theirs).toHaveProperty('disabled', true)
    expect(screen.getByRole('status').textContent).toContain('−60 /')
    await user.click(mine)
    expect(mine.getAttribute('aria-pressed')).toBe('false')
    expect(theirs).toHaveProperty('disabled', false)
  })

  it('gives every loser at least one card when domino has a winner', async () => {
    const user = await startFour()
    await user.click(screen.getByRole('button', { name: '6. Dominó' }))
    await user.click(screen.getByRole('button', { name: 'Ganó de Ana' }))
    expect(screen.getByRole('status').textContent).toContain('+270')
    expect(screen.getByRole('button', { name: 'Cartas Jugador 2 menos' })).toHaveProperty('disabled', true)
    await user.click(screen.getByRole('button', { name: 'Cartas Jugador 2 más' }))
    expect(screen.getByRole('button', { name: 'Cartas Jugador 2 menos' })).toHaveProperty('disabled', false)
  })

  it('adds the tricks needed by marked cards and keeps them as a minimum', async () => {
    const user = await startThree()
    await user.click(screen.getByRole('button', { name: '3. Quinas' }))
    for (const suit of ['♠', '♥', '♦', '♣']) {
      await user.click(screen.getByRole('button', { name: `Q${suit} de Ana` }))
    }
    expect(screen.getByRole('status').textContent).toContain('−220 /')
    await user.click(screen.getByRole('button', { name: 'Basas Ana menos' }))
    expect(screen.getByRole('status').textContent).toContain('−220 /')
    await user.click(screen.getByRole('button', { name: 'Última de Jugador 2' }))
    expect(screen.getByRole('status').textContent).toContain('−280 /')
  })

  it('blocks a mark when no tricks are left to hold it', async () => {
    const user = await startFour()
    const more = screen.getByRole('button', { name: 'Basas Ana más' })
    for (let i = 0; i < 13; i++) await user.click(more)
    expect(screen.getByRole('button', { name: '7♣ de Jugador 2' })).toHaveProperty('disabled', true)
    expect(screen.getByRole('button', { name: '7♣ de Ana' })).toHaveProperty('disabled', false)
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
      entry.tally[0] = { tricks: 13, hearts: 13 }
      entry.queens = [0, 0, 0, 0]
      entry.seven = 0
      entry.last = 0
      match.entries[g.id] = entry
    }
    match.entries.domino.winner = 1
    match.entries.domino.remaining = [1, 0, 1, 1]
    localStorage.setItem('cocktail:v1', JSON.stringify({ current: match, history: [] }))

    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Terminar partida' }))
    expect(screen.getByText(/A −410/)).toBeTruthy()
  })

  it('explains the rules without losing the match', async () => {
    const user = await startFour()
    await user.click(screen.getByRole('button', { name: 'Última de Ana' }))
    await user.click(screen.getByRole('button', { name: 'Reglas' }))
    expect(screen.getByText('Total fijo: −330 con 4 · −370 con 3')).toBeTruthy()
    expect(screen.getByText('Ganador +300 · Demás −10 por carta')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Reparto' })).toBeTruthy()
    expect(screen.getByText(/6 y 7 cartas con 4 jugadores/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Partida' }))
    expect(screen.getByRole('button', { name: 'Última de Ana' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('changes the text size from settings and remembers it', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Ajustes' }))
    await user.click(screen.getByRole('button', { name: /Muy grande/ }))
    expect(document.documentElement.style.fontSize).toBe('130%')
    expect(localStorage.getItem('cocktail:text-size')).toBe('xlarge')
    cleanup()
    document.documentElement.style.fontSize = ''
    render(<App />)
    expect(document.documentElement.style.fontSize).toBe('130%')
  })

  it('shows the total and the issue under each played game', async () => {
    const user = await startFour()
    await user.click(screen.getByRole('button', { name: 'Última de Ana' }))
    expect(screen.getByText('Total −60 · faltan 270')).toBeTruthy()
  })

  it('switches language and remembers it', async () => {
    const user = await startFour()
    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('button', { name: 'Finish match' })).toBeTruthy()
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem('preferred-lang')).toBe('en')
  })

  it('toggles the color mode', async () => {
    localStorage.setItem('color-mode', 'dark')
    const user = userEvent.setup()
    render(<App />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Cambiar a modo claro' }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('color-mode')).toBe('light')
  })

  it('shows the footer and offers install only when the browser allows it', async () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'tletelieru' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Instalar app' })).toBeNull()
    const event = Object.assign(new Event('beforeinstallprompt'), { prompt: async () => {} })
    act(() => {
      window.dispatchEvent(event)
    })
    expect(screen.getByRole('button', { name: 'Instalar app' })).toBeTruthy()
  })
})
