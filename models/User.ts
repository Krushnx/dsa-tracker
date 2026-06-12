import mongoose, { Schema, Model } from "mongoose";
import type { IUser } from "@/types";

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false, // never returned in queries by default
    },
    image: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
);

// Remove the duplicate index call — unique:true on the field already creates the index
UserSchema.index({ role: 1 });

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
