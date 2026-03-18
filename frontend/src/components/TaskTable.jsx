import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Trash2, Pencil, CheckCircle2, XCircle, Clock, Square, RefreshCw, Timer, Send, AlertTriangle } from 'lucide-react';
import { Badge, Button } from './Common';
import { API_BASE } from '../api';


/* ── Status config ───────────────────────────────── */
const statusConfig = {
  STARTED:   { label: 'Started',   variant: 'info',    dot: 'dot-running' },
  RUNNING:   { label: 'Running',   variant: 'success', dot: 'dot-running' },
  COMPLETED: { label: 'Completed', variant: 'success', dot: 'dot-default' },
  FAILED:    { label: 'Failed',    variant: 'error',   dot: 'dot-failed'  },
  ERROR:     { label: 'Error',     variant: 'error',   dot: 'dot-failed'  },
  STOPPED:   { label: 'Stopped',   variant: 'warning', dot: 'dot-stopped' },
};

/* ── Loop Countdown Timer ────────────────────────── */
function LoopTimer({ nextSendAt, interval }) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.ceil(nextSendAt - Date.now() / 1000));
      setSecs(remaining);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [nextSendAt]);

  const totalSecs = interval || 120;
  const pct = Math.max(0, Math.min(100, ((totalSecs - secs) / totalSecs) * 100));
  // color: green when lots of time left→ yellow → red near end
  const barColor = secs < 10 ? 'from-rose-500 to-red-400' : secs < 30 ? 'from-amber-500 to-yellow-400' : 'from-emerald-500 to-teal-400';

  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="flex items-center gap-1 text-slate-500">
          <Timer size={10} />
          <span>Next send</span>
        </span>
        <span className={secs < 10 ? 'text-rose-400' : secs < 30 ? 'text-amber-400' : 'text-emerald-400'}>
          {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
        </span>
      </div>
      {/* Progress bar drains downward */}
      <div className="h-1.5 w-full bg-slate-800/60 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
          style={{ width: `${100 - pct}%` }}
          animate={{ width: `${100 - pct}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </div>
    </div>
  );
}

/* ── Send Count Badge ────────────────────────────── */
function SendStats({ sendCount = 0, failedCount = 0 }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <Send size={11} className="text-emerald-400" />
        <span className="text-[11px] font-black text-emerald-400 tabular-nums">{sendCount}</span>
        <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">sent</span>
      </div>
      {failedCount > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <AlertTriangle size={11} className="text-rose-400" />
          <span className="text-[11px] font-black text-rose-400 tabular-nums">{failedCount}</span>
          <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wider">failed</span>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────── */
export default function TaskTable({ tasks, setTasks }) {
  const [editing, setEditing] = useState(null);

  // 🔄 POLLING FOR UPDATES
  useEffect(() => {
    const interval = setInterval(async () => {
      for (const task of tasks) {
        try {
          const res = await fetch(`${API_BASE}/status/${task.id}`);

          const data = await res.json();
          if (!data.error) {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === task.id
                  ? {
                      ...t,
                      status:       data.status,
                      progress:     data.progress     || t.progress,
                      send_count:   data.send_count   !== undefined ? data.send_count   : t.send_count,
                      failed_count: data.failed_count !== undefined ? data.failed_count : t.failed_count,
                      next_send_at: data.next_send_at !== undefined ? data.next_send_at : t.next_send_at,
                      interval:     data.interval     !== undefined ? data.interval     : t.interval,
                    }
                  : t
              )
            );
          }
        } catch (err) {
          console.error('Status update failed:', err);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [tasks, setTasks]);

  const stopTask = async (id) => {
    try {
      await fetch(`${API_BASE}/stop/${id}`, { method: 'POST' });

      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: 'STOPPED' } : t));
    } catch {
      alert('❌ Failed to stop task');
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this bot?')) return;
    try {
      await fetch(`${API_BASE}/task/${id}`, { method: 'DELETE' });

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert('❌ Failed to delete task');
    }
  };

  const saveEdit = () => {
    if (!editing) return;
    setTasks((prev) => prev.map((t) => t.id === editing.id ? { ...t, name: editing.name } : t));
    setEditing(null);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {tasks.map((t, idx) => {
          const cfg = statusConfig[t.status] || statusConfig.STOPPED;
          const isRunning = t.status === 'STARTED' || t.status === 'RUNNING';
          const isLoop = t.mode === 'loop' && isRunning;
          const progress = t.progress || 0;
          const sendCount = t.send_count || 0;
          const failedCount = t.failed_count || 0;
          const nextSendAt = t.next_send_at;

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
              transition={{ delay: idx * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="card-premium overflow-hidden group relative"
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.025] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

              {/* ── Loop mode: colored top accent ── */}
              {isLoop && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" style={{ animation: 'progress-shine 2s linear infinite', backgroundSize: '200% 100%' }} />
              )}

              <div className="p-5 flex flex-col gap-4">
                {/* ── Row 1: Info + Status Badge + Actions ── */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Left: dot + name + email */}
                  <div className="flex items-start gap-3 flex-1 min-w-0 relative z-10">
                    <div className={`mt-1.5 shrink-0 ${cfg.dot}`} />
                    <div className="min-w-0 flex-1">
                      {editing?.id === t.id ? (
                        <input
                          value={editing.name}
                          onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                          autoFocus
                          className="input-field py-1.5 text-sm font-bold max-w-xs"
                        />
                      ) : (
                        <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors truncate">
                          {t.name}
                        </h4>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[12px] text-slate-500 font-medium truncate">{t.receiver || 'Self-Automated'}</span>
                        {t.mode && (
                          <>
                            <span className="w-px h-3 bg-slate-700/60 shrink-0" />
                            <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${t.mode === 'loop' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                              {t.mode === 'loop' ? `⟳ Loop · every ${t.interval || '?'}s` : t.mode}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: badge + actions */}
                  <div className="flex items-center gap-3 shrink-0 relative z-10">
                    <Badge label={cfg.label} variant={cfg.variant} dot={isRunning} />
                    <div className="h-7 w-px bg-slate-800/60" />
                    <div className="flex items-center gap-1.5">
                      {editing?.id === t.id ? (
                        <Button variant="primary" size="sm" onClick={saveEdit}>Save</Button>
                      ) : (
                        <button onClick={() => setEditing(t)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all" title="Rename">
                          <Pencil size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => stopTask(t.id)}
                        disabled={!isRunning}
                        className={`p-2 rounded-lg transition-all ${isRunning ? 'hover:bg-amber-500/10 text-slate-500 hover:text-amber-400' : 'text-slate-700 cursor-not-allowed'}`}
                        title="Stop"
                      >
                        <Square size={14} />
                      </button>
                      <button onClick={() => deleteTask(t.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Row 2: Loop-specific UI (Timer + Send count) ── */}
                {isLoop && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-800/50 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {/* Countdown timer */}
                    {nextSendAt ? (
                      <LoopTimer nextSendAt={nextSendAt} interval={t.interval} />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Waiting for first send...</span>
                      </div>
                    )}

                    {/* Send stats */}
                    <div className="flex items-center justify-end">
                      <SendStats sendCount={sendCount} failedCount={failedCount} />
                    </div>
                  </motion.div>
                )}

                {/* ── Non-loop progress bar ── */}
                {!isLoop && progress > 0 && (
                  <div className="space-y-1.5 relative z-10">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-600">
                      <span>Progress</span>
                      <span className="text-indigo-400">{progress}%</span>
                    </div>
                    <div className="neon-progress">
                      <motion.div
                        className="neon-progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}