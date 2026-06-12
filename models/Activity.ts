import mongoose, { Schema, Model } from "mongoose";
import type { IActivity } from "@/types";

const ActivitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "PROBLEM_SOLVED",
        "PROBLEM_ATTEMPTED",
        "GOAL_CREATED",
        "GOAL_COMPLETED",
        "STREAK_MILESTONE",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivitySchema.index({ userId: 1 });
ActivitySchema.index({ createdAt: -1 });

const Activity: Model<IActivity> =
  mongoose.models.Activity ??
  mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;
