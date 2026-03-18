import json
import os
import threading

TASKS_FILE = "tasks.json"
_lock = threading.Lock()

def load_tasks():
    if os.path.exists(TASKS_FILE):
        try:
            with open(TASKS_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_tasks(tasks_dict):
    with _lock:
        try:
            with open(TASKS_FILE, "w") as f:
                json.dump(tasks_dict, f, indent=4)
        except Exception as e:
            print(f"Save error: {e}")

task_store = load_tasks()