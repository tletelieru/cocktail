import { useMessages } from '../i18n/messages'

interface Props {
  label: string
  player: string
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
}

const button =
  'flex size-9 items-center justify-center rounded-lg bg-raised text-lg active:opacity-70 disabled:opacity-30'

export function Stepper({ label, player, value, min = 0, max, onChange }: Props) {
  const t = useMessages()

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`${label} ${player} ${t.less}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className={button}
        >
          −
        </button>
        <span className="w-7 text-center text-lg font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={`${label} ${player} ${t.more}`}
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
