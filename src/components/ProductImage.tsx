import React, { useState } from 'react';
import { Sparkles, Gem } from 'lucide-react';
import type { PieceType } from '../types/index.ts';

interface ProductImageProps {
  src: string;
  alt: string;
  tipoPeca?: PieceType;
  className?: string;
  id?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  tipoPeca,
  className = '',
  id,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If image fails to load or error is triggered, render the official elegant placeholder
  if (hasError) {
    return (
      <div
        className={`w-full h-full bg-[#FFF7F8] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden transition-all duration-300 ${className}`}
        aria-label={alt}
      >
        {/* Subtle geometric jewel backdrop */}
        <div className="absolute inset-0 opacity-[0.04] flex items-center justify-center pointer-events-none">
          <Gem className="w-48 h-48 text-[#D81B60]" />
        </div>

        <div className="w-16 h-16 rounded-full bg-white/80 border border-[#F8C8D8] flex items-center justify-center shadow-xs text-[#EC407A] mb-3 relative z-10 transition-transform duration-300 group-hover:scale-105">
          {tipoPeca === 'anel' ? (
            <svg
              className="w-8 h-8 stroke-current fill-none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="14" r="7" />
              <path d="M10 4h4l1 3h-6z" />
            </svg>
          ) : tipoPeca === 'brinco' ? (
            <svg
              className="w-8 h-8 stroke-current fill-none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="9" r="4" />
              <circle cx="15" cy="15" r="4" />
              <path d="M9 5v-2M15 11v-2" />
            </svg>
          ) : (
            <Sparkles className="w-7 h-7" />
          )}
        </div>

        {id && (
          <span className="text-[10px] font-mono tracking-wider uppercase text-[#C48B8B] mb-1 font-medium">
            {id}
          </span>
        )}
        <span className="text-xs font-serif italic text-[#7A5563] tracking-wide">
          Foto em breve
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-white ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#FFF7F8] flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#F8C8D8] border-t-[#EC407A] animate-spin" />
          <span className="text-[11px] font-serif italic text-[#7A5563] mt-2">
            Carregando...
          </span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        width="600"
        height="750"
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-contain p-2 transition-transform duration-300 ease-out group-hover:scale-105 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
