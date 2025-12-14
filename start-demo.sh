#!/bin/bash

# start-demo.sh
# One-command setup and launch for Feature Flag Service + Demo System

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Feature Flag Service Demo ===${NC}"

# 1. Check/Start Infrastructure (Redis & Mongo)
echo -e "\n${GREEN}[1/4] Checking Infrastructure (Docker)...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Run Mongo if not running
if [ ! "$(docker ps -q -f name=mongo)" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=mongo)" ]; then
        echo "Starting existing Mongo container..."
        docker start mongo
    else
        echo "Creating Mongo container..."
        docker run -d -p 27017:27017 --name mongo mongo
    fi
else
    echo "Mongo is already running."
fi

# Run Redis if not running
if [ ! "$(docker ps -q -f name=redis)" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=redis)" ]; then
        echo "Starting existing Redis container..."
        docker start redis
    else
        echo "Creating Redis container..."
        docker run -d -p 6379:6379 --name redis redis
    fi
else
    echo "Redis is already running."
fi

# 2. Install Dependencies (Skipping if node_modules exists to save time, override with --install)
if [[ "$1" == "--install" || ! -d "node_modules" ]]; then
    echo -e "\n${GREEN}[2/4] Installing Dependencies...${NC}"
    npm install
    cd feature-flag-client && npm install && npm run build && cd ..
    cd demo-service && npm install && cd ..
    cd demo-ui && npm install && cd ..
else
     echo -e "\n${GREEN}[2/4] Dependencies check passed (Run with --install to force install)${NC}"
fi

# 3. Kill ports if occupied (Cleanup)
echo -e "\n${GREEN}[3/4] freeing ports 3000, 3001, 5173...${NC}"
lsof -ti:3000,3001,5173 | xargs kill -9 2>/dev/null

# 4. Start Services
echo -e "\n${GREEN}[4/4] Launching Services...${NC}"

# Function to kill all background processes on script exit
cleanup() {
    echo -e "\n${BLUE}Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

# Start Feature Flag Service
echo "Starting Feature Flag Service (Port 3000)..."
npm run start:dev > service.log 2>&1 &
PID_SERVICE=$!

# Start Demo Service
echo "Starting Demo Service (Port 3001)..."
cd demo-service
npm run start:dev > ../demo-service.log 2>&1 &
PID_DEMO=$!
cd ..

# Start Demo UI
echo "Starting Demo UI (Port 5173)..."
cd demo-ui
npm run dev > ../demo-ui.log 2>&1 &
PID_UI=$!
cd ..

echo -e "${BLUE}All services started!${NC}"
echo -e "  - Feature Service: http://localhost:3000"
echo -e "  - Demo API:        http://localhost:3001"
echo -e "  - Demo UI:         http://localhost:5173"
echo -e "\n${GREEN}READY! Open http://localhost:5173 to view the demo.${NC}"
echo "Logs are being written to service.log, demo-service.log, and demo-ui.log"
echo "Press CTRL+C to stop all services."

# Wait for all processes
wait $PID_SERVICE $PID_DEMO $PID_UI
