import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Simple animated number using RAF
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const duration = 500;
    const start = performance.now();

    if (startRef.current) cancelAnimationFrame(startRef.current);

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) startRef.current = requestAnimationFrame(step);
      else fromRef.current = to;
    };
    startRef.current = requestAnimationFrame(step);
    return () => { if (startRef.current) cancelAnimationFrame(startRef.current); };
  }, [value]);

  return <span>{display}</span>;
}

export function Card({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`card shadow-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function StatsCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const colors = {
    primary: {
      gradient: 'from-indigo-600 via-indigo-500 to-violet-500',
      glow: 'shadow-indigo-500/25',
      ring: 'ring-indigo-500/20',
      bg: 'bg-indigo-500/[0.08]',
      text: 'text-indigo-400',
    },
    success: {
      gradient: 'from-emerald-600 via-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/25',
      ring: 'ring-emerald-500/20',
      bg: 'bg-emerald-500/[0.08]',
      text: 'text-emerald-400',
    },
    error: {
      gradient: 'from-rose-600 via-rose-500 to-pink-500',
      glow: 'shadow-rose-500/25',
      ring: 'ring-rose-500/20',
      bg: 'bg-rose-500/[0.08]',
      text: 'text-rose-400',
    },
    warning: {
      gradient: 'from-amber-500 via-amber-400 to-orange-400',
      glow: 'shadow-amber-500/25',
      ring: 'ring-amber-500/20',
      bg: 'bg-amber-500/[0.08]',
      text: 'text-amber-400',
    },
  };

  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card-premium p-6 group relative overflow-hidden cursor-default"
    >
      {/* Aurora background glow */}
      <div className={`absolute -top-8 -right-8 w-40 h-40 rounded-full bg-gradient-to-br ${c.gradient} opacity-[0.06] blur-3xl group-hover:opacity-[0.13] transition-opacity duration-700`} />
      <div className={`absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-tr ${c.gradient} opacity-[0.04] blur-3xl group-hover:opacity-[0.09] transition-opacity duration-700`} />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-black uppercase tracking-[0.18em] mb-3 ${c.text} opacity-70`}>{label}</p>
          <div className="flex items-end gap-2.5">
            <h3 className="text-3xl font-black text-white tracking-tight tabular-nums">
              <AnimatedNumber value={value} />
            </h3>
            {trend !== undefined && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-1 mb-1.5 text-[11px] font-bold ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                <span>{Math.abs(trend)}%</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Icon badge */}
        <motion.div
          whileHover={{ scale: 1.12, rotate: 5, transition: { duration: 0.2 } }}
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.gradient} ${c.glow} flex items-center justify-center shadow-lg border border-white/10 shrink-0 ring-4 ${c.ring} ring-offset-0`}
        >
          <Icon size={20} className="text-white drop-shadow" />
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-current to-transparent ${c.text} opacity-20 group-hover:opacity-40 transition-opacity`} />
    </motion.div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card-premium p-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-flex w-24 h-24 rounded-3xl bg-slate-900/80 items-center justify-center mb-8 border border-slate-800/60 shadow-inner mx-auto relative"
      >
        <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full animate-glow-pulse" />
        <Icon size={36} className="text-slate-500 relative z-10" />
      </motion.div>
      <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed font-medium">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </motion.div>
  );
}

export function Badge({ label, variant = 'info', dot = false }) {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    error:   'bg-rose-500/10 text-rose-400 border-rose-500/25',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    info:    'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  };
  const dotVariants = {
    success: 'dot-running',
    error:   'dot-failed',
    warning: 'dot-stopped',
    info:    'dot-default',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 w-fit ${variants[variant]}`}>
      {dot && <span className={dotVariants[variant]} />}
      {label}
    </span>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-3 bg-slate-800 rounded-lg w-1/4" style={{ animationDelay: `${i * 150}ms` }} />
          <div className="h-7 bg-slate-800/70 rounded-xl w-2/3" style={{ animationDelay: `${i * 150}ms` }} />
        </div>
      ))}
    </div>
  );
}

