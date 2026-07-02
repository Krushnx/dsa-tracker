import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { isAdminAuthenticated } from "@/lib/auth/adminAuth";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models";

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, html, filter } = await req.json();

  if (!subject?.trim() || !html?.trim()) {
    return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
  }

  await connectDB();

  // Build query based on filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};
  if (filter === "google") query.provider = "google";
  else if (filter === "credentials") query.provider = "credentials";

  const users = await User.find(query).select("email name").lean();

  if (users.length === 0) {
    return NextResponse.json({ error: "No users found" }, { status: 400 });
  }

  let sent = 0;
  let failed = 0;

  // Send emails one by one (Gmail rate limit: ~500/day)
  for (const user of users) {
    try {
      await transporter.sendMail({
        from: `DSA Tracker <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject,
        html: html.replace(/\{\{name\}\}/g, user.name),
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${user.email}:`, err);
      failed++;
    }

    // Small delay to avoid Gmail rate limiting
    await new Promise((r) => setTimeout(r, 100));
  }

  return NextResponse.json({ sent, failed, total: users.length });
}
