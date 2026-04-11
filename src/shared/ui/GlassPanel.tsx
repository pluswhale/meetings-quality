import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type GlassPanelVariant = 'default' | 'primary' | 'dark' | 'subtle';
type GlassPanelPadding = 'none' | 'sm' | 'md' | 'lg';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  variant?: GlassPanelVariant;
  padding?: GlassPanelPadding;
  hover?: boolean;
  animate?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<GlassPanelVariant, string> = {
  default: 'glass shadow-glass border-white/70',
  primary: 'glass-primary',
  dark:    'glass-dark text-white',
  subtle:  'bg-white/60 border border-mq-border shadow-glass',
};

const paddingStyles: Record<GlassPanelPadding, string> = {
  none: 'p-0',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

const panelEnter = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

export const GlassPanel: React.FC<GlassPanelProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  animate: shouldAnimate = true,
  className = '',
  children,
  ...props
}) => {
  return (
    <motion.div
      variants={shouldAnimate ? panelEnter : undefined}
      initial={shouldAnimate ? 'hidden' : undefined}
      animate={shouldAnimate ? 'visible' : undefined}
      whileHover={hover ? { y: -2, boxShadow: '0 12px 40px -8px rgba(15, 23, 42, 0.14)' } : undefined}
      className={[
        'rounded-2xl transition-shadow duration-200',
        variantStyles[variant],
        paddingStyles[padding],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface GlassPanelHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const GlassPanelHeader: React.FC<GlassPanelHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
  badge,
  className = '',
}) => (
  <div className={`flex items-start justify-between gap-3 mb-5 ${className}`}>
    <div className="flex items-center gap-3 min-w-0">
      {icon && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-mq-primary-soft flex items-center justify-center">
          <span className="text-mq-primary">{icon}</span>
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-mq-text text-base leading-snug truncate">{title}</h3>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-mq-muted mt-0.5 leading-relaxed">{subtitle}</p>
        )}
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

interface GlassDividerProps {
  className?: string;
}

export const GlassDivider: React.FC<GlassDividerProps> = ({ className = '' }) => (
  <div className={`h-px bg-gradient-to-r from-transparent via-mq-border to-transparent my-4 ${className}`} />
);
