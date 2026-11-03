import { describe, expect, it } from "vitest";
import { getImageSize, parseImageSize } from "@/lib/imageSize";

describe("imageSize", () => {
  it("reads real JPEG dimensions from a committed photograph", () => {
    expect(getImageSize("/photos/rimowa-pilot-front.jpg")).toEqual({ width: 1600, height: 1065 });
  });
  it("reads PNG dimensions", () => {
    expect(getImageSize("/og.png")).toEqual({ width: 1200, height: 630 });
  });
  it("returns null for missing files, remote URLs and junk", () => {
    expect(getImageSize("/photos/does-not-exist.jpg")).toBeNull();
    expect(getImageSize("https://example.com/a.jpg")).toBeNull();
    expect(parseImageSize(Buffer.from("not an image at all"))).toBeNull();
  });
});
