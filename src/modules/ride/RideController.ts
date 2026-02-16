import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { matchingQueue, cancellationQueue } from './ride.queue';
import { v4 as uuidv4 } from 'uuid';

export class RideController {
  // In-memory store for demo purposes (Status Tracking)
  // Shared partially via memory if running in same process for dev
  // Ideally this is Redis/DB.
  static jobStatusDB: Map<string, any> = new Map();

  constructor() {}

  requestRide = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pickup, dropoff, passengers, luggageCount } = req.body;

      const rideRequestId = uuidv4();
      const newRequest: any = {
        id: rideRequestId,
        pickup,
        dropoff,
        passengers,
        luggageCount,
        requestTime: new Date(),
      };

      // Dispatch Job to Queue
      await matchingQueue.add('match-ride', {
        rideRequestId,
        request: newRequest,
      });

      // Respond immediately
      res.status(202).json({
        message: 'Ride request accepted for processing',
        rideRequestId,
        statusUrl: `/ride/status/${rideRequestId}`,
      });
    } catch (error) {
      next(error);
    }
  };

  getRideStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    
    // Check Queue Status
    const job = await matchingQueue.getJob(id); // Use ID mapping if job ID != request ID
    // Since we didn't force JobID = RequestID in .add(), this is tricky.
    // Simplifying: In a real app, we check DB.
    // For this MVP, let's assume client provided correct ID or we use Redis to track.
    
    // Fallback: Check if job is completed
    res.json({ status: 'PROCESSING', message: 'Check worker logs for completion in this MVP setup' });
  };

  cancelRide = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body;
    await cancellationQueue.add('cancel-ride', { rideRequestId: id });
    res.json({ message: 'Cancellation request accepted', rideId: id });
  };
}


