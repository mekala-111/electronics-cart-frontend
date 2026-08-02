"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FALLBACK = "/images/laptop.png";

type Props = Omit<ImageProps, "onError"> & {
  fallbackSrc?: string;
};

/** next/image with broken-src fallback and soft placeholder. */
export function SafeImage({
  src,
  alt,
  className,
  fallbackSrc = FALLBACK,
  ...rest
}: Props) {
  const [current, setCurrent] = useState(src);
  const [failed, setFailed] = useState(false);

  return (
    <Image
      {...rest}
      src={failed ? fallbackSrc : current}
      alt={alt}
      className={cn(
        "bg-section/80 transition duration-300",
        className,
      )}
      onError={() => {
        if (!failed) {
          setFailed(true);
          setCurrent(fallbackSrc);
        }
      }}
      placeholder={typeof src === "string" && src.startsWith("data:") ? undefined : "empty"}
    />
  );
}
