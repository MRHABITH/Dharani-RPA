import asyncio
import smtplib
import ssl
import imaplib
import email
import logging
import time
from datetime import datetime
from email.message import EmailMessage


from task_store import task_store, save_tasks
from websocket import manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =========================
# 📧 SMTP (SYNC → THREAD)
# =========================
def send_email_sync(task):
    msg = EmailMessage()
    msg.set_content(task.get("message", ""))
    msg["Subject"] = task.get("subject", "")
    msg["From"] = task.get("sender", "")
    msg["To"] = task.get("receiver", "")

    context = ssl.create_default_context()

    # Use task‑provided SMTP configuration (defaults are defined in the Pydantic model)
    smtp_server = task.get("smtpServer", "smtp.gmail.com")
    smtp_port = task.get("smtpPort", 587)
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls(context=ssl.create_default_context())
            server.login(task["sender"], task["password"])
            server.send_message(msg)
    except Exception as e:
        logger.error(f"SMTP send failed for task {task.get('id')}: {e}")
        raise

        server.starttls(context=context)
        server.login(task["sender"], task["password"])
        server.send_message(msg)

async def send_email(task):
    # Wrapper that runs the synchronous SMTP function in a thread pool
    await asyncio.to_thread(send_email_sync, task)
    await asyncio.to_thread(send_email_sync, task)

# =========================
# 📥 IMAP
# =========================
async def parse_email(task, task_id):
    try:
        mail = imaplib.IMAP4_SSL(task["imapServer"], task["imapPort"])
        mail.login(task["sender"], task["password"])
        mail.select(task["mailbox"])

        try:
            status, data = mail.search(None, task.get("filterQuery") or "ALL")
        except:
            status, data = mail.search(None, "ALL")

        ids = data[0].split()
        total = len(ids)

        await manager.broadcast({
            "task_id": task_id,
            "status": "RUNNING",
            "message": f"{total} emails found"
        })

        for i, m_id in enumerate(ids[-5:]):
            status, msg_data = mail.fetch(m_id, "(RFC822)")
            raw = msg_data[0][1]

            msg = email.message_from_bytes(raw)
            subject = msg["Subject"]

            progress = int((i + 1) / min(total, 5) * 100)

            await manager.broadcast({
                "task_id": task_id,
                "progress": progress,
                "message": subject
            })

            await asyncio.sleep(0.5)

        mail.logout()
        return True

    except Exception as e:
        logger.error(f"IMAP error: {e}")
        raise e

# =========================
# 🚀 MAIN TASK ENGINE
# =========================
async def run_task(task_id: str):
    task = task_store.get(task_id)
    if not task:
        return

    task["status"] = "RUNNING"

    try:
        if task["template_id"] == "email":
            await parse_email(task, task_id)

        else:
            mode = task["mode"]

            if mode == "once":
                await send_email(task)

            elif mode == "loop":
                task["send_count"] = task.get("send_count", 0)
                task["failed_count"] = task.get("failed_count", 0)
                loop_iteration = 0

                while not task["stop"]:
                    try:
                        await send_email(task)
                        loop_iteration += 1
                        task["send_count"] += 1
                        save_tasks(task_store)

                        next_at = time.time() + task["interval"]
                        task["next_send_at"] = next_at

                        await manager.broadcast({
                            "task_id": task_id,
                            "status": "RUNNING",
                            "send_count": task["send_count"],
                            "failed_count": task["failed_count"],
                            "next_send_at": next_at,
                            "interval": task["interval"],
                            "message": f"✅ Sent #{task['send_count']} — next in {task['interval']}s",
                        })

                    except Exception as send_err:
                        task["failed_count"] += 1
                        logger.warning(f"Loop send failed (will retry): {send_err}")
                        await manager.broadcast({
                            "task_id": task_id,
                            "status": "RUNNING",
                            "send_count": task["send_count"],
                            "failed_count": task["failed_count"],
                            "message": f"❌ Send #{loop_iteration + 1} failed: {send_err}",
                        })
                        loop_iteration += 1

                    if task["stop"]:
                        break

                    await asyncio.sleep(task["interval"])


            elif mode == "schedule":
                dt = datetime.strptime(
                    f"{task['scheduledDate']} {task['scheduledTime']}",
                    "%Y-%m-%d %H:%M"
                )

                delay = (dt - datetime.now()).total_seconds()

                if delay > 0:
                    await asyncio.sleep(delay)

                if not task["stop"]:
                    await send_email(task)

        task["status"] = "COMPLETED"
        task["progress"] = 100

    except Exception as e:
        task["status"] = "FAILED"
        await manager.broadcast({
            "task_id": task_id,
            "error": str(e)
        })

    save_tasks(task_store)