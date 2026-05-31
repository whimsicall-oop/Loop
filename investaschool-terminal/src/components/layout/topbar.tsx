import { UserButton } from "@clerk/nextjs";
import { GlobalSearch } from "./global-search";
import { MobileNav } from "./mobile-nav";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <MobileNav />
      <div className="flex-1">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-muted-foreground sm:block">
          IDX · Sample
        </span>
        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { avatarBox: "h-8 w-8" } }}
        />
      </div>
    </header>
  );
}
