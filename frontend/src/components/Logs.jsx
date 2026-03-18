import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { EmptyState, Badge } from './Common';


export default function Logs({ tasks }) {
  const logs = tasks.map((t) => ({
    type:
      t.status === 'COMPLETED'
        ? 'success'
        : t.status === 'STARTED'
        ? 'info'
        : 'error',
    message: `${t.name} → ${t.receiver}`,
    status: t.status,
    icon:
      t.status === 'COMPLETED'
        ? CheckCircle
        : t.status === 'STARTED'
        ? Info
        : AlertCircle,
  }));

  if (logs.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <EmptyState
          icon={Info}
          title="No Activity Yet"
          description="Your automation logs will appear here"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Logs List */}
      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide pr-1">
        {logs.map((log, i) => {
          const Icon = log.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-800/40 bg-slate-800/20 hover:bg-slate-800/40 transition-colors group"
            >
              {/* Icon */}
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  log.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : log.type === 'error'
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'bg-indigo-500/10 text-indigo-400'
                }`}
              >
                <Icon size={16} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                    {log.message}
                  </p>
                  <Badge label={log.status} variant={log.type} />
                </div>

                <div className="flex items-center justify-between mt-1 text-[11px] font-medium text-slate-500">
                  <span className="opacity-60">{new Date().toLocaleDateString()}</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}