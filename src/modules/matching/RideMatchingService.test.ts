
import { RideMatchingService } from './RideMatchingService';
import { RideGroup, RideRequest } from './types';

// Mock Data Helpers
const createPoint = (lat: number, lng: number) => ({ lat, lng });

const createRideGroup = (
  id: string,
  lat: number,
  lng: number,
  passengers: number = 1,
  luggage: number = 0,
): RideGroup => ({
  id,
  cabId: `cab-${id}`,
  currentLocation: { lat, lng },
  capacity: 4,
  totalPassengers: passengers,
  totalLuggage: luggage,
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

// Test Suite
async function runTests() {
  console.log('Running Ride Matching Tests...\n');

  const service = new RideMatchingService({
    maxDetourKm: 10,
    maxWaitTimeMins: 20,
  });

  // Scenario 1: Simple Match
  console.log('Test 1: Simple Match (Ride nearby)');
  const ride1 = createRideGroup('ride1', 12.9716, 77.5946); // Bangalore Center
  service.trackRideGroup(ride1);

  const req1 = createRequest('req1', 12.972, 77.595); // Very close
  const match1 = service.findMatch(req1);

  if (match1 && match1.id === 'ride1') {
    console.log('PASSED: Found nearby ride.');
  } else {
    console.error('FAILED: Did not find nearby ride.');
  }

  // Scenario 2: Capacity Constraint
  console.log('\nTest 2: Constraint Check (Full Ride)');
  const rideFull = createRideGroup('rideFull', 12.9716, 77.5946, 4, 0); // Full capacity
  service.trackRideGroup(rideFull);
  
  const req2 = createRequest('req2', 12.972, 77.595);
  const match2 = service.findMatch(req2);
  
  // Should ideally match ride1 (if still tracked/valid) or null if specific Logic
  // But since we just added rideFull to the same grid, and ride1 is also there.
  // rideFull should be rejected. ride1 should be accepted.
  // To test effectively, let's clear or assume logic picks best valid.
  
  if (match2 && match2.id !== 'rideFull') {
    console.log('PASSED: Skipped full ride.');
  } else {
    console.error(`FAILED: Selected full ride: ${match2?.id}`);
  }

  // Scenario 3: Spatial Filtering (Far away)
  console.log('\nTest 3: Spatial Filtering (Far away ride)');
  const rideFar = createRideGroup('rideFar', 13.0, 78.0); // Far away
  service.trackRideGroup(rideFar);

  const req3 = createRequest('req3', 12.9716, 77.5946);
  // Only ride1 and rideFull are nearby. rideFull is full. ride1 is valid.
  // rideFar is too far (different grid).

  // Let's create a fresh service for clean slate testing
  const service2 = new RideMatchingService();
  service2.trackRideGroup(rideFar);
  const match3 = service2.findMatch(req3);

  if (match3 === null) {
    console.log('PASSED: Ignored far away ride.');
  } else {
    console.error('FAILED: Matched far away ride.');
  }
}

runTests().catch(console.error);
