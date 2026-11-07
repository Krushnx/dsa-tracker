import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { validateUsernameBodySchema } from "@/lib/validations/leetcode-sync";
import leetcodeClient, {
  LeetCodeHttpError,
  LeetCodeNetworkError,
  LeetCodeTimeoutError,
} from "@/lib/leetcode/leetcode-client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = validateUsernameBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid username format", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { username } = parsed.data;

    let found: boolean;
    try {
      found = await leetcodeClient.validateUsername(username);
    } catch (err) {
      if (
        err instanceof LeetCodeHttpError ||
        err instanceof LeetCodeNetworkError ||
        err instanceof LeetCodeTimeoutError
      ) {
        return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
      }
      throw err;
    }

    if (!found) {
      return NextResponse.json({ error: "profile_not_found" }, { status: 422 });
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/leetcode/validate-username]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
