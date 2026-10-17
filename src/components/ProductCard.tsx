import React, { useState } from 'react';
import { ShoppingBag, Eye, Sparkles } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { formatCurrencyBRL } from '../utils/formatters.ts';
import { useCart } from '../context/CartContext.tsx';
import { ProductImage } from './ProductImage.tsx';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const [selectedSizeBJ01, setSelectedSizeBJ01] = useState<string>('');
  const [sizeWarning, setSizeWarning] = useState<boolean>(false);

  const isBJ01 = product.id === 'BJ-01';

  const handleAdd = () => {
    if (isBJ01 && !selectedSizeBJ01) {
      setSizeWarning(true);
      return;
    }
    addItem(product, selectedSizeBJ01 || undefined, 1);
    setSizeWarning(false);
  };

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-[#F8C8D8] p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-[#F48FB1] hover:-translate-y-1">
      {/* Best Seller Badge */}
      {product.badge === 'Best Seller' && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D81B60] text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3 h-3" />
            Best Seller
          </span>
        </div>
      )}

      {/* Image Container with 4:5 aspect ratio and object-contain */}
      <div className="relative w-full aspect-4/5 rounded-xl sm:rounded-2xl bg-[#FFF7F8] border border-[#F8C8D8]/50 overflow-hidden mb-3.5">
        <ProductImage
          src={product.imagem}
          alt={product.nome}
          tipoPeca={product.tipoPeca}
          id={product.id}
          className="w-full h-full"
        />

        {/* Quick View Hover overlay on desktop */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="px-4 py-2 rounded-full bg-white text-[#3A1F2B] hover:text-[#D81B60] text-xs font-medium tracking-wide shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver detalhes</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Tag row (Material / Size / Ring size) */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#C48B8B] font-semibold">
              {product.id}
            </span>

            {product.material && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FFF7F8] text-[#7A5563] border border-[#F8C8D8]/60">
                {product.material}
              </span>
            )}

            {product.tamanho && !isBJ01 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FFF7F8] text-[#7A5563] border border-[#F8C8D8]/60">
                Tam. {product.tamanho}
              </span>
            )}

            {product.aro && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FFF7F8] text-[#7A5563] border border-[#F8C8D8]/60">
                {product.aro === 'Não tem' ? 'Aro: consulte pelo WhatsApp' : `Aro ${product.aro}`}
              </span>
            )}
          </div>

          {/* Exact Name */}
          <h3
            className="text-xs sm:text-sm font-medium text-[#3A1F2B] leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#D81B60] transition-colors"
            title={product.nome}
          >
            {product.nome}
          </h3>
        </div>

        {/* Price & Actions */}
        <div className="mt-3 pt-3 border-t border-[#F8C8D8]/40">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[11px] text-[#7A5563]">Valor</span>
            <span className="font-serif text-lg sm:text-xl font-bold text-[#D81B60]">
              {formatCurrencyBRL(product.preco)}
            </span>
          </div>

          {/* BJ-01 size selector */}
          {isBJ01 && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#3A1F2B] font-medium">Tamanho:</span>
                {sizeWarning && (
                  <span className="text-[10px] text-[#D81B60] font-semibold">
                    Escolha M ou G
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(['M', 'G'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSizeBJ01(size);
                      setSizeWarning(false);
                    }}
                    className={`py-1 text-xs rounded-lg font-semibold border transition-all ${
                      selectedSizeBJ01 === size
                        ? 'bg-[#D81B60] text-white border-[#D81B60]'
                        : 'bg-[#FFF7F8] text-[#3A1F2B] border-[#F8C8D8] hover:border-[#D81B60]'
                    }`}
                  >
                    Tam. {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Adicionar ${product.nome} à sacola`}
              className="flex-1 py-2 px-3 rounded-full bg-[#EC407A] hover:bg-[#D81B60] text-white text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>

            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label={`Ver detalhes de ${product.nome}`}
              className="sm:w-10 py-2 px-3 sm:px-0 rounded-full bg-white hover:bg-[#FFF7F8] border border-[#F8C8D8] text-[#7A5563] hover:text-[#3A1F2B] text-xs font-medium transition-all flex items-center justify-center cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="sm:hidden ml-1">Detalhes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
