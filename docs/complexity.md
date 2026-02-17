# Algorithmic Complexity Analysis

## Problem Statement
The core challenge is finding the "best" existing ride for a new passenger from potentially thousands of active rides. A brute-force O(N) scan is too slow for 10,000 concurrent users.

## Approach: Spatial Hashing + Min-Heap

We use a combination of **Spatial Partitioning** (Grid) to reduce the search space and a **Priority Queue** (Min-Heap) to select the optimal match.

### 1. Spatial Lookups (SpatialGrid)
Use a Grid system where the world is divided into fixed-size cells (e.g., 0.01 degrees ~1.1km).
-   **Insertion**: Calculate cell ID `(floor(lat/size), floor(lng/size))`. Store in Map.
    -   **Time Complexity**: **O(1)**
-   **Lookup**: Calculate cell ID of user. Check that cell + 8 neighbors.
    -   **Time Complexity**: **O(1)** (Constant number of buckets to check, independent of total rides N).
-   **Space Complexity**: **O(N)** to store N rides.

### 2. Matching Logic (RideMatchingService)
For a incoming request:
1.  **Filter**: Retrieve candidates from Spatial Grid. Let $k$ be average rides per cell.
    -   Complexity: **O(k)**
2.  **Constraint Check**: Iterate through candidates to check Capacity & Detour limits.
    -   Complexity: **O(k)**
3.  **Optimization**: Insert valid candidates into a Min-Heap (ordered by cost increase).
    -   Complexity: **O(k log k)**
4.  **Selection**: Extract min.
    -   Complexity: **O(1)**

**Total Time Complexity per Request**: **O(k log k)**, where $k << N$.
Since $k$ (rides in nearby cells) is small and bounded by physical density constraints, this is effectively **O(1)** relative to the total system size N.

## Concurrency Handling (Redis Locks)
To prevent Race Conditions (Double Booking):
-   **Operation**: `SET resource_key token NX PX 5000`
-   **Time Complexity**: **O(1)** (Redis atomic operation).

## Database Indexing Strategy
To support the O(1) logic at the persistence layer (PostgreSQL):
-   **Geospatial Index**: `CREATE INDEX ON "cabs" USING GIST (location)`
    -   Allows R-Tree based queries for fallback/initialization.
    -   Complexity: **O(log N)**
-   **Status Index**: `CREATE INDEX ON "rides" (status)`
    -   Fast filtering of 'ACTIVE' vs 'COMPLETED' rides.
