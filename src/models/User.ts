import { Schema, model, models, type Model, type Types } from "mongoose";

export type UserRole = "ADMIN" | "MANAGER" | "DRIVER";
export type UserStatus = "ACTIVE" | "PENDING" | "DISABLED";

/**
 * Plain data shape (no Mongoose `Document` methods mixed in — some of
 * those, like `.model()`, collide with legitimate field names elsewhere
 * in this app, e.g. Vehicle.model). Mongoose's `Model<T>` return types
 * already hydrate query results with `_id`, timestamps, and instance
 * methods, so nothing is lost by keeping this interface data-only.
 */
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "DRIVER"],
      default: "DRIVER",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "PENDING", "DISABLED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as { password?: string }).password;
        return ret;
      },
    },
  }
);

const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
export default User;
