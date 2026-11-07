import mongoose, { Schema, Model } from "mongoose";
import type { ILeetCodeSync } from "@/types";

const LeetCodeSyncSchema = new Schema<ILeetCodeSync>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED", "FAILED"],
      required: true,
    },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
    stats: {
      total: Number,
      easy: Number,
      medium: Number,
      hard: Number,
    },
    newlySolvedCount: { type: Number },
    error: {
      stage: {
        type: String,
        enum: ["FETCH_STATS", "FETCH_SUBMISSIONS", "CROSS_REFERENCE", "PERSIST"],
      },
      reason: {
        type: String,
        enum: ["TIMEOUT", "HTTP_ERROR", "INVALID_RESPONSE", "DB_ERROR", "NETWORK_ERROR"],
      },
      detail: String,
    },
  },
  { timestamps: true }
);

LeetCodeSyncSchema.index({ userId: 1, startedAt: -1 }); // cron cooldown check + status query
LeetCodeSyncSchema.index({ userId: 1, status: 1 });

const LeetCodeSync: Model<ILeetCodeSync> =
  mongoose.models.LeetCodeSync ??
  mongoose.model<ILeetCodeSync>("LeetCodeSync", LeetCodeSyncSchema);

export default LeetCodeSync;
