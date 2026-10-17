import type { CartItem } from '../types/index.ts';

export const WHATSAPP_PHONE = '5511994584059';
export const WHATSAPP_DISPLAY = '(11) 99458-4059';
export const INSTAGRAM_HANDLE = '@lufaeacessorios_';
export const INSTAGRAM_URL = 'https://www.instagram.com/lufaeacessorios_/';

/**
 * Formata um número para moeda BRL (ex.: 25.5 -> "R$ 25,50")
 */
export function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Calcula o subtotal dos itens da sacola
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
}

/**
 * Gera a mensagem formatada para envio pelo WhatsApp conforme a seção 7 do catálogo
 */
export function buildWhatsAppMessage(items: CartItem[]): string {
  const subtotal = calculateSubtotal(items);

  const lines = items.map((item) => {
    let spec = '';
    if (item.tamanhoOuAro) {
      if (item.tamanhoOuAro.startsWith('Aro')) {
        spec = ` — ${item.tamanhoOuAro}`;
      } else if (item.tamanhoOuAro === 'Não tem') {
        spec = ' — Aro: a consultar';
      } else {
        spec = ` — Tam. ${item.tamanhoOuAro}`;
      }
    }
    return `• ${item.quantidade}x ${item.nome}${spec} — ${formatCurrencyBRL(item.preco)}`;
  });

  return (
    `Olá, Lufae! Gostaria de fazer um pedido:\n\n` +
    `${lines.join('\n')}\n\n` +
    `Subtotal dos itens: ${formatCurrencyBRL(subtotal)}\n\n` +
    `Pode me ajudar com as formas de pagamento e o envio?`
  );
}

/**
 * Retorna o link completo do WhatsApp com a mensagem codificada
 */
export function generateWhatsAppOrderUrl(items: CartItem[], phone: string = WHATSAPP_PHONE): string {
  const message = buildWhatsAppMessage(items);
  const cleanPhone = phone.replace(/\D/g, '') || WHATSAPP_PHONE;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Retorna link direto de dúvida sobre um produto específico
 */
export function generateWhatsAppProductQueryUrl(productName: string, phone: string = WHATSAPP_PHONE): string {
  const message = `Olá, Lufae! Gostaria de tirar uma dúvida sobre a peça: ${productName}`;
  const cleanPhone = phone.replace(/\D/g, '') || WHATSAPP_PHONE;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

