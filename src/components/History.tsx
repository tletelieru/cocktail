import { useState } from 'react'
import { formatPoints, matchTotals } from '../lib/scoring'
import type { Match } from '../lib/scoring'
import { useLocale, useMessages } from '../i18n/messages'
import { ScoreTable } from './ScoreTable'

interface Props {
  matches: Match[]
  onRemove: (id: string) => void
}

export function History({ matches, onRemove }: Props) {
  const t = useMessages()
  const locale = useLocale()
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })
  const [open, setOpen] = useState<string | null>(null)

  if (matches.length === 0) {
    return <p className="text-muted">{t.emptyHistory}</p>
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
              className="rounded-xl bg-surface p-3 text-left"
            >
              <span className="block text-xs text-muted">
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
                    if (window.confirm(t.removeConfirm)) onRemove(match.id)
                  }}
                  className="self-end rounded-lg px-3 py-1.5 text-sm text-bad"
                >
                  {t.remove}
                </button>
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
