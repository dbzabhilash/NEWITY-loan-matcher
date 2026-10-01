export type YesNo = "Yes" | "No";
export type Collateral = "Yes" | "No" | "Varies";

export const PURPOSES = [
  "Equipment + working capital",
  "Working capital",
  "Equipment",
  "Real estate purchase",
  "Refinance",
  "Business acquisition",
] as const;
export type Purpose = (typeof PURPOSES)[number];

export const FUNDING_TARGETS = [
  { label: "Within 14 days", days: 14 },
  { label: "Within 30 days", days: 30 },
  { label: "Within 60 days", days: 60 },
  { label: "Within 90 days", days: 90 },
  { label: "No deadline", days: null },
] as const;

export interface Intake {
  businessName: string;
  contactName: string;
  customerEmail: string;
  requestedAmount: number | null;
  purpose: Purpose | null;
  targetDays: number | null;
  desiredPayment: number | null;
  ownerInjection: number | null;
  industry: string | null;
  years: number | null;
  months: number | null;
  franchise: YesNo | null;
  ownerOccupied: YesNo | null;
  ownershipPct: number | null;
  creditScore: number | null;
  cashFlow: number | null;
  debtPayments: number | null;
  collateral: string;
  bankruptcy: YesNo | null;
}

export type SpecialKey =
  | "six_months"
  | "injection_10"
  | "positive_cash_flow"
  | "franchise_sba"
  | "owner_occupied_only"
  | "real_estate_only"
  | "equity_20"
  | "no_bankruptcy"
  | "business_plan_startup"
  | "no_refi";

/** One lender program, flattened from the normalized tables. */
export interface Program {
  id: number;
  lender: string;
  type: string;
  typeBlurb: string;
  minAmount: number;
  maxAmount: number;
  minCredit: number;
  creditTier: string;
  minYears: number;
  rateMin: number;
  rateMax: number;
  rateMid: number;
  maxTerm: number;
  guaranteePct: number;
  industry: string | null; // null = All
  collateral: Collateral;
  maxDebtRatio: number | null; // null = no rule listed
  turnaroundDays: number;
  special: { text: string; key: SpecialKey } | null;
  lastUpdated: string; // ISO date
}

export interface Snapshot {
  date: string;
  importedAt: string;
  programCount: number;
  lenderCount: number;
  oldestRateSheet: string;
}

export type RuleId =
  | "amount"
  | "industry"
  | "credit"
  | "years"
  | "debt_ratio"
  | "turnaround"
  | "collateral"
  | "special";
export type RuleStatus = "pass" | "fail" | "unknown" | "watch" | "n/a";

export interface RuleResult {
  id: RuleId;
  status: RuleStatus;
  hard: boolean;
  reason: string;
  gap?: keyof Intake;
  ask?: string;
}

export type Tier = "strong" | "potential" | "poor" | "ineligible";
export type Bucket = "wrong industry" | "property-only" | "amount / credit" | "too slow" | "other";
export type Preset = "best" | "rate" | "speed" | "payment" | "collateral";

export interface Match {
  program: Program;
  tier: Tier;
  score: number;
  rules: RuleResult[];
  passed: number;
  total: number;
  payment: number | null;
  paymentLow: number | null;
  paymentHigh: number | null;
  totalInterest: number | null;
  bucket: Bucket | null;
}
