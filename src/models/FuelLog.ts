import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IFuelLog {
  _id: Types.ObjectId;
  vehicle: Types.ObjectId;
  driver: Types.ObjectId;
  previousOdometer: number;
  currentOdometer: number;
  distanceTraveled: number;
  litersPurchased: number;
  totalCostGHS: number;
  stationName: string;
  fuelEfficiencyKmL: number;
  costPerKmGHS: number;
  logDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FuelLogSchema = new Schema<IFuelLog>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    driver: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    previousOdometer: { type: Number, required: true, min: 0 },
    currentOdometer: { type: Number, required: true, min: 0 },
    distanceTraveled: { type: Number, required: true, min: 0 },
    litersPurchased: { type: Number, required: true, min: 0 },
    totalCostGHS: { type: Number, required: true, min: 0 },
    stationName: { type: String, required: true, trim: true },
    fuelEfficiencyKmL: { type: Number, required: true },
    costPerKmGHS: { type: Number, required: true },
    logDate: { type: Date, default: Date.now, index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const FuelLog: Model<IFuelLog> = models.FuelLog || model<IFuelLog>("FuelLog", FuelLogSchema);
export default FuelLog;
