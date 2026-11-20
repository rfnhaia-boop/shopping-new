// SHOPPING NEW — CAIXA. Paga a sacola com moedas do jogo e escolhe: sair vestindo ou levar na sacola.
// Também devolve sozinha a roupa que a pessoa provou e não pagou quando ela sai da loja.
import { CATALOGO_ROUPAS } from '../../shared/personagem/guarda-roupa.js';
import { Perfil } from '../../shared/personagem/perfil.js';
import { moedas } from './sacola.js';

const $ = s => document.querySelector(s);
const item = id => CATALOGO_ROUPAS.find(r => r.id === id);

// caixas: { nome, ala, x, z (coordenadas locais da ala onde o cliente fica), olhaZ } + retângulo da loja (pra saber se saiu)
export function criaCaixa({ J, sacola, aviso, mundo, caixas, lojas, robo }) {
  const modal = $('#caixa'), pill = $('#b-pagar');
  let vestir = true, lojaCx = null;   // o caixa aberto é de UMA loja: só cobra as peças pegas nela
  const mundoDe = (c, x, z) => c.ala.mundo(x, z);

  function maisPerto() {
    let best = null, bd = 1e9;
    for (const c of caixas) { const p = mundoDe(c, c.x, c.z), d = Math.hypot(p.x - J.pos.x, p.z - J.pos.z); if (d < bd) { bd = d; best = c; } }
    return { c: best, d: bd };
  }
  function vaiAoCaixa(nome) {
    const loja = lojaAtual(), alvo = nome || (loja && loja.nome) || sacola.lojas()[0];
    const c = caixas.find(k => k.nome === alvo) || maisPerto().c;
    const p = mundoDe(c, c.x, c.z), o = mundoDe(c, c.x, c.olhaZ);
    J.pos.set(p.x, 0, p.z); J.dest = null; J.rumo = Math.atan2(o.x - p.x, o.z - p.z); J.camYaw = J.rumo + Math.PI; J.camPitch = .2; J.dist = 4.2;
    abre(c.nome);
  }
  sacola.defineCaixa(vaiAoCaixa);

  function desenha() {
    const ids = sacola.itens(lojaCx), tot = sacola.total(lojaCx), saldo = Perfil.saldo(), corpo = J.p && J.p.cfg.corpo;
    $('#caixa .cx-tit').textContent = 'Caixa · ' + (lojaCx || '');
    $('#cx-lista').innerHTML = ids.map(id => { const r = item(id) || { nome: id }; const serve = !r.corpos || r.corpos.includes(corpo); return `<li><span>${r.nome}${serve ? '' : ' <em>(não serve nesse corpo)</em>'}</span><b>${moedas(r.preco)}</b></li>`; }).join('');
    $('#cx-total').textContent = moedas(tot); $('#cx-saldo').textContent = moedas(saldo); $('#cx-depois').textContent = moedas(Math.max(0, saldo - tot));
    const falta = tot - saldo; $('#cx-pagar').disabled = !ids.length || falta > 0;
    $('#cx-pagar').textContent = falta > 0 ? `Faltam ${falta} moedas` : `Pagar ${moedas(tot)}`;
    document.querySelectorAll('#caixa .cx-op').forEach(b => b.classList.toggle('on', (b.dataset.v === 'vestir') === vestir));
  }
  function abre(nome) {
    const aqui = lojaAtual(); lojaCx = nome || (aqui && aqui.nome) || (maisPerto().c || {}).nome;
    if (!sacola.itens(lojaCx).length) { const outras = sacola.lojas(); aviso(outras.length ? `Nada da ${lojaCx} na sacola. Pague cada peça no caixa da loja dela (${outras.join(', ')}).` : 'Sua sacola está vazia'); return; }
    sacola.fechaPainel(); desenha(); modal.classList.add('on');
  }
  function fecha() { modal.classList.remove('on'); }
  $('#cx-fecha').onclick = fecha;
  document.querySelectorAll('#caixa .cx-op').forEach(b => b.onclick = () => { vestir = b.dataset.v === 'vestir'; desenha(); });
  pill.onclick = () => abre(pill.dataset.loja);

  $('#cx-pagar').onclick = async () => {
    const ids = sacola.itens(lojaCx), tot = sacola.total(lojaCx), loja = lojaCx;
    if (!ids.length || !Perfil.debita(tot)) { desenha(); return; }
    ids.forEach(id => Perfil.compra(id, (item(id) || {}).preco || 0));
    // a roupa que ela estava provando passa a ser dela (não volta mais)
    J.provando = null; $('#provando').classList.remove('on');
    const corpo = J.p && J.p.cfg.corpo;
    if (vestir && J.p) {
      const roupas = { ...J.p.cfg.roupas }; let pulou = 0;
      ids.forEach(id => { const r = item(id); if (!r) return; if (r.corpos && !r.corpos.includes(corpo)) { pulou++; return; } roupas[r.slot] = id; });
      await J.p.muda({ roupas });
      const p = Perfil.ler() || {}; Perfil.salvar({ nome: p.nome || 'Visitante', cfg: { ...J.p.cfg } });
      aviso(pulou ? `Pago! Vestindo o que serve; ${pulou} peça(s) foram pro closet` : `Pago na ${loja}! Saindo vestindo · −${tot} moedas`);
    } else {
      aviso(`Pago na ${loja}! Levando · −${tot} moedas`);
    }
    // vestindo ou não, a loja entrega a embalagem: o robozinho carrega (uma sacola por peça)
    robo && robo.recebe(loja, ids.length, ids);
    addEventListener && dispatchEvent(new CustomEvent('compra:feita', { detail: { loja, ids, tot } }));
    sacola.esvazia(loja); fecha();
    pill.classList.remove('on');
  };

  /* ---------- por frame: botão "Pagar" perto do caixa + devolver roupa provada ao sair da loja ---------- */
  function lojaAtual() {
    for (const l of lojas) { const c = l.ala.c, s = l.ala.s, lx = J.pos.x * c + J.pos.z * s, lz = -J.pos.x * s + J.pos.z * c; if (lx > l.x0 && lx < l.x1 && lz > l.z0 && lz < l.z1) return l; }
    return null;
  }
  let dentro = null;
  function update() {
    const { c, d } = maisPerto(), tem = c && sacola.itens(c.nome).length > 0;
    pill.classList.toggle('on', d < 3.2 && tem && !modal.classList.contains('on'));
    if (c && pill.dataset.loja !== c.nome) { pill.dataset.loja = c.nome; pill.textContent = 'Pagar na ' + c.nome; }
    const l = lojaAtual();
    if (dentro && !l && J.provando && J.p) {
      const antes = J.provando.antes; J.provando = null; $('#provando').classList.remove('on');
      J.p.muda({ roupas: antes }); aviso('Roupa provada devolvida na saída da loja');
    }
    dentro = l;
  }
  addEventListener('keydown', e => { if (e.code === 'Escape') fecha(); });
  return { abre, update, vaiAoCaixa, lojaAtual };
}
