import { formatPoints } from '../lib/scoring'

function tone(value: number): string {
  if (value > 0) return 'bg-emerald-500/20'
  if (value < 0) return 'bg-rose-500/20'
  return 'text-muted'
}

export function Points({ value }: { value: number }) {
  return (
    <span className={`inline-block rounded-md px-1 py-0.5 tabular-nums ${tone(value)}`}>
      {formatPoints(value)}
    </span>
  )
}
