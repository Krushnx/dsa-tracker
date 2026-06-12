import mongoose, { Schema, Model } from "mongoose";
import type { IGoal } from "@/types";

const GoalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    targetProblems: {
      type: Number,
      required: true,
      min: 1,
    },
    currentProgress: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "ARCHIVED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

GoalSchema.index({ userId: 1 });
GoalSchema.index({ status: 1 });

const Goal: Model<IGoal> =
  mongoose.models.Goal ?? mongoose.model<IGoal>("Goal", GoalSchema);

export default Goal;
