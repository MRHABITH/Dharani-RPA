import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle, AlertCircle, Zap, RefreshCw, Timer, Send, Repeat } from "lucide-react";
import { StatsCard, Card, EmptyState, Badge } from "../components/Common";
import ChartCard from "../components/ChartCard";
import { useEffect, useState } from "react";

/* ── Loop Bot Mini Timer ────────────────────────── */
function MiniTimer({ nextSendAt, interval }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const tick = () => setSecs(Math.max(0, Math.ceil(nextSendAt - Date.now() / 1000)));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [nextSendAt]);
  const pct = Math.max(0, Math.min(100, ((interval - secs) / interval) * 100));
  const col = secs < 10 ? 'text-rose-400' : secs < 30 ? 'text-amber-400' : 'text-emerald-400';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
        <span className="text-slate-600 flex items-center gap-1"><Timer size={8} />next</span>
        <span className={col}>{String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}</span>
      </div>
      <div className="h-1 w-full bg-slate-800/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${secs < 10 ? 'from-rose-500 to-red-400' : 'from-emerald-500 to-teal-400'} transition-all duration-500`}
          style={{ width: `${100 - pct}%` }} />
      </div>
    </div>
  );
}

/* ── Recent Activity Entry ──────────────────────── */
function ActivityItem({ task, idx }) {
  const isRunning = task.status === 'RUNNING' || task.status === 'STARTED';
  const isFailed  = task.status === 'FAILED' || task.status === 'ERROR';
  const sendCount = task.send_count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="flex items-center gap-3 py-2.5 border-b border-slate-800/30 last:border-0"
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${isRunning ? 'bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse' : isFailed ? 'bg-rose-500' : 'bg-slate-700'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-white truncate">{task.name}</p>
        <p className="text-[10px] text-slate-600 truncate">{task.receiver}</p>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-0.5">
        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md
          ${isRunning ? 'bg-emerald-500/10 text-emerald-400' : isFailed ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
          {task.status}
        </span>
        {sendCount > 0 && (
          <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
            <Send size={8} />{sendCount}✓
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function Overview({ tasks = [], loading = false }) {
  const activeTasks    = tasks.filter(t => t.status === "STARTED" || t.status === "RUNNING").length;
  const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
  const failedTasks    = tasks.filter(t => t.status === "FAILED" || t.status === "ERROR").length;
  const totalBots      = tasks.length;
  const loopBots       = tasks.filter(t => t.mode === 'loop' && (t.status === 'RUNNING' || t.status === 'STARTED'));
  const totalSent      = tasks.reduce((sum, t) => sum + (t.send_count || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-12"
    >
      {/* ── Stats Grid ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-20 mb-3" />
              <div className="h-6 bg-slate-700 rounded w-1/2" />
            </div>
          ))
        ) : (
          <>
            <StatsCard icon={Activity}    label="Running Bots"   value={activeTasks}    color="primary" />
            <StatsCard icon={CheckCircle} label="Completed"      value={completedTasks} color="success" />
            <StatsCard icon={AlertCircle} label="Failed"         value={failedTasks}    color="error"   />
            <StatsCard icon={Send}        label="Emails Sent"    value={totalSent}      color="warning" />
          </>
        )}
      </div>

      {/* ── Continuous Loop Bots ─────────────────── */}
      {loopBots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card-premium p-5 space-y-4 overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Repeat size={16} className="text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">Continuous Loop Bots</h3>
            <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {loopBots.length} active
            </span>
          </div>

          <div className="space-y-3">
            {loopBots.map((bot) => (
              <div key={bot.id} className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/40">
                <div className="dot-running mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-white truncate">{bot.name}</p>
                      <p className="text-[10px] text-slate-600 truncate">{bot.receiver}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {(bot.send_count || 0) > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          <Send size={9} />{bot.send_count} sent
                        </span>
                      )}
                    </div>
                  </div>
                  {bot.next_send_at && (
                    <MiniTimer nextSendAt={bot.next_send_at} interval={bot.interval || 120} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Chart + Activity ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Chart */}
        <Card className="lg:col-span-8 p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Activity size={16} />
              </div>
              <h3 className="text-sm font-bold text-white">Task Analytics</h3>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-2 py-1 rounded-md bg-slate-800/40">Live</span>
          </div>
          <ChartCard tasks={tasks} />
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-4 p-5 flex flex-col max-h-[420px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Zap size={16} />
              </div>
              <h3 className="text-sm font-bold text-white">Recent Activity</h3>
            </div>
            {tasks.length > 0 && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">
                {tasks.length} bots
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-0 scrollbar-hide">
            {tasks.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No Activity Yet"
                description="Your automation logs will appear here once you launch a bot"
              />
            ) : (
              [...tasks].reverse().map((task, i) => (
                <ActivityItem key={task.id} task={task} idx={i} />
              ))
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}