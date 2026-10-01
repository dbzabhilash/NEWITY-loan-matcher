"use client";
import { Chevron } from "@/components/icons";
import { fmtMoney, interestAtPayment, payment, roundTo, solveMonths, totalInterest, yearsMonths } from "@/lib/money";
import type { Intake, Match } from "@/lib/types";
import { useMemo, useState } from "react";

export function Affordability({ cols, selected, setSelected, intake }: { cols: Match[]; selected: Match; setSelected: (m: Match) => void; intake: Intake }) {
  const P = intake.requestedAmount!;
  const p = selected.program;
  const apr = p.rateMid;
  const minPay = payment(P, apr, p.maxTerm);
  const lo = Math.ceil(minPay / 10) * 10;
  const hi = Math.ceil((1.8 * lo) / 500) * 500;
  // Slider value is keyed to the program so switching columns resets to that program's minimum.
  const [payFor, setPayFor] = useState<{ id: number; pay: number } | null>(null);
  const pay = payFor?.id === p.id ? Math.min(Math.max(payFor.pay, lo), hi) : lo;
  const setPay = (v: number) => setPayFor({ id: p.id, pay: v });
  const [open, setOpen] = useState(false);

  const r = useMemo(() => {
    const months = solveMonths(P, apr, pay);
    const ti = interestAtPayment(P, apr, pay);
    const base = totalInterest(P, apr, p.maxTerm);
    return { months, ti, saved: base - ti, base, sooner: p.maxTerm - Math.ceil(Math.round(months * 100) / 100) };
  }, [P, apr, pay, p.maxTerm]);

  const target = intake.desiredPayment;
  const delta = target != null ? pay - target : null;
  const pct = ((pay - lo) / (hi - lo)) * 100;

  return (
    <section className="overflow-clip rounded-lg border border-border bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 sm:px-6 pb-1 pt-5">
        <div className="flex flex-col gap-1">
          <span className="label-caps text-blue">Affordability · selected program</span>
          <h2 className="text-[22px] font-bold leading-7 tracking-tight">What if the payment changes?</h2>
          <p className="text-sm leading-[18px] text-muted">
            Drag the payment. Rate held at the {apr.toFixed(2).replace(/\.?0+$/, "")}% midpoint on {fmtMoney(P)} — an estimate, not a quote.
          </p>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setOpen((o) => !o)} className="flex h-10 items-center gap-[10px] rounded-[8px] border border-border bg-white pl-[10px] pr-3 text-left">
            <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-blue text-[11px] font-bold leading-3 text-white">{cols.indexOf(selected) + 1}</span>
            <span className="flex flex-col gap-px">
              <span className="text-sm font-bold leading-4">{p.lender}</span>
              <span className="text-xs font-semibold leading-[14px] text-blue">
                {p.type} · {p.rateMin}–{p.rateMax}%
              </span>
            </span>
            <Chevron up={open} />
          </button>
          {open && (
            <div className="absolute left-0 top-11 z-20 flex w-[300px] max-w-[calc(100vw-2rem)] sm:left-auto sm:right-0 flex-col overflow-clip rounded-md border border-border bg-white py-1 shadow-[0_12px_32px_#0C152124]">
              {cols.map((m, n) => (
                <button
                  key={m.program.id}
                  type="button"
                  onClick={() => {
                    setSelected(m);
                    setOpen(false);
                  }}
                  className={`flex h-9 items-center gap-2 px-3 text-left text-sm hover:bg-ground ${m === selected ? "bg-blue-soft font-semibold" : "font-medium"}`}
                >
                  <span className="text-xs text-muted">{n + 1}</span>
                  {m.program.lender}
                  <span className="text-xs text-muted">{m.program.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 px-4 sm:px-6 pb-5 pt-4 xl:flex-row xl:gap-6">
        <div className="flex min-w-0 basis-0 grow flex-col gap-[14px] rounded-[12px] bg-ground px-[18px] py-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="flex flex-col gap-[2px]">
              <span className="text-xs font-medium leading-4 text-muted">Monthly payment</span>
              <span className="flex items-baseline gap-[6px]">
                <span className="text-[28px] font-bold leading-10 sm:text-[34px] tracking-[-0.03em] text-blue tabular-nums">{fmtMoney(pay)}</span>
                <span className="text-[14px] font-medium leading-5 text-muted">/mo</span>
              </span>
            </div>
            {target != null && (
              <div className="flex flex-col items-end gap-[2px]">
                <span className="text-xs font-medium leading-4 text-muted">Customer&apos;s target</span>
                <span className="text-[14px] font-semibold leading-5">
                  {fmtMoney(target)} · {delta === 0 ? "right on target" : `this is ${fmtMoney(Math.abs(delta!))} ${delta! > 0 ? "above" : "below"}`}
                </span>
              </div>
            )}
          </div>
          <input type="range" min={lo} max={hi} step={10} value={pay} onChange={(e) => setPay(Number(e.target.value))} style={{ ["--fill" as string]: `${pct}%` }} aria-label="Monthly payment" />
          <div className="flex items-center justify-between text-xs font-medium leading-4 text-muted">
            <span>
              {fmtMoney(Math.round(minPay))} · the {yearsMonths(p.maxTerm).replace(" yrs", "-year")} schedule
            </span>
            <span>
              {fmtMoney(hi)} · paid off in {yearsMonths(solveMonths(P, apr, hi))}
            </span>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-[10px] xl:w-[420px]">
          <div className="flex gap-[10px]">
            <Tile label="Paid off in" value={yearsMonths(r.months)} sub={r.sooner > 0 ? `${yearsMonths(r.sooner)} sooner` : "full schedule"} />
            <Tile label="Total interest" value={`~${fmtMoney(roundTo(r.ti, 100))}`} sub="estimated, mid rate" />
            <Tile label="Interest saved" value={`~${fmtMoney(roundTo(Math.max(0, r.saved), 100))}`} sub={`vs ${yearsMonths(p.maxTerm).replace(" yrs", "-yr")} schedule`} green />
          </div>
          <div className="flex items-center gap-2 rounded-[8px] bg-ground px-3 py-[10px] text-xs leading-4">
            <span className="font-semibold">At the minimum</span>
            <span className="text-muted">
              {fmtMoney(Math.round(minPay))}/mo · {yearsMonths(p.maxTerm)} · ~{fmtMoney(roundTo(r.base, 100))} total interest
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const Tile = ({ label, value, sub, green }: { label: string; value: string; sub: string; green?: boolean }) => (
  <div className={`flex min-w-0 basis-0 grow flex-col gap-1 rounded-md border px-3 py-[14px] ${green ? "border-green-line bg-green-soft" : "border-border"}`}>
    <span className="text-xs font-medium leading-4 text-muted">{label}</span>
    <span className="truncate text-[20px] font-bold leading-[26px] tracking-tight tabular-nums">{value}</span>
    <span className="truncate text-xs leading-4 text-muted">{sub}</span>
  </div>
);
