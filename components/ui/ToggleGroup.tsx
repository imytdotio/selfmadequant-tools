type ToggleValue = string | number | boolean

/**
 * A labelled row of mutually exclusive toggle buttons (one is `aria-pressed`). Unstyled: the host
 * surface supplies the look via `className`, e.g. the public tools' `tool-segment` or `smile-presets`.
 */
export function ToggleGroup<T extends ToggleValue>({ label, options, value, onChange, className, disabled }: {
  label: string
  options: readonly { value: T; label: React.ReactNode }[]
  /** `null` while nothing is chosen yet. */
  value: T | null
  onChange: (value: T) => void
  className?: string
  disabled?: boolean
}) {
  return (
    <div className={className} role="group" aria-label={label}>
      {options.map(option => (
        <button key={String(option.value)} type="button" aria-pressed={value === option.value} disabled={disabled} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  )
}
