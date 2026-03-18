import {
  LayoutDashboard,
  Bot,
  Zap,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "bot", label: "Bot Manager", icon: Bot },
  { id: "automation", label: "Automation", icon: Zap },
];

export default function Sidebar({
  currentPage,
  setPage,
  collapsed = false,
  setCollapsed,
}) {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`h-full border-r border-slate-800 bg-slate-950/90 backdrop-blur-xl flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* 🔷 Logo */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-white/10 shrink-0">
            <Zap size={14} className="fill-white" />
          </div>

          {!collapsed && (
            <div className="leading-tight">
              <h1 className="text-[13px] font-black tracking-wider text-white uppercase italic">
                GoGenix<span className="text-indigo-400 italic">-AI</span>
              </h1>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.15em] opacity-80 mt-0.5">
                Workflows•OS
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-slate-800 transition"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* 🔷 Menu */}
      <nav className="flex-1 px-4 py-8 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`group flex items-center w-full rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-300 relative ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              } ${collapsed ? "justify-center" : "gap-3.5"}`}
            >
              <Icon size={18} className={isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400 transition-colors"} />

              {!collapsed && <span>{item.label}</span>}

              {/* Active indicator bubble */}
              {isActive && !collapsed && (
                <motion.span 
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-6 bg-white/20 rounded-full" 
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* 🔷 Footer */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-2">
        <button
          className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </button>

        <button
          className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed && (
          <p className="text-xs text-slate-500 text-center mt-3">
            v1.0.0 • Production
          </p>
        )}
      </div>
    </motion.aside>
  );
}