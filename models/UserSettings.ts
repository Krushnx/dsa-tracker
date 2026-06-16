import mongoose, { Schema, Model } from "mongoose";
import type { IUserSettings } from "@/types";

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    theme: { type: String, enum: ["dark", "light", "system"], default: "dark" },
    dailyGoal: { type: Number, default: 2, min: 1, max: 20 },
    timezone: { type: String, default: "UTC" },
    emailNotifications: { type: Boolean, default: false },
    pinnedCompanies: { type: [String], default: [] },
  },
  { timestamps: true }
);

// userId unique:true on field already creates the index — no duplicate needed

const UserSettings: Model<IUserSettings> =
  mongoose.models.UserSettings ??
  mongoose.model<IUserSettings>("UserSettings", UserSettingsSchema);

export default UserSettings;
