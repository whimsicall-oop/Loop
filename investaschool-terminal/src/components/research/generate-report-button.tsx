"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateReport } from "@/server/research";

export function GenerateReportButton({
  ticker,
  size = "default",
}: {
  ticker: string;
  size?: "default" | "sm" | "lg";
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function onClick() {
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
    <Button onClick={onClick} disabled={pending} size={size}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      Generate Research Report
    </Button>
  );
}
