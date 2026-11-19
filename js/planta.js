// SHOPPING NEW (moda) — planta em TRÊS ALAS ao redor de um átrio hexagonal. Metros. Cada ala tem seu eixo (x = ao longo da ala, a partir do centro; z = de lado).
export const SH = {
  apotema: 14,                // átrio hexagonal: distância do centro até cada lado
  teto: 10,                   // pé-direito das alas
  tetoAtrio: 14,
  zAl: 8,                     // meia-largura das alas
  porta: 3.6,
};
// ang: direção da ala no plano (rad, de +X para +Z). A de 180° é a de ENTRADA (praça lá fora, a oeste).
export const ALAS = [
  { id: 'entrada', ang: Math.PI,       comp: 30, nome: 'Entrada' },
  { id: 'vantra',  ang: Math.PI / 3,   comp: 52, nome: 'Ala VANTRA' },
  { id: 'street',  ang: -Math.PI / 3,  comp: 52, nome: 'Ala em breve' },
];
// vitrines "em breve" (só moda). Cada ala distribui as suas pelos dois lados.
export const EM_BREVE = {
  entrada: { '-1': ['Moda feminina', 'Joias'], '1': ['Calçados', 'Óculos'] },
  street:  { '-1': ['Moda masculina', 'Tênis & street', 'Jeans'], '1': ['Esportiva', 'Premium', 'Acessórios'] },
  vantra:  { '-1': ['Íntima & praia', 'Infantil'] },
};
// a loja âncora: ocupa o lado +1 da ala VANTRA, a partir de x
export const VANTRA = { ala: 'vantra', lado: 1, x0: 17, w: 36, d: 36 };
export const COR_BREVE = ['#f4a6b8', '#8fc6f4', '#ffd36b', '#9be0b0', '#c9aef5', '#ffb07a'];
