import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IMaintenance {
  _id: Types.ObjectId;
  vehicle: Types.ObjectId;
  serviceType: string;
  costGHS: number;
  serviceDate: Date;
  odometerAtService: number;
  nextDueOdometer?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceSchema = new Schema<IMaintenance>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    serviceType: { type: String, required: true, trim: true },
    costGHS: { type: Number, required: true, min: 0 },
    serviceDate: { type: Date, required: true },
    odometerAtService: { type: Number, required: true, min: 0 },
    nextDueOdometer: { type: Number },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Maintenance: Model<IMaintenance> =
  models.Maintenance || model<IMaintenance>("Maintenance", MaintenanceSchema);
export default Maintenance;
