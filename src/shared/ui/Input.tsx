import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  inputSize = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const baseStyles = 'w-full rounded-xl border-2 transition-all duration-200 focus:outline-none';
  const normalStyles = 'border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100';
  const errorStyles = 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100';
  const disabledStyles = 'disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400';

  const containerWidth = fullWidth ? 'w-full' : '';

  return (
    <div className={`${containerWidth} ${className}`}>
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            ${baseStyles}
            ${error ? errorStyles : normalStyles}
            ${sizeStyles[inputSize]}
            ${disabledStyles}
            ${leftIcon ? 'pl-12' : ''}
            ${rightIcon ? 'pr-12' : ''}
          `.trim().replace(/\s+/g, ' ')}
          disabled={disabled}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}
        >
          {error || helperText}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none resize-none';
  const normalStyles = 'border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100';
  const errorStyles = 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100';
  const disabledStyles = 'disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400';

  const containerWidth = fullWidth ? 'w-full' : '';

  return (
    <div className={`${containerWidth} ${className}`}>
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={`
          ${baseStyles}
          ${error ? errorStyles : normalStyles}
          ${disabledStyles}
        `.trim().replace(/\s+/g, ' ')}
        disabled={disabled}
        {...props}
      />
      
      {(error || helperText) && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}
        >
          {error || helperText}
        </motion.p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';
