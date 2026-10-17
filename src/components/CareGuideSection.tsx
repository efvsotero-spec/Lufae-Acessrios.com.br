import React from 'react';
import { Droplets, Sparkles, Box, Shirt } from 'lucide-react';

export const CareGuideSection: React.FC = () => {
  const tips = [
    {
      title: 'Evite Água',
      description: 'Retire antes do banho, mar e piscina para manter o brilho impecável.',
      icon: (
        <svg
          className="w-7 h-7 text-[#EC407A] stroke-current fill-none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      ),
    },
    {
      title: 'Cosméticos Antes',
      description: 'Aplique perfumes e cremes minutos antes de colocar os acessórios.',
      icon: (
        <svg
          className="w-7 h-7 text-[#EC407A] stroke-current fill-none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="9" width="12" height="13" rx="2" />
          <path d="M10 9V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" />
          <circle cx="12" cy="15" r="1.5" />
        </svg>
      ),
    },
    {
      title: 'Guarde Separado',
      description: 'Armazene em saquinhos macios para evitar atrito entre as peças.',
      icon: (
        <svg
          className="w-7 h-7 text-[#EC407A] stroke-current fill-none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      ),
    },
    {
      title: 'Flanela Macia',
      description: 'Limpe suavemente após o uso para remover oleosidade natural.',
      icon: (
        <svg
          className="w-7 h-7 text-[#EC407A] stroke-current fill-none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 4-3 3 3 3" />
          <path d="m9 20 3-3-3-3" />
          <path d="M12 7h5a2 2 0 0 1 2 2v2" />
          <path d="M12 17H7a2 2 0 0 1-2-2v-2" />
        </svg>
      ),
    },
  ];

  return (
    <section id="cuidados" className="py-16 sm:py-24 bg-white border-b border-[#F8C8D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#D81B60] mb-2 block">
            Dicas Especiais
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#3A1F2B]">
            Cuidados para Durabilidade das Peças
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-[#FFF7F8] border border-[#F8C8D8] text-center flex flex-col items-center justify-start transition-all duration-300 hover:shadow-md hover:bg-white hover:-translate-y-1 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#F8C8D8] flex items-center justify-center mb-5 shadow-2xs group-hover:scale-110 transition-transform">
                {tip.icon}
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#3A1F2B] mb-3">
                {tip.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#7A5563] leading-relaxed">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
