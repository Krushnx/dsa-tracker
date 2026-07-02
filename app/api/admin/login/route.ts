import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminPassword, getAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, getAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(ADMIN_COOKIE_NAME);
  return res;
}
