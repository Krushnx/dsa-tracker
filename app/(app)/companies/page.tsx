import { auth } from "@/lib/auth/auth";
import { getCompanyList } from "@/lib/services/companies.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { CompaniesGrid } from "@/components/companies/CompaniesGrid";
import { connectDB } from "@/lib/db/mongoose";
import { UserSettings } from "@/models";
import { getUserObjectId } from "@/lib/db/getUserObjectId";

export const metadata = { title: "Companies — DSA Tracker" };

export default async function CompaniesPage() {
  const session = await auth();

  const [companies, pinnedCompanies] = await Promise.all([
    getCompanyList(session?.user?.id, session?.user?.email ?? undefined),
    (async () => {
      if (!session?.user?.id) return [];
      await connectDB();
      const uid = await getUserObjectId(session.user.id, session.user.email!);
      const settings = await UserSettings.findOne({ userId: uid })
        .select("pinnedCompanies")
        .lean() as { pinnedCompanies?: string[] } | null;
      return settings?.pinnedCompanies ?? [];
    })(),
  ]);

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Browse interview problems by company — pin the ones you're targeting"
      />
      <CompaniesGrid companies={companies} pinnedSlugs={pinnedCompanies} />
    </div>
  );
}
