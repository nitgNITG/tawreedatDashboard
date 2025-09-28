"use client";
import Image, { ImageProps } from "next/image";
import React, { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

type Props = ImageProps & {
  fallbackSrc?: string;
  errorSrc?: string;
};

const ImageApi = ({
  src,
  alt = "image",
  fallbackSrc = "/imgs/notfound.png",
  errorSrc = "/imgs/notfound.png",
  ...rest
}: Props) => {
  const [imgSrc, setImgSrc] = useState<ImageProps["src"]>(src || fallbackSrc);
  const [loading, setLoading] = useState(true);

  // Update when parent src changes
  useEffect(() => {
    if (src) {
      setImgSrc(src);
      setLoading(true);
    }
  }, [src]);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <Skeleton className="absolute inset-0 w-full h-full animate-pulse" />
      )}
      <Image
        {...rest}
        src={imgSrc}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={() => {
          setImgSrc(errorSrc);
          setLoading(false);
        }}
      />
    </div>
  );
};

export default ImageApi;
