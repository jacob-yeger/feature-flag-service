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
- **Docker** (Recommended)

## Quick Start (Docker)
The easiest way to run the entire system (Mongo, Redis, API, Demo Service, UI).

```bash
docker-compose up --build
```
Access the dashboard at `http://localhost:5173`.

## Quick Start (Manual)
If you prefer running locally without containers for development:

```bash
./start-demo.sh
# Use --install flag on first run:
# ./start-demo.sh --install
```

## Running the Demo
The demo application launches 3 simulated clients to showcase different access patterns:
1. **Polling Client**: Demonstrates ETag usage (logs show status).
2. **Real-time Client**: Listen for SSE updates instantly.
3. **Filtered Client**: Fetches only flags starting with `beta`.

## How to Verify
1.  **Open Dashboard**: `http://localhost:5173`
2.  **Toggle Flags**: Use the inputs to toggle/create flags.
3.  **Observe**: Watch the real-time logs in the client cards.

## Architecture
- `feature-flag-service`: Core API (Port 3000)
- `demo-service`: Backend-for-Frontend simulating microservices (Port 3001)
- `demo-ui`: React Dashboard (Port 5173)
- `feature-flag-client`: Isomorphic TypeScript client library.
