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
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp env.example .env.local
    echo "✅ Created .env.local from env.example"
    echo "📝 Please review and update .env.local with your Firebase configuration"
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
    kill $EMULATOR_PID 2>/dev/null
    kill $DEV_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for either process to exit
wait
