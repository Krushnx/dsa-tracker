import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import PushSubscriptionModel from "@/models/PushSubscription";
import { getUserObjectId } from "@/lib/db/getUserObjectId";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    await connectDB();
    const uid = await getUserObjectId(session.user.id, session.user.email!);

    // Upsert — update if endpoint exists, create if not
    await PushSubscriptionModel.findOneAndUpdate(
      { endpoint },
      { userId: uid, endpoint, keys },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/push/subscribe]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint } = body;

    await connectDB();
    await PushSubscriptionModel.deleteOne({ endpoint });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/push/subscribe]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
