// SHOPPING NEW — FASE 2: interação de loja. Clicar numa peça (cabide) ou num manequim abre a FICHA: foto 3D gerada na hora, nome, preço,
// peças do look, "Provar" (leva sua personagem ao provador e veste a roupa nela) e "Comprar e vestir" (salva no perfil global).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { CATALOGO_ROUPAS } from '../../shared/personagem/guarda-roupa.js';
import { Perfil } from '../../shared/personagem/perfil.js';

const $ = s => document.querySelector(s);
const brl = v => v ? 'R$ ' + v.toLocaleString('pt-BR') : 'grátis';
const item = id => CATALOGO_ROUPAS.find(r => r.id === id);

/* foto 3D: renderiza um clone do objeto (peça ou manequim) num estúdio claro, fora da tela */
let R = null, S = null, C = null;
function foto(obj) {
  if (!R) {
    R = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); R.setSize(420, 560, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
    S = new THREE.Scene(); S.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), .04).texture;
    S.add(new THREE.HemisphereLight(0xffffff, 0xdfe3e8, 1.1)); const k = new THREE.DirectionalLight(0xffffff, 2); k.position.set(2, 4, 3); S.add(k);
    const rim = new THREE.DirectionalLight(0xd4ff3a, .9); rim.position.set(-3, 2, -2); S.add(rim);
    C = new THREE.PerspectiveCamera(24, 420 / 560, .05, 50);
  }
  const c = SkeletonUtils.clone(obj); c.position.set(0, 0, 0); c.rotation.set(0, 0, 0); c.scale.copy(obj.scale);
  c.traverse(o => { if (o.userData && o.userData.clic) delete o.userData.clic; });
  S.add(c); c.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(c), sz = bb.getSize(new THREE.Vector3()), ct = bb.getCenter(new THREE.Vector3());
  const dist = Math.max(sz.y, sz.x * 1.33) / (2 * Math.tan(THREE.MathUtils.degToRad(12))) * 1.15;
  C.position.set(ct.x + dist * .28, ct.y + sz.y * .05, ct.z + dist); C.lookAt(ct);
  R.render(S, C); const url = R.domElement.toDataURL('image/png'); S.remove(c); return url;
}

export function criaFicha({ J, irProvador, aviso }) {
  let atual = null;
  const painel = $('#ficha'), bar = $('#provando');
  const fecha = () => painel.classList.remove('on');
  $('#f-fecha').onclick = fecha;

  const pecasDe = info => info.tipo === 'peca' ? [info.id] : Object.values(info.roupas).filter(id => id && id !== 'nenhum');
  const podeVestir = ids => { const corpo = J.p && J.p.cfg.corpo; return ids.every(id => { const r = item(id); return !r || !r.corpos || r.corpos.includes(corpo); }); };

  function abrir(info, obj) {
    atual = info;
    const ids = pecasDe(info), total = ids.reduce((t, id) => t + ((item(id) || {}).preco || 0), 0);
    $('#f-img').src = foto(obj);
    $('#f-tag').textContent = info.tipo === 'peca' ? 'Peça · Drop 01' : 'Look completo · Drop 01';
    $('#f-nome').textContent = info.tipo === 'peca' ? (item(info.id) || {}).nome || info.id : (info.nome || 'Look VANTRA');
    $('#f-lista').innerHTML = ids.map(id => { const r = item(id) || { nome: id }; const tem = Perfil.possui(id, r.preco); return `<li><span>${r.nome}</span><b>${tem ? 'seu' : brl(r.preco)}</b></li>`; }).join('');
    $('#f-preco').textContent = brl(total);
    const ok = podeVestir(ids);
    $('#f-provar').disabled = !ok; $('#f-comprar').disabled = !ok;
    $('#f-nota').textContent = ok ? 'Provar leva você ao provador e veste a roupa na sua personagem.' : 'Essa roupa é feita pro corpo feminino. Troque no criador pra provar.';
    painel.classList.add('on');
  }

  function vestir(ids) {
    const roupas = { ...J.p.cfg.roupas };
    ids.forEach(id => { const r = item(id); if (r) roupas[r.slot] = id; });
    return J.p.muda({ roupas });
  }
  $('#f-provar').onclick = async () => {
    if (!atual || !J.p) return;
    const ids = pecasDe(atual);
    if (!J.provando) J.provando = { antes: { ...J.p.cfg.roupas } };
    J.provando.ids = ids; fecha(); irProvador();
    await vestir(ids);
    const total = ids.reduce((t, id) => t + ((item(id) || {}).preco || 0), 0);
    $('#pv-nome').textContent = ids.map(id => (item(id) || {}).nome || id).join(' + ');
    $('#pv-preco').textContent = brl(total); bar.classList.add('on');
  };
  async function comprar(ids) {
    ids.forEach(id => { const r = item(id); Perfil.compra(id, r ? r.preco : 0); });
    const p = Perfil.ler() || {}; Perfil.salvar({ nome: p.nome || 'Visitante', cfg: { ...J.p.cfg } });
    J.provando = null; bar.classList.remove('on');
    aviso('Comprado (demo) e salvo no seu personagem');
  }
  $('#f-comprar').onclick = async () => { if (!atual || !J.p) return; const ids = pecasDe(atual); fecha(); await vestir(ids); comprar(ids); };
  $('#pv-comprar').onclick = () => { if (J.provando) comprar(J.provando.ids); };
  $('#pv-devolver').onclick = async () => { if (!J.provando || !J.p) return; await J.p.muda({ roupas: J.provando.antes }); J.provando = null; bar.classList.remove('on'); aviso('Roupa devolvida'); };
  addEventListener('keydown', e => { if (e.code === 'Escape') fecha(); });
  return { abrir, aberta: () => painel.classList.contains('on') };
}
