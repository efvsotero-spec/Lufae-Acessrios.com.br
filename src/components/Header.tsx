import React, { useState } from 'react';
import { ShoppingBag, Menu, X, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useStore } from '../context/StoreContext.tsx';
import type { CategorySlug } from '../types/index.ts';

interface HeaderProps {
  activeCategory: CategorySlug | 'todos';
  onSelectCategory: (category: CategorySlug | 'todos') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeCategory, onSelectCategory }) => {
  const { openCart, totalItems } = useCart();
  const { products, categories, settings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (category: CategorySlug | 'todos') => {
    onSelectCategory(category);
    setMobileMenuOpen(false);
    // Smooth scroll to showcase
    const el = document.getElementById('vitrine');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#F8C8D8] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Mobile menu trigger button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menu de navegação"
          className="lg:hidden w-11 h-11 rounded-full flex items-center justify-center text-[#3A1F2B] hover:bg-[#FFF7F8] border border-[#F8C8D8]/50"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory('todos');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 group"
          aria-label="Lufae Acessórios - Página Inicial"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF7F8] to-[#FCE4EC] border border-[#F8C8D8] p-1 shadow-xs flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
            <img src={settings.logoUrl || '/logo.svg'} alt={`Logo ${settings.nomeLoja || 'Lufae Acessórios'}`} className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-semibold tracking-wide text-[#3A1F2B] leading-none">
              {settings.nomeLoja || 'Lufae'}
            </span>
            <span className="text-[9px] font-sans font-medium tracking-[0.25em] text-[#C48B8B] uppercase mt-0.5">
              {settings.assinatura || 'Luiza Leal'}
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => handleNavClick('todos')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
              activeCategory === 'todos'
                ? 'bg-[#F8C8D8]/50 text-[#D81B60] font-semibold'
                : 'text-[#7A5563] hover:text-[#3A1F2B] hover:bg-[#FFF7F8]'
            }`}
          >
            Todos os produtos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleNavClick(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                activeCategory === cat.slug
                  ? 'bg-[#F8C8D8]/50 text-[#D81B60] font-semibold'
                  : 'text-[#7A5563] hover:text-[#3A1F2B] hover:bg-[#FFF7F8]'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </nav>

        {/* Header Actions (WhatsApp and Cart) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`https://wa.me/${settings.whatsappPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Atendimento no WhatsApp"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF7F8] hover:bg-[#FCE4EC] border border-[#F8C8D8] text-[#3A1F2B] text-xs font-medium transition-all shadow-2xs"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span className="hidden md:inline font-sans">{settings.whatsappDisplay}</span>
            <span className="md:hidden">WhatsApp</span>
          </a>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Abrir sacola com ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
            className="relative w-11 h-11 rounded-full bg-[#FFF7F8] hover:bg-[#F8C8D8]/40 border border-[#F8C8D8] flex items-center justify-center text-[#D81B60] transition-all cursor-pointer shadow-2xs"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-[#D81B60] text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-75">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-4/5 max-w-xs h-full bg-white border-r border-[#F8C8D8] p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#F8C8D8]/60">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFF7F8] to-[#FCE4EC] border border-[#F8C8D8] p-1 flex items-center justify-center">
                    <img src={settings.logoUrl || '/logo.svg'} alt={`Logo ${settings.nomeLoja || 'Lufae'}`} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="font-serif text-xl font-semibold text-[#3A1F2B]">
                      {settings.nomeLoja || 'Lufae'}
                    </span>
                    <span className="block text-[8px] font-sans tracking-widest text-[#C48B8B] uppercase">
                      Luiza Leal
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fechar menu"
                  className="w-10 h-10 flex items-center justify-center rounded-full text-[#7A5563] hover:bg-[#FFF7F8]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-1">
                <p className="text-[10px] uppercase font-semibold tracking-widest text-[#C48B8B] px-3 mb-2">
                  Categorias
                </p>
                <button
                  onClick={() => handleNavClick('todos')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeCategory === 'todos'
                      ? 'bg-[#FFF7F8] text-[#D81B60] font-semibold border border-[#F8C8D8]'
                      : 'text-[#3A1F2B] hover:bg-[#FFF7F8]'
                  }`}
                >
                  Ver Todos os Produtos ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleNavClick(cat.slug)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                      activeCategory === cat.slug
                        ? 'bg-[#FFF7F8] text-[#D81B60] font-semibold border border-[#F8C8D8]'
                        : 'text-[#3A1F2B] hover:bg-[#FFF7F8]'
                    }`}
                  >
                    <span>{cat.nome}</span>
                    <span className="text-xs text-[#7A5563] font-normal">
                      {products.filter((p) => p.categoria === cat.slug).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#F8C8D8]/60 space-y-3">
              <a
                href={`https://wa.me/${settings.whatsappPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#25D366] text-white text-xs font-semibold tracking-wide shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Atendimento WhatsApp</span>
              </a>
              <p className="text-[11px] text-center text-[#7A5563]">
                {settings.whatsappDisplay}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
