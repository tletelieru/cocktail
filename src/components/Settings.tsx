import { useMessages } from '../i18n/messages'
import { textSizes } from '../lib/textSize'
import type { TextSize } from '../lib/textSize'

interface Props {
  size: TextSize
  onSize: (size: TextSize) => void
}

const SAMPLE: Record<TextSize, string> = {
  normal: 'text-sm',
  large: 'text-lg',
  xlarge: 'text-2xl',
}

export function Settings({ size, onSize }: Props) {
  const t = useMessages()

  return (
    <section className="flex flex-col gap-2 rounded-xl bg-surface p-3">
      <h2 className="font-semibold">{t.textSize}</h2>
      <div className="grid grid-cols-3 gap-1.5">
        {textSizes.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={size === option}
            onClick={() => onSize(option)}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-xs font-medium ${
              size === option ? 'bg-emerald-700 text-white' : 'bg-raised text-muted'
            }`}
          >
            <span aria-hidden="true" className={`leading-none font-bold ${SAMPLE[option]}`}>
              A
            </span>
            {t.textSizes[option]}
          </button>
        ))}
      </div>
    </section>
  )
}
