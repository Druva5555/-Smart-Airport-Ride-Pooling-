import { Router } from 'express';
import { RideController } from './RideController';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();
const rideController = new RideController();

/**
 * @openapi
 * /ride/request:
 *   post:
 *     summary: Request a new ride
 *     tags: [Rides]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RideRequest'
 *     responses:
 *       201:
 *         description: Ride confirmed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RideResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /ride/cancel:
 *   post:
 *     summary: Cancel a ride
 *     tags: [Rides]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Ride cancelled successfully
 *       404:
 *         description: Ride not found
 */
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

/**
 * @openapi
 * /ride/status/{id}:
 *   get:
 *     summary: Get ride status
 *     tags: [Rides]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Ride Request ID
 *     responses:
 *       200:
 *         description: Ride details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RideResponse'
 *       404:
 *         description: Ride not found
 */
router.get('/status/:id', rideController.getRideStatus);

export default router;
