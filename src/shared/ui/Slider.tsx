import * as RadixSlider from '@radix-ui/react-slider';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

export type SliderVariant = 'default' | 'green' | 'emotional' | 'importance';

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  variant?: SliderVariant;
  disabled?: boolean;
  showValue?: boolean;
  valueFormatter?: (v: number) => string;
  className?: string;
}

const trackColors: Record<SliderVariant, string> = {
  default: 'bg-blue-100',
  green: 'bg-green-100',
  importance: 'bg-slate-200',
  emotional: 'bg-slate-100',
};

const rangeColors: Record<SliderVariant, string> = {
  default: 'bg-blue-600',
  green: 'bg-green-600',
  importance: 'bg-slate-700',
  emotional: 'hidden',
};

const thumbColors: Record<SliderVariant, string> = {
  default: 'border-blue-600 focus:ring-blue-200',
  green: 'border-green-600 focus:ring-green-200',
  importance: 'border-slate-700 focus:ring-slate-200',
  emotional: 'border-blue-500 focus:ring-blue-200',
};

const shadowColors: Record<SliderVariant, string> = {
  default: 'shadow-[0_4px_12px_rgba(37,99,235,0.30)]',
  green: 'shadow-[0_4px_12px_rgba(22,163,74,0.30)]',
  importance: 'shadow-[0_4px_12px_rgba(15,23,42,0.20)]',
  emotional: 'shadow-[0_4px_12px_rgba(37,99,235,0.25)]',
};

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 10,
  onChange,
  onChangeEnd,
  variant = 'default',
  disabled = false,
  showValue = true,
  valueFormatter,
  className = '',
}) => {
  const [dragging, setDragging] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;
  const displayVal = valueFormatter ? valueFormatter(value) : `${value}`;

  return (
    <div className={`relative select-none ${className}`}>
      <RadixSlider.Root
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={([v]) => {
          onChange(v);
        }}
        onValueCommit={([v]) => {
          setDragging(false);
          onChangeEnd?.(v);
        }}
        onPointerDown={() => setDragging(true)}
        className="relative flex items-center touch-none h-8 w-full"
      >
        <RadixSlider.Track
          className={`relative grow rounded-full h-2.5 overflow-hidden ${trackColors[variant]}`}
        >
          <RadixSlider.Range
            className={`absolute h-full rounded-full transition-all ${rangeColors[variant]}`}
          />
        </RadixSlider.Track>

        <RadixSlider.Thumb
          data-radix-slider-thumb
          className={[
            'block w-5 h-5 bg-white rounded-full border-2',
            'transition-transform duration-100 ease-out',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            thumbColors[variant],
            shadowColors[variant],
            dragging ? 'scale-110' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </RadixSlider.Root>

      {/* Min/max labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-mq-muted font-medium">{min}</span>
        <span className="text-[10px] text-mq-muted font-medium">{max}</span>
      </div>
    </div>
  );
};
