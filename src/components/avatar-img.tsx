"use client";

import { useState } from "react";

export function AvatarImg({
  src,
  name,
  className,
  fallbackClassName,
}: {
  src: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={fallbackClassName}>
        {name.slice(0, 1)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
