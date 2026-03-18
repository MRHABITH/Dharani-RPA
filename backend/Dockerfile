# ── Build stage (keeps final image small) ─────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Runtime stage ──────────────────────────────────────────────────────
FROM python:3.11-slim

# Non-root user for security
RUN useradd -m appuser
WORKDIR /app

COPY --from=builder /install /usr/local
COPY . .

# Persistent storage for tasks.json
RUN mkdir -p /app/data && chown appuser:appuser /app/data
ENV TASKS_FILE=/app/data/tasks.json

USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]