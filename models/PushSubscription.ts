import mongoose, { Schema, Model } from "mongoose";

export interface IPushSubscription {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true }
);

PushSubscriptionSchema.index({ userId: 1 });
PushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });

const PushSubscriptionModel: Model<IPushSubscription> =
  mongoose.models.PushSubscription ??
  mongoose.model<IPushSubscription>("PushSubscription", PushSubscriptionSchema);

export default PushSubscriptionModel;
