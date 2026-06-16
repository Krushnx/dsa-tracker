import mongoose, { Schema, Model } from "mongoose";

export interface ICompanyProblem {
  _id: mongoose.Types.ObjectId;
  companyName: string;
  companySlug: string;
  problemId: mongoose.Types.ObjectId | null;
  title: string;
  difficulty: string;
  frequency: number;
  acceptanceRate: number;
  link: string;
  topics: string[];
  timeframe: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyProblemSchema = new Schema<ICompanyProblem>(
  {
    companyName: { type: String, required: true, trim: true },
    companySlug: { type: String, required: true, lowercase: true },
    problemId: { type: Schema.Types.ObjectId, ref: "Problem", default: null },
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, required: true },
    frequency: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    link: { type: String, default: "" },
    topics: { type: [String], default: [] },
    timeframe: {
      type: String,
      enum: ["30days", "3months", "6months", "6months+", "all"],
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index
CompanyProblemSchema.index(
  { companySlug: 1, title: 1, timeframe: 1 },
  { unique: true }
);
CompanyProblemSchema.index({ companySlug: 1 });
CompanyProblemSchema.index({ companySlug: 1, timeframe: 1 });

const CompanyProblem: Model<ICompanyProblem> =
  mongoose.models.CompanyProblem ??
  mongoose.model<ICompanyProblem>("CompanyProblem", CompanyProblemSchema);

export default CompanyProblem;
