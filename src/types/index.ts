export type CategorySlug =
  | 'brincos'
  | 'conjuntos-e-colares'
  | 'pulseiras'
  | 'bijuterias'
  | 'pecas-infantis';

export type PieceType = 'brinco' | 'colar' | 'pulseira' | 'anel' | 'conjunto' | 'choker';

export interface Product {
  id: string;
  categoria: CategorySlug;
  nome: string;
  material: string;
  tamanho: string;
  aro: string;
  preco: number;
  badge: 'Best Seller' | '';
  imagem: string;
  imagensComplementares?: string[];
  revisar: string[];
  tipoPeca: PieceType;
  descricao?: string;
  status?: 'publicado' | 'oculto' | 'indisponivel';
}

export interface CategoryInfo {
  slug: CategorySlug;
  nome: string;
  descricao: string;
  count: number;
  featuredProductId: string;
}

export interface StoreSettings {
  nomeLoja: string;
  assinatura: string;
  whatsappPhone: string;
  whatsappDisplay: string;
  instagramHandle: string;
  instagramUrl: string;
  tagline: string;
  logoUrl: string;
  pagamento: string;
  envio: string;
  mensagemAtendimento: string;
}

export interface CartItem {
  id: string; // product id or product id + selected option (e.g. BJ-01-M)
  productId: string;
  nome: string;
  tamanhoOuAro: string;
  preco: number;
  quantidade: number;
  imagem: string;
  material: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  name?: string;
  mustChangePassword?: boolean;
}
