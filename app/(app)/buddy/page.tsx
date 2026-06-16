import { auth } from "@/lib/auth/auth";
import { getBuddyStatus, getBuddyDashboard } from "@/lib/services/buddy.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { BuddyPage } from "@/components/buddy/BuddyPage";

export const metadata = { title: "DSA Buddy — DSA Tracker" };

export default async function BuddyPageRoute() {
  const s = await auth();
  const [status, dashboard] = await Promise.all([
    getBuddyStatus(s!.user.id, s!.user.email),
    getBuddyDashboard(s!.user.id, s!.user.email),
  ]);

  return (
    <div>
      <PageHeader
        title="DSA Buddy"
        description="Challenge a friend, track daily wins, and push each other to solve more"
      />
      <BuddyPage initialStatus={status} initialDashboard={dashboard} />
    </div>
  );
}
