import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import type { Product, CategorySlug, PieceType } from '../types/index.ts';
import { ProductCard } from './ProductCard.tsx';

interface ShowcaseProps {
  activeCategory: CategorySlug | 'todos';
  onSelectCategory: (category: CategorySlug | 'todos') => void;
  onQuickView: (product: Product) => void;
}

export const Showcase: React.FC<ShowcaseProps> = ({
  activeCategory,
  onSelectCategory,
  onQuickView,
}) => {
  const { products, categories, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPieceType, setSelectedPieceType] = useState<string>('todos');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('todos');
  const [selectedSize, setSelectedSize] = useState<string>('todos');
  const [selectedAro, setSelectedAro] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'catalogo' | 'menor' | 'maior'>('catalogo');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Distinct materials strictly without mixing Prata and Prata 925
  const materialsList = useMemo(() => {
    const list = Array.from(
      new Set(products.map((p) => p.material).filter(Boolean))
    );
    return list.sort();
  }, [products]);

  const pieceTypes: { label: string; value: PieceType | 'todos' }[] = [
    { label: 'Todos os tipos', value: 'todos' },
    { label: 'Brincos', value: 'brinco' },
    { label: 'Colares', value: 'colar' },
    { label: 'Pulseiras', value: 'pulseira' },
    { label: 'Anéis', value: 'anel' },
    { label: 'Conjuntos', value: 'conjunto' },
    { label: 'Chokers', value: 'choker' },
  ];

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedPieceType('todos');
    setSelectedMaterial('todos');
    setSelectedSize('todos');
    setSelectedAro('todos');
    setSortBy('catalogo');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedPieceType !== 'todos' ||
    selectedMaterial !== 'todos' ||
    selectedSize !== 'todos' ||
    selectedAro !== 'todos' ||
    sortBy !== 'catalogo';

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (activeCategory !== 'todos' && product.categoria !== activeCategory) {
        return false;
      }
      // Search
      if (
        searchTerm &&
        !product.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.id.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      // Piece Type
      if (selectedPieceType !== 'todos' && product.tipoPeca !== selectedPieceType) {
        return false;
      }
      // Material (strict match)
      if (selectedMaterial !== 'todos' && product.material !== selectedMaterial) {
        return false;
      }
      // Size
      if (selectedSize !== 'todos') {
        if (selectedSize === 'P' && product.tamanho !== 'P') return false;
        if (selectedSize === 'M' && !['M', 'M e G'].includes(product.tamanho)) return false;
        if (selectedSize === 'G' && !['G', 'M e G'].includes(product.tamanho)) return false;
      }
      // Aro
      if (selectedAro !== 'todos' && product.aro !== selectedAro) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'menor') return a.preco - b.preco;
      if (sortBy === 'maior') return b.preco - a.preco;
      // Default: Ordem do catálogo
      return products.indexOf(a) - products.indexOf(b);
    });
  }, [
    products,
    activeCategory,
    searchTerm,
    selectedPieceType,
    selectedMaterial,
    selectedSize,
    selectedAro,
    sortBy,
  ]);

  return (
    <section id="vitrine" className="py-12 sm:py-16 bg-[#FFF7F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title and Category Selector Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#F8C8D8] text-[11px] font-semibold tracking-widest text-[#D81B60] uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" />
              Vitrine Oficial
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#3A1F2B]">
              {activeCategory === 'todos'
                ? 'Catálogo Completo'
                : categories.find((c) => c.slug === activeCategory)?.nome}
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5563] mt-1">
              Exibindo {filteredProducts.length} de {products.length} peças cadastradas
            </p>
          </div>

          {/* Quick Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => onSelectCategory('todos')}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'todos'
                  ? 'bg-[#D81B60] text-white shadow-xs'
                  : 'bg-white text-[#7A5563] border border-[#F8C8D8] hover:border-[#F48FB1]'
              }`}
            >
              Todos ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-[#D81B60] text-white shadow-xs'
                    : 'bg-white text-[#7A5563] border border-[#F8C8D8] hover:border-[#F48FB1]'
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Search, Filter & Sort Toolbar */}
        <div className="bg-white rounded-2xl border border-[#F8C8D8] p-4 mb-8 shadow-xs">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A5563]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome do produto ou código (ex: Esfera, Coração, BR-01)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-xs sm:text-sm text-[#3A1F2B] placeholder:text-[#7A5563]/60 focus:outline-hidden focus:border-[#D81B60] transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A5563] hover:text-[#3A1F2B]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-semibold text-[#3A1F2B] flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#D81B60]" />
                <span>Filtros detalhados</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-[#D81B60]" />
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Ordenar produtos"
                className="py-2.5 px-3 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-medium text-[#3A1F2B]"
              >
                <option value="catalogo">Ordem do catálogo</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
              </select>
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-2 flex-wrap">
              {/* Piece type */}
              <select
                value={selectedPieceType}
                onChange={(e) => setSelectedPieceType(e.target.value)}
                aria-label="Filtrar por tipo de peça"
                className="py-2 px-3 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-medium text-[#3A1F2B] focus:border-[#D81B60]"
              >
                {pieceTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              {/* Material */}
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                aria-label="Filtrar por material"
                className="py-2 px-3 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-medium text-[#3A1F2B] focus:border-[#D81B60]"
              >
                <option value="todos">Todos os materiais</option>
                {materialsList.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Tamanho */}
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                aria-label="Filtrar por tamanho"
                className="py-2 px-3 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-medium text-[#3A1F2B] focus:border-[#D81B60]"
              >
                <option value="todos">Todos os tamanhos</option>
                <option value="P">Tamanho P</option>
                <option value="M">Tamanho M</option>
                <option value="G">Tamanho G</option>
              </select>

              {/* Aro */}
              <select
                value={selectedAro}
                onChange={(e) => setSelectedAro(e.target.value)}
                aria-label="Filtrar por aro"
                className="py-2 px-3 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-medium text-[#3A1F2B] focus:border-[#D81B60]"
              >
                <option value="todos">Todos os aros</option>
                <option value="16">Aro 16</option>
                <option value="17">Aro 17</option>
                <option value="18">Aro 18</option>
                <option value="19">Aro 19</option>
                <option value="Não tem">Aro a consultar</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Ordenar produtos"
                className="py-2 px-3 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-medium text-[#3A1F2B] focus:border-[#D81B60]"
              >
                <option value="catalogo">Ordem do catálogo</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  aria-label="Limpar todos os filtros"
                  className="py-2 px-3 rounded-full bg-white hover:bg-[#FFF7F8] text-[#D81B60] border border-[#F8C8D8] text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#F8C8D8] p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] flex items-center justify-center text-[#EC407A] mx-auto">
              <Search className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-[#3A1F2B]">
              Nenhuma peça encontrada
            </h3>
            <p className="text-xs sm:text-sm text-[#7A5563] leading-relaxed">
              Não encontramos nenhuma peça com esses filtros. Experimente redefinir os filtros ou fale conosco pelo WhatsApp para encontrarmos a peça ideal para você.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-[#EC407A] hover:bg-[#D81B60] text-white text-xs font-semibold tracking-wider transition-colors shadow-xs"
              >
                Limpar filtros
              </button>
              <a
                href={`https://wa.me/${settings.whatsappPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] hover:border-[#25D366] text-[#3A1F2B] hover:text-[#25D366] text-xs font-semibold tracking-wider transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Consultar no WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-4/5 max-w-sm h-full bg-white border-l border-[#F8C8D8] ml-auto p-6 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F8C8D8]">
                <h3 className="font-serif text-xl font-semibold text-[#3A1F2B]">
                  Filtros
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#FFF7F8] text-[#7A5563]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Piece Type */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#3A1F2B]">
                  Tipo de peça
                </label>
                <select
                  value={selectedPieceType}
                  onChange={(e) => setSelectedPieceType(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                >
                  {pieceTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#3A1F2B]">
                  Material
                </label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                >
                  <option value="todos">Todos os materiais</option>
                  {materialsList.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#3A1F2B]">
                  Tamanho
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                >
                  <option value="todos">Todos os tamanhos</option>
                  <option value="P">Tamanho P</option>
                  <option value="M">Tamanho M</option>
                  <option value="G">Tamanho G</option>
                </select>
              </div>

              {/* Ring Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#3A1F2B]">
                  Aro
                </label>
                <select
                  value={selectedAro}
                  onChange={(e) => setSelectedAro(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                >
                  <option value="todos">Todos os aros</option>
                  <option value="16">Aro 16</option>
                  <option value="17">Aro 17</option>
                  <option value="18">Aro 18</option>
                  <option value="19">Aro 19</option>
                  <option value="Não tem">Aro a consultar</option>
                </select>
              </div>

              {/* Order */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#3A1F2B]">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                >
                  <option value="catalogo">Ordem do catálogo</option>
                  <option value="menor">Menor preço</option>
                  <option value="maior">Maior preço</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-[#F8C8D8] space-y-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-full bg-[#D81B60] text-white text-xs font-semibold tracking-wider uppercase shadow-xs"
              >
                Ver {filteredProducts.length} Peças
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full py-2.5 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-[#7A5563] text-xs font-medium"
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
