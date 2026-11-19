// SHOPPING NEW — SACOLA + CARTEIRA. A personagem junta peças numa sacola (que aparece na mão dela) e paga no caixa com moedas do jogo.
// Estado da sacola fica no navegador (sessionStorage); saldo e compras ficam no Perfil global (vale em todas as lojas).
import * as THREE from 'three';
import { CATALOGO_ROUPAS } from '../../shared/personagem/guarda-roupa.js';
import { Perfil } from '../../shared/personagem/perfil.js';

const $ = s => document.querySelector(s);
const CHAVE = 'new_sacola_v1';
export const moedas = v => v ? `${v} moedas` : 'grátis';
const item = id => CATALOGO_ROUPAS.find(r => r.id === id);

export function criaSacola({ J, scene, aviso }) {
  let itens = [];
  try { itens = JSON.parse(sessionStorage.getItem(CHAVE)) || []; } catch (e) {}
  const grava = () => { try { sessionStorage.setItem(CHAVE, JSON.stringify(itens)); } catch (e) {} };
  const ouvintes = [];

  /* ---------- HUD: botão da sacola + carteira ---------- */
  const painel = $('#sacola');
  const desenha = () => {
    $('#sc-n').textContent = itens.length; $('#b-sacola').classList.toggle('cheia', itens.length > 0);
    $('#ct-v').textContent = Perfil.saldo();
    const tot = total();
    $('#sc-lista').innerHTML = itens.length ? itens.map(id => { const r = item(id) || { nome: id }; return `<li><span>${r.nome}</span><b>${moedas(r.preco)}</b><button data-id="${id}" aria-label="Tirar da sacola">×</button></li>`; }).join('') : '<li class="vazia">Sua sacola está vazia. Clique numa peça ou num manequim.</li>';
    $('#sc-total').textContent = moedas(tot); $('#sc-saldo').textContent = moedas(Perfil.saldo());
    const falta = tot - Perfil.saldo();
    $('#sc-nota').textContent = !itens.length ? '' : falta > 0 ? `Faltam ${falta} moedas.` : 'Pague no caixa e saia vestindo ou leve na sacola.';
    bolsa3d.visible = itens.length > 0 || levando; bolsa3d.scale.setScalar(.85 + Math.min(Math.max(itens.length, levando ? 2 : 0), 6) * .05);
    $('.sc-botoes').innerHTML = itens.length ? '<button id="sc-caixa" class="b-lima">Ir ao caixa</button>' : '';
    const bc = $('#sc-caixa'); if (bc) bc.onclick = () => { painel.classList.remove('on'); irCaixa && irCaixa(); };
    ouvintes.forEach(f => f(itens));
  };
  let levando = false, irCaixa = null;
  $('#sc-lista').addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (b) tira(b.dataset.id); });
  $('#b-sacola').onclick = () => { painel.classList.toggle('on'); desenha(); };
  $('#sc-fecha').onclick = () => painel.classList.remove('on');
  addEventListener('perfil:mudou', () => { $('#ct-v').textContent = Perfil.saldo(); });

  function total() { return itens.reduce((t, id) => t + ((item(id) || {}).preco || 0), 0); }
  function poe(ids) {
    const novos = ids.filter(id => !itens.includes(id) && !Perfil.possui(id, (item(id) || {}).preco));
    if (!novos.length) { aviso(ids.every(id => Perfil.possui(id, (item(id) || {}).preco)) ? 'Você já tem essa peça' : 'Já está na sacola'); return 0; }
    itens.push(...novos); grava(); desenha();
    const b = $('#b-sacola'); b.classList.remove('pulo'); void b.offsetWidth; b.classList.add('pulo');
    aviso(novos.length > 1 ? `${novos.length} peças na sacola` : `${(item(novos[0]) || {}).nome || 'Peça'} na sacola`);
    return novos.length;
  }
  function tira(id) { itens = itens.filter(x => x !== id); grava(); desenha(); }
  function esvazia() { itens = []; grava(); desenha(); }

  /* ---------- sacola 3D na mão direita da personagem ---------- */
  const bolsa3d = new THREE.Group(); scene.add(bolsa3d);
  {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 300; const x = cv.getContext('2d');
    x.fillStyle = '#f4ede0'; x.fillRect(0, 0, 256, 300);
    x.fillStyle = '#8f7a55'; x.font = '400 40px "Didot","Bodoni MT","Times New Roman",serif'; x.textAlign = 'center'; x.letterSpacing = '8px'; x.fillText('ATELIÊ', 128, 160);
    x.fillStyle = '#c9b38a'; x.fillRect(78, 182, 100, 2);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    const papel = new THREE.MeshStandardMaterial({ color: 0xf4ede0, roughness: .85 }), frente = new THREE.MeshStandardMaterial({ map: t, roughness: .85 });
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(.3, .32, .12), [papel, papel, papel, papel, frente, frente]); corpo.position.y = -.27; corpo.castShadow = true; bolsa3d.add(corpo);
    const alca = new THREE.Mesh(new THREE.TorusGeometry(.065, .006, 6, 20, Math.PI), new THREE.MeshStandardMaterial({ color: 0xc9b38a, roughness: .5 })); alca.position.y = -.11; bolsa3d.add(alca);
  }
  bolsa3d.visible = false;
  let mao = null, malha = null;
  const pw = new THREE.Vector3();
  function update() {
    if (!bolsa3d.visible || !J.p || !J.p.corpoMalha) return;
    if (malha !== J.p.corpoMalha) { malha = J.p.corpoMalha; mao = malha.skeleton.bones.find(b => b.name === 'hand_r') || null; }
    // fica pendurada ao lado do quadril, do lado da mão direita, um pouco pra fora (não some dentro da saia)
    let lado = new THREE.Vector3(Math.cos(J.rumo), 0, -Math.sin(J.rumo));
    if (mao) { mao.getWorldPosition(pw); const d = new THREE.Vector3(pw.x - J.pos.x, 0, pw.z - J.pos.z); if (d.dot(lado) < 0) lado.negate(); }
    bolsa3d.position.set(J.pos.x + lado.x * .56, J.pos.y + 1.0, J.pos.z + lado.z * .56);
    bolsa3d.rotation.y = J.rumo + Math.PI / 2;
  }

  desenha();
  return { poe, tira, esvazia, itens: () => [...itens], total, update, ao: f => ouvintes.push(f), redesenha: desenha,
    leva(v) { levando = v; desenha(); }, defineCaixa(f) { irCaixa = f; }, fechaPainel() { painel.classList.remove('on'); } };
}
