import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import { User, UserSettings } from "@/models";
import { getUserObjectId } from "@/lib/db/getUserObjectId";
import { getProgressSummary } from "@/lib/services/progress.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileClient } from "@/components/profile/ProfileClient";

export const metadata = { title: "Profile — DSA Tracker" };

export default async function ProfilePage() {
  const s = await auth();
  await connectDB();
  const uid = await getUserObjectId(s!.user.id, s!.user.email!);
  const [dbUser, dbSettings, summary] = await Promise.all([
    User.findById(uid).lean(),
    UserSettings.findOne({ userId: uid }).lean(),
    getProgressSummary(s!.user.id),
  ]);

  if (!dbUser) return null;

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account and preferences" />
      <ProfileClient
        user={{
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image ?? "",
          provider: dbUser.provider ?? "credentials",
          createdAt: dbUser.createdAt.toISOString(),
        }}
        settings={{
          dailyGoal: (dbSettings as { dailyGoal?: number } | null)?.dailyGoal ?? 2,
          theme: (dbSettings as { theme?: string } | null)?.theme ?? "dark",
        }}
        stats={{ solved: summary.solved, attempted: summary.attempted, todo: summary.todo }}
      />
    </div>
  );
}
