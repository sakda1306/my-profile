import Image from "next/image";
import { mediaUrl } from "@/lib/media/url";

// Remote images only; hosts are allow-listed in next.config.ts.
export function MediaImage({
  path,
  alt,
  className = "",
  width = 800,
  height = 450,
  unoptimized = false,
}: {
  path: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  unoptimized?: boolean;
}) {
  const src = mediaUrl(path);
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized={unoptimized}
      className={`h-auto w-full object-cover ${className}`.trim()}
    />
  );
}
