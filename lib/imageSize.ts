import fs from "fs";
import path from "path";

export interface Dimensions {
  width: number;
  height: number;
}

// Reads width/height from a JPEG or PNG under /public by parsing the header
// only (no dependency, no full decode). Returns null for anything else, so
// callers can fall back to a plain <img>.
export function getImageSize(publicPath: string): Dimensions | null {
  if (!publicPath.startsWith("/")) return null;
  const file = path.join(process.cwd(), "public", publicPath);
  let buf: Buffer;
  try {
    buf = fs.readFileSync(file);
  } catch {
    return null;
  }
  return parseImageSize(buf);
}

export function parseImageSize(buf: Buffer): Dimensions | null {
  // PNG: 8-byte signature, then IHDR with big-endian width/height at offset 16.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: walk the marker segments until a Start-Of-Frame (SOF0–SOF15,
  // excluding DHT 0xC4, JPG 0xC8 and DAC 0xCC), which carries the dimensions.
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}
