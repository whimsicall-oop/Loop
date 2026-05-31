import Link from "next/link";
import { LineChart, TrendingUp, FileText, Layers } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / value-prop panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card p-10 lg:flex">
        <div className="grid-bg absolute inset-0 opacity-40" />
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LineChart className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Investaschool<span className="text-primary"> Terminal</span>
          </span>
        </Link>

        <div className="relative z-10 space-y-8">
          <h1 className="max-w-md text-3xl font-bold leading-tight tracking-tight">
            Institutional-grade equity research,{" "}
            <span className="text-primary">built for learners.</span>
          </h1>
          <ul className="space-y-4 text-sm text-muted-foreground">
            {[
              { icon: TrendingUp, t: "Live metrics, valuation & DCF modeling" },
              { icon: FileText, t: "AI-generated research reports & PDF export" },
              { icon: Layers, t: "Watchlists, portfolios & peer comparisons" },
            ].map(({ icon: Icon, t }) => (
              <li key={t} className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-muted-foreground">
          Educational sample data. Not investment advice.
        </p>
      </div>

      {/* Auth form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
