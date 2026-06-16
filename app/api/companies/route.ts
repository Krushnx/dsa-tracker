import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getCompanyList } from "@/lib/services/companies.service";

export async function GET() {
  try {
    const session = await auth();
    const companies = await getCompanyList(
      session?.user?.id,
      session?.user?.email ?? undefined
    );
    return NextResponse.json({ companies });
  } catch (err) {
    console.error("[GET /api/companies]", err);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}
