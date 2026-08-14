import "server-only";
import { Types } from "mongoose";
import connectDB from "./db";
import FuelLog from "@/models/FuelLog";
import Vehicle from "@/models/Vehicle";
import { round2 } from "./calculations";
import { serializeFuelLog } from "./serializers";
import type { AnalyticsDTO, FuelLogDTO } from "@/types";

/**
 * Shared read-model queries used by both the /api/analytics route and the
 * server-rendered dashboard overview page, so the two never drift apart.
 */
export async function getFleetAnalytics(): Promise<AnalyticsDTO> {
  await connectDB();

  const [totals] = await FuelLog.aggregate([
    {
      $group: {
        _id: null,
        totalSpendGHS: { $sum: "$totalCostGHS" },
        totalLiters: { $sum: "$litersPurchased" },
        totalDistanceKm: { $sum: "$distanceTraveled" },
        averageEfficiencyKmL: { $avg: "$fuelEfficiencyKmL" },
      },
    },
  ]);

  const activeVehicleCount = await Vehicle.countDocuments({ status: "ACTIVE" });

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRaw = await FuelLog.aggregate([
    { $match: { logDate: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { y: { $year: "$logDate" }, m: { $month: "$logDate" } },
        spendGHS: { $sum: "$totalCostGHS" },
        liters: { $sum: "$litersPurchased" },
      },
    },
    { $sort: { "_id.y": 1, "_id.m": 1 } },
  ]);

  const monthFormatter = new Intl.DateTimeFormat("en-GH", { month: "short", year: "2-digit" });
  const monthlySpend = monthlyRaw.map((row) => ({
    month: monthFormatter.format(new Date(row._id.y, row._id.m - 1, 1)),
    spendGHS: round2(row.spendGHS),
    liters: round2(row.liters),
  }));

  const vehicleBreakdownRaw = await FuelLog.aggregate([
    {
      $group: {
        _id: "$vehicle",
        spendGHS: { $sum: "$totalCostGHS" },
        efficiencyKmL: { $avg: "$fuelEfficiencyKmL" },
        logCount: { $sum: 1 },
      },
    },
    { $sort: { spendGHS: -1 } },
    { $limit: 10 },
    { $lookup: { from: "vehicles", localField: "_id", foreignField: "_id", as: "vehicle" } },
    { $unwind: "$vehicle" },
  ]);

  const vehicleBreakdown = vehicleBreakdownRaw.map((row) => ({
    vehicleId: String(row._id),
    licensePlate: row.vehicle.licensePlate,
    spendGHS: round2(row.spendGHS),
    efficiencyKmL: round2(row.efficiencyKmL),
    logCount: row.logCount,
  }));

  const topStationsRaw = await FuelLog.aggregate([
    { $group: { _id: "$stationName", visits: { $sum: 1 }, totalSpendGHS: { $sum: "$totalCostGHS" } } },
    { $sort: { totalSpendGHS: -1 } },
    { $limit: 5 },
  ]);

  const topStations = topStationsRaw.map((row) => ({
    stationName: row._id as string,
    visits: row.visits,
    totalSpendGHS: round2(row.totalSpendGHS),
  }));

  return {
    totalSpendGHS: round2(totals?.totalSpendGHS ?? 0),
    totalLiters: round2(totals?.totalLiters ?? 0),
    averageEfficiencyKmL: round2(totals?.averageEfficiencyKmL ?? 0),
    totalDistanceKm: round2(totals?.totalDistanceKm ?? 0),
    activeVehicleCount,
    monthlySpend,
    vehicleBreakdown,
    topStations,
  };
}

export interface DriverOverview {
  totalSpendGHS: number;
  totalLiters: number;
  averageEfficiencyKmL: number;
  totalDistanceKm: number;
  logCount: number;
  recentLogs: FuelLogDTO[];
}

export async function getDriverOverview(driverId: string): Promise<DriverOverview> {
  await connectDB();

  const [totals] = await FuelLog.aggregate([
    { $match: { driver: new Types.ObjectId(driverId) } },
    {
      $group: {
        _id: null,
        totalSpendGHS: { $sum: "$totalCostGHS" },
        totalLiters: { $sum: "$litersPurchased" },
        totalDistanceKm: { $sum: "$distanceTraveled" },
        averageEfficiencyKmL: { $avg: "$fuelEfficiencyKmL" },
        logCount: { $sum: 1 },
      },
    },
  ]);

  const recent = await FuelLog.find({ driver: driverId })
    .populate("vehicle", "licensePlate make model")
    .populate("driver", "name")
    .sort({ logDate: -1 })
    .limit(5);

  return {
    totalSpendGHS: round2(totals?.totalSpendGHS ?? 0),
    totalLiters: round2(totals?.totalLiters ?? 0),
    averageEfficiencyKmL: round2(totals?.averageEfficiencyKmL ?? 0),
    totalDistanceKm: round2(totals?.totalDistanceKm ?? 0),
    logCount: totals?.logCount ?? 0,
    recentLogs: recent.map(serializeFuelLog),
  };
}
