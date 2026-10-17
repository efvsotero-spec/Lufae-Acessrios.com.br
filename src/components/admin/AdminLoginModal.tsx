import React, { useState } from 'react';
import { Lock, User, ArrowLeft, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Por favor, informe o usuário e a senha.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(username.trim(), password);
      if (res.success) {
        setUsername('');
        setPassword('');
        onLoginSuccess();
      } else {
        // Discreet error message without revealing which specific field was incorrect
        setErrorMessage(res.error || 'Usuário ou senha incorretos.');
        setPassword('');
      }
    } catch {
      setErrorMessage('Erro de conexão ao tentar autenticar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrorMessage('');
    setUsername('');
    setPassword('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#F8C8D8] p-6 sm:p-8 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#F48FB1]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF7F8] border border-[#F8C8D8] flex items-center justify-center text-[#D81B60] mx-auto mb-3 shadow-xs">
            <Lock className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h2 id="admin-login-title" className="font-serif text-2xl sm:text-3xl font-semibold text-[#3A1F2B]">
            Acesso Administrativo
          </h2>
          <p className="text-xs text-[#7A5563] mt-1 font-sans">
            Gerenciamento oficial de produtos, fotos e informações da loja Lufae.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A1F2B] mb-1.5">
              Usuário
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A5563]" />
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: ADM"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs sm:text-sm text-[#3A1F2B] focus:border-[#D81B60] focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A1F2B] mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A5563]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8] text-xs sm:text-sm text-[#3A1F2B] focus:border-[#D81B60] focus:outline-hidden transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A5563] hover:text-[#3A1F2B] p-1 cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF7F8] border border-[#F8C8D8]/60 text-[11px] text-[#7A5563]">
            <ShieldCheck className="w-4 h-4 text-[#25D366] shrink-0" />
            <span>Área restrita aos administradores autorizados da marca Lufae.</span>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-full bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Acessar Painel</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 px-6 rounded-full bg-white hover:bg-[#FFF7F8] text-[#7A5563] hover:text-[#3A1F2B] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a loja pública</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
