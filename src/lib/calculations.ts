/**
 * Pure business-logic functions for FleetLog's fuel efficiency engine.
 *
 * Kept free of Mongoose/Next.js imports on purpose: this is the module the
 * unit-testing story (SRS FR-08, exam Part A §8) exercises directly,
 * without a database or HTTP layer in the loop.
 */

export class CalculationError extends Error {}

/**
 * Distance covered between two odometer readings.
 * Throws if the reading did not increase, since a fleet vehicle's
 * odometer is monotonically non-decreasing (NFR-05 data integrity rule).
 */
export function computeDistance(previousOdometer: number, currentOdometer: number): number {
  if (currentOdometer <= previousOdometer) {
    throw new CalculationError(
      `Current odometer (${currentOdometer} km) must be greater than the previous reading (${previousOdometer} km).`
    );
  }
  return round2(currentOdometer - previousOdometer);
}

/** Fuel efficiency in km per litre. */
export function computeEfficiencyKmL(distanceKm: number, litersPurchased: number): number {
  if (litersPurchased <= 0) {
    throw new CalculationError("Liters purchased must be greater than zero.");
  }
  if (distanceKm <= 0) {
    throw new CalculationError("Distance travelled must be greater than zero.");
  }
  return round2(distanceKm / litersPurchased);
}

/** Cost per kilometre in GHS. */
export function computeCostPerKm(totalCostGHS: number, distanceKm: number): number {
  if (distanceKm <= 0) {
    throw new CalculationError("Distance travelled must be greater than zero.");
  }
  if (totalCostGHS < 0) {
    throw new CalculationError("Total cost cannot be negative.");
  }
  return round2(totalCostGHS / distanceKm);
}

export interface OdometerValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validates a new odometer reading against a vehicle's last known reading.
 * Mirrors FR-05/FR-07 (Odometer Validation) without throwing, so callers in
 * a form/UI context can surface the message inline.
 */
export function validateOdometerReading(
  previousOdometer: number,
  currentOdometer: number
): OdometerValidationResult {
  if (!Number.isFinite(currentOdometer) || currentOdometer <= 0) {
    return { valid: false, message: "Enter a valid odometer reading." };
  }
  if (currentOdometer <= previousOdometer) {
    return {
      valid: false,
      message: `Reading must be greater than the vehicle's last recorded reading (${previousOdometer} km).`,
    };
  }
  // Guard against obvious fat-finger entries (e.g. an extra digit).
  const MAX_PLAUSIBLE_TRIP_KM = 5000;
  if (currentOdometer - previousOdometer > MAX_PLAUSIBLE_TRIP_KM) {
    return {
      valid: false,
      message: `That's a jump of over ${MAX_PLAUSIBLE_TRIP_KM.toLocaleString()} km since the last log — please double-check the reading.`,
    };
  }
  return { valid: true };
}

export interface FuelLogComputation {
  distanceTraveled: number;
  fuelEfficiencyKmL: number;
  costPerKmGHS: number;
}

/**
 * Runs the full efficiency-engine pipeline for a fuel log submission
 * (FR-06/FR-08): distance -> km/L -> GHS/km, in one validated step.
 */
export function computeFuelLog(params: {
  previousOdometer: number;
  currentOdometer: number;
  litersPurchased: number;
  totalCostGHS: number;
}): FuelLogComputation {
  const { previousOdometer, currentOdometer, litersPurchased, totalCostGHS } = params;
  const distanceTraveled = computeDistance(previousOdometer, currentOdometer);
  const fuelEfficiencyKmL = computeEfficiencyKmL(distanceTraveled, litersPurchased);
  const costPerKmGHS = computeCostPerKm(totalCostGHS, distanceTraveled);
  return { distanceTraveled, fuelEfficiencyKmL, costPerKmGHS };
}

/** Rounds to 2 decimal places without floating point artifacts like 10.769999. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Fleet-wide efficiency rating bucket, used to color the dashboard gauge.
 * Thresholds are intentionally generous for mixed diesel/petrol pickup
 * and sedan fleets typical of Ghanaian transport operators.
 */
export type EfficiencyRating = "poor" | "fair" | "good";

export function rateEfficiency(kmPerLiter: number): EfficiencyRating {
  if (kmPerLiter < 6) return "poor";
  if (kmPerLiter < 11) return "fair";
  return "good";
}
