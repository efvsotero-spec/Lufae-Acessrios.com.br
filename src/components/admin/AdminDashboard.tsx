import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Image as ImageIcon,
  Sparkles,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  Shield,
  Save,
  Layers,
  Phone,
  Instagram,
  FileText,
  CreditCard,
  Truck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import type { Product, CategorySlug, CategoryInfo } from '../../types/index.ts';
import { formatCurrencyBRL } from '../../utils/formatters.ts';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const {
    products,
    categories,
    settings,
    adminUser,
    logout,
    saveProduct,
    deleteProduct,
    uploadImage,
    updateLogo,
    updateSettings,
    changePassword,
    adminToken,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'produtos' | 'imagens' | 'logotipo' | 'loja' | 'seguranca'
  >('produtos');

  // Products Tab State
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Gallery Tab State
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [gallerySearch, setGallerySearch] = useState('');
  const [uploadPreview, setUploadPreview] = useState<{ file: File; base64: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Logo Tab State
  const [logoPreview, setLogoPreview] = useState<{ file: File; base64: string } | null>(null);
  const [isSavingLogo, setIsSavingLogo] = useState(false);

  // Store Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Password Change State
  const [passCurrent, setPassCurrent] = useState('');
  const [passNew, setPassNew] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // First Access Password State
  const [firstCurrentPass, setFirstCurrentPass] = useState('');
  const [firstNewPass, setFirstNewPass] = useState('');
  const [firstConfirmPass, setFirstConfirmPass] = useState('');
  const [isSubmittingFirstPass, setIsSubmittingFirstPass] = useState(false);

  // Global Toast / Notice State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const productImgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Load gallery images
  const loadGallery = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/gallery', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGalleryImages(data);
      }
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'imagens') {
      loadGallery();
    }
  }, [activeTab]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // -------------------------------------------------------------------------
  // PRODUCT HANDLERS
  // -------------------------------------------------------------------------
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const parsedPreco =
      typeof editingProduct.preco === 'number'
        ? editingProduct.preco
        : parseFloat(String(editingProduct.preco));

    if (!editingProduct.nome?.trim() || Number.isNaN(parsedPreco) || parsedPreco < 0 || !editingProduct.categoria) {
      showToast('Preencha nome, categoria e um preço válido.', 'error');
      return;
    }

    const payload = {
      ...editingProduct,
      preco: parsedPreco,
    };

    const res = await saveProduct(payload, isCreatingProduct);
    if (res.success) {
      showToast(isCreatingProduct ? 'Produto adicionado com sucesso!' : 'Produto atualizado com sucesso!');
      setEditingProduct(null);
      setIsCreatingProduct(false);
    } else {
      showToast(res.error || 'Erro ao salvar produto.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const res = await deleteProduct(productToDelete.id);
    if (res.success) {
      showToast(`Produto ${productToDelete.id} removido.`);
      setProductToDelete(null);
    } else {
      showToast(res.error || 'Erro ao remover produto.', 'error');
    }
  };

  const handleToggleProductStatus = async (product: Product) => {
    const nextStatus = product.status === 'publicado' ? 'oculto' : 'publicado';
    const res = await saveProduct({ ...product, status: nextStatus }, false);
    if (res.success) {
      showToast(`Status de ${product.id} alterado para ${nextStatus}.`);
    } else {
      showToast('Erro ao alternar status.', 'error');
    }
  };

  // -------------------------------------------------------------------------
  // IMAGE UPLOAD HANDLERS
  // -------------------------------------------------------------------------
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Formato inválido. Use JPG, PNG ou WebP.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('Arquivo maior que 10MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadPreview({
        file,
        base64: event.target?.result as string,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmUpload = async () => {
    if (!uploadPreview) return;
    setIsUploading(true);
    const res = await uploadImage(uploadPreview.base64, uploadPreview.name);
    setIsUploading(false);

    if (res.success && res.url) {
      showToast('Fotografia enviada com sucesso!');
      setUploadPreview(null);
      await loadGallery();
    } else {
      showToast(res.error || 'Falha no upload da fotografia.', 'error');
    }
  };

  // -------------------------------------------------------------------------
  // LOGO HANDLERS
  // -------------------------------------------------------------------------
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview({
        file,
        base64: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    if (!logoPreview) return;
    setIsSavingLogo(true);
    const res = await updateLogo(logoPreview.base64, logoPreview.file.name);
    setIsSavingLogo(false);

    if (res.success) {
      showToast('Logotipo atualizado em todo o site e salvo permanentemente!');
      setLogoPreview(null);
    } else {
      showToast(res.error || 'Falha ao atualizar o logotipo.', 'error');
    }
  };

  // -------------------------------------------------------------------------
  // STORE SETTINGS HANDLERS
  // -------------------------------------------------------------------------
  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const res = await updateSettings(settingsForm);
    setIsSavingSettings(false);

    if (res.success) {
      showToast('Informações da loja atualizadas com sucesso!');
    } else {
      showToast(res.error || 'Falha ao salvar configurações.', 'error');
    }
  };

  // -------------------------------------------------------------------------
  // PASSWORD CHANGE HANDLERS
  // -------------------------------------------------------------------------
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passNew !== passConfirm) {
      showToast('A nova senha e a confirmação não coincidem.', 'error');
      return;
    }
    if (passNew.length < 8) {
      showToast('A nova senha deve ter no mínimo 8 caracteres.', 'error');
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword(passCurrent, passNew);
    setIsChangingPass(false);

    if (res.success) {
      showToast('Senha alterada com sucesso! Utilize-a no próximo login.');
      setPassCurrent('');
      setPassNew('');
      setPassConfirm('');
    } else {
      showToast(res.error || 'Falha ao alterar senha.', 'error');
    }
  };

  const handleFirstAccessPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (firstNewPass !== firstConfirmPass) {
      showToast('A nova senha e a confirmação não coincidem.', 'error');
      return;
    }
    if (firstNewPass.length < 8) {
      showToast('A nova senha deve ter no mínimo 8 caracteres.', 'error');
      return;
    }

    setIsSubmittingFirstPass(true);
    const res = await changePassword(firstCurrentPass, firstNewPass);
    setIsSubmittingFirstPass(false);

    if (res.success) {
      showToast('Nova senha cadastrada com sucesso! Seu painel está liberado.');
      setFirstCurrentPass('');
      setFirstNewPass('');
      setFirstConfirmPass('');
    } else {
      showToast(res.error || 'Falha ao cadastrar nova senha.', 'error');
    }
  };

  // Filtered Products for Table
  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'todos' && p.categoria !== categoryFilter) return false;
    if (statusFilter !== 'todos') {
      const pStatus = p.status || 'publicado';
      if (pStatus !== statusFilter) return false;
    }
    if (productSearch) {
      const s = productSearch.toLowerCase();
      if (!p.nome.toLowerCase().includes(s) && !p.id.toLowerCase().includes(s)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDF9FA] text-[#3A1F2B] flex flex-col font-sans">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4 duration-300 ${
            toast.type === 'success'
              ? 'bg-[#25D366] text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#F8C8D8] px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] p-1 flex items-center justify-center">
            <img src={settings.logoUrl || '/logo.svg'} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-[#3A1F2B]">Lufae</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-[10px] font-semibold text-[#D81B60] uppercase tracking-wider">
                Painel Administrativo
              </span>
            </div>
            <p className="text-[10px] text-[#7A5563]">
              Logado como: <strong className="text-[#3A1F2B]">{adminUser?.name || 'Administradora Lufae'}</strong>{' '}
              <span className="font-mono text-[9px] text-[#C48B8B]">({adminUser?.username || 'ADM'})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToStore}
            className="px-3.5 py-2 rounded-full bg-white hover:bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-medium text-[#7A5563] hover:text-[#3A1F2B] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver Loja Pública</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await logout();
              onBackToStore();
            }}
            className="px-3.5 py-2 rounded-full bg-[#FFF7F8] hover:bg-red-50 border border-[#F8C8D8] hover:border-red-200 text-xs font-semibold text-[#D81B60] hover:text-red-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Layout (Sidebar + Content) */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-3xl border border-[#F8C8D8] p-3 shadow-xs space-y-1 sticky top-24">
            <button
              onClick={() => setActiveTab('produtos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === 'produtos'
                  ? 'bg-[#D81B60] text-white shadow-xs'
                  : 'text-[#7A5563] hover:bg-[#FFF7F8] hover:text-[#3A1F2B]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Gerenciar Produtos</span>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'produtos' ? 'bg-white/20 text-white' : 'bg-[#FFF7F8] text-[#7A5563]'
              }`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('imagens')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === 'imagens'
                  ? 'bg-[#D81B60] text-white shadow-xs'
                  : 'text-[#7A5563] hover:bg-[#FFF7F8] hover:text-[#3A1F2B]'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Imagens &amp; Uploads</span>
            </button>

            <button
              onClick={() => setActiveTab('logotipo')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === 'logotipo'
                  ? 'bg-[#D81B60] text-white shadow-xs'
                  : 'text-[#7A5563] hover:bg-[#FFF7F8] hover:text-[#3A1F2B]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Logotipo da Marca</span>
            </button>

            <button
              onClick={() => setActiveTab('loja')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === 'loja'
                  ? 'bg-[#D81B60] text-white shadow-xs'
                  : 'text-[#7A5563] hover:bg-[#FFF7F8] hover:text-[#3A1F2B]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Informações da Loja</span>
            </button>

            <button
              onClick={() => setActiveTab('seguranca')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === 'seguranca'
                  ? 'bg-[#D81B60] text-white shadow-xs'
                  : 'text-[#7A5563] hover:bg-[#FFF7F8] hover:text-[#3A1F2B]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Segurança &amp; Senha</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* ============================================================= */}
          {/* TAB: PRODUTOS */}
          {/* ============================================================= */}
          {activeTab === 'produtos' && (
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="bg-white rounded-3xl border border-[#F8C8D8] p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#3A1F2B]">
                    Produtos da Loja ({filteredProducts.length})
                  </h2>
                  <p className="text-xs text-[#7A5563]">
                    Edite preços, fotos, descrições ou adicione novas peças ao catálogo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct({
                      id: '',
                      nome: '',
                      categoria: 'brincos',
                      preco: 25.5,
                      material: 'Prata',
                      tamanho: '',
                      aro: '',
                      badge: '',
                      imagem: '/produtos/BR-01.webp',
                      descricao: '',
                      status: 'publicado',
                      tipoPeca: 'brinco',
                    });
                    setIsCreatingProduct(true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Produto</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="bg-white rounded-2xl border border-[#F8C8D8] p-4 shadow-xs flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A5563]" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Buscar por ID ou nome do produto..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                >
                  <option value="todos">Todas as categorias</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.nome}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                >
                  <option value="todos">Todos os status</option>
                  <option value="publicado">Publicados</option>
                  <option value="oculto">Ocultos</option>
                  <option value="indisponivel">Indisponíveis</option>
                </select>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-3xl border border-[#F8C8D8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF7F8] border-b border-[#F8C8D8] text-[10px] font-semibold uppercase tracking-wider text-[#7A5563]">
                      <tr>
                        <th className="py-3 px-4">Foto</th>
                        <th className="py-3 px-4">Código / Nome</th>
                        <th className="py-3 px-4">Categoria</th>
                        <th className="py-3 px-4">Preço</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F8C8D8]/50">
                      {filteredProducts.map((product) => {
                        const status = product.status || 'publicado';
                        return (
                          <tr key={product.id} className="hover:bg-[#FFF7F8]/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="w-12 h-14 rounded-lg bg-white border border-[#F8C8D8] overflow-hidden p-1 shrink-0">
                                <img
                                  src={product.imagem}
                                  alt={product.nome}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as any).src = '/logo.svg';
                                  }}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-mono text-[10px] text-[#C48B8B] font-semibold">
                                {product.id}
                              </div>
                              <div className="font-medium text-[#3A1F2B] max-w-xs truncate" title={product.nome}>
                                {product.nome}
                              </div>
                              {product.material && (
                                <span className="text-[10px] text-[#7A5563]">
                                  {product.material}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 capitalize text-[#7A5563]">
                              {product.categoria.replace(/-/g, ' ')}
                            </td>
                            <td className="py-3 px-4 font-serif font-bold text-sm text-[#D81B60]">
                              {formatCurrencyBRL(product.preco)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                  status === 'publicado'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : status === 'oculto'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                {status === 'publicado'
                                  ? 'Publicado'
                                  : status === 'oculto'
                                  ? 'Oculto'
                                  : 'Indisponível'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductStatus(product)}
                                  title={status === 'publicado' ? 'Ocultar da loja' : 'Publicar na loja'}
                                  className="p-1.5 rounded-lg hover:bg-[#FFF7F8] text-[#7A5563] hover:text-[#3A1F2B] transition-colors"
                                >
                                  {status === 'publicado' ? (
                                    <Eye className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <EyeOff className="w-4 h-4 text-amber-600" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setIsCreatingProduct(false);
                                  }}
                                  title="Editar produto"
                                  className="p-1.5 rounded-lg hover:bg-[#FFF7F8] text-[#7A5563] hover:text-[#D81B60] transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setProductToDelete(product)}
                                  title="Excluir produto"
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-[#7A5563] hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB: IMAGENS & UPLOADS */}
          {/* ============================================================= */}
          {activeTab === 'imagens' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-[#F8C8D8] p-6 shadow-xs">
                <h2 className="font-serif text-2xl font-bold text-[#3A1F2B] mb-1">
                  Gerenciamento de Fotografias
                </h2>
                <p className="text-xs text-[#7A5563] mb-6">
                  Envie novas imagens diretamente do seu dispositivo para salvar no armazenamento permanente da loja.
                </p>

                {/* Upload Drag/Drop Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#F8C8D8] hover:border-[#D81B60] bg-[#FFF7F8] hover:bg-[#FCE4EC]/30 rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#F8C8D8] flex items-center justify-center text-[#D81B60] mb-3 group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#3A1F2B]">
                    Clique ou arraste uma foto para cá
                  </h3>
                  <p className="text-xs text-[#7A5563] mt-1">
                    Formatos suportados: WebP, PNG ou JPG (até 10 MB)
                  </p>
                </div>

                {/* Upload Preview & Confirm */}
                {uploadPreview && (
                  <div className="mt-6 p-4 rounded-2xl bg-white border border-[#F8C8D8] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-20 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] overflow-hidden p-1 shrink-0">
                        <img src={uploadPreview.base64} alt="Prévia" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#3A1F2B]">{uploadPreview.name}</h4>
                        <p className="text-[11px] text-[#7A5563]">
                          {(uploadPreview.file.size / 1024).toFixed(1)} KB • Pronto para envio
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleConfirmUpload}
                        disabled={isUploading}
                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                      >
                        {isUploading ? 'Salvando...' : 'Confirmar Envio'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadPreview(null)}
                        className="px-4 py-2.5 rounded-full bg-white hover:bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#7A5563]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Grid */}
              <div className="bg-white rounded-3xl border border-[#F8C8D8] p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl font-bold text-[#3A1F2B]">
                    Galeria de Imagens Salvas ({galleryImages.length})
                  </h3>
                  <button
                    type="button"
                    onClick={loadGallery}
                    className="text-xs text-[#D81B60] hover:underline"
                  >
                    Atualizar galeria
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] p-2 flex flex-col justify-between hover:shadow-md transition-all"
                    >
                      <div className="w-full aspect-square rounded-lg bg-white overflow-hidden p-1 mb-2">
                        <img src={img.url} alt={img.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] text-[#7A5563] truncate block font-mono">
                        {img.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(img.url);
                          showToast(`Caminho copiado: ${img.url}`);
                        }}
                        className="mt-1 py-1 rounded-md bg-white border border-[#F8C8D8] text-[9px] text-[#3A1F2B] hover:text-[#D81B60] transition-colors"
                      >
                        Copiar URL
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB: LOGOTIPO */}
          {/* ============================================================= */}
          {activeTab === 'logotipo' && (
            <div className="bg-white rounded-3xl border border-[#F8C8D8] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#3A1F2B]">
                  Logotipo Oficial da Marca
                </h2>
                <p className="text-xs text-[#7A5563] mt-1">
                  Substitua a imagem do logotipo que aparece no cabeçalho, rodapé e abas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Current Active Logo */}
                <div className="p-6 rounded-2xl bg-[#FFF7F8] border border-[#F8C8D8] flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C48B8B] mb-4">
                    Logotipo Atualmente em Uso
                  </span>
                  <div className="w-40 h-40 rounded-2xl bg-white border border-[#F8C8D8] p-3 flex items-center justify-center shadow-xs overflow-hidden mb-4">
                    <img src={settings.logoUrl || '/logo.svg'} alt="Logotipo Atual" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs text-[#7A5563]">Arquivo: {settings.logoUrl}</p>
                </div>

                {/* Upload New Logo */}
                <div className="p-6 rounded-2xl bg-[#FFF7F8] border border-[#F8C8D8] flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C48B8B] mb-4">
                    Enviar Novo Logotipo
                  </span>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleLogoFileChange}
                  />

                  {logoPreview ? (
                    <div className="space-y-4 flex flex-col items-center">
                      <div className="w-40 h-40 rounded-2xl bg-white border border-[#D81B60] p-3 flex items-center justify-center shadow-md overflow-hidden">
                        <img src={logoPreview.base64} alt="Prévia" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSaveLogo}
                          disabled={isSavingLogo}
                          className="px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                        >
                          {isSavingLogo ? 'Salvando...' : 'Salvar Novo Logotipo'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoPreview(null)}
                          className="px-4 py-2.5 rounded-full bg-white border border-[#F8C8D8] text-xs text-[#7A5563]"
                        >
                          Descartar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-6 py-3 rounded-full bg-white hover:bg-[#FFF7F8] border-2 border-dashed border-[#F8C8D8] hover:border-[#D81B60] text-xs font-semibold text-[#3A1F2B] transition-all flex items-center gap-2 shadow-2xs"
                      >
                        <Upload className="w-4 h-4 text-[#D81B60]" />
                        <span>Selecionar Arquivo PNG ou SVG</span>
                      </button>
                      <p className="text-[11px] text-[#7A5563]">
                        Recomendado: Imagem com fundo transparente ou quadrado arredondado.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB: INFORMAÇÕES DA LOJA */}
          {/* ============================================================= */}
          {activeTab === 'loja' && (
            <div className="bg-white rounded-3xl border border-[#F8C8D8] p-6 sm:p-8 shadow-xs">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold text-[#3A1F2B]">
                  Configurações e Contatos da Loja
                </h2>
                <p className="text-xs text-[#7A5563]">
                  Atualize telefones, Instagram, formas de pagamento e textos institucionais da Lufae.
                </p>
              </div>

              <form onSubmit={handleSaveSettingsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#3A1F2B] mb-1">
                      Nome da Loja
                    </label>
                    <input
                      type="text"
                      value={settingsForm.nomeLoja}
                      onChange={(e) => setSettingsForm({ ...settingsForm, nomeLoja: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#3A1F2B] mb-1">
                      Assinatura
                    </label>
                    <input
                      type="text"
                      value={settingsForm.assinatura}
                      onChange={(e) => setSettingsForm({ ...settingsForm, assinatura: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#3A1F2B] mb-1">
                      WhatsApp (Apenas Números)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappPhone: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#3A1F2B] mb-1">
                      WhatsApp (Exibição Formatada)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappDisplay}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappDisplay: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#3A1F2B] mb-1">
                      Instagram (@)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instagramHandle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagramHandle: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#3A1F2B] mb-1">
                      Link do Instagram
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instagramUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#3A1F2B] mb-1">
                    Frase Principal Oficial (Tagline)
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#3A1F2B] mb-1">
                      Formas de Pagamento
                    </label>
                    <input
                      type="text"
                      value={settingsForm.pagamento}
                      onChange={(e) => setSettingsForm({ ...settingsForm, pagamento: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#3A1F2B] mb-1">
                      Informação de Envio
                    </label>
                    <input
                      type="text"
                      value={settingsForm.envio}
                      onChange={(e) => setSettingsForm({ ...settingsForm, envio: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-8 py-3 rounded-full bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </form>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB: SEGURANÇA */}
          {/* ============================================================= */}
          {activeTab === 'seguranca' && (
            <div className="bg-white rounded-3xl border border-[#F8C8D8] p-6 sm:p-8 shadow-xs max-w-lg">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold text-[#3A1F2B]">
                  Segurança &amp; Alterar Senha
                </h2>
                <p className="text-xs text-[#7A5563]">
                  Atualize sua senha de acesso administrativo.
                </p>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#3A1F2B] mb-1">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    required
                    value={passCurrent}
                    onChange={(e) => setPassCurrent(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#3A1F2B] mb-1">
                    Nova Senha (mínimo 8 caracteres)
                  </label>
                  <input
                    type="password"
                    required
                    value={passNew}
                    onChange={(e) => setPassNew(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#3A1F2B] mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={passConfirm}
                    onChange={(e) => setPassConfirm(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full py-3 rounded-full bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isChangingPass ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ================================================================= */}
      {/* MODAL: EDITAR / CRIAR PRODUTO */}
      {/* ================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#F8C8D8] p-6 sm:p-8 shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#F8C8D8] mb-6">
              <h3 className="font-serif text-2xl font-bold text-[#3A1F2B]">
                {isCreatingProduct ? 'Novo Produto' : `Editar Produto (${editingProduct.id})`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#FFF7F8] text-[#7A5563]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#3A1F2B] mb-1">
                    Código ID {isCreatingProduct && <span className="text-[#D81B60]">*</span>}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isCreatingProduct}
                    value={editingProduct.id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, id: e.target.value.toUpperCase() })}
                    placeholder="Ex: BR-24"
                    className="w-full py-2 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-mono disabled:opacity-60"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase text-[#3A1F2B] mb-1">
                    Nome do Produto <span className="text-[#D81B60]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.nome || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nome: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#3A1F2B] mb-1">
                    Categoria <span className="text-[#D81B60]">*</span>
                  </label>
                  <select
                    value={editingProduct.categoria || 'brincos'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoria: e.target.value as CategorySlug })}
                    className="w-full py-2 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#3A1F2B] mb-1">
                    Preço (R$) <span className="text-[#D81B60]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={
                      editingProduct.preco !== undefined &&
                      editingProduct.preco !== null &&
                      editingProduct.preco !== ('' as any) &&
                      !Number.isNaN(Number(editingProduct.preco))
                        ? editingProduct.preco
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
                        preco: val === '' ? ('' as any) : Number.isNaN(parseFloat(val)) ? ('' as any) : parseFloat(val),
                      });
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-bold text-[#D81B60]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#3A1F2B] mb-1">
                    Status na Loja
                  </label>
                  <select
                    value={editingProduct.status || 'publicado'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    className="w-full py-2 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs"
                  >
                    <option value="publicado">Publicado (visível)</option>
                    <option value="oculto">Oculto</option>
                    <option value="indisponivel">Indisponível</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#3A1F2B] mb-1">
                    Material
                  </label>
                  <input
                    type="text"
                    value={editingProduct.material || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                    placeholder="Prata, Ouro 18k..."
                    className="w-full py-2 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#3A1F2B] mb-1">
                    Tamanho
                  </label>
                  <input
                    type="text"
                    value={editingProduct.tamanho || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tamanho: e.target.value })}
                    placeholder="P, M, G, M e G"
                    className="w-full py-2 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#3A1F2B] mb-1">
                    Aro (Anéis)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.aro || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, aro: e.target.value })}
                    placeholder="17, 18, Não tem"
                    className="w-full py-2 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs"
                  />
                </div>
              </div>

              {/* Image Selection / Direct Upload */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#3A1F2B] mb-1">
                  Fotografia Principal (URL do arquivo)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-16 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] p-1 shrink-0 overflow-hidden">
                    <img src={editingProduct.imagem} alt="Prévia" className="w-full h-full object-contain" />
                  </div>
                  <input
                    type="text"
                    value={editingProduct.imagem || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imagem: e.target.value })}
                    placeholder="/produtos/BR-01.webp ou /uploads/..."
                    className="flex-1 py-2 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-mono"
                  />
                  <input
                    ref={productImgInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (ev) => {
                        const base64 = ev.target?.result as string;
                        const res = await uploadImage(base64, file.name);
                        if (res.success && res.url) {
                          setEditingProduct({ ...editingProduct, imagem: res.url });
                          showToast('Imagem carregada com sucesso!');
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => productImgInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-white border border-[#F8C8D8] hover:border-[#D81B60] text-xs text-[#3A1F2B] whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#D81B60]" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#3A1F2B] mb-1">
                  Selo de Destaque
                </label>
                <select
                  value={editingProduct.badge || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value as any })}
                  className="w-full py-2 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs"
                >
                  <option value="">Nenhum selo</option>
                  <option value="Best Seller">Best Seller</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#F8C8D8] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-medium text-[#7A5563]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-full bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: CONFIRMAR EXCLUSÃO */}
      {/* ================================================================= */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border border-red-200 p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 border border-red-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-serif text-xl font-bold text-[#3A1F2B]">
                Confirmar Exclusão
              </h3>
              <p className="text-xs text-[#7A5563] mt-2 leading-relaxed">
                Tem certeza que deseja excluir o produto <strong>{productToDelete.nome}</strong> ({productToDelete.id})? Essa ação não poderá ser desfeita.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 rounded-full bg-[#FFF7F8] border border-[#F8C8D8] text-xs font-semibold text-[#7A5563]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: TROCA OBRIGATÓRIA DE SENHA NO PRIMEIRO ACESSO */}
      {/* ================================================================= */}
      {adminUser?.mustChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#F8C8D8] p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
              <Shield className="w-7 h-7" />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                Primeiro Acesso Detectado
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#3A1F2B] mt-2">
                Cadastre sua Nova Senha
              </h3>
              <p className="text-xs text-[#7A5563] mt-2 leading-relaxed">
                Por motivos de segurança, como você realizou o acesso com as credenciais iniciais da loja, é necessário cadastrar sua nova senha pessoal antes de prosseguir gerenciando o catálogo.
              </p>
            </div>

            <form onSubmit={handleFirstAccessPasswordSubmit} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A1F2B] mb-1">
                  Senha Atual (Inicial)
                </label>
                <input
                  type="password"
                  required
                  value={firstCurrentPass}
                  onChange={(e) => setFirstCurrentPass(e.target.value)}
                  placeholder="Digite a senha usada no login"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B] focus:border-[#D81B60] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A1F2B] mb-1">
                  Nova Senha (mínimo 8 caracteres)
                </label>
                <input
                  type="password"
                  required
                  value={firstNewPass}
                  onChange={(e) => setFirstNewPass(e.target.value)}
                  placeholder="Crie sua nova senha segura"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B] focus:border-[#D81B60] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A1F2B] mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={firstConfirmPass}
                  onChange={(e) => setFirstConfirmPass(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs text-[#3A1F2B] focus:border-[#D81B60] focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingFirstPass}
                  className="w-full py-3 rounded-full bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmittingFirstPass ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Salvando Nova Senha...</span>
                    </>
                  ) : (
                    <span>Salvar Nova Senha e Liberar Painel</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
