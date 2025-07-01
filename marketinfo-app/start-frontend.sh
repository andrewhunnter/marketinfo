#!/bin/bash

echo "🚀 Starting MarketInfo Frontend..."
echo "================================="

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing npm dependencies..."
    npm install
fi

# Start Next.js development server
echo "🌟 Starting Next.js server on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo "================================="
npm run dev 