import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type CardVariant = 'default' | 'outlined' | 'elevated' | 'interactive';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border-2 border-slate-200 shadow-sm',
  outlined: 'bg-white border-2 border-slate-300',
  elevated: 'bg-white shadow-xl shadow-slate-200/50',
  interactive: 'bg-white border-2 border-transparent shadow-xl shadow-slate-200/50 hover:shadow-blue-100 hover:border-blue-400 cursor-pointer'
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6 md:p-8',
  lg: 'p-8 md:p-12'
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const isInteractive = variant === 'interactive';

  return (
    <motion.div
      whileHover={isInteractive ? { scale: 1.02, y: -4 } : {}}
      whileTap={isInteractive ? { scale: 0.98 } : {}}
      className={`
        rounded-3xl transition-all duration-300
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface CardHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  icon,
  title,
  subtitle,
  action,
  className = ''
}) => {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div className="flex items-start gap-4 flex-1">
        {icon && (
          <div className="p-3 rounded-2xl bg-slate-100 group-hover:bg-blue-50 transition-colors">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-extrabold text-slate-900 text-xl mb-1 leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className = '', children }) => {
  return (
    <div className={`mt-8 pt-6 border-t border-slate-100 ${className}`}>
      {children}
    </div>
  );
};
