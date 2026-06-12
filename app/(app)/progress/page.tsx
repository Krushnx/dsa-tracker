import { auth } from "@/lib/auth/auth";
import { getProgressSummary } from "@/lib/services/progress.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressClient } from "@/components/problems/ProgressClient";

export const metadata = {
  title: "My Progress — DSA Tracker",
};

export default async function ProgressPage() {
  const session = await auth();
  const summary = await getProgressSummary(session!.user.id);
  const totalTracked = summary.solved + summary.attempted + summary.todo + summary.revision;

  return (
    <div>
      <PageHeader
        title="My Progress"
        description={`${totalTracked} problems tracked · ${summary.solved} solved`}
      />
      <ProgressClient />
    </div>
  );
}
