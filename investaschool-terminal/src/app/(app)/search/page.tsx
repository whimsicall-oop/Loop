import { SearchIcon } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { CompanyTable } from "@/components/company-table";
import { EmptyState } from "@/components/empty-state";
import { searchCompanies } from "@/server/companies";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await searchCompanies(q) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">
          Find public companies by ticker or name.
        </p>
      </div>

      <SearchForm initial={q} />

      {!q.trim() ? (
        <EmptyState
          icon={SearchIcon}
          title="Search the IDX universe"
          description="Try BBCA, BMRI, TLKM, ASII, or GOTO. You can also search by sector."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={`No results for “${q}”`}
          description="Check the spelling or try a different ticker or company name."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
          </p>
          <CompanyTable companies={results} />
        </>
      )}
    </div>
  );
}
