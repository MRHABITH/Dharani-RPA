from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        disconnected = []

        for conn in self.active_connections:
            try:
                await conn.send_json(data)
            except:
                disconnected.append(conn)

        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()