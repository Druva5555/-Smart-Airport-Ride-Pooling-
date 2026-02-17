# Smart Airport Ride Pooling System

## Overview
This project implements a high-performance backend system for pooling airport passengers into shared cabs. It optimizes for minimal detours, efficient pricing, and high concurrency management using a microservices-ready architecture.

## Key Features
- **Efficient Matching**: Uses **Spatial Hashing (Grid)** for O(1) proximity lookups, ensuring fast matching even with 10,000+ users.
- **Dynamic Pricing**: Calculates fares based on distance, duration, surge pricing, and sharing discounts.
- **Concurrency Safety**: Implements **Distributed Locking (Redis)** to prevent race conditions (e.g., two users booking the last seat simultaneously).
- **Asynchronous Processing**: Offloads heavy matching logic to a background **Worker Process** using **BullMQ**, ensuring the API remains responsive (<300ms latency).
- **Robust API**: Fully documented REST API with Input Validation (Zod) and Rate Limiting.

## Technology Stack
- **Language**: TypeScript (Node.js)
- **Framework**: Express.js
- **Database**: PostgreSQL (with PostGIS extensions for geospatial data)
- **Caching & Queues**: Redis (features: Locking, BullMQ)
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest (Unit), Supertest (Integration), Custom Load Scripts

## Prerequisites
- Node.js
- Docker & Docker Compose

## Setup & Installation

1.  **Clone the Repository**
    ```bash
    git clone <repo-url>
    cd <repo-folder>
    ```

2.  **Start Infrastructure**
    Start PostgreSQL and Redis containers:
    ```bash
    docker-compose up -d
    ```

3.  **Install Dependencies**
    ```bash
    npm install
    ```

4.  **Database Migration**
    Initialize the database schema:
    ```bash
    npx prisma migrate dev --name init
    ```

## Running the Application

To handle high concurrency, the system is split into two processes:

1.  **Start the API Server** (Terminal 1)
    ```bash
    npm run dev
    ```
    *Server runs on http://localhost:3000*

2.  **Start the Worker Process** (Terminal 2)
    ```bash
    npm run worker
    ```
    *Processes background matching jobs from the queue*

## API Documentation
The API is fully documented using OpenAPI (Swagger).
- **Access the UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Key Endpoints
- `POST /ride/request`: Request a ride (supports async processing).
- `POST /ride/cancel`: Cancel a ride request.
- `GET /ride/status/:id`: Check the status of a request.

## Testing & Simulation

### Unit Tests
Run the Jest test suite to verify core logic (Matching, Pricing, Validation).
```bash
npm test
```

### Load Simulation
To convince yourself of the system's stability, run the concurrent load script. This simulates 50+ concurrent requests hitting the API.
```bash
npx ts-node src/simulation/load_test.ts
```

## System Architecture
See [docs/architecture.md](docs/architecture.md) for High-Level (HLD) and Low-Level (LLD) diagrams.

## Algorithmic Complexity
See [docs/complexity.md](docs/complexity.md) for detailed Big-O analysis of the matching engine.
