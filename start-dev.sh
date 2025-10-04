#!/bin/bash

# Casa Petrada Development Server Startup Script

echo "🚀 Starting Casa Petrada Development Environment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the casapetrankcom root directory"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down development servers..."
    jobs -p | xargs -r kill
    exit 0
}

# Trap SIGINT and SIGTERM to cleanup processes
trap cleanup SIGINT SIGTERM

echo "📦 Starting Frontend Development Server (Vite)..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo "🐍 Starting Backend Development Server (FastAPI)..."
cd ../backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait $FRONTEND_PID $BACKEND_PID
