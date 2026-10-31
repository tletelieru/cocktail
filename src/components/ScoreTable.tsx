import { Fragment } from 'react'
import { GAMES, formatPoints, gameScores, gameStatus, matchTotals } from '../lib/scoring'
import type { Match } from '../lib/scoring'
import { issueText, useMessages } from '../i18n/messages'
import { GameSymbol } from './GameSymbol'
import { Points } from './Points'

export function ScoreTable({ match }: { match: Match }) {
  const t = useMessages()
  const totals = matchTotals(match)
  const cell = 'px-1 py-2 text-right tabular-nums'

  return (
    <div className="overflow-x-auto rounded-xl bg-surface">
      <table className="w-full table-fixed text-base">
        <thead>
          <tr className="text-muted">
            <th className="w-14" aria-label={t.game} />
            {match.players.map((player, i) => (
              <th
                key={i}
                title={player}
                className="px-1 py-1.5 text-right text-sm leading-tight font-medium break-words"
              >
                <span className="line-clamp-2">{player}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GAMES.map((game) => {
            const entry = match.entries[game.id]
            const status = gameStatus(game, entry)
            const scores = gameScores(game, entry)
            const played = status.state !== 'empty'
            return (
              <Fragment key={game.id}>
                <tr className="border-t border-line">
                  <td
                    rowSpan={played ? 2 : 1}
                    title={t.games[game.id]}
                    aria-label={t.games[game.id]}
                    className="py-1 pl-1.5"
                  >
                    <GameSymbol id={game.id} />
                  </td>
                  {scores.map((score, i) => (
                    <td key={i} className={`${cell} ${played ? '' : 'text-muted'}`}>
                      {played ? <Points value={score} /> : '—'}
                    </td>
                  ))}
                </tr>
                {played && (
                  <tr>
                    <td
                      colSpan={scores.length}
                      className={`px-1 pb-2 text-right text-sm tabular-nums ${
                        status.state === 'off' ? 'text-bad' : 'text-muted'
                      }`}
                    >
                      {t.total} {formatPoints(status.total)}
                      {status.issue && ` · ${issueText(status.issue, t)}`}
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-line font-semibold">
            <td className="py-2 text-center text-xs">{t.total}</td>
            {totals.map((total, i) => (
              <td key={i} className={cell}>
                <Points value={total} />
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
