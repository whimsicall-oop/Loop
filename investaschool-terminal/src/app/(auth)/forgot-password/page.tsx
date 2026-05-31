import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Clerk's <SignIn> flow includes a built-in "forgot password" path (email
 * code → reset). This page explains that and routes users into it, so the
 * dedicated /forgot-password route from the spec exists and is on-brand.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
        <KeyRound className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Password recovery is handled securely inside the sign-in screen.
          Choose <span className="font-medium text-foreground">“Forgot password?”</span>{" "}
          there to receive a reset code by email.
        </p>
      </div>
      <Button asChild className="w-full">
        <Link href="/sign-in">Go to sign in</Link>
      </Button>
      <Link
        href="/"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back home
      </Link>
    </div>
  );
}
