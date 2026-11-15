import { useState } from 'react';
import { Orbit } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  loading?: 'eager' | 'lazy';
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle = 'NASA Archival Hardware Plate',
  loading = 'lazy'
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0E1833] via-[#14264A] to-[#080D1C] p-6 text-center ${className}`}
      >
        <Orbit className="mb-3 h-8 w-8 text-[#20B9C9]/80" aria-hidden="true" />
        <p className="font-mono text-xs uppercase tracking-wider text-[#9FB2D1]">
          {fallbackTitle}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
