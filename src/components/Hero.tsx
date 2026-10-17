import React from 'react';
import { ArrowDown, MessageCircle, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface HeroProps {
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  const { settings } = useStore();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FDE4EC] via-[#FFF0F5] to-[#FFF7F8] py-16 sm:py-24 border-b border-[#F8C8D8]">
      {/* Delicate background decorative glow rings */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#F48FB1]/15 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Logo Card as in the Official Catalog Cover (page 1) */}
        <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-white/80 backdrop-blur-xs border border-[#F8C8D8] shadow-md transition-transform duration-300 hover:scale-105">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#FFF7F8] border border-[#F8C8D8]/50 p-1 flex items-center justify-center">
            <img
              src={settings.logoUrl || '/logo.svg'}
              alt={`Monograma e Logo ${settings.nomeLoja || 'Lufae Acessórios'} - ${settings.assinatura || 'Luiza Leal'}`}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Official Tag from Catalog Cover */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#F8C8D8] shadow-2xs mb-5">
          <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" />
          <span className="text-[11px] font-sans font-semibold tracking-[0.25em] uppercase text-[#D81B60]">
            Catálogo Oficial
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-semibold text-[#3A1F2B] tracking-tight mb-4">
          Acessórios
        </h1>

        {/* Official Main Tagline */}
        <p className="max-w-2xl text-base sm:text-xl md:text-2xl text-[#7A5563] font-serif italic leading-relaxed mb-8">
          “{settings.tagline || 'Realce sua beleza e sofisticação com peças feitas para brilhar em todas as ocasiões.'}”
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={onExplore}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#EC407A] hover:bg-[#D81B60] text-white text-sm font-semibold tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Ver catálogo</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <a
            href={`https://wa.me/${settings.whatsappPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-white hover:bg-[#FFF7F8] text-[#3A1F2B] border border-[#F8C8D8] hover:border-[#25D366] text-sm font-semibold tracking-wider transition-all shadow-xs hover:shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
