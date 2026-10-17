import React from 'react';
import type { CategorySlug } from '../types/index.ts';
import { useStore } from '../context/StoreContext.tsx';
import { MessageCircle, Instagram, Heart, Lock } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (category: CategorySlug | 'todos') => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenAdmin }) => {
  const { categories, settings } = useStore();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[#F8C8D8] pt-14 pb-12 text-[#7A5563]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#F8C8D8]/60">
          {/* Brand info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF7F8] border border-[#F8C8D8] p-1 flex items-center justify-center">
                <img
                  src={settings.logoUrl || '/logo.svg'}
                  alt={`Logo ${settings.nomeLoja || 'Lufae Acessórios'}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-semibold text-[#3A1F2B] block leading-none">
                  {settings.nomeLoja || 'Lufae'}
                </span>
                <span className="text-[10px] font-sans tracking-[0.25em] text-[#C48B8B] uppercase">
                  {settings.assinatura || 'Luiza Leal'}
                </span>
              </div>
            </div>

            <p className="font-serif italic text-sm text-[#7A5563] max-w-sm leading-relaxed">
              {settings.tagline ||
                'Realce sua beleza e sofisticação com peças feitas para brilhar em todas as ocasiões.'}
            </p>
          </div>

          {/* Quick Categories Navigation */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#3A1F2B]">
              Categorias
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('todos');
                    document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#D81B60] transition-colors"
                >
                  Todos os Produtos
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.slug);
                      document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-[#D81B60] transition-colors"
                  >
                    {cat.nome}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Contacts */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#3A1F2B]">
              Atendimento Oficial
            </h4>
            <div className="space-y-2.5 text-xs">
              <a
                href={`https://wa.me/${settings.whatsappPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#25D366] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>{settings.whatsappDisplay}</span>
              </a>

              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#D81B60] transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#E1306C]" />
                <span>{settings.instagramHandle}</span>
              </a>

              <div className="pt-2 text-[11px] text-[#7A5563]/80 space-y-1">
                <p>• {settings.pagamento || 'Pix Instantâneo; Cartões de Crédito / Débito'}</p>
                <p>• {settings.envio || 'Enviamos para todo o Brasil'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: copyright & discreet admin access link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A5563] gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <p>© {currentYear} {settings.nomeLoja || 'Lufae Acessórios'}. Todos os direitos reservados.</p>
            <span className="text-[#F8C8D8] hidden sm:inline">•</span>
            {/* Discreet admin access */}
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-[11px] text-[#7A5563]/60 hover:text-[#D81B60] transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Lock className="w-2.5 h-2.5 opacity-60" />
              <span>Acesso administrativo</span>
            </button>
          </div>

          <p className="flex items-center gap-1.5 text-[11px]">
            <span>Catálogo Oficial de Acessórios &amp; Joias</span>
            <Heart className="w-3 h-3 text-[#EC407A] fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
};
