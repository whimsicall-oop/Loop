"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Star,
  Briefcase,
  Calculator,
  FileText,
  Building2,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/valuation", label: "Valuation", icon: Calculator },
  { href: "/research", label: "Research", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <Link
        href="/dashboard"
        className="flex h-14 items-center gap-2 border-b border-border px-4"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <LineChart className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">
          Investaschool
        </span>
      </Link>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Sample data</p>
          <p className="mt-1">
            IDX figures are illustrative for education. Not investment advice.
          </p>
        </div>
      </div>
    </aside>
  );
}
