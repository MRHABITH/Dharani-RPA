// Simple mock socket that emits task updates periodically for demo purposes
export default function createMockSocket({ setTasks }) {
  let id = null;

  const start = () => {
    if (id) return;
    id = setInterval(() => {
      setTasks((prev) => {
        if (!prev || prev.length === 0) return prev;
        const i = Math.floor(Math.random() * prev.length);
        const copy = [...prev];
        const t = { ...copy[i] };
        // randomize progress/status
        if (t.status === 'STARTED') {
          t.progress = Math.min(100, (t.progress || 0) + Math.floor(Math.random() * 30));
          if (t.progress >= 100) t.status = 'COMPLETED';
        } else if (t.status === 'STOPPED') {
          if (Math.random() < 0.1) {
            t.status = 'STARTED';
            t.progress = 0;
          }
        } else if (t.status === 'COMPLETED') {
          if (Math.random() < 0.05) {
            t.status = 'STARTED';
            t.progress = 0;
          }
        }
        copy[i] = t;
        return copy;
      });
    }, 3000);
  };

  const stop = () => {
    if (id) {
      clearInterval(id);
      id = null;
    }
  };

  return { start, stop };
}
