import { motion } from "framer-motion";
import { Sparkles, Radio } from "lucide-react";
import Overview from "./Overview";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show:  { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function Dashboard({ tasks = [], loading }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* ── Hero Header ──────────────────────────────── */}
      <motion.div variants={item} className="relative overflow-hidden card-premium px-8 py-7">
        {/* Aurora blobs */}
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" style={{ animation: 'aurora 12s linear infinite' }} />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-violet-600/8 blur-[80px] pointer-events-none" style={{ animation: 'aurora 16s linear infinite reverse' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="dot-running" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">System Operational</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Welcome back, <span className="text-gradient">Operator</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">
              {tasks.length > 0
                ? `${tasks.length} automation bot${tasks.length > 1 ? 's' : ''} registered · monitoring in realtime`
                : 'No bots running yet — create your first from Bot Manager'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
            >
              <Radio size={14} className="text-indigo-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Live</span>
            </motion.div>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles size={22} className="text-indigo-400 opacity-60" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats + Charts ─────────────────────────── */}
      <motion.div variants={item}>
        <Overview tasks={tasks} loading={loading} />
      </motion.div>
    </motion.div>
  );
}