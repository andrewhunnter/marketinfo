#!/bin/bash

echo "🤖 MarketInfo AI Chatbot Startup Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    echo -e "${YELLOW}Killing process on port $1...${NC}"
    lsof -ti:$1 | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Check if we're in the right directory
if [ ! -f "backend/app.py" ] || [ ! -f "frontend/package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the marketinfo-app directory${NC}"
    echo "Current directory: $(pwd)"
    echo "Expected files: backend/app.py, frontend/package.json"
    exit 1
fi

# Check if .env file exists and has API key
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Error: backend/.env file not found${NC}"
    echo "Please create backend/.env with your Groq API key"
    exit 1
fi

if grep -q "your_groq_api_key_here" backend/.env; then
    echo -e "${RED}❌ Error: Groq API key not configured${NC}"
    echo "Please edit backend/.env and replace 'your_groq_api_key_here' with your actual API key"
    echo "Get your free API key at: https://console.groq.com/"
    exit 1
fi

echo -e "${GREEN}✅ Configuration check passed${NC}"
echo ""

# Kill existing processes on ports
if check_port 5001; then
    kill_port 5001
fi

if check_port 3000; then
    kill_port 3000
fi

if check_port 3001; then
    kill_port 3001
fi

echo -e "${BLUE}🚀 Starting MarketInfo AI Chatbot...${NC}"
echo ""

# Start backend
echo -e "${PURPLE}📡 Starting Backend (Flask + Groq AI)...${NC}"
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -r requirements.txt >/dev/null 2>&1

# Start Flask backend in background
echo -e "${GREEN}Starting Flask server on http://localhost:5001${NC}"
python app.py > flask.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Test backend
if curl -s http://localhost:5001/api/health >/dev/null; then
    echo -e "${GREEN}✅ Backend started successfully${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Check backend/flask.log for errors${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

cd ..

# Start frontend
echo -e "${PURPLE}🎨 Starting Frontend (Next.js)...${NC}"
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install >/dev/null 2>&1
fi

# Start Next.js frontend in background
echo -e "${GREEN}Starting Next.js server...${NC}"
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

cd ..

# Wait for frontend to start
sleep 5

# Check if frontend started
if curl -s http://localhost:3000 >/dev/null || curl -s http://localhost:3001 >/dev/null; then
    echo -e "${GREEN}✅ Frontend started successfully${NC}"
else
    echo -e "${RED}❌ Frontend failed to start. Check frontend.log for errors${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 MarketInfo AI Chatbot is now running!${NC}"
echo ""
echo -e "${BLUE}📱 Access your dashboard:${NC}"
if curl -s http://localhost:3000 >/dev/null; then
    echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
else
    echo -e "   Frontend: ${GREEN}http://localhost:3001${NC}"
fi
echo -e "   Backend API: ${GREEN}http://localhost:5001${NC}"
echo ""
echo -e "${PURPLE}🤖 AI Features Available:${NC}"
echo "   • Click the floating chat button (bottom right)"
echo "   • Or click 'Start AI Analysis' in the hero section"
echo "   • Ask about crypto prices, market trends, economic data"
echo "   • Get personalized investment insights"
echo ""
echo -e "${YELLOW}📊 Your AI can analyze:${NC}"
echo "   • Cryptocurrency data (BTC, ETH, SOL)"
echo "   • Stock market indices (S&P 500, NASDAQ)"
echo "   • Economic indicators (CPI, unemployment, interest rates)"
echo "   • Fear & Greed Index"
echo "   • Economic calendar events"
echo ""
echo -e "${BLUE}🛠️  Process IDs:${NC}"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo -e "${YELLOW}To stop the services:${NC}"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping MarketInfo AI Chatbot...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running and show logs
echo -e "${BLUE}📋 Showing live logs (Press Ctrl+C to stop):${NC}"
echo "================================================"

# Follow logs from both services
tail -f backend/flask.log frontend.log 2>/dev/null &
TAIL_PID=$!

# Wait for user to stop
wait

# Cleanup
kill $TAIL_PID 2>/dev/null
cleanup 