import mongoose, { Schema, Model } from "mongoose";

export type BuddyRequestStatus = "pending" | "accepted" | "declined";

export interface IBuddyRequest {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: BuddyRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BuddyRequestSchema = new Schema<IBuddyRequest>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

BuddyRequestSchema.index({ senderId: 1 });
BuddyRequestSchema.index({ receiverId: 1 });
BuddyRequestSchema.index({ senderId: 1, receiverId: 1 });

const BuddyRequest: Model<IBuddyRequest> =
  mongoose.models.BuddyRequest ??
  mongoose.model<IBuddyRequest>("BuddyRequest", BuddyRequestSchema);

export default BuddyRequest;
