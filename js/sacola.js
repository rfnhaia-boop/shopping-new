// SHOPPING NEW — SACOLA + CARTEIRA. A peça vai pra sacola marcada com a LOJA onde foi pega; cada loja só cobra no próprio caixa.
// Depois de pago, quem carrega as embalagens é o robozinho (robo.js). Sacola fica no navegador (sessionStorage); saldo/compras no Perfil.
import { CATALOGO_ROUPAS } from '../../shared/personagem/guarda-roupa.js';
import { Perfil } from '../../shared/personagem/perfil.js';

const $ = s => document.querySelector(s);
const CHAVE = 'new_sacola_v2';
export const moedas = v => v ? `${v} moedas` : 'grátis';
const item = id => CATALOGO_ROUPAS.find(r => r.id === id);
const preco = id => (item(id) || {}).preco || 0;

export function criaSacola({ J, aviso }) {
  let itens = [];                                   // [{ id, loja }]
  try { itens = JSON.parse(sessionStorage.getItem(CHAVE)) || []; } catch (e) {}
  const grava = () => { try { sessionStorage.setItem(CHAVE, JSON.stringify(itens)); } catch (e) {} };
  const ouvintes = [];
  let irCaixa = null, lojaAgora = () => 'Shopping NEW';
  const painel = $('#sacola');

  const lojas = () => [...new Set(itens.map(i => i.loja))];
  const ids = loja => itens.filter(i => !loja || i.loja === loja).map(i => i.id);
  const total = loja => ids(loja).reduce((t, id) => t + preco(id), 0);

  const desenha = () => {
    $('#sc-n').textContent = itens.length; $('#b-sacola').classList.toggle('cheia', itens.length > 0);
    $('#ct-v').textContent = Perfil.saldo();
    if (!itens.length) $('#sc-lista').innerHTML = '<li class="vazia">Sua sacola está vazia. Clique numa peça ou num manequim.</li>';
    else $('#sc-lista').innerHTML = lojas().map(l => `<li class="sc-loja"><b>${l}</b><span>${moedas(total(l))}</span></li>` +
      ids(l).map(id => { const r = item(id) || { nome: id }; return `<li><span>${r.nome}</span><b>${moedas(r.preco)}</b><button data-id="${id}" aria-label="Tirar da sacola">×</button></li>`; }).join('') +
      `<li class="sc-pagar"><button class="b-lima" data-loja="${l}">Pagar no caixa da ${l}</button></li>`).join('');
    $('#sc-total').textContent = moedas(total()); $('#sc-saldo').textContent = moedas(Perfil.saldo());
    const falta = total() - Perfil.saldo();
    $('#sc-nota').textContent = !itens.length ? '' : falta > 0 ? `Faltam ${falta} moedas.` : 'Cada loja cobra no próprio caixa. Depois de pago, o robozinho leva as embalagens.';
    $('.sc-botoes').innerHTML = '';
    ouvintes.forEach(f => f(itens));
  };
  $('#sc-lista').addEventListener('click', e => {
    const b = e.target.closest('button[data-id]'); if (b) { tira(b.dataset.id); return; }
    const p = e.target.closest('button[data-loja]'); if (p) { painel.classList.remove('on'); irCaixa && irCaixa(p.dataset.loja); }
  });
  $('#b-sacola').onclick = () => { painel.classList.toggle('on'); desenha(); };
  $('#sc-fecha').onclick = () => painel.classList.remove('on');
  addEventListener('perfil:mudou', () => { $('#ct-v').textContent = Perfil.saldo(); });

  function poe(lista, loja) {
    const onde = loja || lojaAgora() || 'Shopping NEW';
    const novos = lista.filter(id => !itens.some(i => i.id === id) && !Perfil.possui(id, preco(id)));
    if (!novos.length) { aviso(lista.every(id => Perfil.possui(id, preco(id))) ? 'Você já tem essa peça' : 'Já está na sacola'); return 0; }
    novos.forEach(id => itens.push({ id, loja: onde })); grava(); desenha();
    const b = $('#b-sacola'); b.classList.remove('pulo'); void b.offsetWidth; b.classList.add('pulo');
    aviso(novos.length > 1 ? `${novos.length} peças na sacola · ${onde}` : `${(item(novos[0]) || {}).nome || 'Peça'} na sacola · ${onde}`);
    return novos.length;
  }
  function tira(id) { itens = itens.filter(i => i.id !== id); grava(); desenha(); }
  function esvazia(loja) { itens = loja ? itens.filter(i => i.loja !== loja) : []; grava(); desenha(); }

  desenha();
  return {
    poe, tira, esvazia, itens: ids, total, lojas, lojaDe: id => (itens.find(i => i.id === id) || {}).loja,
    update() {}, ao: f => ouvintes.push(f), redesenha: desenha,
    leva() {}, defineRobo() {}, defineCaixa(f) { irCaixa = f; }, defineLoja(f) { lojaAgora = f; }, fechaPainel() { painel.classList.remove('on'); },
  };
}
