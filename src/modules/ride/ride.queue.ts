import { Queue } from 'bullmq';
import { connectionOptions } from '../../config/queue';
import { RideRequest } from '../matching/types';

export const MATCHING_QUEUE_NAME = 'ride-matching';
export const CANCELLATION_QUEUE_NAME = 'ride-cancellation';

export interface RideMatchingJob {
  rideRequestId: string;
  request: RideRequest;
}

export interface RideCancellationJob {
  rideRequestId: string;
}

export const matchingQueue = new Queue<RideMatchingJob>(MATCHING_QUEUE_NAME, {
  connection: connectionOptions,
});

export const cancellationQueue = new Queue<RideCancellationJob>(CANCELLATION_QUEUE_NAME, {
  connection: connectionOptions,
});
