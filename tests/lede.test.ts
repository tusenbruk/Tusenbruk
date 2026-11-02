import { describe, expect, it } from "vitest";
import { splitLede } from "@/lib/lede";

describe("splitLede", () => {
  it("returns the whole body as the lede when there is no break", () => {
    expect(splitLede("One.\n\nTwo.")).toEqual({ lede: "One.\n\nTwo.", remainder: "" });
  });
  it("splits at a horizontal rule and drops the rule", () => {
    expect(splitLede("Lede.\n\n---\n\nRest.")).toEqual({ lede: "Lede.", remainder: "Rest." });
  });
  it("splits at the first h2 and keeps the heading in the remainder", () => {
    expect(splitLede("Lede.\n## Heading\n\nRest.")).toEqual({
      lede: "Lede.",
      remainder: "## Heading\n\nRest.",
    });
  });
  it("uses whichever break comes first", () => {
    const r = splitLede("A.\n\n---\n\nB.\n\n## H\n\nC.");
    expect(r.lede).toBe("A.");
    expect(r.remainder.startsWith("B.")).toBe(true);
  });
});
