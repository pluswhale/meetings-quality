import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends Omit<HTMLMotionProps<'span'>, 'size'> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-blue-100 text-blue-700',
  secondary: 'bg-slate-200 text-slate-700',
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-orange-100 text-orange-700',
  info: 'bg-cyan-100 text-cyan-700'
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] rounded',
  md: 'px-3 py-1 text-xs rounded-full',
  lg: 'px-4 py-1.5 text-sm rounded-full'
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-1.5 font-black uppercase tracking-widest
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-green-600' : 'bg-current'}`} />
      )}
      {children}
    </motion.span>
  );
};

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, ...props }) => {
  const statusMap: Record<StatusBadgeProps['status'], BadgeVariant> = {
    active: 'success',
    inactive: 'secondary',
    pending: 'warning',
    completed: 'primary',
    failed: 'danger'
  };

  return (
    <Badge variant={statusMap[status]} dot {...props}>
      {status}
    </Badge>
  );
};
