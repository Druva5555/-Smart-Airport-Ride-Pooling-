import dotenv from 'dotenv';
import { setupWorkers } from './modules/ride/ride.worker';

dotenv.config();

console.log('Starting Worker Process...');

setupWorkers();

// Keep process alive
process.on('SIGTERM', () => {
    console.log('Worker shutting down...');
    process.exit(0);
});
