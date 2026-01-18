import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type TextVariant = 'body' | 'small' | 'caption' | 'overline';
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

interface HeadingProps extends HTMLMotionProps<'h1'> {
  level?: HeadingLevel;
  weight?: TextWeight;
  className?: string;
  children: React.ReactNode;
}

const headingStyles: Record<HeadingLevel, string> = {
  h1: 'text-4xl md:text-5xl lg:text-6xl',
  h2: 'text-3xl md:text-4xl lg:text-5xl',
  h3: 'text-2xl md:text-3xl lg:text-4xl',
  h4: 'text-xl md:text-2xl lg:text-3xl',
  h5: 'text-lg md:text-xl lg:text-2xl',
  h6: 'text-base md:text-lg lg:text-xl'
};

const weightStyles: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black'
};

export const Heading: React.FC<HeadingProps> = ({
  level = 'h1',
  weight = 'extrabold',
  className = '',
  children,
  ...props
}) => {
  const Component = motion[level];
  
  return (
    <Component
      className={`
        ${headingStyles[level]}
        ${weightStyles[weight]}
        text-slate-900
        tracking-tight
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </Component>
  );
};

interface TextProps extends HTMLMotionProps<'p'> {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'danger' | 'warning';
  className?: string;
  children: React.ReactNode;
}

const textVariantStyles: Record<TextVariant, string> = {
  body: 'text-base',
  small: 'text-sm',
  caption: 'text-xs',
  overline: 'text-xs uppercase tracking-widest'
};

const colorStyles = {
  primary: 'text-slate-900',
  secondary: 'text-slate-700',
  muted: 'text-slate-500',
  success: 'text-green-600',
  danger: 'text-red-600',
  warning: 'text-orange-600'
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight = 'normal',
  color = 'primary',
  className = '',
  children,
  ...props
}) => {
  return (
    <motion.p
      className={`
        ${textVariantStyles[variant]}
        ${weightStyles[weight]}
        ${colorStyles[color]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </motion.p>
  );
};

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  weight?: TextWeight;
  className?: string;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({
  required = false,
  weight = 'bold',
  className = '',
  children,
  ...props
}) => {
  return (
    <label
      className={`
        block text-sm ${weightStyles[weight]} text-slate-700 mb-2
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};
