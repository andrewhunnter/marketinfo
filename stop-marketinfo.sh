#!/bin/bash

# MarketInfo Stop Script
# This script stops all running MarketInfo services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping MarketInfo Services...${NC}"
echo "=================================="

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
    local port=$1
    local service_name=$2
    
    if check_port $port; then
        echo -e "${YELLOW}Stopping $service_name on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
        
        if check_port $port; then
            echo -e "${RED}❌ Failed to stop $service_name${NC}"
        else
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        fi
    else
        echo -e "${YELLOW}$service_name is not running on port $port${NC}"
    fi
}

# Stop services by port
kill_port 5001 "Backend (Flask)"
kill_port 3000 "Frontend (Next.js)"
kill_port 3001 "Frontend (Next.js - alternate port)"

# Kill processes by PID files if they exist
cd marketinfo-app 2>/dev/null || true

if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Stopping backend process (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        sleep 1
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill -9 $BACKEND_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ Backend process stopped${NC}"
    fi
    rm -f backend.pid
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Stopping frontend process (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
        sleep 1
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill -9 $FRONTEND_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ Frontend process stopped${NC}"
    fi
    rm -f frontend.pid
fi

cd .. 2>/dev/null || true

# Clean up any remaining Node.js or Python processes related to the project
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "flask" 2>/dev/null || true
pkill -f "app.py" 2>/dev/null || true

echo ""
echo -e "${GREEN}🎉 All MarketInfo services have been stopped!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "• Backend (Flask) - Stopped"
echo "• Frontend (Next.js) - Stopped"
echo "• All related processes - Terminated"
echo ""
echo -e "${YELLOW}To restart the application, run: ./start-marketinfo.sh${NC}" 