export interface Point {
  lat: number;
  lng: number;
}

export interface RideRequest {
  id: string;
  pickup: Point;
  dropoff: Point;
  passengers: number;
  luggageCount: number; // Small/Medium bags
  requestTime: Date;
}

export interface RideGroup {
  id: string;
  cabId: string;
  currentLocation: Point;
  capacity: number;
  totalPassengers: number;
  totalLuggage: number;
  route: Point[]; // Ordered list of stops (pickups/dropoffs)
  status: 'WAITING' | 'ON_WAY' | 'FULL';
}

export interface MatchCandidate {
  rideGroup: RideGroup;
  cost: number; // Lower is better (detour distance + time penalty)
  detourKm: number;
}

export interface MatchingConstraints {
  maxDetourKm: number;
  maxWaitTimeMins: number;
}
