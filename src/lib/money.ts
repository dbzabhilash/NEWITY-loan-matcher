const r = (apr: number) => apr / 1200;

export function payment(P: number, apr: number, n: number): number {
  const i = r(apr);
  return i === 0 ? P / n : (P * i) / (1 - Math.pow(1 + i, -n));
}

export function totalInterest(P: number, apr: number, n: number): number {
  return payment(P, apr, n) * n - P;
}

/** Months to pay off P at apr with monthly payment M. Infinity when M can't cover interest. */
export function solveMonths(P: number, apr: number, M: number): number {
  const i = r(apr);
  if (i === 0) return P / M;
  if (M <= P * i) return Infinity;
  return -Math.log(1 - (i * P) / M) / Math.log(1 + i);
}

export function interestAtPayment(P: number, apr: number, M: number): number {
  return M * solveMonths(P, apr, M) - P;
}

export const roundTo = (x: number, step: number) => Math.round(x / step) * step;

export const fmtMoney = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
export const fmtK = (x: number) =>
  x >= 1_000_000 ? `$${(x / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}M` : `$${Math.round(x / 1000)}k`;
export const fmtPct = (x: number) => `${x.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
export const fmtRate = (lo: number, hi: number) => `${fmtPct(lo).slice(0, -1)}–${fmtPct(hi)}`;

/** ceil(months) → "7 yrs 8 mo"; whole years → "10 yrs". */
export function yearsMonths(m: number): string {
  if (!isFinite(m)) return "never";
  const k = Math.ceil(Math.round(m * 100) / 100);
  const y = Math.floor(k / 12);
  const mo = k % 12;
  if (y === 0) return `${mo} mo`;
  if (mo === 0) return `${y} yrs`;
  return `${y} yrs ${mo} mo`;
}

export function termLabel(months: number): string {
  return months % 12 === 0 ? `Up to ${months / 12} yrs` : `Up to ${yearsMonths(months)}`;
}

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
export function fmtDateShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
