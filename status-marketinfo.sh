#!/bin/bash

# MarketInfo Status Check Script
# This script checks the status of all MarketInfo services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}📊 MarketInfo Service Status${NC}"
echo "============================"
echo ""

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to test service health
test_service() {
    if curl -s "$1" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check Backend
echo -e "${BLUE}🔧 Backend Services:${NC}"
if check_port 5001; then
    if test_service "http://localhost:5001/api/health"; then
        echo -e "   Flask API: ${GREEN}✅ Running${NC} - http://localhost:5001"
    else
        echo -e "   Flask API: ${YELLOW}⚠️  Port in use but not responding${NC} - http://localhost:5001"
    fi
else
    echo -e "   Flask API: ${RED}❌ Not running${NC}"
fi

echo ""

# Check Frontend
echo -e "${BLUE}🎨 Frontend Services:${NC}"
if check_port 3000; then
    if test_service "http://localhost:3000"; then
        echo -e "   Next.js App: ${GREEN}✅ Running${NC} - http://localhost:3000"
    else
        echo -e "   Next.js App: ${YELLOW}⚠️  Port in use but not responding${NC} - http://localhost:3000"
    fi
elif check_port 3001; then
    if test_service "http://localhost:3001"; then
        echo -e "   Next.js App: ${GREEN}✅ Running${NC} - http://localhost:3001"
    else
        echo -e "   Next.js App: ${YELLOW}⚠️  Port in use but not responding${NC} - http://localhost:3001"
    fi
else
    echo -e "   Next.js App: ${RED}❌ Not running${NC}"
fi

echo ""

# Check PID files
echo -e "${BLUE}📋 Process Information:${NC}"
cd marketinfo-app 2>/dev/null || true

if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "   Backend PID: ${GREEN}$BACKEND_PID (running)${NC}"
    else
        echo -e "   Backend PID: ${RED}$BACKEND_PID (not running)${NC}"
    fi
else
    echo -e "   Backend PID: ${YELLOW}No PID file found${NC}"
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "   Frontend PID: ${GREEN}$FRONTEND_PID (running)${NC}"
    else
        echo -e "   Frontend PID: ${RED}$FRONTEND_PID (not running)${NC}"
    fi
else
    echo -e "   Frontend PID: ${YELLOW}No PID file found${NC}"
fi

cd .. 2>/dev/null || true

echo ""

# Check log files
echo -e "${BLUE}📝 Log Files:${NC}"
if [ -f "marketinfo-app/backend.log" ]; then
    BACKEND_LOG_SIZE=$(wc -l < marketinfo-app/backend.log 2>/dev/null || echo "0")
    echo -e "   Backend logs: ${GREEN}✅ Available${NC} ($BACKEND_LOG_SIZE lines)"
else
    echo -e "   Backend logs: ${YELLOW}⚠️  Not found${NC}"
fi

if [ -f "marketinfo-app/frontend.log" ]; then
    FRONTEND_LOG_SIZE=$(wc -l < marketinfo-app/frontend.log 2>/dev/null || echo "0")
    echo -e "   Frontend logs: ${GREEN}✅ Available${NC} ($FRONTEND_LOG_SIZE lines)"
else
    echo -e "   Frontend logs: ${YELLOW}⚠️  Not found${NC}"
fi

echo ""

# Overall status
if check_port 5001 && (check_port 3000 || check_port 3001); then
    echo -e "${GREEN}🎉 MarketInfo is running!${NC}"
    echo ""
    echo -e "${CYAN}🌐 Access your application:${NC}"
    if check_port 3000; then
        echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
    elif check_port 3001; then
        echo -e "   Frontend: ${GREEN}http://localhost:3001${NC}"
    fi
    echo -e "   Backend API: ${GREEN}http://localhost:5001${NC}"
elif check_port 5001 || check_port 3000 || check_port 3001; then
    echo -e "${YELLOW}⚠️  MarketInfo is partially running${NC}"
    echo -e "   Some services may need to be restarted"
else
    echo -e "${RED}❌ MarketInfo is not running${NC}"
    echo -e "   Run ${YELLOW}./start-marketinfo.sh${NC} to start all services"
fi

echo ""
echo -e "${BLUE}📋 Available Commands:${NC}"
echo -e "   Start:  ${YELLOW}./start-marketinfo.sh${NC}"
echo -e "   Stop:   ${YELLOW}./stop-marketinfo.sh${NC}"
echo -e "   Status: ${YELLOW}./status-marketinfo.sh${NC}" 