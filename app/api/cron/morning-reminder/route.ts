import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import webpush from "web-push";
import { connectDB } from "@/lib/db/mongoose";
import PushSubscriptionModel from "@/models/PushSubscription";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const subscriptions = await PushSubscriptionModel.find({}).lean();

  const payload = JSON.stringify({
    title: "🌅 Good morning! DSA time",
    body: "Start your daily problem — keep your streak alive today!",
    tag: "morning-reminder",
    url: "/problems",
  });

  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
        sent++;
      } catch (err: unknown) {
        // Remove expired/invalid subscriptions
        if (err instanceof Error && "statusCode" in err) {
          const statusCode = (err as { statusCode: number }).statusCode;
          if (statusCode === 410 || statusCode === 404) {
            await PushSubscriptionModel.deleteOne({ endpoint: sub.endpoint });
          }
        }
        failed++;
      }
    })
  );

  console.log(`[morning-reminder] sent: ${sent}, failed: ${failed}`);
  return NextResponse.json({ sent, failed });
}
