/**
 * Slider - Beautiful range input with progress bar
 */

import React from 'react';

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  variant?: 'default' | 'green' | 'emotional' | 'importance';
  showProgress?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  onChange,
  variant = 'default',
  showProgress = true,
  className = '',
}) => {
  // Calculate progress percentage
  const percentage = ((value - min) / (max - min)) * 100;

  const sliderClasses = [
    variant === 'green' && 'slider-green',
    variant === 'emotional' && 'slider-emotional',
    variant === 'importance' && 'slider-importance',
  ]
    .filter(Boolean)
    .join(' ');

  const progressClasses = [
    'slider-progress',
    variant === 'green' && 'slider-progress-green',
    variant === 'importance' && 'slider-progress-importance',
  ]
    .filter(Boolean)
    .join(' ');

  if (!showProgress || variant === 'emotional') {
    // No progress bar for emotional slider (has gradient track)
    return (
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`${sliderClasses} ${className}`}
      />
    );
  }

  return (
    <div className="slider-wrapper">
      <div className={progressClasses} style={{ width: `${percentage}%` }} />
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`${sliderClasses} ${className}`}
      />
    </div>
  );
};
