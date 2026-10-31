import { GAMES, expectedTotal, formatPoints, ruleSummary } from '../lib/scoring'
import { useMessages } from '../i18n/messages'
import { GameSymbol } from './GameSymbol'

export function Rules() {
  const t = useMessages()
  const sections = [
    { title: t.rulesTitle, rules: t.rulesBasics },
    { title: t.dealTitle, rules: t.dealRules },
    { title: t.playTitle, rules: t.playRules },
  ]

  return (
    <section className="flex flex-col gap-3">
      {sections.map(({ title, rules }) => (
        <div key={title} className="flex flex-col gap-2 rounded-xl bg-surface p-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted">
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      ))}

      {GAMES.map((game, i) => {
        const four = expectedTotal(game, 4)
        const three = expectedTotal(game, 3)
        return (
          <article key={game.id} className="flex flex-col gap-1 rounded-xl bg-surface p-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <GameSymbol id={game.id} />
              {i + 1}. {t.games[game.id]}
            </h3>
            <p className="text-sm">{ruleSummary(game, t.rule)}</p>
            {game.id === 'domino' && <p className="text-sm text-muted">{t.dominoRule}</p>}
            <p className="text-xs text-muted">
              {four !== null && three !== null
                ? t.fixedTotal(formatPoints(four), formatPoints(three))
                : t.noFixedTotal}
            </p>
          </article>
        )
      })}
    </section>
  )
}
