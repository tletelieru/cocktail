import { GAMES, formatPoints, gameScores, gameStatus, matchTotals } from '../lib/scoring'
import type { Match } from '../lib/scoring'

export function ScoreTable({ match }: { match: Match }) {
  const totals = matchTotals(match)
  const cell = 'px-2 py-1.5 text-right tabular-nums'

  return (
    <div className="overflow-x-auto rounded-xl bg-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400">
            <th className="px-2 py-1.5 text-left font-medium">Juego</th>
            {match.players.map((player, i) => (
              <th key={i} className="max-w-20 truncate px-2 py-1.5 text-right font-medium">
                {player}
              </th>
            ))}
            <th className="px-2 py-1.5 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {GAMES.map((game) => {
            const entry = match.entries[game.id]
            const status = gameStatus(game, entry)
            const scores = gameScores(game, entry)
            return (
              <tr key={game.id} className="border-t border-slate-700">
                <td className="px-2 py-1.5 whitespace-nowrap">{game.name}</td>
                {scores.map((score, i) => (
                  <td key={i} className={cell}>
                    {status.state === 'empty' ? '—' : formatPoints(score)}
                  </td>
                ))}
                <td className={`${cell} ${status.state === 'off' ? 'text-red-400' : ''}`}>
                  {status.state === 'empty' ? '—' : formatPoints(status.total)}
                  {status.message && <div className="text-xs whitespace-nowrap">{status.message}</div>}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-600 font-semibold">
            <td className="px-2 py-1.5">Total</td>
            {totals.map((total, i) => (
              <td key={i} className={cell}>
                {formatPoints(total)}
              </td>
            ))}
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
