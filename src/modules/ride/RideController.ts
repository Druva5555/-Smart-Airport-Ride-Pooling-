import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RideMatchingService } from '../matching/RideMatchingService';
import { PricingService } from '../pricing/PricingService';
import { RideRequest, RideGroup } from '../matching/types';
import { v4 as uuidv4 } from 'uuid';

export class RideController {
  private matchingService: RideMatchingService;
  private pricingService: PricingService;
  // In-memory store for demo purposes. In real app, this would be DB.
  private ridesMockDB: Map<string, any> = new Map();

  constructor() {
    this.matchingService = new RideMatchingService();
    this.pricingService = new PricingService();
  }

  requestRide = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pickup, dropoff, passengers, luggageCount } = req.body;

      const rideRequestId = uuidv4();
      const newRequest: RideRequest = {
        id: rideRequestId,
        pickup,
        dropoff,
        passengers,
        luggageCount,
        requestTime: new Date(),
      };

      // 1. Find Best Match
      const bestMatchGroup = this.matchingService.findMatch(newRequest);
      let assignedGroup: RideGroup;
      let isShared = false;

      if (bestMatchGroup) {
        // 2. Try to join existing group (Concurrency Safe)
        const success = await this.matchingService.attemptRideAllocation(
          bestMatchGroup,
          newRequest,
        );

        if (success) {
          assignedGroup = bestMatchGroup;
          isShared = true;
        } else {
          // Fallback: Failed to join (race condition), create new group
          assignedGroup = this.createNewRideGroup(newRequest);
        }
      } else {
        // 3. No match found, create new group
        assignedGroup = this.createNewRideGroup(newRequest);
      }

      // 4. Calculate Fare
      // Estimated distance/duration (Mocked for MVP)
      const distanceKm = this.getMockDistance(pickup, dropoff);
      const durationMins = distanceKm * 2; // Approx 30km/h

      const fare = this.pricingService.calculateFare({
        distanceKm,
        durationMins,
        isShared,
      });

      // 5. Response
      const response = {
        rideRequestId,
        groupId: assignedGroup.id,
        status: 'CONFIRMED',
        fare,
        isShared,
        etaMins: 5, // Mock ETA
      };

      this.ridesMockDB.set(rideRequestId, response);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getRideStatus = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const ride = this.ridesMockDB.get(id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json(ride);
  };

  cancelRide = (req: Request, res: Response, next: NextFunction) => {
    // In a real app, this would involve notifying driver, updating group, issuing refund
    const { id } = req.body;
      const ride = this.ridesMockDB.get(id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Mock cancellation
    ride.status = 'CANCELLED';
    this.ridesMockDB.set(id, ride);

    res.json({ message: 'Ride cancelled successfully', rideId: id });
  };

  private createNewRideGroup(req: RideRequest): RideGroup {
    const groupId = uuidv4();
    const newGroup: RideGroup = {
      id: groupId,
      cabId: `cab-${uuidv4().substring(0, 8)}`,
      currentLocation: req.pickup,
      capacity: 4,
      totalPassengers: req.passengers,
      totalLuggage: req.luggageCount,
      route: [req.pickup, req.dropoff],
      status: 'ON_WAY',
    };
    
    // Register new group in matching system
    this.matchingService.trackRideGroup(newGroup);
    
    return newGroup;
  }

  private getMockDistance(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }): number {
    // Haversine approximation or just simple Euclidean for mock
    return Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2)) * 111;
  }
}
