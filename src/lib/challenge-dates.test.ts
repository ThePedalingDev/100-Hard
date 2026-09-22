import { describe, expect, it } from "vitest";
import {
  challengeMilestones,
  clampToChallengeRange,
  daysRemainingFor,
  isChallengeComplete,
  validateAdminChallengeRange,
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

describe("validateAdminChallengeRange", () => {
  it("allows a start date in the past", () => {
    const result = validateAdminChallengeRange("2026-01-01", "2026-12-31");
    expect(result.ok).toBe(true);
  });

  it("still rejects end on start day", () => {
    const result = validateAdminChallengeRange("2026-09-22", "2026-09-22");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("END_NOT_AFTER_START");
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

describe("challengeMilestones", () => {
  it("marks start, 25-day intervals, and end on a 100-day challenge", () => {
    const marks = challengeMilestones("2026-09-22", "2026-12-30");
    expect(marks.map((item) => `${item.kind}:${item.day}:${item.label}`)).toEqual([
      "start:1:Start",
      "interval:25:Day 25",
      "interval:50:Day 50",
      "interval:75:Day 75",
      "end:100:End",
    ]);
  });

  it("keeps the last interval off the end day", () => {
    const marks = challengeMilestones("2026-09-22", "2026-12-31");
    const lastInterval = marks.filter((item) => item.kind === "interval").at(-1);
    expect(lastInterval?.day).toBe(100);
    expect(marks.at(-1)).toMatchObject({ kind: "end", label: "End" });
  });
});
