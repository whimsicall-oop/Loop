import { CompanyTable } from "@/components/company-table";
import { listCompanies } from "@/server/companies";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await listCompanies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
        <p className="text-sm text-muted-foreground">
          {companies.length} companies available in the sample IDX universe.
        </p>
      </div>
      <CompanyTable companies={companies} />
    </div>
  );
}
