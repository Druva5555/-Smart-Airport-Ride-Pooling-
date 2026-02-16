import { Router } from 'express';
import { RideController } from './RideController';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();
const rideController = new RideController();

const rideRequestSchema = z.object({
  body: z.object({
    pickup: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    dropoff: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    passengers: z.number().int().min(1).max(4),
    luggageCount: z.number().int().min(0).max(4),
  }),
});

const rideCancelSchema = z.object({
  body: z.object({
    id: z.string().uuid(),
  }),
});

router.post(
  '/request',
  validate(rideRequestSchema),
  rideController.requestRide
);

router.post(
  '/cancel',
  validate(rideCancelSchema),
  rideController.cancelRide
);

router.get('/status/:id', rideController.getRideStatus);

export default router;
