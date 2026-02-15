import { RideGroup } from './types';

/**
 * Spatial Grid System for O(1) geospatial lookups.
 * Divide the world into fixed-size buckets (grids).
 *
 * Complexity Analysis:
 * - Insert: O(1) - Constant time hash calculation and map set.
 * - Query (getNearbyRides): O(1) - Checking constant number of neighbor grids (9).
 * - Space: O(N) - Storing N ride groups (distributed across buckets).
 */
export class SpatialGrid {
  private grid: Map<string, RideGroup[]> = new Map();
  private readonly cellSize: number; // Degrees (~0.01 deg is approx 1.1km)

  constructor(cellSize: number = 0.01) {
    this.cellSize = cellSize;
  }

  private getGridKey(lat: number, lng: number): string {
    const latIdx = Math.floor(lat / this.cellSize);
    const lngIdx = Math.floor(lng / this.cellSize);
    return `${latIdx}:${lngIdx}`;
  }

  addRide(ride: RideGroup): void {
    const key = this.getGridKey(ride.currentLocation.lat, ride.currentLocation.lng);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(ride);
  }

  removeRide(ride: RideGroup): void {
    const key = this.getGridKey(ride.currentLocation.lat, ride.currentLocation.lng);
    const cell = this.grid.get(key);
    if (cell) {
      const idx = cell.findIndex((r) => r.id === ride.id);
      if (idx !== -1) {
        cell.splice(idx, 1);
      }
      if (cell.length === 0) {
        this.grid.delete(key);
      }
    }
  }

  getNearbyRides(lat: number, lng: number): RideGroup[] {
    const centerLatIdx = Math.floor(lat / this.cellSize);
    const centerLngIdx = Math.floor(lng / this.cellSize);
    const rides: RideGroup[] = [];

    // Check 3x3 grid neighborhood
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${centerLatIdx + dx}:${centerLngIdx + dy}`;
        if (this.grid.has(key)) {
          rides.push(...this.grid.get(key)!);
        }
      }
    }
    return rides;
  }
}
