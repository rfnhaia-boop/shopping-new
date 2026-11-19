// SHOPPING NEW — PROVADOR. A personagem entra no provador da loja, a câmera vira o "espelho" (de frente pra ela)
// e ela veste/tira as peças da sacola (e as que mandou provar pela ficha). Ao sair, o que não foi pago volta.
import { CATALOGO_ROUPAS } from '../../shared/personagem/guarda-roupa.js';
import { Perfil } from '../../shared/personagem/perfil.js';
import { moedas } from './sacola.js';

const $ = s => document.querySelector(s);
const item = id => CATALOGO_ROUPAS.find(r => r.id === id);
const meu = id => Perfil.possui(id, (item(id) || {}).preco);

// locais: [{ nome, ala, x, z, olhaZ }] em coordenadas locais da ala (onde ela fica de frente pro "espelho")
export function criaProvador({ J, sacola, caixa, aviso, locais }) {
  const painel = $('#provador');
  let extras = [], ponto = null, ativo = false;

  const lista = () => [...new Set([...sacola.itens(), ...extras])];
  const serve = id => { const r = item(id), c = J.p && J.p.cfg.corpo; return !r || !r.corpos || r.corpos.includes(c); };
  const vestindo = id => { const r = item(id); return !!(r && J.p && J.p.cfg.roupas[r.slot] === id); };

  function desenha() {
    if (!ativo) return;
    const ids = lista();
    $('#pr-loja').textContent = 'Provador · ' + (ponto ? ponto.nome : '');
    $('#pr-lista').innerHTML = ids.length ? ids.map(id => {
      const r = item(id) || { nome: id }, ok = serve(id), v = vestindo(id), naSacola = sacola.itens().includes(id);
      return `<li class="${v ? 'v' : ''}"><div><b>${r.nome}</b><span>${meu(id) ? 'sua' : moedas(r.preco)}${naSacola ? ' · na sacola' : ''}</span></div>
        ${ok ? `<button data-a="vestir" data-id="${id}" class="${v ? 'on' : ''}">${v ? 'Tirar' : 'Vestir'}</button>` : '<em>não serve</em>'}
        ${!meu(id) && !naSacola ? `<button data-a="sacola" data-id="${id}">+ sacola</button>` : ''}</li>`;
    }).join('') : '<li class="vazia">Ponha peças na sacola ou clique em "Provar" numa peça.</li>';
    const pend = sacola.itens().length;
    $('#pr-caixa').style.display = pend ? '' : 'none';
    $('#pr-nota').textContent = pend ? `${pend} peça(s) na sacola · ${moedas(sacola.total())}` : 'O que você não pagar volta quando sair do provador.';
  }

  async function veste(id) {
    if (!J.p) return; const r = item(id); if (!r) return;
    if (!J.provando) J.provando = { antes: { ...J.p.cfg.roupas }, ids: [] };
    const roupas = { ...J.p.cfg.roupas };
    if (roupas[r.slot] === id) roupas[r.slot] = J.provando.antes[r.slot] !== id ? J.provando.antes[r.slot] : roupas[r.slot];
    else roupas[r.slot] = id;
    J.provando.ids = lista().filter(x => roupas[(item(x) || {}).slot] === x);
    await J.p.muda({ roupas }); desenha();
  }
  painel.addEventListener('click', e => {
    const b = e.target.closest('button[data-a]'); if (!b) return;
    if (b.dataset.a === 'vestir') veste(b.dataset.id);
    else { sacola.poe([b.dataset.id]); desenha(); }
  });

  function irPonto(p) {
    const w = p.ala.mundo(p.x, p.z), o = p.ala.mundo(p.x, p.olhaZ);
    J.pos.set(w.x, 0, w.z); J.dest = null; J.rumo = Math.atan2(o.x - w.x, o.z - w.z);
    J.camYaw = J.rumo; J.camPitch = .1; J.dist = 3.1;                      // câmera na frente dela = espelho
  }
  async function abre(ids = []) {
    const loja = caixa.lojaAtual(), p = (loja && locais.find(l => l.nome === loja.nome)) || locais[0];
    ponto = p; ativo = true; extras = [...new Set([...extras, ...ids])];
    irPonto(p); painel.classList.add('on'); desenha();
    for (const id of ids) if (serve(id) && !vestindo(id)) await veste(id);
    aviso('Provador · arraste pra girar e se ver de todos os lados');
  }
  // sai: o que estava sendo provado e não foi pago volta pra roupa de antes
  async function sai() {
    if (!ativo) return; ativo = false; painel.classList.remove('on');
    if (J.provando && J.p) {
      const roupas = { ...J.p.cfg.roupas }, antes = J.provando.antes; let voltou = 0;
      for (const slot of Object.keys(roupas)) { const id = roupas[slot]; if (id && id !== antes[slot] && !meu(id)) { roupas[slot] = antes[slot]; voltou++; } }
      J.provando = null; if (voltou) { await J.p.muda({ roupas }); aviso('As peças não pagas ficaram no provador'); }
    }
    extras = [];
    J.camYaw = J.rumo + Math.PI; J.dist = 5;
  }
  $('#pr-sair').onclick = sai;
  $('#pr-caixa').onclick = () => { ativo = false; painel.classList.remove('on'); extras = []; caixa.vaiAoCaixa(); };
  sacola.ao(desenha);
  addEventListener('perfil:mudou', desenha);

  function update() {
    if (!ativo || !ponto) return;
    const w = ponto.ala.mundo(ponto.x, ponto.z);
    if (Math.hypot(J.pos.x - w.x, J.pos.z - w.z) > 3.5) sai();     // andou pra longe: saiu do provador
  }
  return { abre, sai, update, ativo: () => ativo };
}
