import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  LineChart,
  TrendingUp,
  FileText,
  Calculator,
  Star,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: Building2, title: "Company Intelligence", desc: "Search IDX names, drill into metrics, financials, and 5-year trends." },
  { icon: Calculator, title: "DCF Valuation", desc: "Model intrinsic value with WACC, growth, and a live sensitivity grid." },
  { icon: Sparkles, title: "AI Research", desc: "Generate institutional-style reports: thesis, SWOT, risks, catalysts." },
  { icon: TrendingUp, title: "Comparables", desc: "Auto-discovered peers with P/E, P/BV, EV/EBITDA, ROE, growth." },
  { icon: Star, title: "Watchlists", desc: "Track daily and weekly performance across the names you follow." },
  { icon: FileText, title: "PDF Export", desc: "Export polished, shareable equity research reports in one click." },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LineChart className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">
            Investaschool<span className="text-primary"> Terminal</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-powered equity research for the next generation of analysts
        </div>
        <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          The research terminal that{" "}
          <span className="text-primary">teaches you to invest.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          Search public companies, analyze valuation, build watchlists and
          portfolios, and generate professional research reports — modeled on
          Bloomberg, Capital IQ, and Morningstar, designed for learners.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/sign-up">
              Launch the terminal <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-8 text-center text-xs text-muted-foreground">
        Investaschool Terminal · Educational sample data · Not investment advice.
      </footer>
    </div>
  );
}
