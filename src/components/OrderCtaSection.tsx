import React from 'react';
import { MessageCircle, Instagram } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const OrderCtaSection: React.FC = () => {
  const { settings } = useStore();

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-[#FFF7F8] to-[#FCE4EC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border-2 border-[#F8C8D8] p-8 sm:p-12 shadow-xl text-center relative overflow-hidden">
          {/* Subtle glow circle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F48FB1]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Logo container like page 27 */}
          <div className="inline-block mb-6 p-4 rounded-3xl bg-[#FFF7F8] border border-[#F8C8D8] shadow-xs">
            <div className="w-20 h-20 rounded-2xl overflow-hidden p-1 bg-white border border-[#F8C8D8]/50 flex items-center justify-center">
              <img
                src={settings.logoUrl || '/logo.svg'}
                alt={`Logo ${settings.nomeLoja || 'Lufae Acessórios'}`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Official Commercial Heading */}
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#3A1F2B] mb-3">
            Faça o Seu Pedido Conosco!
          </h2>

          {/* Official Customer Service Message */}
          <p className="max-w-xl mx-auto text-sm sm:text-lg text-[#7A5563] font-serif italic mb-8">
            {settings.mensagemAtendimento || 'Estamos prontas para atender você com todo o carinho e atenção.'}
          </p>

          {/* Contact buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href={`https://wa.me/${settings.whatsappPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-semibold tracking-wider transition-all shadow-md hover:shadow-lg"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>{settings.whatsappDisplay}</span>
            </a>

            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-white hover:bg-[#FFF7F8] border border-[#F8C8D8] hover:border-[#D81B60] text-[#3A1F2B] hover:text-[#D81B60] text-sm font-semibold tracking-wider transition-all shadow-xs"
            >
              <Instagram className="w-5 h-5 text-[#E1306C]" />
              <span>{settings.instagramHandle}</span>
            </a>
          </div>

          {/* Official Strip from Catalog Page 27 */}
          <div className="pt-6 border-t border-[#F8C8D8] flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-[#7A5563]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D81B60]" />
              {settings.pagamento ? settings.pagamento.split(';')[0]?.trim() || 'Pix Instantâneo' : 'Pix Instantâneo'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D81B60]" />
              {settings.pagamento && settings.pagamento.includes(';') ? settings.pagamento.split(';')[1]?.trim() || 'Cartões de Crédito / Débito' : 'Cartões de Crédito / Débito'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D81B60]" />
              {settings.envio || 'Enviamos para todo o Brasil'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
