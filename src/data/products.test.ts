import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, CATEGORIES } from './products.ts';
import { calculateSubtotal, buildWhatsAppMessage, formatCurrencyBRL } from '../utils/formatters.ts';
import type { CartItem } from '../types/index.ts';

test('Catálogo contém exatamente 68 itens', () => {
  assert.equal(PRODUCTS.length, 68, `Esperado 68 itens, encontrado ${PRODUCTS.length}`);
});

test('Produto PU-01 está configurado na categoria de pulseiras', () => {
  const pu01 = PRODUCTS.find((p) => p.id === 'PU-01');
  assert.ok(pu01, 'PU-01 deve existir');
  assert.equal(pu01.categoria, 'pulseiras');
  const catPulseiras = CATEGORIES.find((c) => c.slug === 'pulseiras');
  assert.equal(catPulseiras?.featuredProductId, 'PU-01');
});

test('Contagem exata por categoria', () => {
  const brincos = PRODUCTS.filter((p) => p.categoria === 'brincos');
  const conjuntos = PRODUCTS.filter((p) => p.categoria === 'conjuntos-e-colares');
  const pulseiras = PRODUCTS.filter((p) => p.categoria === 'pulseiras');
  const infantis = PRODUCTS.filter((p) => p.categoria === 'pecas-infantis');
  const bijuterias = PRODUCTS.filter((p) => p.categoria === 'bijuterias');

  assert.equal(brincos.length, 23, 'Brincos deve ter 23 itens');
  assert.equal(conjuntos.length, 12, 'Conjuntos e Colares deve ter 12 itens');
  assert.equal(pulseiras.length, 5, 'Pulseiras deve ter 5 itens');
  assert.equal(infantis.length, 6, 'Peças Infantis deve ter 6 itens');
  assert.equal(bijuterias.length, 22, 'Bijuterias deve ter 22 itens');
});

test('Somas de conferência por categoria e total geral de R$ 1.611,50', () => {
  const sumBrincos = PRODUCTS.filter((p) => p.categoria === 'brincos').reduce((a, b) => a + b.preco, 0);
  const sumConjuntos = PRODUCTS.filter((p) => p.categoria === 'conjuntos-e-colares').reduce((a, b) => a + b.preco, 0);
  const sumPulseiras = PRODUCTS.filter((p) => p.categoria === 'pulseiras').reduce((a, b) => a + b.preco, 0);
  const sumInfantis = PRODUCTS.filter((p) => p.categoria === 'pecas-infantis').reduce((a, b) => a + b.preco, 0);
  const sumBijuterias = PRODUCTS.filter((p) => p.categoria === 'bijuterias').reduce((a, b) => a + b.preco, 0);
  const sumTotal = PRODUCTS.reduce((a, b) => a + b.preco, 0);

  assert.equal(Math.round(sumBrincos * 100) / 100, 599.0, 'Soma Brincos deve ser R$ 599,00');
  assert.equal(Math.round(sumConjuntos * 100) / 100, 561.5, 'Soma Conjuntos deve ser R$ 561,50');
  assert.equal(Math.round(sumPulseiras * 100) / 100, 161.0, 'Soma Pulseiras deve ser R$ 161,00');
  assert.equal(Math.round(sumInfantis * 100) / 100, 177.0, 'Soma Infantis deve ser R$ 177,00');
  assert.equal(Math.round(sumBijuterias * 100) / 100, 113.0, 'Soma Bijuterias deve ser R$ 113,00');
  assert.equal(Math.round(sumTotal * 100) / 100, 1611.5, 'Soma Geral deve ser R$ 1.611,50');
});

test('Apenas CJ-02 possui o selo Best Seller', () => {
  const bestSellers = PRODUCTS.filter((p) => p.badge === 'Best Seller');
  assert.equal(bestSellers.length, 1);
  assert.equal(bestSellers[0].id, 'CJ-02');
});

test('Formato da mensagem do WhatsApp corresponde ao exemplo da seção 7', () => {
  const mockItems: CartItem[] = [
    {
      id: 'BR-01-P',
      productId: 'BR-01',
      nome: 'Brinco Formato de Coração (Prata)',
      tamanhoOuAro: 'P',
      preco: 25.5,
      quantidade: 2,
      imagem: '/produtos/BR-01.webp',
      material: 'Prata',
    },
    {
      id: 'BJ-05-17',
      productId: 'BJ-05',
      nome: 'Anel Liso Dourado',
      tamanhoOuAro: 'Aro 17',
      preco: 5.0,
      quantidade: 1,
      imagem: '/produtos/BJ-05.webp',
      material: 'Dourado',
    },
  ];

  const subtotal = calculateSubtotal(mockItems);
  assert.equal(subtotal, 56.0);

  const message = buildWhatsAppMessage(mockItems);
  assert.ok(message.includes('Olá, Lufae! Gostaria de fazer um pedido:'));
  assert.ok(message.includes('• 2x Brinco Formato de Coração (Prata) — Tam. P — R$ 25,50') || message.includes('• 2x Brinco Formato de Coração (Prata) — Tam. P — R$\u00a025,50'));
  assert.ok(message.includes('• 1x Anel Liso Dourado — Aro 17 — R$ 5,00') || message.includes('• 1x Anel Liso Dourado — Aro 17 — R$\u00a05,00'));
  assert.ok(message.includes('Subtotal dos itens: R$ 56,00') || message.includes('Subtotal dos itens: R$\u00a056,00'));
  assert.ok(message.includes('Pode me ajudar com as formas de pagamento e o envio?'));
});
