import { ConnectionOptions } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
// Parse standard redis:// url if needed, or just specific host/port
// BullMQ ConnectionOptions is slightly specific.
// Simple setup for now assuming standard redis
const url = new URL(redisUrl);

export const connectionOptions: ConnectionOptions = {
  host: url.hostname,
  port: parseInt(url.port || '6379'),
  // password: url.password, // if needed
};
