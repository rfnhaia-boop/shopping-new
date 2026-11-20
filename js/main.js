// SHOPPING NEW (moda) — ponto de entrada: render, luzes, jogador em 3ª pessoa (clique no chão + WASD), mulheres e HOMENS andando pelas alas
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { construirShopping } from './arquitetura.js';
import { SH, VANTRA, ATELIE, LEFERRI } from './planta.js';
import { montaVantra } from './loja-vantra.js';
import { montaAtelie } from './loja-atelie.js';
import { montaLeFerriMall } from './loja-leferri.js';
import { montaLeFerri, OX as LF_OX, ENTRADA as LF_ENTRADA } from './leferri-mundo.js';
import { Personagem } from '../../shared/personagem/personagem.js';
import { CATALOGO_ROUPAS, KIT_INICIAL } from '../../shared/personagem/guarda-roupa.js';
import { Perfil } from '../../shared/personagem/perfil.js';
import { criaMapa } from './mapa.js';
import { criaFicha } from './ficha.js';
import { criaSacola } from './sacola.js';
import { criaRobo } from './robo.js';
import { criaCaixa } from './caixa.js';
import { criaProvador } from './provador.js';
import { criaCloset } from './closet.js';
import { criaRoboPainel } from './robo-painel.js';
import { montaLojasNew } from './lojas-new.js';
import { interiorOrganico } from './interior-organico.js';
import { LOJA_CFG } from '../../vantra-3d/js/catalogo.js';

const $ = s => document.querySelector(s);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdfe6ee); scene.fog = new THREE.Fog(0xe4ebf2, 70, 190);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
const cam = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, .05, 400);
scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd5dc, 1.0));
const sol = new THREE.DirectionalLight(0xffffff, 1.1); sol.position.set(4, 18, 6); sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 60 }); scene.add(sol, sol.target);

const mundo = construirShopping(scene);
mundo.organico = interiorOrganico(scene, mundo.alas);           // abóbada, sancas, ilhas com jardim, anéis de luz no átrio
/* a VANTRA é construída no sistema de coordenadas da ala dela (colisões convertidas pro mundo) */
{
  const ala = mundo.alas[VANTRA.ala];
  const shim = { obst: { push: o => (o.t === 'c' ? ala.circ(o.x, o.z, o.r) : ala.ret(o.x0, o.x1, o.z0, o.z1)) }, clicaveis: [] };
  mundo.clicaveis = shim.clicaveis; mundo.shim = shim; mundo.alaVantra = ala;
  mundo.lojaV = montaVantra(ala.g, { lado: VANTRA.lado, x: VANTRA.x0 + VANTRA.w / 2, w: VANTRA.w, d: VANTRA.d, zFundo: SH.zAl + VANTRA.d }, shim);
  // 2ª loja (ATELIÊ) na ala street — compartilha a lista de clicáveis com a VANTRA
  const alaS = mundo.alas[ATELIE.ala];
  mundo.pisos = [() => ({ y: 0, k: 'g' })];                       // superfícies andáveis: chão + lajes + rampas (cada uma devolve {y,k} ou null)
  const shimS = { obst: { push: o => { if (o.t === 'f') { mundo.obst.push(o); return; } const n = mundo.obst.length; if (o.t === 'c') alaS.circ(o.x, o.z, o.r); else alaS.ret(o.x0, o.x1, o.z0, o.z1); if (o.lv) for (let i = n; i < mundo.obst.length; i++) mundo.obst[i].lv = o.lv; } }, clicaveis: shim.clicaveis, pisos: mundo.pisos };
  mundo.alaAtelie = alaS; mundo.lojaA = montaAtelie(alaS.g, { ala: alaS, lado: ATELIE.lado, x: ATELIE.x0 + ATELIE.w / 2, w: ATELIE.w, d: ATELIE.d, zFundo: SH.zAl + ATELIE.d }, shimS);
  // 3ª loja: LE FERRI — boutique no lado -1 da ala VANTRA (com portal) + o mundo próprio da marca, longe do shopping
  mundo.lfMall = montaLeFerriMall(ala.g, { lado: LEFERRI.lado, x: LEFERRI.x0 + LEFERRI.w / 2, w: LEFERRI.w, d: LEFERRI.d }, shim);
  mundo.lf = montaLeFerri(scene, mundo);
  // lado -1 da ala street: NEW WEAR, NEW LAB, Central de Vendas (maquete etapa 2) e Sua Loja Aqui (demo pra cliente)
  mundo.lojasNew = montaLojasNew(alaS, { clicaveis: shim.clicaveis, aviso: t => aviso(t) });
}
const ALA_ID = { c: 1, s: 0, mundo: (x, z) => ({ x, z }) };     // "ala" identidade: coordenadas já são do mundo

/* ---------- jogador ---------- */
const SPAWN = { x: -(SH.apotema + 24), z: 0 };                       // sempre começa no começo da ala de entrada, olhando pro átrio
const J = { pos: new THREE.Vector3(SPAWN.x, 0, SPAWN.z), rumo: Math.PI / 2, vel: 0, dest: null, camYaw: -Math.PI / 2, camPitch: .28, dist: 7.5, p: null, keys: {} };
const perfil = Perfil.ler();
const cfg = (perfil && perfil.cfg) || { corpo: 'fem', roupas: { camisa: 'top-referencia', calca: 'calca-vacuo', calcado: 'bota-v' } };
// a saia assimétrica deixou de ser roupa inicial: quem ainda está com ela começa de calça (e ganha a calça do kit)
if (cfg.corpo === 'fem' && cfg.roupas.calca === 'saia-assimetrica' && !Perfil.possui('saia-assimetrica', 20)) { cfg.roupas.calca = 'calca-vacuo'; Perfil.compra('calca-vacuo', 0); Perfil.salvar({ nome: (perfil && perfil.nome) || 'Visitante', cfg }); }
// se o perfil salvo tem peça que não serve no corpo dele (ex.: peça masculina num corpo feminino), troca pelo kit inicial
for (const sl of ['camisa', 'calca', 'calcado']) { const r = CATALOGO_ROUPAS.find(x => x.id === cfg.roupas[sl]); if (!r || (r.corpos && !r.corpos.includes(cfg.corpo))) cfg.roupas[sl] = KIT_INICIAL[cfg.corpo][sl]; }
const av = new THREE.Group(); scene.add(av);
Personagem.cria({ ...cfg }).then(p => { J.p = p; av.add(p.grupo); }).catch(e => console.error('personagem', e)).finally(() => $('#carrega').classList.add('fim'));

/* ---------- gente andando: mulheres (peças reais) e homens (mockup masculino) ---------- */
const NPCS = [
  { corpo: 'fem', ala: 'vantra', roupas: { camisa: 'top-freecrop', calca: 'saia-trumpet', calcado: 'bota-v' } },
  { corpo: 'masc', ala: 'vantra', roupas: { camisa: 'moletom-vinho', calca: 'calca-preta', calcado: 'tenis-branco' } },
  { corpo: 'fem', ala: 'street', roupas: { camisa: 'tee-ceramica', calca: 'calca-vacuo', calcado: 'bota-v' } },
  { corpo: 'masc', ala: 'street', roupas: { camisa: 'camiseta-preta', calca: 'jeans-claro', calcado: 'tenis-preto' } },
  { corpo: 'masc', ala: 'entrada', roupas: { camisa: 'manga-longa-azul', calca: 'bermuda-bege', calcado: 'tenis-lima' } },
  { corpo: 'fem', ala: 'entrada', roupas: { camisa: 'top-crop04', calca: 'calca-puffer', calcado: 'bota-v' } },
  { corpo: 'masc', ala: 'vantra', roupas: { camisa: 'camiseta-cinza', calca: 'jeans-escuro', calcado: 'tenis-lima' } },
];
const npcs = [];
NPCS.forEach((d, i) => {
  Personagem.cria({ corpo: d.corpo, roupas: d.roupas }).then(p => {
    p.grupo.traverse(o => { if (o.isMesh) o.frustumCulled = false; }); scene.add(p.grupo);
    const ala = mundo.alas[d.ala];
    npcs.push({ p, ala, dir: i % 2 ? 1 : -1, z: (i % 3 - 1) * 2.4 + (i % 2 ? 1.2 : -1.2), x: SH.apotema + 8 + (i * 7) % Math.max(8, ala.comp - 14), v: .8 + (i % 3) * .2 });
  }).catch(() => {});
});
function atualizaNpcs(dt) {
  for (const n of npcs) {
    n.x += n.dir * n.v * dt; if (n.x > SH.apotema + n.ala.comp - 3) n.dir = -1; if (n.x < SH.apotema - 6) n.dir = 1;
    const w = n.ala.mundo(n.x, n.z), ang = n.ala.ang + (n.dir > 0 ? 0 : Math.PI);
    n.p.grupo.position.set(w.x, 0, w.z); n.p.grupo.rotation.y = Math.PI / 2 - ang; n.p.atualiza(dt, n.v);
  }
}

/* ---------- mapa ---------- */
function irPara(x, z, ang) { J.pos.set(x, 0, z); J.dest = null; J.rumo = Math.PI / 2 - ang + Math.PI; J.camYaw = J.rumo + Math.PI; }
const mapa = criaMapa({ J, npcs, irPara });
function aviso(t) { const e = $('#aviso'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(aviso._t); aviso._t = setTimeout(() => e.classList.remove('on'), 2400); }
function irProvador() {
  const pv = mundo.shim.provador; if (!pv) return;
  const a = mundo.alaVantra, p = a.mundo(pv.x, pv.z), o = a.mundo(pv.x, pv.olha);
  J.pos.set(p.x, 0, p.z); J.dest = null; J.rumo = Math.atan2(o.x - p.x, o.z - p.z); J.camYaw = J.rumo + Math.PI; J.camPitch = .12; J.dist = 4.2;
}
const sacola = criaSacola({ J, aviso });
const robo = criaRobo({ J, scene, aviso });
sacola.defineLoja(() => { const l = caixa && caixa.lojaAtual(); return l ? l.nome : 'Shopping NEW'; });
// troca o corpo inteiro (mulher <-> homem): cria uma personagem nova e põe no lugar da atual
async function trocaPersonagem(cfg) {
  const novo = await Personagem.cria(cfg);
  if (J.p) { av.remove(J.p.grupo); J.p.dispose && J.p.dispose(); }
  J.p = novo; av.add(novo.grupo);
}
const closet = criaCloset({ J, aviso, sacola, trocaPersonagem });
const roboPainel = criaRoboPainel({ J, robo, cam, aviso, sacola, ir: nome => { const d = DESTINOS().find(x => x.nome === nome); if (d) teleporta(d); }, destinos: () => DESTINOS() });
const ficha = criaFicha({ J, provar: ids => provador.abre(ids), aviso, sacola });
// caixas das lojas (coordenadas locais da ala: x = centro da loja, z = zAl + metros pra dentro) e retângulos das lojas
var caixa = criaCaixa({ J, sacola, aviso, mundo, robo,
  caixas: [
    { nome: 'LE FERRI', ala: ALA_ID, x: mundo.lf.provador.x, z: mundo.lf.provador.z, olhaZ: mundo.lf.provador.olhaZ },
  { nome: 'ATELIÊ', ala: mundo.alaAtelie, x: ATELIE.x0 + ATELIE.w / 2, z: SH.zAl + 25.4, olhaZ: SH.zAl + 31 },
    { nome: 'VANTRA', ala: mundo.alaVantra, x: VANTRA.x0 + VANTRA.w / 2, z: SH.zAl + 24.4, olhaZ: SH.zAl + 30 },
    { nome: 'LE FERRI', ala: ALA_ID, x: mundo.lf.caixa.x, z: mundo.lf.caixa.z, olhaZ: mundo.lf.caixa.olhaZ },
    ...mundo.lojasNew.caixas,
    { nome: 'LE FERRI', ala: mundo.alaVantra, x: mundo.lfMall.caixa.x, z: mundo.lfMall.caixa.z, olhaZ: mundo.lfMall.caixa.olhaZ },
  ],
  lojas: [
    { nome: 'ATELIÊ', ala: mundo.alaAtelie, x0: ATELIE.x0, x1: ATELIE.x0 + ATELIE.w, z0: SH.zAl + .2, z1: SH.zAl + ATELIE.d },
    { nome: 'VANTRA', ala: mundo.alaVantra, x0: VANTRA.x0, x1: VANTRA.x0 + VANTRA.w, z0: SH.zAl + .2, z1: SH.zAl + VANTRA.d },
    { nome: 'LE FERRI', ala: ALA_ID, ...mundo.lf.retangulo },
    { nome: 'LE FERRI', ala: mundo.alaVantra, x0: LEFERRI.x0, x1: LEFERRI.x0 + LEFERRI.w, z0: -SH.zAl - LEFERRI.d, z1: -SH.zAl - .2 },
    ...mundo.lojasNew.lojas,
  ] });
const provador = criaProvador({ J, sacola, caixa, aviso, locais: [
  { nome: 'ATELIÊ', ala: mundo.alaAtelie, x: ATELIE.x0 + ATELIE.w / 2 + 11.6, z: SH.zAl + 34.0, olhaZ: SH.zAl + 28 },
  { nome: 'VANTRA', ala: mundo.alaVantra, x: mundo.shim.provador ? mundo.shim.provador.x : VANTRA.x0 + 31.6, z: mundo.shim.provador ? mundo.shim.provador.z : SH.zAl + 31.4, olhaZ: SH.zAl + 26 },
] });

/* ---------- colisão (retângulos orientados + círculos) ---------- */
function superf(x, z, y) {                                         // superfície mais alta alcançável (degrau máx. .9 m) naquele ponto
  let b = null;
  if (!mundo.pisos) return { y: 0, k: 'g' };
  for (const f of mundo.pisos) { const r = f(x, z); if (r && Math.abs(r.y - y) <= .9 && (!b || r.y > b.y)) b = r; }
  return b;
}
function bate(x, z) {
  const sf = superf(x, z, J.pos.y); if (!sf) return true; if (sf.k === 'r') return false;
  const lv = sf.k === 'l' ? 1 : 0;
  for (const o of mundo.obst) {
    if ((o.lv || 0) !== lv) continue;
    if (o.t === 'f') { if (o.f(x, z)) return true; }
    else if (o.t === 'c') { if (Math.hypot(x - o.x, z - o.z) < o.r) return true; }
    else if (o.t === 'o') {
      const c = Math.cos(o.a), s = Math.sin(o.a), dx = x - o.cx, dz = z - o.cz, lx = dx * c + dz * s, lz = -dx * s + dz * c;
      if (Math.abs(lx) < o.hx + .35 && Math.abs(lz) < o.hz + .35) return true;
    }
  }
  return false;
}
function atualiza(dt) {
  const k = J.keys, f = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0), s = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
  let dx = 0, dz = 0;
  if (f || s) { J.dest = null; const fy = Math.sin(J.camYaw), fc = Math.cos(J.camYaw); dx = -fy * f + fc * s; dz = -fc * f - fy * s; }
  else if (J.dest) { dx = J.dest.x - J.pos.x; dz = J.dest.z - J.pos.z; if (Math.hypot(dx, dz) < .25) { J.dest = null; dx = dz = 0; } }
  const len = Math.hypot(dx, dz), corre = k.ShiftLeft || k.ShiftRight || J.corre || (J.dest && J.dest.corre), vmax = corre ? 7.2 : 2.6;
  if (len > .001) { dx /= len; dz /= len; if (J.dest && J.dest.corre && len < 2.5) J.dest.corre = false; J.vel += (vmax - J.vel) * Math.min(1, dt * 5); let dr = Math.atan2(dx, dz) - J.rumo; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); J.rumo += dr * Math.min(1, dt * 12); }
  else J.vel += (0 - J.vel) * Math.min(1, dt * 10);
  const passo = J.vel * dt, nx = J.pos.x + dx * passo, nz = J.pos.z + dz * passo;
  if (!bate(nx, J.pos.z)) J.pos.x = nx; if (!bate(J.pos.x, nz)) J.pos.z = nz;
  { const sf = superf(J.pos.x, J.pos.z, J.pos.y); if (sf) J.pos.y += (sf.y - J.pos.y) * Math.min(1, dt * 14); }
  av.position.copy(J.pos); av.rotation.y = J.rumo; J.p && J.p.atualiza(dt, J.vel);
  const a = new THREE.Vector3(J.pos.x, J.pos.y + 1.45, J.pos.z), cp = Math.cos(J.camPitch);
  const des = new THREE.Vector3(a.x + Math.sin(J.camYaw) * J.dist * cp, a.y + Math.sin(J.camPitch) * J.dist + .2, a.z + Math.cos(J.camYaw) * J.dist * cp);
  des.y = Math.min(des.y, SH.teto - .4);
  cam.position.lerp(des, 1 - Math.exp(-dt * 10)); cam.lookAt(a);
  sol.position.set(J.pos.x + 4, 18, J.pos.z + 6); sol.target.position.copy(J.pos);
  // onde está
  const ang = Math.atan2(J.pos.z, J.pos.x); let local = 'Átrio';
  if (Math.hypot(J.pos.x, J.pos.z) > SH.apotema + .5) {
    let best = null, bd = 1e9;
    for (const al of Object.values(mundo.alas)) { const d = Math.abs(Math.atan2(Math.sin(ang - al.ang), Math.cos(ang - al.ang))); if (d < bd) { bd = d; best = al; } }
    local = best.nome; if (J.pos.x < -(SH.apotema + 30)) local = 'Praça';
  }
  { const zl = mundo.lf && mundo.lf.zona(J.pos.x, J.pos.z); if (zl) local = zl; else if (mundo.alaVantra) { const a = mundo.alaVantra, lx = J.pos.x * a.c + J.pos.z * a.s, lz = -J.pos.x * a.s + J.pos.z * a.c; if (lx > LEFERRI.x0 && lx < LEFERRI.x0 + LEFERRI.w && lz < -SH.zAl && lz > -SH.zAl - LEFERRI.d) local = 'LE FERRI · Boutique'; } }
  $('#local').textContent = local;
}

/* ---------- entrada do usuário ---------- */
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(); let arr = null;
addEventListener('keydown', e => { J.keys[e.code] = true; if (e.code === 'KeyR' && !(e.target.closest && e.target.closest('input,textarea'))) { J.corre = !J.corre; aviso(J.corre ? 'Correndo (R pra andar)' : 'Andando (R pra correr)'); } }); addEventListener('keyup', e => { J.keys[e.code] = false; });
renderer.domElement.addEventListener('pointerdown', e => { arr = { x: e.clientX, y: e.clientY, mv: 0 }; renderer.domElement.setPointerCapture(e.pointerId); });
renderer.domElement.addEventListener('pointermove', e => { if (!arr) return; const dx = e.clientX - arr.x, dy = e.clientY - arr.y; arr.mv += Math.abs(dx) + Math.abs(dy); arr.x = e.clientX; arr.y = e.clientY; J.camYaw -= dx * .006; J.camPitch = Math.max(-.05, Math.min(1.15, J.camPitch + dy * .004)); });
renderer.domElement.addEventListener('pointerup', e => {
  const clique = arr && arr.mv < 6; arr = null; if (!clique) return;
  mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mouse, cam);
  if (robo.grupo.visible !== false && ray.intersectObject(robo.grupo, true)[0]) { roboPainel.abre(); return; }
  if (mundo.clicaveis.length) {
    const hc = ray.intersectObjects(mundo.clicaveis, true)[0];
    if (hc && hc.distance < 14) { let o = hc.object; while (o && !(o.userData && o.userData.clic)) o = o.parent; if (o) { if (o.userData.clic.tipo === 'acao') o.userData.clic.acao(); else if (o.userData.clic.tipo === 'provador') provador.abre(); else ficha.abrir(o.userData.clic, o); return; } }
  }
  const alvos = []; scene.traverse(o => { if (o.userData && o.userData.chao) alvos.push(o); });
  const h = ray.intersectObjects(alvos, false)[0]; if (h) J.dest = { x: h.point.x, z: h.point.z, corre: Math.hypot(h.point.x - J.pos.x, h.point.z - J.pos.z) > 7 };
});
renderer.domElement.addEventListener('wheel', e => { J.dist = Math.max(2.2, Math.min(16, J.dist * (1 + e.deltaY * .001))); }, { passive: true });
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); });

setTimeout(() => { try { mundo.lojaV && mundo.lojaV.reflexo(renderer, scene); mundo.lojaA && mundo.lojaA.reflexo(renderer, scene); } catch (e) { console.error('reflexo', e); } }, 9000);
const clock = new THREE.Clock();
(function loop() { const dt = Math.min(clock.getDelta(), .05); atualiza(dt); atualizaNpcs(dt); mapa.update(dt); mundo.lojaV && mundo.lojaV.update(dt); mundo.lojaA && mundo.lojaA.update(dt); robo.update(dt); roboPainel.update(dt); sacola.update(); caixa.update(); provador.update(); mundo.lf.update(dt, J); mundo.lojasNew.update(dt, J); mundo.lfMall.update(dt); mundo.organico.update(dt); portais(); renderer.render(scene, cam); requestAnimationFrame(loop); })();
window.__s = { J, cam, scene, mundo, renderer, ficha, sacola, caixa, provador, robo, roboPainel };

/* ---------- música da loja (Spotify embutido; o navegador não deixa tocar sozinho, então é um clique) ---------- */
{
  const b = document.querySelector('#b-musica'), box = document.querySelector('#player');
  const id = (LOJA_CFG.playlist.match(/playlist\/([A-Za-z0-9]+)/) || [])[1];
  b.onclick = () => {
    if (box.classList.toggle('on')) { if (!box.firstChild && id) { const f = document.createElement('iframe'); f.src = `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`; f.width = '320'; f.height = '152'; f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'; f.loading = 'lazy'; box.appendChild(f); } b.textContent = '♪ Fechar música'; }
    else b.textContent = '♪ Música da loja';
  };
}

/* ---------- atalho: Ir à VANTRA (botão no topo e ?loja=vantra na URL) ---------- */
function irVantra() {
  const a = mundo.alaVantra, cx = VANTRA.x0 + VANTRA.w / 2;
  const p = a.mundo(cx, SH.zAl + 10.5), alvo = a.mundo(cx, SH.zAl + 22);
  J.pos.set(p.x, 0, p.z); J.dest = null; J.rumo = Math.atan2(alvo.x - p.x, alvo.z - p.z); J.camYaw = J.rumo + Math.PI; J.camPitch = .16; J.dist = 6;
  aviso('Bem-vinda à VANTRA');
}
window.__s.irVantra = irVantra;

/* ---------- atalho: Ir ao ATELIÊ (2ª loja) ---------- */
function irAtelie() {
  const a = mundo.alaAtelie, cx = ATELIE.x0 + ATELIE.w / 2;
  const p = a.mundo(cx, SH.zAl + 10.5), alvo = a.mundo(cx, SH.zAl + 22);
  J.pos.set(p.x, 0, p.z); J.dest = null; J.rumo = Math.atan2(alvo.x - p.x, alvo.z - p.z); J.camYaw = J.rumo + Math.PI; J.camPitch = .16; J.dist = 6;
  aviso('Bem-vinda ao ATELIÊ');
}
window.__s.irAtelie = irAtelie; window.__s.mundoRef = mundo;

/* ---------- LE FERRI: portal boutique (shopping) <-> mundo da marca, com véu preto e o nome ---------- */
var veu = $('#veu'), travaPortal = false, passando = false;   // var: o loop já roda antes desta linha
function viaja(destX, destZ, olhaX, olhaZ, nome) {
  if (passando) return; passando = true; travaPortal = true; J.dest = null;
  veu.classList.add('lf', 'on');
  setTimeout(() => {
    J.pos.set(destX, 0, destZ); J.rumo = Math.atan2(olhaX - destX, olhaZ - destZ); J.camYaw = J.rumo + Math.PI; J.camPitch = .16; J.dist = 5.5;
    if (destX > LF_OX - 100) mundo.lf.ativa();
    setTimeout(() => { veu.classList.remove('on'); setTimeout(() => { veu.classList.remove('lf'); passando = false; }, 700); aviso(nome); }, 450);
  }, 750);
}
const lfPortalMall = () => mundo.alaVantra.mundo(mundo.lfMall.portal.x, mundo.lfMall.portal.z);
function entraLeFerri() { viaja(LF_ENTRADA.x, LF_ENTRADA.z, LF_ENTRADA.x, LF_ENTRADA.z + 10, 'Bem-vinda à LE FERRI'); }
function voltaShopping() { const c = mundo.lfMall.chegada, a = mundo.alaVantra, p = a.mundo(c.x, c.z), o = a.mundo(c.x, c.olhaZ); viaja(p.x, p.z, o.x, o.z, 'Shopping NEW · ala VANTRA'); }
function portais() {
  if (!veu || passando || !mundo.lfMall) return;
  const pm = lfPortalMall(), dM = Math.hypot(J.pos.x - pm.x, J.pos.z - pm.z), dW = Math.hypot(J.pos.x - LF_OX, J.pos.z - .9);
  if (travaPortal) { if (dM > 2.6 && dW > 2.6) travaPortal = false; return; }
  if (dM < 1.3) entraLeFerri(); else if (dW < 1.4 && J.pos.z < 1.6) voltaShopping();
}
function irLeFerri() { const f = mundo.lfMall.frente, a = mundo.alaVantra, p = a.mundo(f.x, f.z), o = a.mundo(f.x, f.olhaZ); J.pos.set(p.x, 0, p.z); J.dest = null; J.rumo = Math.atan2(o.x - p.x, o.z - p.z); J.camYaw = J.rumo + Math.PI; J.camPitch = .14; J.dist = 7; aviso('LE FERRI · entre e vá até o portal no fundo'); }
window.__s.irLeFerri = irLeFerri; window.__s.entraLeFerri = entraLeFerri; window.__s.voltaShopping = voltaShopping;

/* ---------- IR PARA: teleporte pra frente de qualquer loja (botão no topo ou tecla T) ---------- */
function frenteAla(ala, cx, lado) {                   // no corredor, de frente pra fachada
  const p = ala.mundo(cx, lado * (SH.zAl - 3.2)), o = ala.mundo(cx, lado * (SH.zAl + 6));
  return { x: p.x, z: p.z, ox: o.x, oz: o.z };
}
const DESTINOS = () => {
  const lista = [
    { grupo: 'Shopping', nome: 'Entrada', sub: 'começo do shopping', x: SPAWN.x, z: 0, ox: 0, oz: 0 },
    { grupo: 'Shopping', nome: 'Átrio', sub: 'centro do shopping', x: -8, z: 0, ox: 0, oz: 0 },
    { grupo: 'Lojas', nome: 'VANTRA', sub: 'loja âncora · ala VANTRA', ...frenteAla(mundo.alaVantra, VANTRA.x0 + VANTRA.w / 2, VANTRA.lado) },
    { grupo: 'Lojas', nome: 'ATELIÊ', sub: 'boutique branca · 2 andares', ...frenteAla(mundo.alaAtelie, ATELIE.x0 + ATELIE.w / 2, ATELIE.lado) },
    { grupo: 'Lojas', nome: 'LE FERRI', sub: 'maison · portal pro universo da marca', ...frenteAla(mundo.alaVantra, LEFERRI.x0 + LEFERRI.w / 2, LEFERRI.lado) },
    { grupo: 'Lojas', nome: 'LE FERRI · Universo', sub: 'mundo próprio da marca', lf: true, x: LF_ENTRADA.x, z: LF_ENTRADA.z, ox: LF_ENTRADA.x, oz: LF_ENTRADA.z + 10 },
  ];
  (mundo.lojasNew ? mundo.lojasNew.destinos : []).forEach(d => lista.push(d));
  return lista;
};
function teleporta(d) {
  if (passando) return; passando = true; travaPortal = true; J.dest = null; fechaIr();
  veu.classList.toggle('lf', !!d.lf); veu.classList.add('on');
  setTimeout(() => {
    J.pos.set(d.x, 0, d.z); J.rumo = Math.atan2(d.ox - d.x, d.oz - d.z); J.camYaw = J.rumo + Math.PI; J.camPitch = .16; J.dist = 6.5; J.vel = 0;
    if (d.x > LF_OX - 100) mundo.lf.ativa();
    setTimeout(() => { veu.classList.remove('on'); setTimeout(() => { veu.classList.remove('lf'); passando = false; }, 700); aviso(d.nome); }, 350);
  }, d.lf ? 750 : 450);
}
const irBox = $('#ir');
function desenhaIr() {
  const ds = DESTINOS(); let g = '';
  irBox.querySelector('.ir-lista').innerHTML = ds.map((d, i) => (d.grupo !== g ? `<li class="ir-g mono">${g = d.grupo}</li>` : '') + `<li><button data-i="${i}"><b>${d.nome}</b><span>${d.sub || ''}</span></button></li>`).join('');
  irBox._ds = ds;
}
function abreIr() { desenhaIr(); irBox.classList.add('on'); }
function fechaIr() { irBox.classList.remove('on'); }
$('#b-ir').onclick = () => irBox.classList.contains('on') ? fechaIr() : abreIr();
irBox.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) teleporta(irBox._ds[+b.dataset.i]); else if (e.target === irBox || e.target.closest('.ir-x')) fechaIr(); });
addEventListener('keydown', e => { if (e.target.closest && e.target.closest('input,textarea')) return; if (e.code === 'KeyT') { irBox.classList.contains('on') ? fechaIr() : abreIr(); } if (e.code === 'Escape') fechaIr(); });
window.__s.teleporta = teleporta; window.__s.DESTINOS = DESTINOS;
