
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://localhost:3000/ride/request';
const CONCURRENT_REQUESTS = 50;

async function sendRequest(idx: number) {
  const payload = {
    pickup: { lat: 12.9716, lng: 77.5946 },
    dropoff: { lat: 12.98, lng: 77.60 },
    passengers: 1,
    luggageCount: 0,
  };

  try {
    const start = Date.now();
    const res = await axios.post(API_URL, payload);
    const duration = Date.now() - start;
    
    // Check if 202 Accepted
    if (res.status === 202) {
        return { success: true, duration, id: res.data.rideRequestId };
    }
    return { success: false, duration, error: `Status ${res.status}` };
  } catch (error: any) {
    return { success: false, duration: 0, error: error.message };
  }
}

async function runLoadTest() {
  console.log(`Starting Load Test with ${CONCURRENT_REQUESTS} concurrent requests...`);
  
  const promises = [];
  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    promises.push(sendRequest(i));
  }

  const results = await Promise.all(promises);

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalDuration = results.reduce((acc, r) => acc + r.duration, 0);
  const avgDuration = successful.length > 0 ? totalDuration / successful.length : 0;

  console.log('\nLoad Test Results:');
  console.log(`Total Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Avg Response Time: ${avgDuration.toFixed(2)}ms`);

  if (failed.length > 0) {
      console.log('Sample Errors:', failed.slice(0, 3).map(f => f.error));
  }
}

// Ensure axois is installed or use fetch
// To run this standalone, might need to install axios
// npm install axios

runLoadTest().catch(console.error);
