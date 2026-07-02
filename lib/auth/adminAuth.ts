import { cookies } from "next/headers";

const ADMIN_COOKIE = "dsa_admin_session";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "DsaAdmin@2024#Secure";

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return token === Buffer.from(ADMIN_PASSWORD).toString("base64");
}

export function getAdminToken(): string {
  return Buffer.from(ADMIN_PASSWORD).toString("base64");
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE;
