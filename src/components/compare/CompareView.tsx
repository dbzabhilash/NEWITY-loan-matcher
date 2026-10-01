"use client";
import { Chevron, Lock, Search, Tick, Warn } from "@/components/icons";
import { compareSayThis, comparisonMail } from "@/lib/copy";
import { MailLink } from "@/components/MailLink";
import { failText, rulesLabel, TierPill } from "@/components/RulesPill";
import { fmtDate, fmtK, fmtMoney, roundTo, termLabel, yearsMonths } from "@/lib/money";
import { blockReason } from "@/lib/rules";
import type { Intake, Match, Tier } from "@/lib/types";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Affordability } from "./Affordability";

const Badge = ({ children }: { children: ReactNode }) => (
  <span className="flex h-[18px] items-center rounded-[4px] bg-green px-[6px] text-[10px] font-bold leading-3 tracking-wide">{children}</span>
);

function Row({ label, sub, cells, highlight, onSelect }: { label: string; sub?: string; cells: ReactNode[]; highlight: number; onSelect: (n: number) => void }) {
  return (
    <div className="flex border-b border-border">
      <div className="flex w-[160px] shrink-0 flex-col justify-center gap-[2px] border-r border-border px-5 py-3">
        <span className="text-sm font-medium leading-[18px] text-muted">{label}</span>
        {sub && <span className="text-[11px] leading-[14px] text-muted">{sub}</span>}
      </div>
      {cells.map((c, n) => (
        <div key={n} onClick={() => onSelect(n)} className={`flex min-w-0 basis-0 grow flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 ${n < cells.length - 1 ? "border-r border-border" : ""} ${c == null ? "" : highlight === n ? "cursor-pointer bg-blue-soft" : "cursor-pointer hover:bg-ground/60"}`}>
          {c ?? <span className="text-sm text-faint">{c === undefined ? "" : "—"}</span>}
        </div>
      ))}
    </div>
  );
}

const V = ({ children, blue, big }: { children: ReactNode; blue?: boolean; big?: boolean }) => (
  <span className={`${big ? "text-lg font-bold leading-[22px] tracking-[-0.01em]" : "text-base font-semibold leading-5"} ${blue ? "text-blue" : ""}`}>{children}</span>
);
const S = ({ children }: { children: ReactNode }) => <span className="text-xs leading-4 text-muted">{children}</span>;

function Picker({ all, current, others, onPick, onRemove, slot, selected, onSelect }: { all: Match[]; current: Match | null; others: (Match | null)[]; onPick: (m: Match) => void; onRemove?: () => void; slot: number; selected: boolean; onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [more, setMore] = useState<Record<string, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const groups = useMemo(() => {
    const f = q.toLowerCase();
    const hit = (m: Match) => !f || `${m.program.lender} ${m.program.type}`.toLowerCase().includes(f);
    const by = (t: Tier) => all.filter((m) => m.tier === t && hit(m));
    return [
      { t: "strong" as Tier, label: "Strong fit", ms: by("strong") },
      { t: "potential" as Tier, label: "Potential fit", ms: by("potential") },
      { t: "poor" as Tier, label: "Poor fit", ms: by("poor") },
      { t: "ineligible" as Tier, label: "Ineligible", ms: by("ineligible") },
    ];
  }, [all, q]);

  const inCol = (m: Match) => others.findIndex((o) => o?.program.id === m.program.id);

  return (
    <div ref={ref} className="relative">
      <div className={`flex min-h-[46px] w-full items-stretch rounded-[8px] ${!current ? "border border-dashed border-border bg-white" : selected ? "border-2 border-blue bg-blue-soft" : "border border-border bg-white"}`}>
        <button type="button" onClick={current ? onSelect : () => setOpen(true)} title={current ? "Select this program for affordability" : "Add a program"} className="flex min-w-0 grow items-center gap-2 py-1 pl-2 text-left">
          <span className={`flex size-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-3 ${!current ? "border border-dashed border-border text-muted" : selected ? "bg-blue text-white" : "border border-border bg-ground"}`}>{current ? slot + 1 : "+"}</span>
          <span className="flex min-w-0 grow flex-col gap-px">
            <span className={`line-clamp-2 text-sm leading-4 ${current ? "font-bold" : "font-medium text-muted"}`}>{current?.program.lender ?? "Add a program"}</span>
            <span className="truncate text-xs font-semibold leading-[14px] text-blue">{current?.program.type ?? " "}</span>
          </span>
        </button>
        <button type="button" onClick={() => setOpen((o) => !o)} title={current ? "Swap or remove" : "Add a program"} aria-label="Swap program" className="flex w-7 shrink-0 items-center justify-center rounded-r-[8px] hover:bg-ground/70">
          <Chevron up={open} />
        </button>
      </div>
      {open && (
        <div className={`absolute top-[52px] z-20 flex max-h-[460px] w-[350px] flex-col max-xl:fixed max-xl:inset-x-3 max-xl:top-24 max-xl:mx-auto max-xl:w-auto max-xl:max-w-[420px] overflow-clip rounded-md border border-border bg-white shadow-[0_12px_32px_#0C152124] ${slot >= 2 ? "right-0" : "left-0"}`}>
          <label className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
            <Search />
            <input autoFocus className="min-w-0 flex-1 bg-transparent text-sm leading-4 outline-none placeholder:text-muted" placeholder={`Search ${all.length} programs`} value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="overflow-y-auto">
            {current && onRemove && (
              <button
                type="button"
                onClick={() => {
                  onRemove();
                  setOpen(false);
                }}
                className="flex h-9 w-full items-center gap-2 border-b border-border px-3 text-left text-sm font-medium text-red hover:bg-red-soft"
              >
                × Remove {current.program.lender} from compare
              </button>
            )}
            {groups.map((g, gi) => {
              if (!g.ms.length) return null;
              const shown = more[g.t] || q ? g.ms : g.ms.slice(0, 4);
              const inel = g.t === "ineligible";
              return (
                <div key={g.t} className={gi ? "border-t border-border" : ""}>
                  <div className="flex items-center gap-[6px] px-3 pb-1 pt-2 text-[11px] font-semibold uppercase leading-[14px] tracking-wide text-muted">
                    {inel && <Lock />}
                    {g.label} · {g.ms.length}
                    {inel && " — can't be compared"}
                  </div>
                  {shown.map((m) => {
                    const isCur = m.program.id === current?.program.id;
                    const col = inCol(m);
                    const disabled = inel || (col >= 0 && !isCur);
                    return (
                      <button
                        key={m.program.id}
                        type="button"
                        disabled={disabled}
                        title={inel ? failText(m) : undefined}
                        onClick={() => {
                          onPick(m);
                          setOpen(false);
                          setQ("");
                        }}
                        className={`flex h-[34px] w-full items-center gap-2 pr-3 text-left ${isCur ? "bg-blue-soft pl-3" : "pl-[34px]"} ${disabled ? "cursor-not-allowed" : "hover:bg-ground"}`}
                      >
                        {isCur && <Tick />}
                        <span className={`truncate text-sm leading-4 ${isCur ? "font-semibold" : "font-medium"} ${disabled ? "text-faint" : ""} ${inel ? "line-through" : ""}`}>{m.program.lender}</span>
                        <span className={`truncate text-xs leading-4 ${inel ? "text-red" : g.t === "potential" ? "text-amber" : disabled ? "text-faint" : "text-muted"}`}>
                          {inel ? blockReason(m) : col >= 0 && !isCur ? `in column ${col + 1}` : g.t === "strong" ? m.program.type : g.t === "potential" ? blockReason(m) : `${m.program.type} · ${m.program.turnaroundDays} days`}
                        </span>
                      </button>
                    );
                  })}
                  {!more[g.t] && !q && g.ms.length > 4 && (
                    <button type="button" onClick={() => setMore((s) => ({ ...s, [g.t]: true }))} className="flex h-7 w-full items-center pl-[34px] text-xs font-medium leading-4 text-blue">
                      Show {g.ms.length - 4} more
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function CompareView({ all, cols, setCol, removeCol, limit, intake, oldest, onBrowse }: { all: Match[]; cols: Match[]; setCol: (n: number, m: Match) => void; removeCol: (id: number) => void; limit: number; intake: Intake; oldest: string; onBrowse: () => void }) {
  const ok = cols;
  // One trailing empty slot while there's room, so the rep can add straight from the table.
  const slots: (Match | null)[] = cols.length < limit ? [...cols, null] : cols;
  const min = <T,>(f: (m: Match) => T | null) => {
    const vals = ok.map(f).filter((v): v is T => v != null) as unknown as number[];
    return vals.length > 1 ? Math.min(...vals) : null;
  };
  const lowRate = min((m) => m.program.rateMax);
  const lowPay = min((m) => m.payment);
  const lowInt = min((m) => m.totalInterest);
  const fast = min((m) => m.program.turnaroundDays);
  const [affordRaw, setAfford] = useState(0);
  const afford = Math.min(affordRaw, Math.max(0, cols.length - 1));
  const selected = cols[afford] ?? null;

  const cell = (f: (m: Match) => ReactNode) => slots.map((c) => (c ? f(c) : undefined));
  const select = (n: number) => cols[n] && setAfford(n);

  if (cols.length === 0)
    return (
      <section className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-white px-6 py-12 text-center">
        <span className="text-lg font-bold">Nothing to compare yet</span>
        <span className="max-w-[420px] text-sm leading-5 text-muted">Add up to {limit} eligible programs from the ranked list with “Add to compare”, or pick one here.</span>
        <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <div className="w-full max-w-[300px] text-left">
            <Picker all={all} current={null} others={[]} onPick={(m) => setCol(0, m)} slot={0} selected={false} onSelect={() => {}} />
          </div>
          <button type="button" onClick={onBrowse} className="flex h-[38px] items-center rounded-full border border-ink px-4 text-[14px] font-medium leading-4">
            Browse ranked list
          </button>
        </div>
      </section>
    );

  return (
    <>
      <section className="overflow-visible rounded-lg border border-border bg-white">
        <div className="overflow-x-auto"><div className="min-w-[760px]">
        <div className="flex rounded-t-lg border-b border-border bg-ground">
          <div className="flex w-[160px] shrink-0 flex-col justify-center gap-1 border-r border-border px-5 py-4">
            <span className="text-base font-bold leading-5">Side by side</span>
            <span className="text-xs leading-4 text-muted">Numbers the customer hears first</span>
          </div>
          {slots.map((c, n) => (
            <div key={n} className={`flex min-w-0 basis-0 grow flex-col gap-2 px-3 py-[14px] ${n < slots.length - 1 ? "border-r border-border" : ""} ${c && afford === n ? "bg-blue-soft/60" : ""}`}>
              <Picker all={all} current={c} others={slots} onPick={(m) => setCol(n, m)} onRemove={c ? () => removeCol(c.program.id) : undefined} slot={n} selected={!!c && afford === n} onSelect={() => setAfford(n)} />
              {c ? (
                <span className="flex items-center gap-[6px]">
                  <TierPill m={c} size="xs" align="left" />
                  <span className="text-xs leading-4 text-muted">{afford === n ? `${c.passed} of ${c.total} · selected` : rulesLabel(c)}</span>
                </span>
              ) : (
                <span className="text-xs leading-4 text-faint">{cols.length} of {limit} slots used</span>
              )}
            </div>
          ))}
        </div>
        <Row highlight={afford} onSelect={select} label="Loan range" cells={cell((m) => <V>{fmtK(m.program.minAmount)}–{fmtK(m.program.maxAmount)}</V>)} />
        <Row highlight={afford} onSelect={select} label="Est. rate" cells={cell((m) => (<><V>{m.program.rateMin}–{m.program.rateMax}%</V>{m.program.rateMax === lowRate && <Badge>Lowest</Badge>}</>))} />
        <Row highlight={afford} onSelect={select}
          label="Est. monthly payment"
          cells={cell((m) =>
            m.payment ? (
              <>
                <V big blue={m.payment === lowPay}>~{fmtMoney(roundTo(m.payment, 10))}</V>
                <S>{fmtMoney(roundTo(m.paymentLow!, 10))}–{fmtMoney(roundTo(m.paymentHigh!, 10))}</S>
                {m.payment === lowPay && <Badge>Lowest</Badge>}
              </>
            ) : null,
          )}
        />
        <Row highlight={afford} onSelect={select}
          label="Total interest (est.)"
          sub="at minimum payment, mid rate"
          cells={cell((m) =>
            m.totalInterest != null ? (
              <>
                <V>~{fmtMoney(roundTo(m.totalInterest, 100))}</V>
                <S>over {yearsMonths(m.program.maxTerm)}</S>
                {m.totalInterest === lowInt && <Badge>Lowest</Badge>}
              </>
            ) : null,
          )}
        />
        <Row highlight={afford} onSelect={select} label="Term" cells={cell((m) => (<><V>{termLabel(m.program.maxTerm)}</V><S>{m.program.maxTerm} mo</S></>))} />
        <Row highlight={afford} onSelect={select} label="Funding time" cells={cell((m) => (<><V>~{m.program.turnaroundDays} days</V>{m.program.turnaroundDays === fast && <Badge>Fastest</Badge>}</>))} />
        <Row highlight={afford} onSelect={select} label="Cash injection" cells={cell((m) => <V>{m.program.special?.key === "injection_10" ? "10% owner injection" : "None required"}</V>)} />
        <Row highlight={afford} onSelect={select} label="Collateral" cells={cell((m) => (<><V>{m.program.collateral === "Yes" ? "Required" : m.program.collateral === "No" ? "Not required" : "Varies"}</V>{m.program.collateral === "Varies" && <S>case by case</S>}</>))} />
        <Row highlight={afford} onSelect={select}
          label="Special conditions"
          cells={cell((m) =>
            m.program.special ? (
              <>
                <Warn size={14} />
                <span className="text-[14px] font-medium leading-5">{m.program.special.text.replace("Cannot be used for refinancing", "No refinancing")}</span>
              </>
            ) : (
              <span className="text-[14px] leading-5 text-muted">None listed</span>
            ),
          )}
        />
        <Row highlight={afford} onSelect={select}
          label="Rate sheet updated"
          cells={cell((m) => (
            <>
              <span className={`text-[14px] leading-5 ${m.program.lastUpdated === oldest ? "font-semibold text-amber" : "font-medium"}`}>{fmtDate(m.program.lastUpdated)}</span>
              {m.program.lastUpdated === oldest && <S>oldest in set</S>}
            </>
          ))}
        />
        <div className="flex border-b border-border bg-ground">
          <div className="flex w-[160px] shrink-0 items-center gap-2 border-r border-border px-5 py-[10px]">
            <span className="flex h-5 items-center rounded-[4px] bg-navy px-[7px] text-[10px] font-bold leading-3 tracking-[0.08em] text-white">REP ONLY</span>
            <span className="text-xs font-medium leading-4 text-muted">Thresholds</span>
          </div>
          {slots.map((c, n) => (
            <div key={n} className={`flex min-w-0 basis-0 grow items-center px-4 py-[10px] text-xs leading-4 text-muted ${n < slots.length - 1 ? "border-r border-border" : ""} ${c && afford === n ? "bg-blue-soft/60" : ""}`}>
              {c && `SBA ${c.program.guaranteePct}% · credit ≥ ${c.program.minCredit} · ${c.program.minYears} yr${c.program.minYears === 1 ? "" : "s"}${c.program.maxDebtRatio != null ? ` · ratio ≤ ${c.program.maxDebtRatio}` : ""}`}
            </div>
          ))}
        </div>
        </div></div>
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex min-w-0 grow flex-col gap-1">
            <span className="label-caps text-blue">Say this</span>
            <p className="text-[14px] leading-5">{compareSayThis(ok)}</p>
          </div>
          <MailLink {...comparisonMail(ok, intake)} log={{ kind: ok.length > 1 ? "comparison" : "proposal", customerName: intake.contactName, customerEmail: intake.customerEmail, programIds: ok.map((m) => m.program.id) }} disabledReason={!intake.customerEmail ? "Add the customer's email in the intake rail" : !ok.length ? "Pick a program first" : undefined} className="shrink-0">
            Send comparison to customer
          </MailLink>
        </div>
      </section>
      {selected && intake.requestedAmount && <Affordability cols={ok} selected={selected} setSelected={(m) => setAfford(cols.findIndex((c) => c.program.id === m.program.id))} intake={intake} />}
    </>
  );
}
