import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IAuditLog {
  _id: Types.ObjectId;
  actor: Types.ObjectId;
  action: string;
  detail?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    detail: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AuditLog: Model<IAuditLog> =
  models.AuditLog || model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLog;
