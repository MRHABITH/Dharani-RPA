import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Zap } from "lucide-react";
import { Card, Badge, Modal, Button, EmptyState } from "../components/Common";
import BotForm from "../components/BotForm";
import { API_BASE } from "../api";


const TEMPLATES = [
  {
    id: "automation",
    name: "Email Automation",
    icon: "✉️",
    desc: "Automated email sending with flexible execution modes",
    status: "active",
  },
  {
    id: "email",
    name: "Email Parsing",
    icon: "📧",
    desc: "Extract and process data from incoming emails",
    status: "active",
  },
  {
    id: "web",
    name: "Web Automation",
    icon: "🌐",
    desc: "Automate web interactions",
    status: "coming-soon",
  },
  {
    id: "api",
    name: "API Sync",
    icon: "🔌",
    desc: "Sync data across APIs",
    status: "coming-soon",
  },
];

export default function BotManager({ setTasks, tasks, setPage, onBotCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSelectTemplate = (template) => {
    if (template.status === "active") {
      setSelectedTemplate(template);
      setShowModal(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bot permanently?')) return;
    try {
      await fetch(`${API_BASE}/task/${id}`, { method: 'DELETE' });

      setTasks(tasks.filter((t) => t.id !== id));
    } catch {
      alert('❌ Failed to delete bot');
    }
  };


  // 🔙 Template Form View
  if (selectedTemplate) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedTemplate(null)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <BotForm
          key={selectedTemplate.id || selectedTemplate.name}
          template={selectedTemplate}
          setTasks={setTasks}
          onCreated={async () => {
            // Re-fetch tasks from the server so the dashboard has fresh data
            if (onBotCreated) await onBotCreated();
            // Navigate to dashboard to show the new task
            if (setPage) setPage("dashboard");
            setSelectedTemplate(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 🔷 Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Bot <span className="text-gradient">Manager</span>
          </h2>
          <p className="text-[13px] text-slate-500 font-medium mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Create and manage your customized automation bots
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={Plus} onClick={() => setShowModal(true)}>
            Create New Bot
          </Button>
        </div>
      </div>

      {/* 🔷 Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Select Template"
        size="lg"
      >
        <p className="text-sm text-slate-400 mb-4">
          Choose a template to get started
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEMPLATES.map((template) => (
            <div
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className={`border border-slate-800 rounded-2xl p-6 text-center transition cursor-pointer hover:border-indigo-500 hover:bg-slate-900/50 flex flex-col min-h-[280px] ${
                template.status === "coming-soon"
                  ? "opacity-50 pointer-events-none"
                  : "hover:shadow-premium"
              }`}
            >
              <div className="flex-shrink-0">
                <div className="text-3xl mb-4 bg-slate-800/30 w-14 h-14 rounded-xl flex items-center justify-center mx-auto shadow-inner">
                  {template.icon}
                </div>

                <h3 className="text-base font-bold text-white mb-2">
                  {template.name}
                </h3>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <p className="text-[13px] text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                  {template.desc}
                </p>

                {template.status === "coming-soon" ? (
                  <div className="pt-2 flex justify-center">
                    <Badge label="Coming Soon" variant="warning" />
                  </div>
                ) : (
                  <Button size="sm" className="w-full">
                    Select Template
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* 🔷 Bot List */}
      {tasks.length > 0 ? (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Zap size={18} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Active Automation Bots</h3>
            </div>
            <Badge label={`${tasks.length} Operational`} variant="success" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all duration-300 group shadow-lg"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-3xl shadow-inner border border-slate-700/50 group-hover:scale-110 transition-transform duration-300">
                    {TEMPLATES.find(t => t.id === task.template_id)?.icon || "🤖"}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                      {task.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-slate-400 font-medium font-mono opacity-80">
                        {task.receiver || 'Self-Automated'}
                      </p>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                        ID: {task.id.split('_').pop()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:block">
                    <Badge label="Operational" variant="success" />
                  </div>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-3 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200"
                    title="Terminate Bot"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Plus}
          title="No Bots Created"
          description="Create your first automation bot"
          action={<Button onClick={() => setShowModal(true)}>Create Bot</Button>}
        />
      )}
    </div>
  );
}