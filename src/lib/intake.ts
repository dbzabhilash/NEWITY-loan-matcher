"use client";
import { useSyncExternalStore } from "react";
import type { Intake } from "./types";

export const EMPTY_INTAKE: Intake = {
  businessName: "",
  contactName: "",
  customerEmail: "",
  requestedAmount: null,
  purpose: null,
  targetDays: null,
  desiredPayment: null,
  ownerInjection: null,
  industry: null,
  years: null,
  months: null,
  franchise: null,
  ownerOccupied: null,
  ownershipPct: null,
  creditScore: null,
  cashFlow: null,
  debtPayments: null,
  collateral: "",
  bankruptcy: null,
};

/** Sample call loaded on first visit (and until the rep hits Clear) so the tool is never an empty form. Ownership % and bankruptcy stay open on purpose. */
export const DEFAULT_INTAKE: Intake = {
  ...EMPTY_INTAKE,
  businessName: "Rosa Tacos",
  contactName: "Rosa Delgado",
  customerEmail: "rosa@rosatacos.example",
  requestedAmount: 150000,
  purpose: "Equipment + working capital",
  targetDays: 30,
  desiredPayment: 2200,
  ownerInjection: 15000,
  industry: "Restaurant/Food Service",
  years: 4,
  months: 2,
  franchise: "No",
  creditScore: 700,
  cashFlow: 120000,
  debtPayments: 800,
  collateral: "Commercial kitchen equipment ~$45k",
};

// Tiny external store: React reads it via useSyncExternalStore. Kept in memory only, so every refresh restores the sample call; only Clear empties it.
let current: Intake = DEFAULT_INTAKE;
const listeners = new Set<() => void>();
const read = () => current;
function write(next: Intake) {
  current = next;
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useIntake(): [Intake, (patch: Partial<Intake>) => void, () => void] {
  const intake = useSyncExternalStore(subscribe, read, () => DEFAULT_INTAKE);
  return [intake, (patch) => write({ ...read(), ...patch }), () => write(EMPTY_INTAKE)];
}

/** Section field lists drive the "n of m answered" counters. */
export const SECTIONS: { title: string; fields: (keyof Intake)[] }[] = [
  { title: "Loan need", fields: ["requestedAmount", "purpose", "targetDays", "desiredPayment", "ownerInjection"] },
  { title: "Business profile", fields: ["industry", "years", "franchise", "ownershipPct"] },
  { title: "Credit & financials", fields: ["creditScore", "cashFlow", "debtPayments", "bankruptcy"] },
];
/** Owner-occupancy only matters for real-estate purchases; it joins the Business profile count when shown. */
export const showsOwnerOccupied = (i: Intake) => i.purpose === "Real estate purchase";

export const answered = (i: Intake, f: keyof Intake) => {
  const v = i[f];
  return v !== null && v !== "";
};

export const OPEN_QUESTIONS: (keyof Intake)[] = ["ownershipPct", "bankruptcy"];

/** Credit bands; the stored value is the band's lower bound so a band only clears a lender floor when all of it does. */
export const CREDIT_BANDS: { value: number; label: string }[] = [
  { value: 740, label: "740+ · Excellent" },
  { value: 720, label: "720–739 · Very good" },
  { value: 700, label: "700–719 · Good" },
  { value: 680, label: "680–699 · Good" },
  { value: 660, label: "660–679 · Fair+" },
  { value: 650, label: "650–659 · Fair" },
  { value: 640, label: "640–649 · Fair" },
  { value: 620, label: "620–639 · Fair" },
  { value: 600, label: "600–619 · Poor" },
  { value: 500, label: "Below 600" },
];

export const INDUSTRIES = ["Restaurant/Food Service", "Construction", "Manufacturing", "Healthcare", "Professional Services", "Retail", "Other"];

