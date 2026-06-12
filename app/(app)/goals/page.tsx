import { auth } from "@/lib/auth/auth";
import { getGoals } from "@/lib/services/goals.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { GoalsClient } from "@/components/dashboard/GoalsClient";

export const metadata = { title: "Goals — DSA Tracker" };

export default async function GoalsPage() {
  const s = await auth();
  const goals = await getGoals(s!.user.id, s!.user.email!);
  return (
    <div>
      <PageHeader title="Goals" description="Set targets and track your preparation milestones" />
      <GoalsClient initial={goals} />
    </div>
  );
}
