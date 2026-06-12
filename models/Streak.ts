import mongoose, { Schema, Model } from "mongoose";
import type { IStreak } from "@/types";

const StreakSchema = new Schema<IStreak>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one streak record per user
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSolvedDate: {
      type: Date,
    },
    totalActiveDays: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: false,
    // We only store updatedAt manually for performance
  }
);

StreakSchema.add({ updatedAt: { type: Date, default: Date.now } });

// userId unique:true on field already creates the index — no duplicate needed

const Streak: Model<IStreak> =
  mongoose.models.Streak ?? mongoose.model<IStreak>("Streak", StreakSchema);

export default Streak;
