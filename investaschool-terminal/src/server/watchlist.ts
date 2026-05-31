"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireDbUser } from "@/server/auth";
import { dataProvider } from "@/lib/providers";
import { deriveWeeklyChange } from "@/lib/market";
import type { CompanyMetrics } from "@/types";

export interface WatchlistRow {
  itemId: string;
  company: CompanyMetrics;
  weeklyChangePct: number;
}

/** Ensures the user has a default watchlist and returns its id. */
async function ensureWatchlist(userId: string): Promise<string> {
  const existing = await db.watchlist.findFirst({ where: { userId } });
  if (existing) return existing.id;
  const created = await db.watchlist.create({
    data: { userId, name: "My Watchlist" },
  });
  return created.id;
}

export async function getWatchlist(): Promise<WatchlistRow[]> {
  const user = await requireDbUser();
  const watchlistId = await ensureWatchlist(user.id);
  const items = await db.watchlistItem.findMany({
    where: { watchlistId },
    include: { company: true },
    orderBy: { createdAt: "asc" },
  });

  const rows = await Promise.all(
    items.map(async (item) => {
      const company = await dataProvider.getCompany(item.company.ticker);
      if (!company) return null;
      return {
        itemId: item.id,
        company,
        weeklyChangePct: deriveWeeklyChange(company),
      } satisfies WatchlistRow;
    }),
  );
  return rows.filter((r): r is WatchlistRow => r !== null);
}

export async function isInWatchlist(ticker: string): Promise<boolean> {
  const user = await requireDbUser();
  const watchlistId = await ensureWatchlist(user.id);
  const company = await db.company.findUnique({ where: { ticker } });
  if (!company) return false;
  const item = await db.watchlistItem.findUnique({
    where: { watchlistId_companyId: { watchlistId, companyId: company.id } },
  });
  return Boolean(item);
}

export async function addToWatchlist(ticker: string) {
  const user = await requireDbUser();
  const watchlistId = await ensureWatchlist(user.id);
  const company = await db.company.findUnique({ where: { ticker } });
  if (!company) throw new Error("Company not found");
  await db.watchlistItem.upsert({
    where: { watchlistId_companyId: { watchlistId, companyId: company.id } },
    update: {},
    create: { watchlistId, companyId: company.id },
  });
  revalidatePath("/watchlist");
  revalidatePath(`/company/${ticker}`);
  revalidatePath("/dashboard");
}

export async function removeFromWatchlist(ticker: string) {
  const user = await requireDbUser();
  const watchlistId = await ensureWatchlist(user.id);
  const company = await db.company.findUnique({ where: { ticker } });
  if (!company) return;
  await db.watchlistItem.deleteMany({
    where: { watchlistId, companyId: company.id },
  });
  revalidatePath("/watchlist");
  revalidatePath(`/company/${ticker}`);
  revalidatePath("/dashboard");
}

export async function toggleWatchlist(ticker: string): Promise<boolean> {
  const inList = await isInWatchlist(ticker);
  if (inList) {
    await removeFromWatchlist(ticker);
    return false;
  }
  await addToWatchlist(ticker);
  return true;
}
