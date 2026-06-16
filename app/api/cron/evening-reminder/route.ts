import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import webpush from "web-push";
import { connectDB } from "@/lib/db/mongoose";
import PushSubscriptionModel from "@/models/PushSubscription";
import { UserProblem } from "@/models";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Get all users who solved at least one problem today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const solvedToday = await UserProblem.distinct("userId", {
    status: "SOLVED",
    solvedAt: { $gte: todayStart },
  });

  const solvedSet = new Set(solvedToday.map((id) => id.toString()));

  // Only send to subscriptions whose user has NOT solved today
  const subscriptions = await PushSubscriptionModel.find({}).lean();
  const toNotify = subscriptions.filter(
    (sub) => !solvedSet.has(sub.userId.toString())
  );

  const payload = JSON.stringify({
    title: "⏰ Don't break your streak!",
    body: "You haven't solved a problem today. 2.5 hours left — you've got this!",
    tag: "evening-reminder",
    url: "/problems",
  });

  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    toNotify.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
        sent++;
      } catch (err: unknown) {
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

  console.log(`[evening-reminder] notified: ${sent}, already solved: ${solvedSet.size}, failed: ${failed}`);
  return NextResponse.json({ sent, skipped: solvedSet.size, failed });
}
