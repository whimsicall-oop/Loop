"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { generateReport } from "@/server/research";

export function ResearchGenerator({
  companies,
}: {
  companies: { ticker: string; name: string }[];
}) {
  const router = useRouter();
  const [ticker, setTicker] = React.useState<string>("");
  const [pending, startTransition] = React.useTransition();

  function onGenerate() {
    if (!ticker) {
      toast.error("Select a company first");
      return;
    }
    startTransition(async () => {
      try {
        toast.loading("Generating research report…", { id: "gen" });
        const id = await generateReport(ticker);
        toast.success("Report ready", { id: "gen" });
        router.push(`/research/${id}`);
      } catch {
        toast.error("Failed to generate report", { id: "gen" });
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Select value={ticker} onValueChange={setTicker}>
        <SelectTrigger className="sm:w-72">
          <SelectValue placeholder="Select a company…" />
        </SelectTrigger>
        <SelectContent>
          {companies.map((c) => (
            <SelectItem key={c.ticker} value={c.ticker}>
              {c.ticker} — {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onGenerate} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Generate Research Report
      </Button>
    </div>
  );
}
