import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { BottomNav } from "@/components/shared/BottomNav";
import SessionProvider from "@/components/shared/SessionProvider";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <Navbar />

        {/* Page content — top padding for navbar, bottom padding for mobile nav */}
        <main className="flex-1 pt-16 pb-20 lg:pb-0">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </SessionProvider>
  );
}
