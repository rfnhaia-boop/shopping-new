// SHOPPING NEW — NEO, o robozinho: balão de fala em cima dele (ex.: depois de pagar) e painel ao clicar nele.
// Aba Sacolas: o que foi comprado, por loja (as últimas compras destacadas) com "Vestir" direto dali.
// Aba Conversar: papo roteirizado (levar até uma loja, o que comprei, saldo, quais lojas). Sem servidor.
import * as THREE from 'three';
import { CATALOGO_ROUPAS } from '../../shared/personagem/guarda-roupa.js';
import { Perfil } from '../../shared/personagem/perfil.js';

const $ = s => document.querySelector(s);
const item = id => CATALOGO_ROUPAS.find(r => r.id === id);
const COR_LOJA = { 'ATELIÊ': '#f4f1ea', 'LE FERRI': '#050505', 'VANTRA': '#c6ff3d', 'NEW WEAR': '#4c1d95', 'NEW LAB': '#8b5cf6' };
const sem = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function criaRoboPainel({ J, robo, cam, aviso, ir, destinos }) {
  const painel = $('#robo-p'), corpo = painel.querySelector('.rp-corpo'), balao = $('#robo-balao');
  let aba = 'sacolas', novosDesde = 0, falaAte = 0, historico = [];

  /* ---------- balão de fala preso na cabeça do robô ---------- */
  const v = new THREE.Vector3();
  function fala(html, ms = 3200) { balao.innerHTML = html; balao.classList.add('on'); falaAte = performance.now() + ms; }
  function update() {
    if (falaAte && performance.now() > falaAte) { balao.classList.remove('on'); falaAte = 0; }
    if (!balao.classList.contains('on')) return;
    robo.grupo.getWorldPosition(v); v.y += .62; v.project(cam);
    if (v.z > 1) { balao.style.opacity = 0; return; }
    balao.style.opacity = '';
    balao.style.left = `${Math.round((v.x * .5 + .5) * innerWidth + 8)}px`; balao.style.top = `${Math.round((-v.y * .5 + .5) * innerHeight - balao.offsetHeight)}px`;
  }

  /* ---------- aba Sacolas ---------- */
  function desenhaSacolas() {
    const lista = robo.lista();
    if (!lista.length) { corpo.innerHTML = '<p class="rp-vazio">Ainda não estou carregando nada. Quando você pagar no caixa de uma loja, eu guardo a embalagem aqui e você pode vestir a peça quando quiser.</p>'; return; }
    const lojas = [...new Set(lista.map(s => s.loja))], corpoP = J.p && J.p.cfg.corpo, vestindo = J.p ? Object.values(J.p.cfg.roupas) : [];
    corpo.innerHTML = lojas.map(l => {
      const daLoja = lista.filter(s => s.loja === l);
      return `<div class="rp-loja"><i style="background:${COR_LOJA[l] || '#8b5cf6'}"></i>${l} · ${daLoja.length} ${daLoja.length > 1 ? 'sacolas' : 'sacola'}</div>` + daLoja.map(s => {
        const r = s.id && item(s.id);
        if (!r) return `<div class="rp-item"><span class="cor" style="background:#ede9fe"></span><div><b>Embalagem ${l}</b><small>peça já guardada no closet</small></div></div>`;
        const serve = !r.corpos || r.corpos.includes(corpoP), usa = vestindo.includes(r.id);
        return `<div class="rp-item ${s.quando >= novosDesde && novosDesde ? 'novo' : ''}"><span class="cor" style="background:${r.cor || '#ccc'}"></span><div><b>${r.nome.replace(/ \(CLO, teste\)/, '')}</b><small>${s.quando >= novosDesde && novosDesde ? 'acabou de comprar' : 'comprado'}${serve ? '' : ' · não serve nesse corpo'}</small></div>` +
          `<button data-vestir="${r.id}" ${usa || !serve ? 'disabled' : ''}>${usa ? 'Vestindo' : 'Vestir'}</button></div>`;
      }).join('');
    }).join('');
  }
  corpo.addEventListener('click', async e => {
    const b = e.target.closest('button[data-vestir]'); if (b && !b.disabled && J.p) {
      const r = item(b.dataset.vestir); b.disabled = true; b.textContent = '…';
      try { await J.p.muda({ roupas: { ...J.p.cfg.roupas, [r.slot]: r.id } }); const p = Perfil.ler() || {}; Perfil.salvar({ nome: p.nome || 'Visitante', cfg: { ...J.p.cfg, roupas: { ...J.p.cfg.roupas } } }); fala(`Ficou ótimo com <b>${r.nome}</b>!`, 2400); }
      catch (err) { aviso('Não deu pra vestir agora'); }
      desenhaSacolas(); return;
    }
    const c = e.target.closest('button[data-diz]'); if (c) responde(c.dataset.diz);
  });

  /* ---------- aba Conversar ---------- */
  const CHIPS = ['Me leva pra LE FERRI', 'O que eu comprei?', 'Meu saldo', 'Quais lojas tem?'];
  function desenhaPapo() {
    if (!historico.length) historico.push({ quem: 'neo', t: 'Oi! Eu sou o Neo, do Shopping NEW. Carrego suas sacolas e te levo em qualquer loja. Pergunta aí.' });
    corpo.innerHTML = historico.map(m => `<div class="rp-msg ${m.quem}">${m.t}</div>`).join('') + `<div class="rp-chips">${CHIPS.map(c => `<button data-diz="${c}">${c}</button>`).join('')}</div>`;
    corpo.scrollTop = corpo.scrollHeight;
  }
  function responde(txt) {
    historico.push({ quem: 'eu', t: txt.replace(/</g, '&lt;') });
    const q = sem(txt), ds = destinos();
    const alvo = ds.slice().sort((a, b) => b.nome.length - a.nome.length).find(d => q.includes(sem(d.nome)) || (d.apelidos || []).some(a => q.includes(a)));
    let r;
    if (alvo && /(leva|vai|ir |ir$|bora|onde|quero|me manda|teleport|para|pra)/.test(q)) { r = `Bora! Te levo pra <b>${alvo.nome}</b>.`; setTimeout(() => { fecha(); ir(alvo.nome); }, 900); }
    else if (alvo) r = `<b>${alvo.nome}</b>: ${alvo.sub || 'fica aqui no shopping'}. Quer que eu te leve? É só dizer "me leva pra ${alvo.nome}".`;
    else if (/comprei|compra|sacola|embalag/.test(q)) { const n = robo.lista().length; r = n ? `Tô carregando ${n} ${n > 1 ? 'sacolas' : 'sacola'}. Abre a aba <b>Sacolas</b> pra ver e vestir.` : 'Ainda nenhuma compra. Pega uma peça, paga no caixa da loja e eu levo a sacola.'; }
    else if (/saldo|moeda|dinheiro|quanto tenho/.test(q)) r = `Você tem <b>${Perfil.saldo()} moedas</b>.`;
    else if (/loja|tem o que|o que tem/.test(q)) r = 'Temos: ' + ds.filter(d => d.grupo !== 'Shopping').map(d => `<b>${d.nome}</b>`).join(', ') + '.';
    else if (/drone/.test(q)) r = 'Quando passa de 4 sacolas eu chamo um drone pra me ajudar. Ele carrega até mais 10.';
    else if (/^(oi|ola|e ai|eai|bom dia|boa tarde|boa noite)/.test(q)) r = 'Oi! Quer ir pra alguma loja ou ver suas compras?';
    else if (/obrigad|valeu/.test(q)) r = 'Imagina! Tô aqui do seu lado.';
    else r = 'Ainda tô aprendendo. Posso te levar pra uma loja, mostrar suas sacolas ou dizer seu saldo.';
    historico.push({ quem: 'neo', t: r }); if (aba === 'papo') desenhaPapo();
  }
  painel.querySelector('.rp-form').addEventListener('submit', e => { e.preventDefault(); const i = e.target.querySelector('input'); if (!i.value.trim()) return; responde(i.value.trim()); i.value = ''; });

  /* ---------- abrir/fechar ---------- */
  function desenha() { painel.classList.toggle('papo', aba === 'papo'); painel.querySelectorAll('.rp-abas button').forEach(b => b.classList.toggle('on', b.dataset.aba === aba)); aba === 'papo' ? desenhaPapo() : desenhaSacolas(); }
  function abre(a) { if (a) aba = a; painel.classList.add('on'); desenha(); }
  function fecha() { painel.classList.remove('on'); }
  painel.querySelector('.rp-abas').addEventListener('click', e => { const b = e.target.closest('button[data-aba]'); if (b) { aba = b.dataset.aba; desenha(); } });
  painel.querySelector('.rp-x').onclick = fecha;
  painel.addEventListener('pointerdown', e => { if (e.target === painel) fecha(); });
  painel.addEventListener('keydown', e => e.stopPropagation());
  addEventListener('keydown', e => { if (e.code === 'Escape') fecha(); });

  // depois de pagar: o Neo fala, e em seguida mostra as sacolas novas
  addEventListener('compra:feita', e => {
    const { loja, ids } = e.detail; novosDesde = Date.now() - 1500;
    setTimeout(() => fala(`Guardei ${ids.length > 1 ? `suas <b>${ids.length} sacolas</b>` : 'sua sacola'} da <b>${loja}</b>! Clica em mim pra ver.`, 3000), 500);
    setTimeout(() => abre('sacolas'), 3400);
  });
  setTimeout(() => fala('Oi! Sou o <b>Neo</b>. Clica em mim pra conversar.', 3600), 2500);
  return { abre, fecha, fala, update, responde };
}
