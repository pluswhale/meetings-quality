import * as RadixSlider from '@radix-ui/react-slider';
import React from 'react';

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  variant?: 'default' | 'green' | 'emotional' | 'importance';
  disabled?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 10,
  onChange,
  onChangeEnd,
  variant = 'default',
  disabled = false,
  className = '',
}) => {
  const trackClass = {
    default: 'bg-slate-200',
    green: 'bg-green-200',
    importance: 'bg-orange-200',
    emotional: 'bg-gradient-to-r from-red-400 via-yellow-300 to-green-400',
  }[variant];

  const rangeClass = {
    default: 'bg-purple-600',
    green: 'bg-green-600',
    importance: 'bg-orange-500',
    emotional: 'hidden',
  }[variant];

  return (
    <RadixSlider.Root
      value={[value]}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={([v]) => onChange(v)}
      onValueCommit={([v]) => onChangeEnd?.(v)}
      className={`relative flex items-center select-none touch-none h-6 ${className}`}
    >
      <RadixSlider.Track
        className={`relative grow rounded-full h-2 ${trackClass}`}
      >
        <RadixSlider.Range
          className={`absolute h-full rounded-full ${rangeClass}`}
        />
      </RadixSlider.Track>

      <RadixSlider.Thumb
        className="
          block w-5 h-5 bg-white border-2 border-purple-600
          rounded-full shadow transition
          focus:outline-none focus:ring-2 focus:ring-purple-400
          disabled:opacity-50
        "
      />
    </RadixSlider.Root>
  );
};
