import React from 'react';
import { Eye, ShoppingBag, MessageCircle, CreditCard, Send, Sparkles } from 'lucide-react';

export const HowToOrderSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Escolha as peças',
      description: 'Navegue pelo catálogo oficial e selecione suas joias e acessórios favoritos.',
      icon: <Eye className="w-6 h-6 text-[#EC407A]" />,
    },
    {
      num: '02',
      title: 'Monte a sacola',
      description: 'Adicione suas peças à sacola, ajustando opções de tamanho, aros e quantidades.',
      icon: <ShoppingBag className="w-6 h-6 text-[#EC407A]" />,
    },
    {
      num: '03',
      title: 'Envie pelo WhatsApp',
      description: 'Com um clique, sua sacola vira uma mensagem pronta para o atendimento da Lufae.',
      icon: <MessageCircle className="w-6 h-6 text-[#25D366]" />,
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FFF7F8] border-b border-[#F8C8D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#D81B60] mb-2 block">
            Sem Complicações
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#3A1F2B]">
            Como Fazer o Seu Pedido
          </h2>
          <p className="text-xs sm:text-sm text-[#7A5563] mt-2">
            Compre direto conosco pelo WhatsApp com total carinho e praticidade.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-7 rounded-3xl bg-white border border-[#F8C8D8] shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF7F8] border border-[#F8C8D8] flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="font-serif text-3xl font-bold text-[#F8C8D8]">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-[#3A1F2B] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#7A5563] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment & Shipping Banner */}
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#F8C8D8] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] flex items-center justify-center text-[#D81B60] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#3A1F2B]">
                Pagamento
              </h4>
              <p className="text-xs sm:text-sm text-[#7A5563] font-medium">
                Pix Instantâneo
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-10 bg-[#F8C8D8]" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] flex items-center justify-center text-[#D81B60] shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#3A1F2B]">
                Cartões
              </h4>
              <p className="text-xs sm:text-sm text-[#7A5563] font-medium">
                Cartões de Crédito / Débito
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-10 bg-[#F8C8D8]" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] flex items-center justify-center text-[#D81B60] shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#3A1F2B]">
                Envio
              </h4>
              <p className="text-xs sm:text-sm text-[#7A5563] font-medium">
                Enviamos para todo o Brasil
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
