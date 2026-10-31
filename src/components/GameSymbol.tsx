import type { ReactNode } from 'react'
import type { GameId } from '../lib/scoring'
import { DominoIcon } from './icons'

const SYMBOLS: Record<GameId, ReactNode> = {
  trebol: '7♣︎',
  corazones: '♥︎',
  quinas: <span className="text-xl leading-none font-bold">Q</span>,
  todo: <span className="text-2xl leading-none font-bold">+</span>,
  nada: <span className="text-2xl leading-none font-bold">−</span>,
  domino: (
    <span className="inline-flex -rotate-45">
      <DominoIcon />
    </span>
  ),
}

export function GameGlyph({ id }: { id: GameId }) {
  return <>{SYMBOLS[id]}</>
}

export function GameSymbol({ id }: { id: GameId }) {
  return (
    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-raised align-middle text-sm font-medium">
      <GameGlyph id={id} />
    </span>
  )
}
