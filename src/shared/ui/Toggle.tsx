import React, { useId } from 'react';
import { motion } from 'framer-motion';

type ToggleSize = 'sm' | 'md' | 'lg';
type ToggleVariant = 'primary' | 'success' | 'danger' | 'warning';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: ToggleSize;
  variant?: ToggleVariant;
  disabled?: boolean;
  className?: string;
}

const sizeConfig: Record<ToggleSize, { track: string; thumb: string; thumbOn: string }> = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3 top-0.5 left-0.5',
    thumbOn: 'translate-x-4',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5 top-0.5 left-0.5',
    thumbOn: 'translate-x-5',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6 top-0.5 left-0.5',
    thumbOn: 'translate-x-7',
  },
};

const variantOnStyle: Record<ToggleVariant, string> = {
  primary: 'bg-mq-primary shadow-primary',
  success: 'bg-mq-success',
  danger:  'bg-mq-danger',
  warning: 'bg-mq-warning',
};

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const id = useId();
  const cfg = sizeConfig[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={[
          'relative inline-flex flex-shrink-0 rounded-full cursor-pointer',
          'transition-colors duration-200 ease-in-out',
          'focus-visible:ring-2 focus-visible:ring-mq-primary focus-visible:ring-offset-2',
          cfg.track,
          checked ? variantOnStyle[variant] : 'bg-slate-200',
          disabled ? 'opacity-40 cursor-not-allowed' : '',
        ].filter(Boolean).join(' ')}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className={[
            'absolute rounded-full bg-white shadow-md',
            cfg.thumb,
            checked ? cfg.thumbOn : '',
          ].filter(Boolean).join(' ')}
        />
      </button>

      {(label || description) && (
        <label
          htmlFor={id}
          className={`cursor-pointer select-none ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {label && (
            <span className="block text-sm font-medium text-mq-text leading-none">{label}</span>
          )}
          {description && (
            <span className="block text-xs text-mq-muted mt-0.5">{description}</span>
          )}
        </label>
      )}
    </div>
  );
};

interface ToggleGroupItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ToggleGroupProps {
  items: ToggleGroupItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  items,
  value,
  onChange,
  className = '',
}) => (
  <div className={`inline-flex rounded-xl bg-slate-100 p-1 gap-1 ${className}`}>
    {items.map((item) => (
      <button
        key={item.value}
        onClick={() => onChange(item.value)}
        className={[
          'relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium',
          'rounded-lg transition-all duration-200',
          value === item.value
            ? 'text-mq-primary'
            : 'text-mq-secondary hover:text-mq-text',
        ].join(' ')}
      >
        {value === item.value && (
          <motion.div
            layoutId="toggle-group-indicator"
            className="absolute inset-0 bg-white rounded-lg shadow-glass"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          {item.icon}
          {item.label}
        </span>
      </button>
    ))}
  </div>
);
