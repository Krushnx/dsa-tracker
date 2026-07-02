import { isAdminAuthenticated } from "@/lib/auth/adminAuth";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "./AdminLoginForm";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  const isAuth = await isAdminAuthenticated();

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <AdminLoginForm />
      </div>
    );
  }

  return <AdminDashboard />;
}
