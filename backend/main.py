"""
main.py
─────────────────────────────────────────────────────────
FastAPI application entry point.

BUG FIX: `from websocket import manager` → `from ws_manager import manager`
  The original file was named websocket.py which shadows Python/FastAPI's
  internal `websocket` module.  FastAPI's WebSocket type would fail to
  import properly in that environment, causing a cryptic ImportError.

BUG FIX: Route ordering — DELETE /tasks/clear must be registered BEFORE
  any parameterised /tasks/{...} routes or FastAPI will match "clear" as
  a task_id.  Routes are now ordered explicitly.

BUG FIX: WebSocket bare `except:` → `except Exception` with proper
  disconnect cleanup so keyboard interrupts and system signals propagate
  correctly and are not silently swallowed.

BUG FIX: Passwords are stripped from /tasks and /status responses before
  they are returned to the caller.
"""

import uuid
import logging
import os

from fastapi import FastAPI, BackgroundTasks, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import TaskRequest
from task_store import task_store, save_tasks
from tasks import run_task
from ws_manager import manager  # ← renamed from `websocket`

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Email Automation API", version="1.1.0")

# ── CORS ──────────────────────────────────────────────────
# Allow all origins in dev; tighten this in production via env var
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _safe_task(task: dict) -> dict:
    """Return a copy of the task dict with the password redacted."""
    return {k: ("***" if k == "password" else v) for k, v in task.items()}


# ── Health ────────────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.1.0"}


# ── WebSocket ─────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Keep connection alive; we only push from server → client
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        # Normal client-side disconnect (tab closed, etc.)
        manager.disconnect(websocket)
    except Exception as e:
        # Unexpected error — still clean up
        logger.warning(f"[WS] Unexpected error: {e}")
        manager.disconnect(websocket)


# ── Start Task ────────────────────────────────────────────
@app.post("/start")
async def start_task(data: TaskRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())

    task_store[task_id] = {
        "id":            task_id,
        "name":          data.name,
        "template_id":   data.template_id,
        "sender":        data.sender,
        "password":      data.password,   # stored internally; never returned in API
        "receiver":      data.receiver,
        "subject":       data.subject,
        "message":       data.message,
        "status":        "STARTED",
        "progress":      0,
        "stop":          False,
        "mode":          data.mode,
        "interval":      data.interval,
        "scheduledDate": data.scheduledDate,
        "scheduledTime": data.scheduledTime,
        "smtpServer":    data.smtpServer,
        "smtpPort":      data.smtpPort,
        "imapServer":    data.imapServer,
        "imapPort":      data.imapPort,
        "mailbox":       data.mailbox,
        "extractionType":data.extractionType,
        "filterQuery":   data.filterQuery,
        "error":         None,
    }

    save_tasks(task_store)
    background_tasks.add_task(run_task, task_id)

    return {"task_id": task_id}


# ── Stop Task ─────────────────────────────────────────────
@app.post("/stop/{task_id}")
async def stop_task(task_id: str):
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="Task not found")

    task_store[task_id]["stop"] = True
    return {"message": "Stop signal sent"}


# ── Get Status ────────────────────────────────────────────
@app.get("/status/{task_id}")
async def get_status(task_id: str):
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="Task not found")

    return _safe_task(task_store[task_id])


# ── Clear ALL Tasks ───────────────────────────────────────
# IMPORTANT: this must be registered BEFORE /tasks (GET) and any
# parameterised DELETE /task/{task_id} to avoid route shadowing.
@app.delete("/tasks/clear")
async def clear_all_tasks():
    for task in task_store.values():
        task["stop"] = True

    task_store.clear()
    save_tasks(task_store)
    return {"message": "All tasks cleared"}


# ── Get ALL Tasks ─────────────────────────────────────────
@app.get("/tasks")
async def get_all_tasks():
    return [_safe_task(t) for t in task_store.values()]


# ── Delete Single Task ────────────────────────────────────
@app.delete("/task/{task_id}")
async def delete_task(task_id: str):
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="Task not found")

    task_store[task_id]["stop"] = True
    del task_store[task_id]
    save_tasks(task_store)
    return {"message": "Task deleted"}