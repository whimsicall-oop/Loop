"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteReport } from "@/server/research";

export function DeleteReportButton({
  id,
  redirectTo,
}: {
  id: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function onDelete() {
    startTransition(async () => {
      try {
        await deleteReport(id);
        toast.success("Report deleted");
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } catch {
        toast.error("Could not delete report");
      }
    });
  }

  return (
    <Button variant="outline" size="icon" onClick={onDelete} disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
