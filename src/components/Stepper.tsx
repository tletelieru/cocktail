interface Props {
  label: string
  player: string
  value: number
  max: number
  onChange: (value: number) => void
}

const button =
  'flex size-10 items-center justify-center rounded-lg bg-slate-700 text-xl active:bg-slate-600 disabled:opacity-30'

export function Stepper({ label, player, value, max, onChange }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`${label} ${player} menos`}
          disabled={value <= 0}
          onClick={() => onChange(value - 1)}
          className={button}
        >
          −
        </button>
        <span className="w-7 text-center text-lg font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={`${label} ${player} más`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={button}
        >
          +
        </button>
      </div>
    </div>
  )
}
