# ========================================
# Dockerfile for Regression Testing Backend
# Includes: Node.js, Python, Chrome (headless)
# ========================================

# --- Stage 1: Base image with Node + Python + Chrome ---
FROM node:18-slim

# Install Python, pip, and Chromium dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# --- Copy and install backend Node dependencies ---
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# --- Copy and install testing-engine Python dependencies ---
COPY testing-engine/requirements.txt ./testing-engine/
RUN pip3 install --no-cache-dir --break-system-packages -r testing-engine/requirements.txt

# --- Copy all source code ---
COPY backend/ ./backend/
COPY testing-engine/ ./testing-engine/

# Expose the backend port
EXPOSE 5000

# Set environment variables
ENV PORT=5000
ENV PYTHONIOENCODING=utf-8
ENV CHROME_BIN=/usr/bin/chromium

# Start the backend server
CMD ["node", "backend/server.js"]
