import { describe, expect, it } from "vitest";
import { interestAtPayment, payment, roundTo, solveMonths, totalInterest, yearsMonths } from "./money";

// Numbers from the Paper design: $180k, Frontier SBA Express 10.1–11.8% (mid 10.95%), 120 mo.
describe("money matches design", () => {
  const P = 180_000, apr = 10.95, n = 120;
  it("payment ~$2,470 range $2,390–$2,560", () => {
    expect(roundTo(payment(P, apr, n), 10)).toBe(2470);
    expect(roundTo(payment(P, 10.1, n), 10)).toBe(2390);
    expect(roundTo(payment(P, 11.8, n), 10)).toBe(2560);
  });
  it("total interest ~$116,900", () => expect(roundTo(totalInterest(P, apr, n), 100)).toBe(116_900));
  it("$2,900/mo → 7 yrs 8 mo, ~$86,800 interest, ~$30,200 saved", () => {
    expect(yearsMonths(solveMonths(P, apr, 2900))).toBe("7 yrs 8 mo");
    expect(roundTo(interestAtPayment(P, apr, 2900), 100)).toBe(86_800);
    expect(roundTo(totalInterest(P, apr, n) - interestAtPayment(P, apr, 2900), 100)).toBe(30_200);
  });
  it("$4,500/mo → 4 yrs 2 mo", () => expect(yearsMonths(solveMonths(P, apr, 4500))).toBe("4 yrs 2 mo"));
  it("Heritage 10.85%/84 → ~$3,070, ~$77,700", () => {
    expect(roundTo(payment(P, 10.85, 84), 10)).toBe(3070);
    expect(roundTo(totalInterest(P, 10.85, 84), 100)).toBe(77_700);
  });
  it("payment below interest never pays off", () => expect(solveMonths(P, apr, 100)).toBe(Infinity));
});
