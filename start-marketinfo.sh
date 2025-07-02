#!/bin/bash

# MarketInfo Complete Startup Script
# This script runs all components in the correct sequence to get the application running locally

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo ""
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo ""
}

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    echo -e "${YELLOW}Killing existing process on port $1...${NC}"
    lsof -ti:$1 | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}Attempt $attempt/$max_attempts - waiting for $service_name...${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service_name failed to start after $max_attempts attempts${NC}"
    return 1
}

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all MarketInfo services...${NC}"
    
    # Kill processes on known ports
    for port in 3000 3001 5001; do
        if check_port $port; then
            kill_port $port
        fi
    done
    
    # Kill any background processes we started
    jobs -p | xargs -r kill 2>/dev/null || true
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

print_header "🚀 MarketInfo Complete Startup"

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "marketinfo-app" ]; then
    echo -e "${RED}❌ Error: Please run this script from the marketinfo root directory${NC}"
    echo "Current directory: $(pwd)"
    exit 1
fi

print_header "📊 Step 1: Running Data Collection Scripts"

# Run the main data collection scripts first
if [ -f "run_all_scripts.sh" ]; then
    echo -e "${BLUE}Running data collection scripts...${NC}"
    chmod +x run_all_scripts.sh
    if ./run_all_scripts.sh; then
        echo -e "${GREEN}✅ Data collection completed successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Some data collection scripts failed, but continuing...${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  run_all_scripts.sh not found, skipping data collection${NC}"
fi

print_header "🤖 Step 2: Setting up AI Environment"

cd marketinfo-app

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env file...${NC}"
    cat > backend/.env << 'EOF'
GROQ_API_KEY=your_groq_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
EOF
    echo -e "${GREEN}✅ Created backend/.env file${NC}"
fi

# Check if Groq API key is configured
if grep -q "your_groq_api_key_here" backend/.env 2>/dev/null; then
    echo -e "${RED}⚠️  IMPORTANT: You need to configure your Groq API key!${NC}"
    echo ""
    echo -e "${YELLOW}Steps to get your FREE Groq API key:${NC}"
    echo "1. Go to https://console.groq.com/"
    echo "2. Sign up for a free account"
    echo "3. Go to API Keys section"
    echo "4. Create a new API key"
    echo "5. Copy the API key"
    echo ""
    echo -e "${YELLOW}Then edit: marketinfo-app/backend/.env${NC}"
    echo "And replace 'your_groq_api_key_here' with your actual API key"
    echo ""
    read -p "Press Enter to continue (you can set the API key later)..."
fi

# Run setup-llm.sh
if [ -f "setup-llm.sh" ]; then
    echo -e "${BLUE}Running LLM setup...${NC}"
    chmod +x setup-llm.sh
    ./setup-llm.sh
else
    echo -e "${YELLOW}⚠️  setup-llm.sh not found, setting up manually...${NC}"
    
    # Setup backend
    echo -e "${BLUE}Setting up backend...${NC}"
    cd backend
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Creating Python virtual environment...${NC}"
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    cd ..
    
    # Setup frontend
    echo -e "${BLUE}Setting up frontend...${NC}"
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing npm dependencies...${NC}"
        npm install
    fi
    cd ..
fi

print_header "🔧 Step 3: Starting Backend Services"

# Kill existing processes on ports
for port in 5001 3000 3001; do
    if check_port $port; then
        kill_port $port
    fi
done

# Start backend
echo -e "${PURPLE}📡 Starting Backend (Flask + Groq AI)...${NC}"
cd backend

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt >/dev/null 2>&1

echo -e "${GREEN}Starting Flask server on http://localhost:5001${NC}"
nohup python app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid

deactivate
cd ..

# Wait for backend to be ready
if wait_for_service "http://localhost:5001/api/health" "Backend"; then
    echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Check backend.log for errors${NC}"
    cat backend.log
    exit 1
fi

print_header "🎨 Step 4: Starting Frontend"

cd frontend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install >/dev/null 2>&1
fi

echo -e "${GREEN}Starting Next.js development server...${NC}"
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid

cd ..

# Wait for frontend to be ready
sleep 8
if wait_for_service "http://localhost:3000" "Frontend" || wait_for_service "http://localhost:3001" "Frontend"; then
    echo -e "${GREEN}✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend failed to start. Check frontend.log for errors${NC}"
    tail -n 20 frontend.log
    exit 1
fi

print_header "🎉 MarketInfo Application Ready!"

echo -e "${GREEN}🚀 All services are now running!${NC}"
echo ""
echo -e "${BLUE}📱 Access your application:${NC}"
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo -e "   🌐 Frontend: ${GREEN}http://localhost:3000${NC}"
else
    echo -e "   🌐 Frontend: ${GREEN}http://localhost:3001${NC}"
fi
echo -e "   🔌 Backend API: ${GREEN}http://localhost:5001${NC}"
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
echo -e "${BLUE}🛠️  Process Information:${NC}"
echo "   Backend PID: $BACKEND_PID (saved to backend.pid)"
echo "   Frontend PID: $FRONTEND_PID (saved to frontend.pid)"
echo ""
echo -e "${CYAN}📋 Log Files:${NC}"
echo "   Backend logs: marketinfo-app/backend.log"
echo "   Frontend logs: marketinfo-app/frontend.log"
echo ""
echo -e "${YELLOW}⚠️  To stop all services:${NC}"
echo "   Press Ctrl+C in this terminal"
echo "   Or run: kill \$(cat marketinfo-app/backend.pid marketinfo-app/frontend.pid 2>/dev/null)"
echo ""

# Remove the automatic exit trap since we want to keep running
trap - EXIT

# Keep the script running and show live status
echo -e "${BLUE}📊 Live Service Status (Press Ctrl+C to stop all services):${NC}"
echo "================================================"

# Function to show service status
show_status() {
    while true; do
        clear
        echo -e "${CYAN}MarketInfo Service Status - $(date)${NC}"
        echo "================================================"
        
        # Check backend
        if check_port 5001; then
            echo -e "Backend (Flask): ${GREEN}✅ Running${NC} - http://localhost:5001"
        else
            echo -e "Backend (Flask): ${RED}❌ Stopped${NC}"
        fi
        
        # Check frontend
        if check_port 3000; then
            echo -e "Frontend (Next.js): ${GREEN}✅ Running${NC} - http://localhost:3000"
        elif check_port 3001; then
            echo -e "Frontend (Next.js): ${GREEN}✅ Running${NC} - http://localhost:3001"
        else
            echo -e "Frontend (Next.js): ${RED}❌ Stopped${NC}"
        fi
        
        echo ""
        echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
        echo ""
        echo "Recent backend log:"
        echo "-------------------"
        tail -n 3 backend.log 2>/dev/null || echo "No backend logs available"
        echo ""
        echo "Recent frontend log:"
        echo "--------------------"
        tail -n 3 frontend.log 2>/dev/null || echo "No frontend logs available"
        
        sleep 5
    done
}

# Start status monitoring
show_status 