"use client";
import { Chevron } from "@/components/icons";
import { answered, CREDIT_BANDS, INDUSTRIES, OPEN_QUESTIONS, SECTIONS, showsOwnerOccupied } from "@/lib/intake";
import { fmtMoney } from "@/lib/money";
import { debtRatio } from "@/lib/rules";
import { FUNDING_TARGETS, PURPOSES, type Intake, type Match } from "@/lib/types";
import { type ReactNode } from "react";

type Patch = (p: Partial<Intake>) => void;

const label = "truncate text-xs font-medium leading-4 text-muted";
const box = "flex h-9 min-h-9 min-w-0 flex-1 items-center rounded-sm border border-border bg-white px-[10px]";
const digits = (s: string) => s.replace(/[^\d]/g, "");

function Field({ title, children, grow = 1 }: { title: string; children: ReactNode; grow?: number }) {
  return (
    <label className="flex min-w-0 basis-[10rem] flex-col gap-[6px]" style={{ flexGrow: grow }} title={title}>
      <span className={label}>{title}</span>
      {children}
    </label>
  );
}

function MoneyInput({ value, onChange, suffix }: { value: number | null; onChange: (v: number | null) => void; suffix?: string }) {
  return (
    <span className={`${box} justify-between gap-2`}>
      <input
        inputMode="numeric"
        className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold leading-5 outline-none placeholder:font-normal placeholder:text-faint"
        placeholder="$—"
        value={value == null ? "" : fmtMoney(value)}
        onChange={(e) => onChange(digits(e.target.value) ? Number(digits(e.target.value)) : null)}
      />
      {suffix && <span className="text-xs text-muted">{suffix}</span>}
    </span>
  );
}

function NumInput({ value, onChange, suffix, max }: { value: number | null; onChange: (v: number | null) => void; suffix?: string; max?: number }) {
  return (
    <span className={`${box} justify-between gap-2`}>
      <input
        inputMode="numeric"
        className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold leading-5 outline-none placeholder:font-normal placeholder:text-faint"
        placeholder="—"
        value={value ?? ""}
        onChange={(e) => onChange(digits(e.target.value) ? Math.min(Number(digits(e.target.value)), max ?? Infinity) : null)}
      />
      {suffix && <span className="text-xs text-muted">{suffix}</span>}
    </span>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <span className={box}>
      <input type={type} className="min-w-0 flex-1 bg-transparent text-sm font-medium leading-5 outline-none placeholder:font-normal placeholder:text-faint" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </span>
  );
}

function Select<T extends string | number>({ value, onChange, options, placeholder }: { value: T | null; onChange: (v: T | null) => void; options: { value: T; label: string }[]; placeholder?: string }) {
  return (
    <span className={`${box} relative justify-between`}>
      <select
        className={`absolute inset-0 w-full appearance-none bg-transparent px-[10px] text-sm font-medium leading-5 outline-none ${value == null ? "text-faint" : ""}`}
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(options.find((x) => String(x.value) === e.target.value)?.value ?? null)}
      >
        <option value="">{placeholder ?? "Select…"}</option>
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none ml-auto">
        <Chevron />
      </span>
    </span>
  );
}

function Segmented<T extends string>({ value, onChange, options, open }: { value: T | null; onChange: (v: T) => void; options: T[]; open?: boolean }) {
  return (
    <span className={`flex h-9 rounded-sm border p-[3px] ${open ? "border-dashed border-amber bg-amber-soft" : "border-border bg-ground"}`}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`flex flex-1 items-center justify-center rounded-[4px] text-sm leading-4 ${value === o ? "border border-border bg-white font-semibold text-ink" : "font-medium text-muted"}`}
        >
          {o}
        </button>
      ))}
    </span>
  );
}

/** Percent stepper: − / + in steps of 5, direct typing allowed. */
function Stepper({ value, onChange, open, placeholder }: { value: number | null; onChange: (v: number | null) => void; open?: boolean; placeholder?: string }) {
  const step = (d: number) => onChange(Math.max(0, Math.min(100, (value ?? (d > 0 ? 0 : 5)) + d)));
  const btn = "flex h-full w-9 shrink-0 items-center justify-center text-base font-medium text-muted hover:text-ink disabled:opacity-30";
  return (
    <span className={`flex h-9 items-center overflow-clip rounded-sm border ${open ? "border-dashed border-amber bg-amber-soft" : "border-border bg-white"}`}>
      <button type="button" className={`${btn} border-r ${open ? "border-amber/40" : "border-border"}`} onClick={() => step(-5)} disabled={value == null || value <= 0} aria-label="Decrease">
        −
      </button>
      <input
        inputMode="numeric"
        className="min-w-0 flex-1 bg-transparent px-[10px] text-center text-[14px] font-semibold leading-5 outline-none placeholder:text-left placeholder:font-normal placeholder:text-muted"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(digits(e.target.value) ? Math.min(100, Number(digits(e.target.value))) : null)}
      />
      {value != null && <span className="pr-1 text-xs text-muted">%</span>}
      <button type="button" className={`${btn} border-l ${open ? "border-amber/40" : "border-border"}`} onClick={() => step(5)} disabled={value != null && value >= 100} aria-label="Increase">
        +
      </button>
    </span>
  );
}

function SectionHead({ title, done, total }: { title: string; done: number; total: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] font-bold leading-5">{title}</span>
      <span className={`text-xs font-medium leading-4 ${done < total ? "text-amber" : "text-muted"}`}>
        {done} of {total}
      </span>
    </div>
  );
}

function OpenQ({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center gap-[6px] text-xs leading-4">
        <span className="size-[6px] rounded-full bg-amber" />
        <span className="font-semibold">{title}</span>
        <span className="font-medium text-amber">· open</span>
      </div>
      {children}
      {hint && <span className="text-xs leading-4 text-muted">{hint}</span>}
    </div>
  );
}

export function IntakeRail({ intake, patch, reset, matches }: { intake: Intake; patch: Patch; reset: () => void; matches: Match[] }) {
  const sections = SECTIONS.map((s) => ({ ...s, fields: s.title === "Business profile" && showsOwnerOccupied(intake) ? [...s.fields, "ownerOccupied" as const] : s.fields }));
  const counts = sections.map((s) => ({ ...s, done: s.fields.filter((f) => answered(intake, f)).length }));
  const total = counts.reduce((a, s) => a + s.fields.length, 0);
  const done = counts.reduce((a, s) => a + s.done, 0);
  const open = OPEN_QUESTIONS.filter((f) => !answered(intake, f)).length;
  const dr = debtRatio(intake);
  const injectionPct = intake.ownerInjection && intake.requestedAmount ? (intake.ownerInjection / intake.requestedAmount) * 100 : null;

  /** First potential-tier program blocked by this gap → "Unlocks X". */
  const unlocks = (gap: keyof Intake) => {
    const m = matches.find((x) => x.tier === "potential" && x.rules.some((r) => r.status === "unknown" && r.gap === gap));
    if (!m) return undefined;
    const r = m.rules.find((x) => x.status === "unknown" && x.gap === gap)!;
    return `Unlocks ${m.program.lender} ${m.program.type} (${m.program.turnaroundDays}-day funding) — ${r.reason.toLowerCase()}.`;
  };
  const askFor = (gap: keyof Intake) => matches.flatMap((m) => m.rules).find((r) => r.status === "unknown" && r.gap === gap)?.ask;

  return (
    <aside className="flex w-full shrink-0 lg:w-rail flex-col self-start overflow-clip rounded-lg border border-border bg-white">
      <div className="flex flex-col gap-[10px] border-b border-border px-5 pb-4 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="label-caps text-muted">Call intake</span>
          <div className="flex items-center gap-2">
            {open > 0 && (
              <span className="flex items-center gap-[6px] rounded-full bg-amber-soft px-[10px] py-[3px] text-xs font-semibold leading-4">
                <span className="size-[6px] rounded-full bg-amber" />
                {open} open question{open > 1 ? "s" : ""}
              </span>
            )}
            <button type="button" onClick={reset} className="text-xs font-medium text-muted hover:text-ink">
              Clear
            </button>
          </div>
        </div>
        <input
          className="bg-transparent text-[20px] font-bold leading-6 tracking-[-0.01em] outline-none placeholder:font-semibold placeholder:text-faint"
          placeholder="Business name"
          value={intake.businessName}
          onChange={(e) => patch({ businessName: e.target.value })}
        />
        <div className="flex flex-wrap gap-[10px]">
          <Field title="Contact">
            <TextInput value={intake.contactName} onChange={(v) => patch({ contactName: v })} placeholder="Name" />
          </Field>
          <Field title="Customer email">
            <TextInput type="email" value={intake.customerEmail} onChange={(v) => patch({ customerEmail: v })} placeholder="name@business.com" />
          </Field>
        </div>
        <div className="flex items-center gap-[10px]">
          <div className="flex h-1 grow overflow-clip rounded-full bg-border">
            <div className="h-1 bg-blue transition-[width]" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <span className="text-xs font-medium leading-4 text-muted">
            {done} of {total} answered
          </span>
        </div>
      </div>

      {/* Loan need */}
      <section className="flex flex-col gap-3 border-b border-border px-5 py-4">
        <SectionHead title="Loan need" done={counts[0].done} total={counts[0].fields.length} />
        <div className="flex flex-wrap gap-[10px]">
          <Field title="Requested amount">
            <MoneyInput value={intake.requestedAmount} onChange={(v) => patch({ requestedAmount: v })} />
          </Field>
          <Field title="Loan purpose" grow={1.7}>
            <Select value={intake.purpose} onChange={(v) => patch({ purpose: v })} options={PURPOSES.map((p) => ({ value: p, label: p }))} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-[10px]">
          <Field title="Target funding">
            <Select
              value={intake.targetDays}
              onChange={(v) => patch({ targetDays: v })}
              options={FUNDING_TARGETS.filter((t) => t.days != null).map((t) => ({ value: t.days as number, label: t.label }))}
              placeholder="No deadline"
            />
          </Field>
          <Field title="Desired payment">
            <MoneyInput value={intake.desiredPayment} onChange={(v) => patch({ desiredPayment: v })} suffix="/mo" />
          </Field>
        </div>
        <div className="flex flex-wrap gap-[10px]">
          <Field title="Owner injection">
            <MoneyInput value={intake.ownerInjection} onChange={(v) => patch({ ownerInjection: v })} />
          </Field>
          <Field title="Available collateral">
            <TextInput value={intake.collateral} onChange={(v) => patch({ collateral: v })} placeholder="e.g. Kitchen equipment" />
          </Field>
        </div>
        {injectionPct != null && (
          <p className="text-xs leading-4 text-muted">
            Injection is {injectionPct.toFixed(1)}% of loan — {injectionPct >= 10 ? "clears every 10% owner-injection rule in the set." : "short of the 10% owner-injection rules."}
          </p>
        )}
      </section>

      {/* Business profile */}
      <section className="flex flex-col gap-3 border-b border-border px-5 py-4">
        <SectionHead title="Business profile" done={counts[1].done} total={counts[1].fields.length} />
        <div className="flex flex-wrap gap-[10px]">
          <Field title="Industry" grow={1.7}>
            <Select value={intake.industry} onChange={(v) => patch({ industry: v })} options={INDUSTRIES.map((i) => ({ value: i, label: i.replace("/", " / ") }))} />
          </Field>
          <Field title="Franchise">
            <Segmented value={intake.franchise} onChange={(v) => patch({ franchise: v })} options={["Yes", "No"]} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-[10px]">
          <Field title="Time in business">
            <span className="flex gap-[6px]">
              <NumInput value={intake.years} onChange={(v) => patch({ years: v })} suffix="yrs" max={99} />
              <NumInput value={intake.months} onChange={(v) => patch({ months: v })} suffix="mos" max={11} />
            </span>
          </Field>
          {showsOwnerOccupied(intake) && (
            <Field title="Owner-occupied property">
              <Segmented value={intake.ownerOccupied} onChange={(v) => patch({ ownerOccupied: v })} options={["Yes", "No"]} />
            </Field>
          )}
        </div>
        {intake.ownershipPct == null ? (
          <OpenQ title="Ownership % of applicant" hint={unlocks("ownershipPct")}>
            <Stepper value={null} onChange={(v) => patch({ ownershipPct: v })} open placeholder={`Ask: “${askFor("ownershipPct") ?? "What share of the business do you own?"}”`} />
          </OpenQ>
        ) : (
          <Field title="Ownership % of applicant">
            <Stepper value={intake.ownershipPct} onChange={(v) => patch({ ownershipPct: v })} />
          </Field>
        )}
      </section>

      {/* Credit & financials */}
      <section className="flex flex-col gap-3 px-5 py-4">
        <SectionHead title="Credit & financials" done={counts[2].done} total={counts[2].fields.length} />
        <div className="flex flex-wrap gap-[10px]">
          <Field title="Est. credit score">
            <Select value={intake.creditScore} onChange={(v) => patch({ creditScore: v })} options={CREDIT_BANDS} placeholder="Pick a range" />
          </Field>
          <Field title="Profit / cash flow (yr)">
            <MoneyInput value={intake.cashFlow} onChange={(v) => patch({ cashFlow: v })} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-[10px]">
          <Field title="Existing debt payments">
            <MoneyInput value={intake.debtPayments} onChange={(v) => patch({ debtPayments: v })} suffix="/mo" />
          </Field>
          <div className="flex min-w-0 basis-[10rem] grow flex-col gap-[6px]">
            <span className={label}>Debt ratio</span>
            <span className="flex h-9 items-center gap-2 rounded-sm bg-ground px-[10px] text-[14px] font-semibold leading-5" title="Existing debt payments ÷ monthly cash flow — never ask the customer for this">
              {dr == null ? <span className="font-normal text-faint">needs both</span> : isFinite(dr) ? dr.toFixed(2) : "∞"}
              <span className="text-xs font-normal text-muted">calculated</span>
            </span>
          </div>
        </div>
        {intake.bankruptcy == null ? (
          <OpenQ title="Bankruptcy in the last 7 years" hint={unlocks("bankruptcy")}>
            <Segmented value={intake.bankruptcy} onChange={(v) => patch({ bankruptcy: v })} options={["Yes", "No"]} open />
          </OpenQ>
        ) : (
          <Field title="Bankruptcy in the last 7 years">
            <Segmented value={intake.bankruptcy} onChange={(v) => patch({ bankruptcy: v })} options={["Yes", "No"]} />
          </Field>
        )}
      </section>
    </aside>
  );
}
