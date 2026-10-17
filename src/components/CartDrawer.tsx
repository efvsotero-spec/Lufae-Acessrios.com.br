import React, { useEffect, useRef } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useStore } from '../context/StoreContext.tsx';
import {
  formatCurrencyBRL,
  generateWhatsAppOrderUrl,
} from '../utils/formatters.ts';
import { ProductImage } from './ProductImage.tsx';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalItems, subtotal } =
    useCart();
  const { settings } = useStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key and trap basic keyboard focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => closeBtnRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const whatsappUrl = generateWhatsAppOrderUrl(items, settings.whatsappPhone);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
      aria-label="Sacola de Compras"
      onClick={closeCart}
    >
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-[#FFFFFF] shadow-2xl flex flex-col justify-between border-l border-[#F8C8D8] transform transition-transform duration-300 ease-out"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F8C8D8] flex items-center justify-between bg-[#FFF7F8]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white border border-[#F8C8D8] flex items-center justify-center text-[#D81B60]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#3A1F2B]">Sua Sacola</h2>
              <p className="text-xs text-[#7A5563]">
                {totalItems === 0
                  ? 'Nenhum item adicionado'
                  : `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
              </p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={closeCart}
            aria-label="Fechar sacola"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white text-[#7A5563] hover:text-[#3A1F2B] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#F8C8D8]/50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] flex items-center justify-center text-[#EC407A]">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="max-w-xs space-y-2">
                <h3 className="font-serif text-2xl text-[#3A1F2B] font-medium">
                  Sua sacola está vazia
                </h3>
                <p className="text-xs text-[#7A5563] leading-relaxed">
                  Explore nosso catálogo oficial, escolha suas peças preferidas e monte o seu pedido com todo o carinho.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#EC407A] hover:bg-[#D81B60] text-white text-xs font-medium tracking-wider uppercase transition-all shadow-sm hover:shadow"
              >
                Ver Catálogo
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-start first:pt-0 last:pb-0">
                {/* Thumbnail */}
                <div className="w-20 h-24 rounded-xl border border-[#F8C8D8] bg-[#FFF7F8] overflow-hidden shrink-0">
                  <ProductImage
                    src={item.imagem}
                    alt={item.nome}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-[#3A1F2B] leading-snug break-words">
                    {item.nome}
                  </h4>

                  {/* Specification (Size/Ring size) */}
                  {item.tamanhoOuAro && (
                    <div className="mt-1">
                      <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FFF7F8] text-[#7A5563] border border-[#F8C8D8]/70">
                        {item.tamanhoOuAro.startsWith('Aro')
                          ? item.tamanhoOuAro
                          : item.tamanhoOuAro === 'Não tem'
                          ? 'Aro: a consultar'
                          : `Tam. ${item.tamanhoOuAro}`}
                      </span>
                    </div>
                  )}

                  <p className="text-sm font-semibold text-[#D81B60] mt-1.5">
                    {formatCurrencyBRL(item.preco)}
                  </p>

                  {/* Quantity and Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-[#F8C8D8] rounded-full bg-[#FFF7F8] p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label={`Diminuir quantidade de ${item.nome}`}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-[#7A5563] hover:text-[#3A1F2B] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-[#3A1F2B]">
                        {item.quantidade}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label={`Aumentar quantidade de ${item.nome}`}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-[#7A5563] hover:text-[#3A1F2B] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remover ${item.nome} da sacola`}
                      className="p-2 text-[#7A5563] hover:text-[#D81B60] transition-colors rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with subtotal and WhatsApp trigger */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#F8C8D8] bg-[#FFF7F8] space-y-4">
            <div className="flex items-center justify-between text-[#3A1F2B]">
              <span className="text-sm font-medium text-[#7A5563]">Subtotal dos itens</span>
              <span className="font-serif text-2xl font-bold text-[#D81B60]">
                {formatCurrencyBRL(subtotal)}
              </span>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all focus:outline-hidden focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Enviar pedido pelo WhatsApp</span>
            </a>

            <p className="text-[11px] text-center text-[#7A5563] leading-relaxed">
              Pix instantâneo ou cartões de crédito/débito. Enviamos para todo o Brasil.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
