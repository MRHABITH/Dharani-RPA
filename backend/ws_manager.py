"""
ws_manager.py
─────────────────────────────────────────────────────────
WebSocket connection manager.

RENAMED from websocket.py → ws_manager.py to avoid shadowing
Python / FastAPI's internal `websocket` module (critical bug fix).
"""

from fastapi import WebSocket
from typing import List
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"[WS] Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"[WS] Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, data: dict):
        """
        BUG FIX: Original had no error handling — a single dead connection
        would crash the entire loop and silently drop messages to all other
        connected clients. Now we collect dead connections and remove them.
        """
        dead: List[WebSocket] = []

        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception as e:
                logger.warning(f"[WS] Broadcast failed for a connection: {e}")
                dead.append(connection)

        # Clean up dead connections after iterating (safe mutation)
        for conn in dead:
            self.disconnect(conn)


manager = ConnectionManager()