import { motion } from 'framer-motion';
import { Zap, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, EmptyState, StatsCard, Badge } from '../components/Common';
import TaskTable from '../components/TaskTable';

export default function Automation({ tasks, setTasks }) {
  const activeCount = tasks.filter(t => t.status === 'RUNNING' || t.status === 'STARTED').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const errorCount = tasks.filter(t => t.status === 'FAILED' || t.status === 'ERROR').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-12"
    >
      {/* 🔷 Stats Grid */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCard 
            icon={Activity} 
            label="Running Now" 
            value={activeCount} 
            color="primary" 
          />
          <StatsCard 
            icon={CheckCircle} 
            label="Total Success" 
            value={completedCount} 
            color="success" 
          />
          <StatsCard 
            icon={AlertCircle} 
            label="System Errors" 
            value={errorCount} 
            color="error" 
          />
        </div>
      )}

      {/* 🔷 Main Task List */}
      <div className="space-y-6">
        {tasks.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No Automations Active"
            description="Deployment queue is empty. Visit the Bot Manager to launch a new automation instance."
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Activity size={18} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Active Deployments</h3>
            </div>
            <TaskTable tasks={tasks} setTasks={setTasks} />
          </div>
        )}
      </div>
    </motion.div>
  );
}