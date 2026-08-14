import { Schema, model, models, type Model, type Types } from "mongoose";

export type FuelType = "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC";
export type VehicleStatus = "ACTIVE" | "IN_SERVICE" | "INACTIVE";

export interface IVehicle {
  _id: Types.ObjectId;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  initialOdometer: number;
  currentOdometer: number;
  status: VehicleStatus;
  assignedDriver?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    fuelType: {
      type: String,
      enum: ["PETROL", "DIESEL", "HYBRID", "ELECTRIC"],
      default: "DIESEL",
    },
    initialOdometer: { type: Number, required: true, min: 0 },
    currentOdometer: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["ACTIVE", "IN_SERVICE", "INACTIVE"],
      default: "ACTIVE",
    },
    assignedDriver: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const Vehicle: Model<IVehicle> = models.Vehicle || model<IVehicle>("Vehicle", VehicleSchema);
export default Vehicle;
