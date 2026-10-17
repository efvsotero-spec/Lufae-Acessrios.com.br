import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import type { CategorySlug } from '../types/index.ts';
import { ProductImage } from './ProductImage.tsx';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CategoriesSectionProps {
  onSelectCategory: (category: CategorySlug) => void;
  activeCategory: CategorySlug | 'todos';
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  onSelectCategory,
  activeCategory,
}) => {
  const { categories, products } = useStore();

  return (
    <section id="categorias" className="py-16 sm:py-20 bg-white border-b border-[#F8C8D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-[11px] font-semibold tracking-widest text-[#D81B60] uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" />
            Navegação Prática
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#3A1F2B]">
            Categorias do Catálogo
          </h2>
        </div>

        {/* 5 Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((category) => {
            const sampleProduct =
              (category.slug === 'pulseiras'
                ? products.find((p) => p.id === 'PU-01')
                : null) ||
              products.find((p) => p.id === category.featuredProductId) ||
              products.find((p) => p.categoria === category.slug);

            const displayImage =
              sampleProduct?.imagem ||
              (category.slug === 'pulseiras'
                ? '/uploads/1792273367468-_360view_2K_20261017182918.jpg'
                : '');

            const isSelected = activeCategory === category.slug;

            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => {
                  onSelectCategory(category.slug);
                  document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group relative text-left p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFF7F8] border-[#D81B60] shadow-md -translate-y-1 ring-2 ring-[#D81B60]/20'
                    : 'bg-white border-[#F8C8D8] hover:border-[#F48FB1] hover:shadow-md hover:-translate-y-1'
                }`}
              >
                <div>
                  {/* Category Image Cover */}
                  <div className="w-full aspect-square rounded-xl bg-[#FFF7F8] border border-[#F8C8D8]/50 overflow-hidden mb-4 p-2 relative">
                    {displayImage ? (
                      <ProductImage
                        src={displayImage}
                        alt={category.nome}
                        tipoPeca={sampleProduct?.tipoPeca || (category.slug === 'pulseiras' ? 'pulseira' : undefined)}
                        id={sampleProduct?.id || (category.slug === 'pulseiras' ? 'PU-01' : undefined)}
                        className="w-full h-full object-contain"
                      />
                    ) : null}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 border border-[#F8C8D8] text-[10px] font-semibold text-[#D81B60]">
                      {category.count} peças
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#3A1F2B] group-hover:text-[#D81B60] transition-colors">
                    {category.nome}
                  </h3>

                  <p className="text-xs text-[#7A5563] mt-2 leading-relaxed font-sans min-h-[2.5rem]">
                    {category.descricao}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F8C8D8]/50 flex items-center justify-between text-xs font-semibold text-[#D81B60]">
                  <span>Explorar coleção</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
