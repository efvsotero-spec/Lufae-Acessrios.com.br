import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingBag, MessageCircle, Sparkles, Check, HeartHandshake } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { formatCurrencyBRL, generateWhatsAppProductQueryUrl } from '../utils/formatters.ts';
import { useCart } from '../context/CartContext.tsx';
import { useStore } from '../context/StoreContext.tsx';
import { ProductImage } from './ProductImage.tsx';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigateToCare: () => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  onNavigateToCare,
}) => {
  const { addItem } = useCart();
  const { settings } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setValidationError('');
      setIsZoomed(false);
      // If product is BJ-01 (M e G), reset selection
      if (product.id === 'BJ-01') {
        setSelectedSize('');
      } else {
        setSelectedSize('');
      }

      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtnRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && product) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const isBJ01 = product.id === 'BJ-01';

  const handleAddToCart = () => {
    if (isBJ01 && !selectedSize) {
      setValidationError('Por favor, selecione o tamanho (M ou G) antes de adicionar.');
      return;
    }

    addItem(product, selectedSize || undefined, quantity);
    onClose();
  };

  const whatsappQueryUrl = generateWhatsAppProductQueryUrl(product.nome, settings.whatsappPhone);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#F8C8D8] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Fechar visualização rápida"
          className="absolute top-4 right-4 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/90 hover:bg-[#FFF7F8] border border-[#F8C8D8] text-[#7A5563] hover:text-[#3A1F2B] transition-colors shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Column */}
          <div className="relative bg-[#FFF7F8] border-b md:border-b-0 md:border-r border-[#F8C8D8] flex items-center justify-center p-6 sm:p-8 min-h-[340px] md:min-h-[460px]">
            {product.badge === 'Best Seller' && (
              <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D81B60] text-white text-[11px] font-semibold tracking-wider uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Best Seller
              </span>
            )}

            <div
              className={`w-full max-w-[280px] sm:max-w-[320px] aspect-4/5 rounded-2xl bg-white border border-[#F8C8D8]/70 shadow-xs overflow-hidden transition-transform duration-300 cursor-zoom-in ${
                isZoomed ? 'scale-125' : 'hover:scale-105'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
              title="Toque para ampliar"
            >
              <ProductImage
                src={product.imagem}
                alt={product.nome}
                tipoPeca={product.tipoPeca}
                id={product.id}
                className="w-full h-full"
              />
            </div>

            <div className="absolute bottom-3 text-center w-full">
              <span className="text-[11px] text-[#7A5563]/80 italic">
                {isZoomed ? 'Toque novamente para voltar' : 'Toque na foto para ampliar'}
              </span>
            </div>
          </div>

          {/* Info Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#C48B8B] font-semibold">
                  {product.id}
                </span>
                {product.material && (
                  <>
                    <span className="text-[#F8C8D8]">•</span>
                    <span className="text-xs text-[#7A5563] font-medium">
                      {product.material}
                    </span>
                  </>
                )}
              </div>

              <h2
                id="quick-view-title"
                className="font-serif text-2xl sm:text-3xl font-semibold text-[#3A1F2B] leading-snug"
              >
                {product.nome}
              </h2>

              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-[#D81B60]">
                  {formatCurrencyBRL(product.preco)}
                </span>
              </div>

              {/* Specification display */}
              <div className="space-y-3 pt-2 border-t border-[#F8C8D8]/60">
                {/* BJ-01 Multi-size selection */}
                {isBJ01 ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#3A1F2B]">
                      Escolha o tamanho: <span className="text-[#D81B60]">*</span>
                    </label>
                    <div className="flex gap-3">
                      {(['M', 'G'] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size);
                            setValidationError('');
                          }}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                            selectedSize === size
                              ? 'bg-[#D81B60] text-white border-[#D81B60] shadow-xs'
                              : 'bg-white text-[#3A1F2B] border-[#F8C8D8] hover:border-[#D81B60]'
                          }`}
                        >
                          Tamanho {size}
                        </button>
                      ))}
                    </div>
                    {validationError && (
                      <p className="text-xs text-[#D81B60] font-medium mt-1">
                        {validationError}
                      </p>
                    )}
                  </div>
                ) : product.aro ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#7A5563] font-medium">Aro:</span>
                    <span className="px-3 py-1 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-[#3A1F2B] font-semibold text-xs">
                      {product.aro === 'Não tem' ? 'Aro: consulte pelo WhatsApp' : `Aro ${product.aro}`}
                    </span>
                  </div>
                ) : product.tamanho ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#7A5563] font-medium">Tamanho:</span>
                    <span className="px-3 py-1 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-[#3A1F2B] font-semibold text-xs">
                      Tamanho {product.tamanho}
                    </span>
                  </div>
                ) : null}

                {/* Quantity selector */}
                <div className="flex items-center gap-4 pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#3A1F2B]">
                    Quantidade:
                  </span>
                  <div className="flex items-center border border-[#F8C8D8] rounded-full bg-[#FFF7F8] p-0.5">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Diminuir quantidade"
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-[#7A5563] hover:text-[#3A1F2B] transition-colors"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-[#3A1F2B]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Aumentar quantidade"
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-[#7A5563] hover:text-[#3A1F2B] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-[#F8C8D8]/60">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#D81B60] hover:bg-[#C2185B] text-white text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-[#D81B60] focus:ring-offset-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Adicionar à sacola</span>
              </button>

              <a
                href={whatsappQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#FFF7F8] hover:bg-white border border-[#F8C8D8] hover:border-[#25D366] text-[#3A1F2B] hover:text-[#25D366] text-xs font-semibold tracking-wider transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Perguntar sobre esta peça no WhatsApp</span>
              </a>

              {/* Care link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToCare();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#7A5563] hover:text-[#D81B60] underline underline-offset-4 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" />
                  Ver Cuidados para Durabilidade das Peças
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
