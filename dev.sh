#!/bin/bash

# TopicNest Development Server Starter
# This script starts both the Go backend and Next.js frontend

echo "🚀 Starting TopicNest Development Servers..."
echo ""

# Check if DATABASE_URL is set in backend/.env
if ! grep -q "^DATABASE_URL=postgresql://" backend/.env 2>/dev/null; then
    echo "⚠️  WARNING: DATABASE_URL not configured in backend/.env"
    echo "Please add your Supabase connection string to backend/.env"
    echo ""
    echo "Example:"
    echo "DATABASE_URL=postgresql://postgres.dnkzpufpttsunuqybzcx:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require"
    echo ""
    read -p "Continue without backend? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    SKIP_BACKEND=true
fi

# Start backend in background (if configured)
if [ "$SKIP_BACKEND" != "true" ]; then
    echo "📦 Starting Go backend on port 8080..."
    cd backend
    go run . > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    echo "✓ Backend started (PID: $BACKEND_PID)"
    echo "  Logs: backend.log"
    sleep 2
fi

# Start frontend
echo ""
echo "🎨 Starting Next.js frontend on port 3000..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✓ Frontend started (PID: $FRONTEND_PID)"
echo "  Logs: frontend.log"

echo ""
echo "✨ TopicNest is running!"
echo ""
echo "📍 Open your browser to: http://localhost:3000"
if [ "$SKIP_BACKEND" != "true" ]; then
    echo "🔌 Backend API: http://localhost:8080/api"
fi
echo ""
echo "To stop servers, press Ctrl+C or run:"
if [ "$SKIP_BACKEND" != "true" ]; then
    echo "  kill $BACKEND_PID $FRONTEND_PID"
else
    echo "  kill $FRONTEND_PID"
fi

# Wait for user interrupt
trap "echo ''; echo '🛑 Shutting down...'; [ ! -z '$BACKEND_PID' ] && kill $BACKEND_PID 2>/dev/null; kill $FRONTEND_PID 2>/dev/null; exit 0" INT

wait
