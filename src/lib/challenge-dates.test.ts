import { describe, expect, it } from "vitest";
import {
  clampToChallengeRange,
  daysRemainingFor,
  isChallengeComplete,
  validateChallengeRange,
} from "./challenge-dates";

describe("validateChallengeRange", () => {
  it("rejects start before today", () => {
    const result = validateChallengeRange("2026-01-01", "2026-12-31", "2026-09-22");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("START_IN_PAST");
  });

  it("rejects end on start day", () => {
    const result = validateChallengeRange("2026-09-22", "2026-09-22", "2026-09-22");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("END_NOT_AFTER_START");
  });

  it("accepts start today and later end", () => {
    const result = validateChallengeRange("2026-09-22", "2026-12-31", "2026-09-22");
    expect(result.ok).toBe(true);
  });
});

describe("range helpers", () => {
  it("reports complete after end", () => {
    expect(isChallengeComplete("2026-12-31", "2027-01-01")).toBe(true);
  });

  it("clamps iso into range", () => {
    expect(clampToChallengeRange("2026-01-01", "2026-09-22", "2026-12-31")).toBe("2026-09-22");
  });

  it("counts remaining inclusive through end", () => {
    expect(daysRemainingFor("2026-09-22", "2026-09-24", "2026-09-23")).toBe(2);
  });
});
