import { PriorityQueue } from '../../common/PriorityQueue';
import { SpatialGrid } from './SpatialGrid';
import {
  RideRequest,
  RideGroup,
  MatchCandidate,
  MatchingConstraints,
  Point,
} from './types';

/**
 * RideMatchingService
 * Implements the core ride-pooling algorithm using Spatial Hashing and Priority Queues.
 */
export class RideMatchingService {
  private spatialGrid: SpatialGrid;
  private readonly constraints: MatchingConstraints;

  constructor(constraints: MatchingConstraints = { maxDetourKm: 5, maxWaitTimeMins: 15 }) {
    this.spatialGrid = new SpatialGrid();
    this.constraints = constraints;
  }

  /**
   * Adds an active ride group to the tracking system.
   */
  trackRideGroup(group: RideGroup) {
    this.spatialGrid.addRide(group);
  }

  /**
   * Finds the best match for a ride request.
   *
   * Algorithm:
   * 1. Spatial Filter: Get nearby rides from Grid (O(1)).
   * 2. Feasibility Check: Filter by capacity (Seats, Luggage) (O(K)).
   * 3. Cost Calculation: Calculate detour and delay for eligible rides (O(K)).
   * 4. Optimization: Use PriorityQueue to find min-cost match (O(K log K)).
   *
   * @param request New ride request
   * @returns Best matching RideGroup or null if no match found
   */
  findMatch(request: RideRequest): RideGroup | null {
    const nearbyRides = this.spatialGrid.getNearbyRides(
      request.pickup.lat,
      request.pickup.lng,
    );

    // Min-Heap ordered by cost (lowest cost first)
    const pq = new PriorityQueue<MatchCandidate>((a, b) => a.cost - b.cost);

    for (const group of nearbyRides) {
      if (!this.checkConstraints(group, request)) {
        continue;
      }

      const detourKm = this.calculateDetour(group, request);
      if (detourKm > this.constraints.maxDetourKm) {
        continue;
      }

      const cost = this.calculateMatchCost(detourKm, group);
      pq.push({ rideGroup: group, cost, detourKm });
    }

    const bestMatch = pq.pop();
    return bestMatch ? bestMatch.rideGroup : null;
  }

  /**
   * Checks hard constraints: Seat capacity and Luggage capacity.
   * Complexity: O(1)
   */
  private checkConstraints(group: RideGroup, request: RideRequest): boolean {
    if (group.status === 'FULL') return false;
    if (group.totalPassengers + request.passengers > group.capacity) return false;
    // Assuming 1 passenger = ~1-2 luggage units capacity, simplified here:
    // This could be dynamic based on car type (Sedan vs SUV)
    const MAX_LUGGAGE_PER_CAB = 4;
    if (group.totalLuggage + request.luggageCount > MAX_LUGGAGE_PER_CAB) return false;

    return true;
  }

  /**
   * Calculates implicit cost of a match.
   * Cost function = Detour Distance + (Weight * Existing Passengers)
   * This penalizes detours more if there are already many people in the cab.
   */
  private calculateMatchCost(detourKm: number, group: RideGroup): number {
    const PASSENGER_DELAY_PENALTY_WEIGHT = 0.5;
    return detourKm + (group.totalPassengers * PASSENGER_DELAY_PENALTY_WEIGHT);
  }

  /**
   * Calculates the additional distance required to pick up and drop off the new passenger.
   * Uses Haversine formula approximation.
   * Complexity: O(1) (assuming fixed number of waypoints or simple insertion)
   */
  private calculateDetour(group: RideGroup, request: RideRequest): number {
    // Simplified: Distance from current loc -> pickup -> dropoff -> existing destination
    // vs Distance from current loc -> existing destination
    // In a real system, we would iterate existing stops to find optimal insertion index.
    // Here we assume creating a new stop at end or efficient insertion.

    const origin = group.currentLocation;
    // For MVP, simplistic calculation: Distance(Cab, Pickup)
    return this.getDistance(origin, request.pickup);
  }

  /**
   * Haversine formula for distance in km.
   */
  private getDistance(p1: Point, p2: Point): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(p2.lat - p1.lat);
    const dLng = this.deg2rad(p2.lng - p1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(p1.lat)) *
        Math.cos(this.deg2rad(p2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
