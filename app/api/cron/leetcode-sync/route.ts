import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCronEligibleUsers, runSync } from "@/lib/services/leetcode-sync.service";

export async function GET(req: NextRequest) {
  try {
    const cronSecret = req.headers.get("x-cron-secret");
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eligibleUserIds = await getCronEligibleUsers();

    const results = await Promise.allSettled(
      eligibleUserIds.map((userId) => runSync(userId))
    );

    let processed = 0;
    let failed = 0;

    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value.status === "COMPLETED") {
          processed++;
        } else {
          // FAILED sync still counts as attempted, not skipped
          failed++;
        }
      } else {
        failed++;
      }
    }

    const skipped = 0; // getCronEligibleUsers already filters out ineligible users

    return NextResponse.json({ processed, skipped, failed });
  } catch (error) {
    console.error("[GET /api/cron/leetcode-sync]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
