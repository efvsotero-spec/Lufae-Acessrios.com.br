import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { CategoriesSection } from './components/CategoriesSection.tsx';
import { BestSellerHighlight } from './components/BestSellerHighlight.tsx';
import { Showcase } from './components/Showcase.tsx';
import { CareGuideSection } from './components/CareGuideSection.tsx';
import { HowToOrderSection } from './components/HowToOrderSection.tsx';
import { OrderCtaSection } from './components/OrderCtaSection.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { ProductQuickViewModal } from './components/ProductQuickViewModal.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';
import type { CategorySlug, Product } from './types/index.ts';
import { CATEGORIES } from './data/products.ts';

function AppContent() {
  const { adminUser, adminToken } = useStore();
  const [activeCategory, setActiveCategory] = useState<CategorySlug | 'todos'>('todos');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Sync category or admin view with URL hash or path (/colecao/:slug or #admin / /admin)
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash.replace('#', '');
      const path = window.location.pathname;

      if (hash === 'admin' || path === '/admin') {
        if (adminUser) {
          setIsAdminView(true);
        } else {
          setIsAdminView(false);
          setIsLoginModalOpen(true);
        }
        return;
      }

      if (CATEGORIES.some((c) => c.slug === hash)) {
        setActiveCategory(hash as CategorySlug);
        setIsAdminView(false);
        return;
      }

      const match = path.match(/\/colecao\/([^/]+)/);
      if (match && CATEGORIES.some((c) => c.slug === match[1])) {
        setActiveCategory(match[1] as CategorySlug);
        setIsAdminView(false);
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [adminUser, adminToken]);

  const handleSelectCategory = (cat: CategorySlug | 'todos') => {
    setActiveCategory(cat);
    setIsAdminView(false);
    if (cat === 'todos') {
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', `/colecao/${cat}`);
    }
  };

  const handleOpenAdmin = () => {
    if (adminUser || adminToken) {
      setIsAdminView(true);
      window.history.pushState(null, '', '#admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setIsAdminView(true);
    window.history.pushState(null, '', '#admin');
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
    }
  };

  const handleBackToStore = () => {
    setIsAdminView(false);
    if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
    }
  };

  const scrollToCategories = () => {
    const el = document.getElementById('categorias');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCareGuide = () => {
    const el = document.getElementById('cuidados');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If in admin view and user is strictly authenticated, render Admin Dashboard
  if (isAdminView && adminUser) {
    return <AdminDashboard onBackToStore={handleBackToStore} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7F8] text-[#3A1F2B]">
      {/* Header */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero onExplore={scrollToCategories} />

        {/* Categories Navigation */}
        <CategoriesSection
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Featured Best Seller (CJ-02 only) */}
        <BestSellerHighlight onQuickView={(p) => setQuickViewProduct(p)} />

        {/* Product Showcase with Filters & Search */}
        <Showcase
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          onQuickView={(p) => setQuickViewProduct(p)}
        />

        {/* Care Guide */}
        <CareGuideSection />

        {/* How to Order */}
        <HowToOrderSection />

        {/* Order CTA Banner */}
        <OrderCtaSection />
      </main>

      {/* Footer with Discreet Admin Access */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Shopping Bag Drawer */}
      <CartDrawer />

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigateToCare={scrollToCareGuide}
      />

      {/* Non-intrusive Floating WhatsApp */}
      <FloatingWhatsApp />

      {/* Discreet Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </StoreProvider>
  );
}
