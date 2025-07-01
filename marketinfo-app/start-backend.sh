#!/bin/bash

echo "🚀 Starting MarketInfo Backend..."
echo "================================"

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/installed" ]; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
    touch venv/installed
fi

# Start Flask server
echo "🌟 Starting Flask server on http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo "================================"
python app.py 