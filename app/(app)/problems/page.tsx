import { getAllTopics } from "@/lib/services/problems.service";
import { ProblemsTable } from "@/components/problems/ProblemsTable";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata = {
  title: "Problems — DSA Tracker",
};

export default async function ProblemsPage() {
  const topics = await getAllTopics();

  return (
    <div>
      <PageHeader
        title="Problems"
        description="Browse, search, and track all 3,647 LeetCode problems"
      />
      <ProblemsTable topics={topics} />
    </div>
  );
}
