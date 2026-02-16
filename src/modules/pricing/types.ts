
export interface PricingConfig {
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minFare: number;
  surgeMultiplier: number;
  sharedDiscountFactor: number; // e.g., 0.8 for 20% discount
}

export interface RideDetails {
  distanceKm: number;
  durationMins: number;
  isShared: boolean;
}
