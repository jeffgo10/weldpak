#!/bin/bash

# WeldPak Local Development Startup Script
echo "🚀 Starting WeldPak Local Development Environment"
echo "=================================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if .env.local exists
if [ ! -f .env ]; then
    echo "⚠️  .env not found. Creating from template..."
    cp env.example .env
    echo "✅ Created .env from env.example"
    echo "📝 Please review and update .env with your Firebase configuration"
fi

echo ""
echo "🔧 Starting Firebase Realtime Database Emulator..."
echo "📊 Emulator UI will be available at: http://localhost:4000"
echo "🗄️  Database will be available at: http://localhost:9000"
echo ""

# Start Firebase emulators in background
firebase emulators:start --only database &
EMULATOR_PID=$!

# Wait a moment for emulator to start
sleep 3

echo ""
echo "🌐 Starting Next.js Development Server..."
echo "🚀 WeldPak will be available at: http://localhost:3000"
echo ""

# Start Next.js dev server
npm run dev &
DEV_PID=$!

echo "✅ Both servers are starting..."
echo ""
echo "📋 Available URLs:"
echo "   • WeldPak App: http://localhost:3000"
echo "   • Firebase Emulator UI: http://localhost:4000"
echo "   • Database: http://localhost:9000"
echo ""
echo "🛑 To stop both servers, press Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    
    # Kill the emulator process and all its children
    if [ ! -z "$EMULATOR_PID" ]; then
        pkill -P $EMULATOR_PID 2>/dev/null
        kill $EMULATOR_PID 2>/dev/null
    fi
    
    # Kill the dev server process and all its children
    if [ ! -z "$DEV_PID" ]; then
        pkill -P $DEV_PID 2>/dev/null
        kill $DEV_PID 2>/dev/null
    fi
    
    # Also kill any remaining Firebase emulator processes
    pkill -f "firebase emulators" 2>/dev/null
    
    # Kill any node processes on ports 3000, 4000, 9000 to be extra sure
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    lsof -ti:4000 | xargs kill -9 2>/dev/null
    lsof -ti:9000 | xargs kill -9 2>/dev/null
    
    echo "✅ All servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for either process to exit
wait
