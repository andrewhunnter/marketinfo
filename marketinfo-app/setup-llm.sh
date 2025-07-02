#!/bin/bash

echo "🤖 MarketInfo AI Setup Script"
echo "=============================="
echo ""

# Check if Groq API key is set
if [ -f "backend/.env" ]; then
    if grep -q "your_groq_api_key_here" backend/.env; then
        echo "⚠️  You need to set up your Groq API key!"
        echo ""
        echo "Steps to get your FREE Groq API key:"
        echo "1. Go to https://console.groq.com/"
        echo "2. Sign up for a free account"
        echo "3. Go to API Keys section"
        echo "4. Create a new API key"
        echo "5. Copy the API key"
        echo ""
        echo "Then run: nano backend/.env"
        echo "And replace 'your_groq_api_key_here' with your actual API key"
        echo ""
    else
        echo "✅ Groq API key appears to be configured"
    fi
else
    echo "❌ .env file not found in backend/"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
    pip install -r requirements.txt
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  Virtual environment not found. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo "✅ Backend virtual environment created and dependencies installed"
fi

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Make sure your Groq API key is set in backend/.env"
echo "2. Run: ./start-backend.sh"
echo "3. Run: ./start-frontend.sh"
echo ""
echo "Your AI chatbot will be able to analyze:"
echo "• Crypto prices (BTC, ETH, SOL)"
echo "• Market indices (S&P 500, NASDAQ, VIX)"
echo "• Economic indicators (CPI, unemployment, interest rates)"
echo "• Fear & Greed Index"
echo "• And provide investment insights!" 