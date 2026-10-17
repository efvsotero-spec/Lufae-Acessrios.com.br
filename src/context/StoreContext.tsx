import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CategoryInfo, StoreSettings, AdminUser } from '../types/index.ts';
import { PRODUCTS, CATEGORIES } from '../data/products.ts';
import {
  WHATSAPP_PHONE,
  WHATSAPP_DISPLAY,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from '../utils/formatters.ts';

const TOKEN_STORAGE_KEY = 'lufae_admin_token_v1';

const defaultSettings: StoreSettings = {
  nomeLoja: 'Lufae Acessórios',
  assinatura: 'Luiza Leal',
  whatsappPhone: WHATSAPP_PHONE,
  whatsappDisplay: WHATSAPP_DISPLAY,
  instagramHandle: INSTAGRAM_HANDLE,
  instagramUrl: INSTAGRAM_URL,
  tagline:
    'Realce sua beleza e sofisticação com peças feitas para brilhar em todas as ocasiões.',
  logoUrl: '/logo.svg',
  pagamento: 'Pix Instantâneo; Cartões de Crédito / Débito',
  envio: 'Enviamos para todo o Brasil',
  mensagemAtendimento:
    'Estamos prontas para atender você com todo o carinho e atenção.',
};

interface StoreContextType {
  products: Product[];
  categories: CategoryInfo[];
  settings: StoreSettings;
  isLoading: boolean;
  adminUser: AdminUser | null;
  adminToken: string | null;
  login: (loginOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshStore: () => Promise<void>;
  saveProduct: (product: Partial<Product>, isNew?: boolean) => Promise<{ success: boolean; error?: string; product?: Product }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  uploadImage: (base64Data: string, filename: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  updateLogo: (base64Data: string, filename: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  updateSettings: (newSettings: Partial<StoreSettings>, newCategories?: CategoryInfo[]) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<CategoryInfo[]>(CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Load public store data from API
  const refreshStore = async () => {
    try {
      const res = await fetch('/api/public/store');
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        }
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.warn('Usando dados locais de produtos e categorias:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth session
  useEffect(() => {
    const checkAuth = async () => {
      if (!adminToken) {
        setAdminUser(null);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data.user);
        } else {
          // Token expired or invalid
          setAdminToken(null);
          setAdminUser(null);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } catch {
        // Network error
      }
    };

    checkAuth();
    refreshStore();
  }, [adminToken]);

  const login = async (loginOrEmail: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginOrEmail, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminToken(data.token);
        setAdminUser(data.user);
        try {
          localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        } catch {}
        return { success: true };
      }
      return { success: false, error: data.error || 'Credenciais inválidas' };
    } catch (err: any) {
      return { success: false, error: 'Falha de conexão com o servidor' };
    }
  };

  const logout = async () => {
    if (adminToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch {}
    }
    setAdminToken(null);
    setAdminUser(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
  };

  const saveProduct = async (productData: Partial<Product>, isNew = false) => {
    if (!adminToken) return { success: false, error: 'Não autorizado' };

    try {
      const url = isNew
        ? '/api/admin/products'
        : `/api/admin/products/${productData.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await refreshStore();
        return { success: true, product: data.product };
      }
      return { success: false, error: data.error || 'Falha ao salvar produto' };
    } catch (err: any) {
      return { success: false, error: 'Erro de comunicação ao salvar produto' };
    }
  };

  const deleteProduct = async (id: string) => {
    if (!adminToken) return { success: false, error: 'Não autorizado' };

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshStore();
        return { success: true };
      }
      return { success: false, error: data.error || 'Falha ao excluir produto' };
    } catch (err) {
      return { success: false, error: 'Erro ao conectar para excluir' };
    }
  };

  const uploadImage = async (base64Data: string, filename: string) => {
    if (!adminToken) return { success: false, error: 'Não autorizado' };

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ base64Data, filename }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, url: data.url };
      }
      return { success: false, error: data.error || 'Falha no upload' };
    } catch (err) {
      return { success: false, error: 'Erro ao enviar imagem' };
    }
  };

  const updateLogo = async (base64Data: string, filename: string) => {
    if (!adminToken) return { success: false, error: 'Não autorizado' };

    try {
      const res = await fetch('/api/admin/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ base64Data, filename }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshStore();
        return { success: true, url: data.url };
      }
      return { success: false, error: data.error || 'Falha ao atualizar logotipo' };
    } catch (err) {
      return { success: false, error: 'Erro ao comunicar com o servidor' };
    }
  };

  const updateSettings = async (
    newSettings: Partial<StoreSettings>,
    newCategories?: CategoryInfo[]
  ) => {
    if (!adminToken) return { success: false, error: 'Não autorizado' };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ settings: newSettings, categories: newCategories }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshStore();
        return { success: true };
      }
      return { success: false, error: data.error || 'Falha ao salvar configurações' };
    } catch (err) {
      return { success: false, error: 'Erro ao conectar ao servidor' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!adminToken) return { success: false, error: 'Não autorizado' };

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminUser((prev) => (prev ? { ...prev, mustChangePassword: false } : null));
        return { success: true };
      }
      return { success: false, error: data.error || 'Falha ao alterar senha' };
    } catch (err) {
      return { success: false, error: 'Erro ao conectar ao servidor' };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        settings,
        isLoading,
        adminUser,
        adminToken,
        login,
        logout,
        refreshStore,
        saveProduct,
        deleteProduct,
        uploadImage,
        updateLogo,
        updateSettings,
        changePassword,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore deve ser usado dentro de StoreProvider');
  }
  return context;
};
