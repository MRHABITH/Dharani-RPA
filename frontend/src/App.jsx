import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./components/Layout/Sidebar";
import Navbar from "./components/Layout/Navbar";
import Dashboard from "./pages/Dashboard";
import BotManager from "./pages/BotManager";
import Automation from "./pages/Automation";
import LoginPage from "./pages/LoginPage";
import { API_BASE, WS_BASE } from './api';
import './index.css';

const BASE_URL = API_BASE;
const WS_URL   = WS_BASE;

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('automail_auth') === '1');
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isDark, setIsDark] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('automail_auth');
    setAuthed(false);
    if (socketRef.current) socketRef.current.close();
  };

  // 🌙 Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // 📡 Fetch all tasks from backend
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔌 Connect to real backend WebSocket
  const connectWebSocket = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected to backend");
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.task_id) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === msg.task_id
                ? {
                    ...t,
                    status:       msg.status       !== undefined ? msg.status       : t.status,
                    progress:     msg.progress      !== undefined ? msg.progress     : t.progress,
                    error:        msg.error         !== undefined ? msg.error        : t.error,
                    send_count:   msg.send_count    !== undefined ? msg.send_count   : t.send_count,
                    failed_count: msg.failed_count  !== undefined ? msg.failed_count : t.failed_count,
                    next_send_at: msg.next_send_at  !== undefined ? msg.next_send_at : t.next_send_at,
                    interval:     msg.interval      !== undefined ? msg.interval     : t.interval,
                  }
                : t
            )
          );
        }
      } catch (e) {
        console.warn("[WS] Failed to parse message:", e);
      }
    };


    ws.onerror = (err) => {
      console.warn("[WS] Error:", err);
    };

    ws.onclose = () => {
      console.warn("[WS] Disconnected. Reconnecting in 3s...");
      // Auto-reconnect after 3 seconds
      reconnectTimerRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };
  }, []);

  // 🚀 Initial data fetch + WebSocket
  useEffect(() => {
    fetchTasks();
    connectWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [fetchTasks, connectWebSocket]);

  // 🎯 Dynamic page renderer
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard tasks={tasks} loading={loading} />;
      case "bot":
        return (
          <BotManager
            setTasks={setTasks}
            tasks={tasks}
            setPage={setCurrentPage}
            onBotCreated={fetchTasks}
          />
        );
      case "automation":
        return <Automation tasks={tasks} setTasks={setTasks} />;
      default:
        return <Dashboard tasks={tasks} loading={loading} />;
    }
  };

  if (!authed) {
    return <LoginPage onLogin={() => { setAuthed(true); fetchTasks(); }} />;
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-dark-bg to-dark-card text-slate-100 flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setPage={setCurrentPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        className="md:w-64 w-full"
      />

      {/* Main Layout */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Navbar */}
        <Navbar
          title={
            currentPage === "dashboard"
              ? "Dashboard"
              : currentPage === "bot"
              ? "Bot Manager"
              : "Automation"
          }
          isDark={isDark}
          setIsDark={setIsDark}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-br from-dark-bg to-dark-card">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}