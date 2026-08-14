import { describe, it, expect } from "vitest";
import {
  computeDistance,
  computeEfficiencyKmL,
  computeCostPerKm,
  computeFuelLog,
  validateOdometerReading,
  rateEfficiency,
  round2,
  CalculationError,
} from "@/lib/calculations";

describe("computeDistance", () => {
  it("returns the difference between two odometer readings", () => {
    expect(computeDistance(1000, 1350)).toBe(350);
  });

  it("throws when the new reading does not exceed the previous one", () => {
    expect(() => computeDistance(1000, 1000)).toThrow(CalculationError);
    expect(() => computeDistance(1000, 900)).toThrow(CalculationError);
  });
});

describe("computeEfficiencyKmL", () => {
  it("computes kilometres per litre", () => {
    expect(computeEfficiencyKmL(400, 40)).toBe(10);
  });

  it("rounds to 2 decimal places", () => {
    expect(computeEfficiencyKmL(350, 42)).toBe(8.33);
  });

  it("throws for zero or negative liters", () => {
    expect(() => computeEfficiencyKmL(300, 0)).toThrow(CalculationError);
    expect(() => computeEfficiencyKmL(300, -5)).toThrow(CalculationError);
  });

  it("throws for zero or negative distance", () => {
    expect(() => computeEfficiencyKmL(0, 40)).toThrow(CalculationError);
  });
});

describe("computeCostPerKm", () => {
  it("computes GHS cost per kilometre", () => {
    expect(computeCostPerKm(600, 300)).toBe(2);
  });

  it("throws for zero distance", () => {
    expect(() => computeCostPerKm(600, 0)).toThrow(CalculationError);
  });

  it("throws for negative cost", () => {
    expect(() => computeCostPerKm(-10, 300)).toThrow(CalculationError);
  });

  it("allows zero cost (e.g. company-covered fuel voucher)", () => {
    expect(computeCostPerKm(0, 300)).toBe(0);
  });
});

describe("computeFuelLog", () => {
  it("runs the full pipeline consistently", () => {
    const result = computeFuelLog({
      previousOdometer: 12000,
      currentOdometer: 12340,
      litersPurchased: 42,
      totalCostGHS: 630,
    });
    expect(result.distanceTraveled).toBe(340);
    expect(result.fuelEfficiencyKmL).toBe(8.1);
    expect(result.costPerKmGHS).toBe(1.85);
  });

  it("propagates a CalculationError for an inconsistent odometer chain", () => {
    expect(() =>
      computeFuelLog({
        previousOdometer: 12000,
        currentOdometer: 11500,
        litersPurchased: 40,
        totalCostGHS: 500,
      })
    ).toThrow(CalculationError);
  });
});

describe("validateOdometerReading", () => {
  it("accepts a plausible forward reading", () => {
    expect(validateOdometerReading(1000, 1300)).toEqual({ valid: true });
  });

  it("rejects a reading that doesn't increase", () => {
    const result = validateOdometerReading(1000, 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toBeDefined();
  });

  it("rejects an implausibly large jump", () => {
    const result = validateOdometerReading(1000, 10000);
    expect(result.valid).toBe(false);
  });

  it("rejects non-finite or non-positive input", () => {
    expect(validateOdometerReading(1000, NaN).valid).toBe(false);
    expect(validateOdometerReading(1000, -5).valid).toBe(false);
  });
});

describe("rateEfficiency", () => {
  it("buckets low efficiency as poor", () => {
    expect(rateEfficiency(4)).toBe("poor");
  });
  it("buckets mid-range efficiency as fair", () => {
    expect(rateEfficiency(8)).toBe("fair");
  });
  it("buckets high efficiency as good", () => {
    expect(rateEfficiency(15)).toBe("good");
  });
  it("treats boundary values consistently (< upper bound)", () => {
    expect(rateEfficiency(6)).toBe("fair");
    expect(rateEfficiency(11)).toBe("good");
  });
});

describe("round2", () => {
  it("avoids floating point artifacts", () => {
    expect(round2(10.005)).toBe(10.01);
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });
});
