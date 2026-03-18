import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export function Input({
  label,
  type = 'text',
  placeholder,
  icon: Icon,
  error,
  required,
  className = '',
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-md"
    >
      {label && (
        <label className="block text-sm font-semibold text-neutral-200">
          {label}
          {required && <span className="text-error ml-md">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors" size={18} />
        )}
        <motion.input
          type={type}
          placeholder={placeholder}
          className={`
            input-field w-full
            ${Icon ? 'pl-11' : 'px-4'} pr-4 py-2.5
            ${error ? 'border-error/60 bg-error/5 focus:border-error focus:ring-error/30' : 'border-slate-800/80'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-md text-error text-xs font-medium"
        >
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}

export function TextArea({ label, placeholder, error, required, className = '', ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-md"
    >
      {label && (
        <label className="block text-sm font-semibold text-neutral-200">
          {label}
          {required && <span className="text-error ml-md">*</span>}
        </label>
      )}
      <motion.textarea
        placeholder={placeholder}
        className={`
          input-field w-full
          px-lg py-md resize-none h-28
          ${error ? 'border-error/60 bg-error/5 focus:border-error focus:ring-error/30' : 'border-neutral-700/50'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-md text-error text-xs font-medium"
        >
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}

export function Select({ label, options, error, required, className = '', ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-md"
    >
      {label && (
        <label className="block text-sm font-semibold text-neutral-200">
          {label}
          {required && <span className="text-error ml-md">*</span>}
        </label>
      )}
      <motion.select
        className={`
          input-field w-full
          px-lg py-md appearance-none bg-no-repeat
          ${error ? 'border-error/60 bg-error/5 focus:border-error focus:ring-error/30' : 'border-neutral-700/50'}
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.75rem',
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </motion.select>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-md text-error text-xs font-medium"
        >
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}
