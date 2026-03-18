// Central API config — reads from VITE_API_URL env var (set on Render)
// Falls back to localhost:8000 for local development
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const WS_BASE  = API_BASE.replace(/^http/, 'ws') + '/ws';
