# ========================================
# Dockerfile for Regression Testing Backend
# Includes: Node.js, Python, Chrome (headless)
# ========================================

# --- Stage 1: Base image with Node + Python + Chrome ---
FROM node:18-slim

# Install Python, pip, and Chrome dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    wget \
    gnupg \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome (stable)
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
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
ENV CHROME_BIN=/usr/bin/google-chrome

# Start the backend server
CMD ["node", "backend/server.js"]
