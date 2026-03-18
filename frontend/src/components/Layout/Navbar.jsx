import { Moon, Sun, Bell, User, Menu, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar({
  title,
  isDark,
  setIsDark,
  collapsed,
  setCollapsed,
  onLogout,
}) {
  const now = new Date();
  const dateString = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-2xl"
    >
      {/* Left */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2.5 rounded-xl hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700/50"
        >
          <Menu size={20} className="text-slate-300" />
        </button>
        <div className="leading-tight">
          <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5 opacity-80">{dateString}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 pr-6 border-r border-slate-800/60">
          <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-xl hover:bg-slate-800 transition-all hover:scale-105">
            {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-300" />}
          </button>
          <button className="relative p-2.5 rounded-xl hover:bg-slate-800 transition-all hover:scale-105">
            <Bell size={18} className="text-slate-400 hover:text-white" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 border-2 border-slate-950 rounded-full" />
          </button>
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3.5 group cursor-pointer">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors tracking-tight">Administrator</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Superuser</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700/50 shadow-inner group-hover:border-indigo-500/50 transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <User size={16} />
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}