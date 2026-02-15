import { redis } from '../config/redis';

export class LockService {
  private static instance: LockService;

  private constructor() {}

  static getInstance(): LockService {
    if (!LockService.instance) {
      LockService.instance = new LockService();
    }
    return LockService.instance;
  }

  /**
   * Acquires a distributed lock.
   * @param key Unique lock key (e.g., "lock:ride:123")
   * @param ttl Time to live in milliseconds
   * @returns true if lock acquired, false otherwise
   */
  async acquireLock(key: string, ttl: number = 5000): Promise<boolean> {
    const result = await redis.set(key, 'locked', 'PX', ttl, 'NX');
    return result === 'OK';
  }

  /**
   * Releases a distributed lock.
   * @param key Unique lock key
   */
  async releaseLock(key: string): Promise<void> {
    await redis.del(key);
  }
}
  

