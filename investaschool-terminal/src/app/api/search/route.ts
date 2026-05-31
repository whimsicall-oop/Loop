import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { searchCompanies } from "@/server/companies";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ results: [] });
  const results = await searchCompanies(q);
  return NextResponse.json({ results });
}
