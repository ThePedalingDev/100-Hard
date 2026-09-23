import { describe, expect, it } from "vitest";
import { checkinDisplayStatus, currentStreak, statsDayStatus } from "@/lib/scoring";

describe("statsDayStatus", () => {
  it("counts an open perfect day as perfect", () => {
    expect(
      statsDayStatus({
        status: "pending",
        finalized_at: null,
        diet_complete: true,
        workout_1_complete: true,
        workout_2_complete: true,
        outdoor_complete: true,
        water_complete: true,
        bible_complete: true,
      }),
    ).toBe("perfect");
  });

  it("keeps finalized failed days as failed", () => {
    expect(
      statsDayStatus({
        status: "failed",
        finalized_at: "2026-09-21T21:59:59.000Z",
        diet_complete: false,
        workout_1_complete: true,
        workout_2_complete: true,
        outdoor_complete: true,
        water_complete: true,
        bible_complete: true,
      }),
    ).toBe("failed");
  });
});

describe("checkinDisplayStatus", () => {
  it("shows Done for a complete day that is not finalized yet", () => {
    expect(
      checkinDisplayStatus({
        status: "pending",
        finalized_at: null,
        diet_complete: true,
        workout_1_complete: true,
        workout_2_complete: true,
        outdoor_complete: true,
        water_complete: true,
        bible_complete: true,
      }),
    ).toBe("complete");
  });
});

describe("currentStreak", () => {
  it("includes today when today is an open perfect day", () => {
    expect(
      currentStreak(
        [
          { date: "2026-09-21", status: "perfect" },
          { date: "2026-09-22", status: "perfect" },
        ],
        "2026-09-22",
      ),
    ).toBe(2);
  });

  it("counts yesterday when today is still open", () => {
    expect(
      currentStreak([{ date: "2026-09-22", status: "perfect" }], "2026-09-23"),
    ).toBe(1);
  });

  it("returns zero when today failed even if yesterday was perfect", () => {
    expect(
      currentStreak(
        [
          { date: "2026-09-22", status: "perfect" },
          { date: "2026-09-23", status: "failed" },
        ],
        "2026-09-23",
      ),
    ).toBe(0);
  });
});
