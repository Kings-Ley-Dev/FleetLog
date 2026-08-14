import { describe, it, expect } from "vitest";
import {
  loginSchema,
  vehicleCreateSchema,
  fuelLogCreateSchema,
  userCreateSchema,
  maintenanceCreateSchema,
  registerSchema,
  portalRegisterSchema,
  contactMessageSchema,
} from "@/lib/validation";

describe("loginSchema", () => {
  it("accepts a valid email/password pair", () => {
    const result = loginSchema.safeParse({ email: "Driver@FleetLog.gh", password: "secret" });
    expect(result.success).toBe(true);
    if (result.success) {
      // email is normalized to lowercase for consistent lookups
      expect(result.data.email).toBe("driver@fleetlog.gh");
    }
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("vehicleCreateSchema", () => {
  const base = {
    licensePlate: "gr 1234-24",
    make: "Toyota",
    model: "Hiace",
    year: 2022,
    fuelType: "DIESEL",
    initialOdometer: 1000,
  };

  it("accepts valid input and uppercases the plate", () => {
    const result = vehicleCreateSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.licensePlate).toBe("GR 1234-24");
    }
  });

  it("rejects a year far in the future", () => {
    const result = vehicleCreateSchema.safeParse({ ...base, year: 3000 });
    expect(result.success).toBe(false);
  });

  it("rejects a negative initial odometer", () => {
    const result = vehicleCreateSchema.safeParse({ ...base, initialOdometer: -10 });
    expect(result.success).toBe(false);
  });

  it("rejects an unrecognised fuel type", () => {
    const result = vehicleCreateSchema.safeParse({ ...base, fuelType: "STEAM" });
    expect(result.success).toBe(false);
  });
});

describe("fuelLogCreateSchema", () => {
  const base = {
    vehicleId: "64f0000000000000000000aa",
    currentOdometer: 1500,
    litersPurchased: 40,
    totalCostGHS: 600,
    stationName: "Goil — Achimota",
  };

  it("accepts valid input", () => {
    expect(fuelLogCreateSchema.safeParse(base).success).toBe(true);
  });

  it("rejects zero or negative liters", () => {
    expect(fuelLogCreateSchema.safeParse({ ...base, litersPurchased: 0 }).success).toBe(false);
  });

  it("rejects a missing station name", () => {
    expect(fuelLogCreateSchema.safeParse({ ...base, stationName: "" }).success).toBe(false);
  });

  it("coerces numeric strings from form input", () => {
    const result = fuelLogCreateSchema.safeParse({
      ...base,
      currentOdometer: "1500",
      litersPurchased: "40",
      totalCostGHS: "600",
    });
    expect(result.success).toBe(true);
  });
});

describe("userCreateSchema", () => {
  it("rejects a short password", () => {
    const result = userCreateSchema.safeParse({
      name: "Ama",
      email: "ama@fleetlog.gh",
      password: "short",
      role: "DRIVER",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown role", () => {
    const result = userCreateSchema.safeParse({
      name: "Ama",
      email: "ama@fleetlog.gh",
      password: "longenough123",
      role: "SUPERUSER",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a well-formed admin-created account", () => {
    const result = userCreateSchema.safeParse({
      name: "Ama Boateng",
      email: "ama@fleetlog.gh",
      password: "longenough123",
      role: "MANAGER",
    });
    expect(result.success).toBe(true);
  });
});

describe("maintenanceCreateSchema", () => {
  it("accepts valid input without the optional nextDueOdometer", () => {
    const result = maintenanceCreateSchema.safeParse({
      vehicleId: "64f0000000000000000000aa",
      serviceType: "Oil change",
      costGHS: 300,
      serviceDate: "2026-01-15",
      odometerAtService: 12000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a negative cost", () => {
    const result = maintenanceCreateSchema.safeParse({
      vehicleId: "64f0000000000000000000aa",
      serviceType: "Oil change",
      costGHS: -50,
      serviceDate: "2026-01-15",
      odometerAtService: 12000,
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts a valid driver signup", () => {
    const result = registerSchema.safeParse({
      name: "Yaw Darko",
      email: "yaw@fleetlog.gh",
      password: "longenough123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({
      name: "Yaw Darko",
      email: "yaw@fleetlog.gh",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("has no role or status field to accept from the client", () => {
    // The whole point of this schema is that role/status can never come
    // from the request body — assert they're simply not part of the shape.
    expect("role" in registerSchema.shape).toBe(false);
    expect("status" in registerSchema.shape).toBe(false);
  });
});

describe("portalRegisterSchema", () => {
  it("requires a portalPath in addition to the base registration fields", () => {
    const withoutPortalPath = portalRegisterSchema.safeParse({
      name: "Abena Asante",
      email: "abena@fleetlog.gh",
      password: "longenough123",
    });
    expect(withoutPortalPath.success).toBe(false);

    const withPortalPath = portalRegisterSchema.safeParse({
      name: "Abena Asante",
      email: "abena@fleetlog.gh",
      password: "longenough123",
      portalPath: "manager-portal-q4j9",
    });
    expect(withPortalPath.success).toBe(true);
  });
});

describe("contactMessageSchema", () => {
  it("accepts a valid support message", () => {
    const result = contactMessageSchema.safeParse({
      name: "Kofi Mensah",
      email: "kofi@example.com",
      subject: "Trouble logging fuel",
      message: "I can't log fuel for GR 2451-23, it says the vehicle is inactive.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a too-short message", () => {
    const result = contactMessageSchema.safeParse({
      name: "Kofi Mensah",
      email: "kofi@example.com",
      subject: "Help",
      message: "Hi",
    });
    expect(result.success).toBe(false);
  });
});
