import Image from "next/image";
import type { ImgHTMLAttributes } from "react";
import { getImageSize } from "@/lib/imageSize";

// Article bodies are rendered by react-markdown, which emits bare <img> tags
// at full file size. Local images are routed through next/image (AVIF/WebP,
// responsive srcset, lazy by default) using their real dimensions, which also
// reserves space and prevents layout shift. Anything else falls back to a
// lazy plain <img>. The lead photograph is handled separately with priority.
export default function MarkdownImage({ src, alt }: ImgHTMLAttributes<HTMLImageElement>) {
  if (typeof src !== "string") return null;
  const size = getImageSize(src);
  if (!size) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" />;
  }
  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={size.width}
      height={size.height}
      sizes="(max-width: 720px) calc(100vw - 40px), 655px"
    />
  );
}
