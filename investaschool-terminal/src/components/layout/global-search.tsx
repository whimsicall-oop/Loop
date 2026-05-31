"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import type { CompanyMetrics } from "@/types";
import { cn, formatPrice } from "@/lib/utils";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<CompanyMetrics[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(0);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(id);
  }, [query]);

  // Close on outside click
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Cmd/Ctrl-K focus
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function go(ticker: string) {
    setOpen(false);
    setQuery("");
    router.push(`/company/${ticker}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active].ticker);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search ticker or company (e.g. BBCA, Telkom)…"
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-16 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />
        <kbd className="absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
          ⌘K
        </kbd>
      </div>

      {open && (query.trim() || loading) && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No matches for “{query}”.
            </div>
          )}
          {!loading &&
            results.map((c, i) => {
              const up = c.dayChangePct >= 0;
              return (
                <button
                  key={c.ticker}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(c.ticker)}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left",
                    i === active ? "bg-accent/15" : "hover:bg-secondary",
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">
                        {c.ticker}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {c.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {c.sector}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="tabular text-sm">
                      {formatPrice(c.price, c.currency)}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-xs",
                        up ? "text-bull" : "text-bear",
                      )}
                    >
                      {up ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {c.dayChangePct.toFixed(2)}%
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
