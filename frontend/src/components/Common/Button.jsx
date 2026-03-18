import { motion } from 'framer-motion';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  iconPosition = 'left',
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-premium hover:shadow-lg',
    secondary: 'bg-neutral-700/60 text-neutral-100 border border-neutral-600/50 hover:bg-neutral-600/70',
    ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-800/50 hover:text-neutral-100',
    danger: 'bg-error/10 text-error border border-error/30 hover:bg-error/15',
    success: 'bg-success/10 text-success border border-success/30 hover:bg-success/15',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[11px] font-bold rounded-lg',
    md: 'px-4 py-2 text-[13px] font-bold rounded-lg',
    lg: 'px-6 py-3 text-[15px] font-bold rounded-xl',
  };

  return (
    <motion.button
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98, y: 0 }}
      disabled={loading}
      aria-busy={loading}
      aria-disabled={loading}
      className={`
        btn transition-all duration-200
        flex items-center gap-md justify-center
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full"
        />
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <motion.div
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />
            </motion.div>
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <motion.div
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />
            </motion.div>
          )}
        </>
      )}
    </motion.button>
  );
}
