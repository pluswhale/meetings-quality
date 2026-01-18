import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends Omit<HTMLMotionProps<'div'>, 'size'> {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs' },
  sm: { container: 'w-8 h-8', text: 'text-sm' },
  md: { container: 'w-10 h-10', text: 'text-base' },
  lg: { container: 'w-12 h-12', text: 'text-lg' },
  xl: { container: 'w-16 h-16', text: 'text-2xl' }
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
  ...props
}) => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`
        ${sizeStyles[size].container}
        rounded-full
        flex items-center justify-center
        font-bold
        ${src ? '' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span className={sizeStyles[size].text}>{initials}</span>
      )}
    </motion.div>
  );
};

interface AvatarGroupProps {
  avatars: Array<{ name: string; src?: string }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 3,
  size = 'md',
  className = ''
}) => {
  const displayedAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayedAvatars.map((avatar, index) => (
        <div key={index} className="border-2 border-white rounded-full">
          <Avatar name={avatar.name} src={avatar.src} size={size} />
        </div>
      ))}
      {remainingCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: displayedAvatars.length * 0.05 }}
          className={`
            ${sizeStyles[size].container}
            rounded-full
            border-2 border-white
            bg-slate-200
            flex items-center justify-center
            font-bold text-slate-600
            ${sizeStyles[size].text}
          `.trim().replace(/\s+/g, ' ')}
        >
          +{remainingCount}
        </motion.div>
      )}
    </div>
  );
};
