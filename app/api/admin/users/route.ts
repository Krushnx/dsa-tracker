import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/adminAuth";
import { getAdminUsers } from "@/lib/services/admin.service";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const result = await getAdminUsers(page, 20, search);
  return NextResponse.json(result);
}
