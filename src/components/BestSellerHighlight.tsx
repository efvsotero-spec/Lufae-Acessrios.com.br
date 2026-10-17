import React from 'react';
import { Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import type { Product } from '../types/index.ts';
import { formatCurrencyBRL } from '../utils/formatters.ts';
import { useCart } from '../context/CartContext.tsx';
import { ProductImage } from './ProductImage.tsx';

interface BestSellerHighlightProps {
  onQuickView: (product: Product) => void;
}

export const BestSellerHighlight: React.FC<BestSellerHighlightProps> = ({ onQuickView }) => {
  const { addItem } = useCart();
  const { products } = useStore();
  const cj02 = products.find((p) => p.id === 'CJ-02') || products.find((p) => p.badge === 'Best Seller');

  if (!cj02) return null;

  return (
    <section className="py-12 sm:py-16 bg-[#FFF7F8] border-b border-[#F8C8D8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-[#FFF7F8] to-[#FDE4EC] border-2 border-[#F8C8D8] p-6 sm:p-10 shadow-lg overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#F48FB1]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left image column */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-4/5 rounded-2xl bg-white border border-[#F8C8D8] shadow-md p-3 group">
                <ProductImage
                  src={cj02.imagem}
                  alt={cj02.nome}
                  tipoPeca={cj02.tipoPeca}
                  id={cj02.id}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Right details column */}
            <div className="md:col-span-7 space-y-5 text-center md:text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D81B60] text-white text-xs font-bold tracking-widest uppercase shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  Destaque do Catálogo • BEST SELLER
                </span>
                <p className="text-[11px] font-mono tracking-wider text-[#C48B8B] uppercase font-semibold mt-2">
                  {cj02.id} • {cj02.material}
                </p>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#3A1F2B] leading-snug">
                {cj02.nome}
              </h2>

              <div className="flex items-baseline justify-center md:justify-start gap-3">
                <span className="text-xs text-[#7A5563]">Valor oficial</span>
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#D81B60]">
                  {formatCurrencyBRL(cj02.preco)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => addItem(cj02, undefined, 1)}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-semibold tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Adicionar à sacola</span>
                </button>

                <button
                  type="button"
                  onClick={() => onQuickView(cj02)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-[#FFF7F8] border border-[#F8C8D8] text-[#3A1F2B] text-xs font-semibold tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#7A5563]" />
                  <span>Ver detalhes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
