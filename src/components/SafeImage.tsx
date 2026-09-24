"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "./Icon";

type SafeImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fallbackIcon?: "user" | "heart" | "home";
};

export function SafeImage({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  priority,
  className,
  fallbackIcon = "user",
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`safe-image-fallback${className ? ` ${className}` : ""}`} role="img" aria-label={alt || "Image unavailable"}>
        <Icon name={fallbackIcon} size={fallbackIcon === "user" ? 38 : 26} />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
