import React, { useState, useRef, useEffect, memo } from "react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  blur?: boolean;
  priority?: boolean;
  containerClassName?: string;
  sizes?: string;
  quality?: number;
}

const OptimizedImage = memo(
  ({
    src,
    alt,
    fallback = "/placeholder-image.jpg",
    blur = true,
    priority = false,
    className,
    containerClassName,
    loading = "lazy",
    sizes = "100vw",
    quality = 85,
    ...props
  }: OptimizedImageProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageSrc, setImageSrc] = useState(priority ? src : "");
    const imgRef = useRef<HTMLImageElement>(null);

    const { ref: inViewRef, inView } = useInView({
      triggerOnce: true,
      threshold: 0.1,
      skip: priority,
    });

    useEffect(() => {
      if (inView && !priority && !imageSrc) {
        setImageSrc(src);
      }
    }, [inView, priority, src, imageSrc]);

    const handleLoad = () => {
      setImageLoaded(true);
    };

    const handleError = () => {
      setImageError(true);
      setImageSrc(fallback);
    };

    // Generate responsive srcSet for performance
    const generateSrcSet = (baseSrc: string) => {
      const sizes = [320, 640, 768, 1024, 1280, 1536];
      return sizes
        .map((size) => {
          const url = new URL(baseSrc, window.location.origin);
          url.searchParams.set("w", size.toString());
          url.searchParams.set("q", quality.toString());
          return `${url.toString()} ${size}w`;
        })
        .join(", ");
    };

    const setRefs = (element: HTMLImageElement | null) => {
      imgRef.current = element;
      inViewRef(element);
    };

    return (
      <div className={cn("relative overflow-hidden", containerClassName)}>
        {/* Blur placeholder */}
        {blur && !imageLoaded && (
          <div
            className={cn(
              "absolute inset-0 bg-gray-200 animate-pulse",
              "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200",
              "bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
            )}
            style={{
              backgroundImage: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
            }}
          />
        )}

        {imageSrc && (
          <img
            ref={setRefs}
            src={imageSrc}
            alt={alt}
            loading={priority ? "eager" : loading}
            decoding="async"
            sizes={sizes}
            srcSet={!imageError ? generateSrcSet(imageSrc) : undefined}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0",
              className,
            )}
            {...props}
          />
        )}

        {/* Loading state */}
        {!imageLoaded && !imageError && imageSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  },
);

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
