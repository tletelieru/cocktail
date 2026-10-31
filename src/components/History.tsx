import { useState } from 'react'
import { formatPoints, matchTotals } from '../lib/scoring'
import type { Match } from '../lib/scoring'
import { ScoreTable } from './ScoreTable'

interface Props {
  matches: Match[]
  onRemove: (id: string) => void
}

const date = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' })

export function History({ matches, onRemove }: Props) {
  const [open, setOpen] = useState<string | null>(null)

  if (matches.length === 0) {
    return <p className="text-slate-400">Todavía no hay partidas terminadas.</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {matches.map((match) => {
        const totals = matchTotals(match)
        return (
          <li key={match.id} className="flex flex-col gap-2">
            <button
              type="button"
              aria-expanded={open === match.id}
              onClick={() => setOpen(open === match.id ? null : match.id)}
              className="rounded-xl bg-slate-800 p-3 text-left"
            >
              <span className="block text-xs text-slate-400">
                {date.format(match.finishedAt ?? match.createdAt)}
              </span>
              <span className="block text-sm">
                {match.players.map((p, i) => `${p} ${formatPoints(totals[i])}`).join(' · ')}
              </span>
            </button>
            {open === match.id && (
              <>
                <ScoreTable match={match} />
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Borrar esta partida del historial?')) onRemove(match.id)
                  }}
                  className="self-end rounded-lg px-3 py-1.5 text-sm text-red-400"
                >
                  Borrar
                </button>
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
