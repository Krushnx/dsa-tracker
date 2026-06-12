import mongoose, { Schema, Model } from "mongoose";
import type { IProblem } from "@/types";

const ProblemSchema = new Schema<IProblem>(
  {
    leetcodeId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    topics: {
      type: [String],
      default: [],
    },
    acceptanceRate: {
      type: Number,
      default: 0,
    },
    premiumOnly: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// leetcodeId unique:true on field already creates the index
ProblemSchema.index({ title: "text" });
ProblemSchema.index({ difficulty: 1 });
ProblemSchema.index({ topics: 1 });
ProblemSchema.index({ category: 1 });

const Problem: Model<IProblem> =
  mongoose.models.Problem ?? mongoose.model<IProblem>("Problem", ProblemSchema);

export default Problem;
