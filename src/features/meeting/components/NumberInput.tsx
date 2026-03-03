import { memo, useCallback, useId, useRef, useState } from 'react';

export interface NumberInputProps {
  /** Controlled external value. `null` represents an empty / cleared state. */
  value: number | null;
  /** Called with the parsed number on every valid keystroke, or `null` when the field is empty. */
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Granularity for the native number input stepper. Defaults to 1. */
  step?: number;
  placeholder?: string;
  label?: string;
  /** Overrides the auto-generated id. Use when associating an external <label>. */
  id?: string;
  disabled?: boolean;
  required?: boolean;
  /** Extra classes applied to the <input> element. */
  className?: string;
}

function clamp(n: number, min: number | undefined, max: number | undefined): number {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

/**
 * NumberInput — a controlled numeric field with an internal string draft.
 *
 * Contract:
 *   - `value` is always `number | null` externally — consumers never deal with
 *     NaN, empty strings, or partially typed values.
 *   - `onChange` fires on every valid keystroke and returns `null` for empty input.
 *   - On blur, the draft is committed and clamped to [min, max].
 *   - If the external `value` is changed programmatically, the draft syncs inline
 *     (no useEffect — this follows the "derive state in render" pattern).
 */
const NumberInput = memo<NumberInputProps>(function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  label,
  id: externalId,
  disabled = false,
  required = false,
  className = '',
}) {
  const generatedId = useId();
  const inputId = externalId ?? generatedId;

  // Internal string draft allows incomplete inputs ("", "-", "1.") without
  // forcing the consumer to handle those intermediate states.
  const [draft, setDraft] = useState<string>(() =>
    value !== null && !Number.isNaN(value) ? String(value) : '',
  );

  // ─── Sync draft when the controlled value changes from outside ─────────────
  // Uses the "derive state during render" pattern (React docs, no useEffect).
  const prevValueRef = useRef<number | null>(value);
  if (prevValueRef.current !== value) {
    prevValueRef.current = value;
    const draftAsNumber = draft === '' ? null : Number(draft);
    // Only reset draft if the numeric value actually differs, to avoid cursor jumps.
    if (draftAsNumber !== value) {
      setDraft(value !== null && !Number.isNaN(value) ? String(value) : '');
    }
  }

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDraft(raw);

      // Allow empty or in-progress negative — emit null without clamping.
      if (raw === '' || raw === '-') {
        onChange(null);
        return;
      }

      const parsed = Number(raw);
      if (Number.isNaN(parsed)) return; // Ignore unparseable intermediate input.

      onChange(clamp(parsed, min, max));
    },
    [onChange, min, max],
  );

  const handleBlur = useCallback(() => {
    if (draft === '' || draft === '-') {
      setDraft('');
      return;
    }

    const parsed = Number(draft);

    // On blur, revert to last known valid value if the draft is non-numeric.
    if (Number.isNaN(parsed)) {
      setDraft(value !== null ? String(value) : '');
      return;
    }

    const committed = clamp(parsed, min, max);
    setDraft(String(committed));
    onChange(committed);
  }, [draft, value, min, max, onChange]);

  const isDraftInvalid = draft !== '' && draft !== '-' && Number.isNaN(Number(draft));

  return (
    <div className="flex flex-col gap-1">
      {label !== undefined && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
          {required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        type="number"
        id={inputId}
        value={draft}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        aria-invalid={isDraftInvalid || undefined}
        aria-required={required || undefined}
        onChange={handleChange}
        onBlur={handleBlur}
        className={[
          'rounded-lg border px-3 py-2 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          isDraftInvalid
            ? 'border-red-400 bg-red-50 text-red-700'
            : 'border-slate-300 bg-white hover:border-slate-400 text-slate-900',
          disabled ? 'cursor-not-allowed opacity-50 bg-slate-50' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </div>
  );
});

NumberInput.displayName = 'NumberInput';

export { NumberInput };
