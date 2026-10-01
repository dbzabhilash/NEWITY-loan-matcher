import type { User } from "@/db/auth";
import { initials } from "@/lib/copy";
import { fmtDate } from "@/lib/money";
import type { Snapshot } from "@/lib/types";
import { LogoutButton } from "./LogoutButton";

export function TopBar({ snapshot, user }: { snapshot: Snapshot; user: User }) {
  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border bg-white px-4 py-2 sm:px-6">
      <div className="flex items-center gap-[14px]">
        <span className="text-[20px] font-[800] leading-6 tracking-[0.08em] text-blue">NEWITY</span>
        <span className="h-5 w-px bg-border" />
        <span className="text-base font-medium leading-5">Loan Matcher</span>
      </div>
      <div className="flex items-center gap-4 text-sm leading-4 text-muted">
        <span className="hidden md:inline">
          Lender snapshot {fmtDate(snapshot.date)} · {snapshot.programCount} programs · {snapshot.lenderCount} lenders
        </span>
        <span title={user.name} className="flex size-8 items-center justify-center rounded-full bg-navy text-xs font-semibold tracking-[0.04em] text-white">
          {initials(user.name)}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
