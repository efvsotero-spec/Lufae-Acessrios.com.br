import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStore();
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = viewportWidth >= 768;
  const isVerySmall = viewportWidth < 360;

  return (
    <aside
      aria-label="Atendimento rápido"
      className={`fixed z-30 group ${isVerySmall ? 'bottom-3.5 right-3.5' : 'bottom-5 right-5'}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Desktop Tooltip (positioned to the left of the button) */}
        {isDesktop && (
          <div
            role="tooltip"
            className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#F8C8D8] shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 ease-out whitespace-nowrap z-40"
          >
            <div className="flex flex-col text-left">
              <span className="font-serif italic text-xs font-semibold text-[#3A1F2B] leading-tight">
                Atendimento com carinho
              </span>
              <span className="text-[10px] text-[#7A5563] flex items-center gap-1.5 mt-0.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                {settings.whatsappDisplay}
              </span>
            </div>
            {/* Arrow pointer towards button */}
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-[#F8C8D8] rotate-45" />
          </div>
        )}

        {/* Mobile Tooltip (fixed & centered at the bottom of the viewport for total readability without clipping) */}
        {!isDesktop && (
          <div
            role="tooltip"
            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-max max-w-[calc(100vw-1.5rem)] flex items-center justify-center px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#F8C8D8] shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 ease-out z-40"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse shrink-0" />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-serif italic text-xs font-semibold text-[#3A1F2B]">
                  Atendimento com carinho
                </span>
                <span className="text-[10px] font-sans text-[#7A5563] font-medium">
                  {settings.whatsappDisplay} • Pedir no WhatsApp
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Soft subtle radiating pulse halo */}
        <span
          className="absolute -inset-1.5 rounded-full bg-[#25D366] opacity-30 animate-ping motion-reduce:hidden pointer-events-none"
          style={{ animationDuration: '3s' }}
          aria-hidden="true"
        />

        {/* Main WhatsApp action button with smooth hover scale and shadow transition */}
        <a
          href={`https://wa.me/${settings.whatsappPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar com a Lufae Acessórios no WhatsApp"
          className="relative flex items-center gap-2.5 p-3.5 sm:px-4 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg hover:shadow-2xl hover:shadow-[#25D366]/40 transition-all duration-300 ease-out hover:scale-110 active:scale-95 focus:outline-hidden focus:ring-3 focus:ring-[#25D366]/40 cursor-pointer animate-soft-pulse motion-reduce:animate-none"
        >
          <MessageCircle className="w-6 h-6 fill-current shrink-0 transition-transform duration-300 group-hover:rotate-6" />
          <span className="hidden sm:inline text-xs font-semibold tracking-wide whitespace-nowrap">
            Pedir no WhatsApp
          </span>
        </a>
      </div>
    </aside>
  );
};
