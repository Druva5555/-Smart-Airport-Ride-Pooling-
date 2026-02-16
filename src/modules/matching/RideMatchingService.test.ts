
import { RideMatchingService } from './RideMatchingService';
import { RideGroup, RideRequest, Point } from './types';

// Mock Data Helpers
const createRideGroup = (
  id: string,
  lat: number,
  lng: number,
  passengers: number = 1,
): RideGroup => ({
  id,
  cabId: `cab-${id}`,
  currentLocation: { lat, lng },
  capacity: 4,
  totalPassengers: passengers,
  totalLuggage: 0,
  route: [{ lat, lng }],
  status: 'ON_WAY',
});

const createRequest = (
  id: string,
  pickupLat: number,
  pickupLng: number,
): RideRequest => ({
  id,
  pickup: { lat: pickupLat, lng: pickupLng },
  dropoff: { lat: pickupLat + 0.05, lng: pickupLng + 0.05 },
  passengers: 1,
  luggageCount: 1,
  requestTime: new Date(),
});

describe('RideMatchingService', () => {
  let service: RideMatchingService;

  beforeEach(() => {
    // PricingService and LockService are now required or we need to mock internal methods if they are used.
    // However, findMatch relies mainly on SpatialGrid and PriorityQueue which are internal.
    // Let's ensure the service is initialized correctly.
    service = new RideMatchingService();
  });

  it('should find a nearby ride match', () => {
    const ride1 = createRideGroup('ride1', 12.9716, 77.5946);
    service.trackRideGroup(ride1);

    const req1 = createRequest('req1', 12.972, 77.595); // Very close
    const match = service.findMatch(req1);

    expect(match).toBeDefined();
    expect(match?.id).toBe('ride1');
  });

  it('should respect capacity constraints', () => {
    const rideFull = createRideGroup('rideFull', 12.9716, 77.5946, 4); // Full
    service.trackRideGroup(rideFull);

    const req2 = createRequest('req2', 12.972, 77.595);
    const match = service.findMatch(req2);

    expect(match).toBeNull();
  });

  it('should ignore rides that are too far away (Spatial Filtering)', () => {
     // Create a ride far away (e.g., different lat/lng grid cell)
     // Grid cell size is 0.01 deg.
     const rideFar = createRideGroup('rideFar', 13.0, 78.0);
     service.trackRideGroup(rideFar);
 
     const req3 = createRequest('req3', 12.9716, 77.5946);
     const match = service.findMatch(req3);
 
     expect(match).toBeNull();
  });
});
