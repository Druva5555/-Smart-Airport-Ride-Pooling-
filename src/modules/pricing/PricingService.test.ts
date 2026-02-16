
import { PricingService } from './PricingService';

async function runTests() {
  console.log('Running Pricing Engine Tests...\n');

  const pricing = new PricingService({
    baseFare: 50,
    perKmRate: 10,
    perMinuteRate: 1,
    minFare: 50,
    sharedDiscountFactor: 0.8,
  });

  // Test 1: Solo Ride
  console.log('Test 1: Solo Ride Calculation');
  const soloFare = pricing.calculateFare({
    distanceKm: 10,
    durationMins: 20,
    isShared: false,
  });
  // Expected: 50 + (10*10) + (20*1) = 50 + 100 + 20 = 170
  if (soloFare === 170) {
    console.log(`PASSED: Solo fare is ${soloFare}`);
  } else {
    console.error(`FAILED: Expected 170, got ${soloFare}`);
  }

  // Test 2: Shared Ride Discount
  console.log('\nTest 2: Shared Ride Discount');
  const sharedFare = pricing.calculateFare({
    distanceKm: 10,
    durationMins: 20,
    isShared: true,
  });
  // Expected: 170 * 0.8 = 136
  if (sharedFare === 136) {
    console.log(`PASSED: Shared fare is ${sharedFare}`);
  } else {
    console.error(`FAILED: Expected 136, got ${sharedFare}`);
  }

  // Test 3: Surge Pricing
  console.log('\nTest 3: Surge Pricing');
  pricing.setSurgeMultiplier(1.5);
  const surgeFare = pricing.calculateFare({
    distanceKm: 10,
    durationMins: 20,
    isShared: false,
  });
  // Expected: 170 * 1.5 = 255
  if (surgeFare === 255) {
    console.log(`PASSED: Surge fare is ${surgeFare}`);
  } else {
    console.error(`FAILED: Expected 255, got ${surgeFare}`);
  }
}

runTests().catch(console.error);
