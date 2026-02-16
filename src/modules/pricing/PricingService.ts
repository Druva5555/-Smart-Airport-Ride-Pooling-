
import { PricingConfig, RideDetails } from './types';

export class PricingService {
  private config: PricingConfig;

  constructor(config?: Partial<PricingConfig>) {
    this.config = {
      baseFare: 50,
      perKmRate: 12,
      perMinuteRate: 2,
      minFare: 80,
      surgeMultiplier: 1.0,
      sharedDiscountFactor: 0.8, // 20% discount for shared rides
      ...config,
    };
  }

  calculateFare(details: RideDetails): number {
    const { distanceKm, durationMins, isShared } = details;

    let fare = this.config.baseFare;
    fare += distanceKm * this.config.perKmRate;
    fare += durationMins * this.config.perMinuteRate;

    // Apply Surge Pricing
    fare *= this.config.surgeMultiplier;

    // Apply Shared Discount
    if (isShared) {
      fare *= this.config.sharedDiscountFactor;
    }

    // Ensure Minimum Fare
    return Math.max(fare, this.config.minFare);
  }

  setSurgeMultiplier(multiplier: number) {
    this.config.surgeMultiplier = multiplier;
  }
}
