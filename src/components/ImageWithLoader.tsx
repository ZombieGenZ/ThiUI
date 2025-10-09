import { useState } from 'react';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

export function ImageWithLoader({ src, alt, className = '', onLoad }: ImageWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-neutral-300 border-t-brand-600 rounded-full animate-spin" />
        </div>
      )}

      {!error ? (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center text-neutral-400">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
}
