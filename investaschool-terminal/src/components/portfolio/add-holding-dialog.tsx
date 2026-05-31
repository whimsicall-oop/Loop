"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addHolding } from "@/server/portfolio";

export function AddHoldingDialog() {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [ticker, setTicker] = React.useState("");
  const [shares, setShares] = React.useState("");
  const [avgCost, setAvgCost] = React.useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await addHolding({
          ticker: ticker.trim().toUpperCase(),
          shares: Number(shares),
          avgCost: Number(avgCost),
        });
        toast.success(`${ticker.toUpperCase()} added to portfolio`);
        setOpen(false);
        setTicker("");
        setShares("");
        setAvgCost("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not add holding");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Add Holding
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a holding</DialogTitle>
          <DialogDescription>
            Enter a ticker, number of shares, and your average cost per share.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticker">Ticker</Label>
            <Input
              id="ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g. BBCA"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="shares">Shares</Label>
              <Input
                id="shares"
                type="number"
                min="0"
                step="any"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="1000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avgCost">Avg Cost</Label>
              <Input
                id="avgCost"
                type="number"
                min="0"
                step="any"
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                placeholder="8900"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add holding
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
