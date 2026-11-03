import { describe, expect, it } from "vitest";
import { formatDate, formatDateShort, readingTime } from "@/lib/format";

describe("format", () => {
  it("never reports a reading time below one minute", () => {
    expect(readingTime("")).toBeGreaterThanOrEqual(1);
    expect(readingTime("word ".repeat(10))).toBe(1);
  });
  it("scales reading time with length", () => {
    expect(readingTime("word ".repeat(2000))).toBeGreaterThan(readingTime("word ".repeat(400)));
  });
  it("formats ISO dates without shifting the day across timezones", () => {
    expect(formatDate("2026-08-17").toLowerCase()).toContain("17 august 2026");
    expect(formatDateShort("2026-08-17").toLowerCase()).toContain("17");
  });
});
