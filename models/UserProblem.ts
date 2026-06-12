import mongoose, { Schema, Model } from "mongoose";
import type { IUserProblem } from "@/types";

const UserProblemSchema = new Schema<IUserProblem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    status: {
      type: String,
      enum: ["TODO", "ATTEMPTED", "SOLVED", "REVISION"],
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    solutionLink: {
      type: String,
      default: "",
    },
    solvedAt: {
      type: Date,
    },
    firstAttemptedAt: {
      type: Date,
    },
    lastReviewedAt: {
      type: Date,
    },
    revisionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// One tracking record per user/problem pair
UserProblemSchema.index({ userId: 1, problemId: 1 }, { unique: true });
UserProblemSchema.index({ userId: 1 });
UserProblemSchema.index({ userId: 1, status: 1 });
UserProblemSchema.index({ solvedAt: 1 });

const UserProblem: Model<IUserProblem> =
  mongoose.models.UserProblem ??
  mongoose.model<IUserProblem>("UserProblem", UserProblemSchema);

export default UserProblem;
