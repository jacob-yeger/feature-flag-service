# Feature Flag Service & Client (Scaling Demo)

## Overview
A scalable Feature Flag system built with NestJS, optimized for high traffic and real-time requirements.

## Key Features
- **ETags**: Conditional requests (`304 Not Modified`) to drastically reduce bandwidth for polling clients.
- **Redis Caching**: Server-side caching (write-through/invalidation) to protect the database from read spikes.
- **Server-Sent Events (SSE)**: Real-time flag updates pushed to clients via `/feature-flags/stream`.
- **Segmentation**: Filter flags by prefix (e.g., `?prefix=payment`) to reduce payload size.

## Prerequisites
- **Node.js** (v18+)
- **MongoDB** (running on localhost:27017)
- **Redis** (running on localhost:6379)

## Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
   # Install client dependencies
   cd feature-flag-client && npm install && cd ..
   # Install demo dependencies
   cd demo-app && npm install && cd ..
   ```

2. **Start Infrastructure** (if not already running)
   ```bash
   docker run -d -p 27017:27017 mongo
   docker run -d -p 6379:6379 redis
   ```

3. **Start the Service**
   ```bash
   npm run start:dev
   ```
   The service will run on `http://localhost:3000`.

## Running the Demo
The demo application launches 3 simulated clients to showcase different access patterns:
1. **Polling Client**: Demonstrates ETag usage (logs show status).
2. **Real-time Client**: Listen for SSE updates instantly.
3. **Filtered Client**: Fetches only flags starting with `beta`.

To run the demo:
```bash
cd demo-app
npm start
```

## How to Verify
1.  **Start the Demo app** (`npm start` inside `demo-app`).
2.  **Create/Update a Flag** using the API or a tool like Postman:
    ```bash
    curl -X POST http://localhost:3000/feature-flags \
      -H "Content-Type: application/json" \
      -d '{"key": "new-feature", "isEnabled": true, "description": "Test flag"}'
    ```
3.  **Observers**:
    - **SSE Client** should show the update *immediately*.
    - **Polling Client** will update on the next interval (5s).
    - **Filtered Client** will ignore it unless it starts with `beta`.
