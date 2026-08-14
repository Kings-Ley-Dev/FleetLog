/**
 * Seeds FleetLog with realistic demo data: an admin, a fleet manager, two
 * drivers, three vehicles, a spread of fuel logs, and a few maintenance
 * records. Safe to re-run — it wipes and rebuilds the relevant collections.
 *
 * Usage:
 *   npm run seed
 * (requires MONGODB_URI in .env.local)
 */
import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User";
import Vehicle from "../src/models/Vehicle";
import FuelLog from "../src/models/FuelLog";
import Maintenance from "../src/models/Maintenance";
import AuditLog from "../src/models/AuditLog";
import { hashPassword } from "../src/lib/auth";
import { computeFuelLog } from "../src/lib/calculations";

const STATIONS = ["Goil — Achimota", "Shell — Spintex", "TotalEnergies — East Legon", "Star Oil — Tema"];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to .env.local before seeding.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB…");
  await mongoose.connect(uri);

  console.log("Clearing existing data…");
  await Promise.all([
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    FuelLog.deleteMany({}),
    Maintenance.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log("Creating users…");
  const [admin, manager, driver1, driver2] = await Promise.all([
    User.create({
      name: "Kwabena Owusu",
      email: "admin@fleetlog.gh",
      password: await hashPassword("Admin123!"),
      role: "ADMIN",
      status: "ACTIVE",
    }),
    User.create({
      name: "Abena Asante",
      email: "manager@fleetlog.gh",
      password: await hashPassword("Manager123!"),
      role: "MANAGER",
      status: "ACTIVE",
    }),
    User.create({
      name: "Kofi Mensah",
      email: "driver1@fleetlog.gh",
      password: await hashPassword("Driver123!"),
      role: "DRIVER",
      status: "ACTIVE",
    }),
    User.create({
      name: "Ama Boateng",
      email: "driver2@fleetlog.gh",
      password: await hashPassword("Driver123!"),
      role: "DRIVER",
      status: "ACTIVE",
    }),
  ]);

  // A pending driver signup, so the approval workflow has something to
  // demo out of the box (Users/Drivers page → Pending approval).
  await User.create({
    name: "Yaw Darko",
    email: "driver3@fleetlog.gh",
    password: await hashPassword("Driver123!"),
    role: "DRIVER",
    status: "PENDING",
  });

  console.log("Creating vehicles…");
  const vehicles = await Promise.all([
    Vehicle.create({
      licensePlate: "GR 2451-23",
      make: "Toyota",
      model: "Hiace",
      year: 2021,
      fuelType: "DIESEL",
      initialOdometer: 12000,
      currentOdometer: 12000,
      status: "ACTIVE",
      assignedDriver: driver1._id,
    }),
    Vehicle.create({
      licensePlate: "GT 7810-22",
      make: "Nissan",
      model: "Navara",
      year: 2020,
      fuelType: "DIESEL",
      initialOdometer: 38500,
      currentOdometer: 38500,
      status: "ACTIVE",
      assignedDriver: driver2._id,
    }),
    Vehicle.create({
      licensePlate: "GW 3309-24",
      make: "Toyota",
      model: "Corolla",
      year: 2023,
      fuelType: "PETROL",
      initialOdometer: 4200,
      currentOdometer: 4200,
      status: "ACTIVE",
      assignedDriver: null,
    }),
  ]);

  console.log("Creating fuel logs…");
  const fuelLogPlan: { vehicle: number; driver: mongoose.Types.ObjectId; entries: { km: number; liters: number; cost: number; daysAgo: number }[] }[] = [
    {
      vehicle: 0,
      driver: driver1._id,
      entries: [
        { km: 340, liters: 42, cost: 630, daysAgo: 85 },
        { km: 300, liters: 38, cost: 580, daysAgo: 70 },
        { km: 410, liters: 50, cost: 760, daysAgo: 55 },
        { km: 280, liters: 36, cost: 545, daysAgo: 40 },
        { km: 365, liters: 45, cost: 690, daysAgo: 22 },
        { km: 320, liters: 40, cost: 615, daysAgo: 6 },
      ],
    },
    {
      vehicle: 1,
      driver: driver2._id,
      entries: [
        { km: 520, liters: 68, cost: 1030, daysAgo: 78 },
        { km: 480, liters: 64, cost: 972, daysAgo: 58 },
        { km: 610, liters: 82, cost: 1250, daysAgo: 35 },
        { km: 455, liters: 60, cost: 915, daysAgo: 18 },
        { km: 500, liters: 66, cost: 1005, daysAgo: 4 },
      ],
    },
    {
      vehicle: 2,
      driver: driver1._id,
      entries: [
        { km: 210, liters: 22, cost: 340, daysAgo: 30 },
        { km: 245, liters: 25, cost: 385, daysAgo: 12 },
      ],
    },
  ];

  let stationIdx = 0;
  for (const plan of fuelLogPlan) {
    const vehicle = vehicles[plan.vehicle];
    let odometer = vehicle.initialOdometer;
    for (const entry of plan.entries) {
      const previousOdometer = odometer;
      const currentOdometer = odometer + entry.km;
      const { distanceTraveled, fuelEfficiencyKmL, costPerKmGHS } = computeFuelLog({
        previousOdometer,
        currentOdometer,
        litersPurchased: entry.liters,
        totalCostGHS: entry.cost,
      });
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - entry.daysAgo);

      await FuelLog.create({
        vehicle: vehicle._id,
        driver: plan.driver,
        previousOdometer,
        currentOdometer,
        distanceTraveled,
        litersPurchased: entry.liters,
        totalCostGHS: entry.cost,
        stationName: STATIONS[stationIdx % STATIONS.length],
        fuelEfficiencyKmL,
        costPerKmGHS,
        logDate,
      });

      odometer = currentOdometer;
      stationIdx++;
    }
    vehicle.currentOdometer = odometer;
    await vehicle.save();
  }

  console.log("Creating maintenance records…");
  await Maintenance.create([
    {
      vehicle: vehicles[0]._id,
      serviceType: "Oil & filter change",
      costGHS: 380,
      serviceDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      odometerAtService: 12300,
      nextDueOdometer: 17300,
      notes: "Full synthetic oil, standard filter.",
    },
    {
      vehicle: vehicles[1]._id,
      serviceType: "Brake pad replacement",
      costGHS: 950,
      serviceDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      odometerAtService: 39100,
      nextDueOdometer: 49100,
    },
    {
      vehicle: vehicles[2]._id,
      serviceType: "Tyre rotation",
      costGHS: 120,
      serviceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      odometerAtService: 4400,
      nextDueOdometer: 9400,
    },
  ]);

  console.log("Creating audit log entries…");
  await AuditLog.create([
    { actor: admin._id, action: "USER_CREATED", detail: "Seeded demo accounts" },
    { actor: manager._id, action: "VEHICLE_CREATED", detail: "Seeded 3 vehicles" },
  ]);

  console.log("\nDone. Seeded accounts:");
  console.log("  Admin    admin@fleetlog.gh    / Admin123!");
  console.log("  Manager  manager@fleetlog.gh  / Manager123!");
  console.log("  Driver 1 driver1@fleetlog.gh  / Driver123!  (Toyota Hiace, Toyota Corolla)");
  console.log("  Driver 2 driver2@fleetlog.gh  / Driver123!  (Nissan Navara)");
  console.log("  Driver 3 driver3@fleetlog.gh  / Driver123!  (PENDING — awaiting approval)");
  console.log("\nAdmin/Manager portal URLs are set by ADMIN_PORTAL_PATH / MANAGER_PORTAL_PATH in .env.local.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
