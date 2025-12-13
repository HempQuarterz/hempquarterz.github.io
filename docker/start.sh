#!/bin/sh
# All4Yah Docker Startup Script
# Starts both Nginx and Node.js backend

set -e

echo "🚀 Starting All4Yah..."

# Start backend in background
echo "📡 Starting backend API on port 3001..."
cd /app/backend
node server.js &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start"
    exit 1
fi

echo "✅ Backend running (PID: $BACKEND_PID)"

# Start nginx in foreground
echo "🌐 Starting Nginx on port 80..."
nginx -g 'daemon off;'
