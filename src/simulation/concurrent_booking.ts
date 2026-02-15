
import { RideMatchingService } from '../modules/matching/RideMatchingService';
import { RideGroup, RideRequest } from '../modules/matching/types';
import { LockService } from '../common/LockService';

// Mock Data Helpers
const createRideGroup = (id: string, capacity: number = 4, filled: number = 0): RideGroup => ({
  id,
  cabId: `cab-${id}`,
  currentLocation: { lat: 12.9716, lng: 77.5946 },
  capacity,
  totalPassengers: filled,
  totalLuggage: 0,
  route: [],
  status: 'ON_WAY',
});

const createRequest = (id: string): RideRequest => ({
  id,
  pickup: { lat: 12.972, lng: 77.595 },
  dropoff: { lat: 12.98, lng: 77.60 },
  passengers: 1,
  luggageCount: 0,
  requestTime: new Date(),
});

async function runSimulation() {
  console.log('Starting Concurrency Simulation...\n');
  const service = new RideMatchingService();
  
  // Scenario: 1 Seat left, 5 concurrent requests
  const ride = createRideGroup('ride-concurrent', 4, 3); // 3/4 filled
  service.trackRideGroup(ride);

  console.log(`Initial Ride State: Passengers ${ride.totalPassengers}/${ride.capacity}`);

  const requests = Array.from({ length: 5 }, (_, i) => createRequest(`req-${i + 1}`));

  console.log('Launching 5 concurrent booking attempts...');

  const results = await Promise.all(
    requests.map(async (req) => {
      // Small random delay to simulate network jitter
      await new Promise(res => setTimeout(res, Math.random() * 50));
      
      const success = await service.attemptRideAllocation(ride, req);
      return { reqId: req.id, success };
    })
  );

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\nResults:');
  console.log(`Successful Bookings: ${successful.length} (${successful.map(r => r.reqId).join(', ')})`);
  console.log(`Failed Bookings: ${failed.length}`);
  console.log(`Final Ride State: Passengers ${ride.totalPassengers}/${ride.capacity}`);

  if (successful.length === 1 && ride.totalPassengers === 4) {
    console.log('\nSUCCESS: Race condition handled correctly. Only 1 request succeeded.');
  } else if (successful.length > 1) {
    console.error('\nFAILURE: Overbooking occurred! Multiple requests succeeded.');
  } else {
    console.error('\nFAILURE: Unexpected outcome.');
  }

  // Cleanup
  process.exit(0);
}

runSimulation().catch(console.error);
