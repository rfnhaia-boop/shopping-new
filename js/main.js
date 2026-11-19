// SHOPPING NEW (moda) — ponto de entrada: render, luzes, jogador em 3ª pessoa (clique no chão + WASD), mulheres e HOMENS andando pelas alas
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { construirShopping } from './arquitetura.js';
import { SH, VANTRA } from './planta.js';
import { montaVantra } from './loja-vantra.js';
import { Personagem } from '../../shared/personagem/personagem.js';
import { Perfil } from '../../shared/personagem/perfil.js';
import { criaMapa } from './mapa.js';
import { criaFicha } from './ficha.js';
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
/* a VANTRA é construída no sistema de coordenadas da ala dela (colisões convertidas pro mundo) */
{
  const ala = mundo.alas[VANTRA.ala];
  const shim = { obst: { push: o => (o.t === 'c' ? ala.circ(o.x, o.z, o.r) : ala.ret(o.x0, o.x1, o.z0, o.z1)) }, clicaveis: [] };
  mundo.clicaveis = shim.clicaveis; mundo.shim = shim; mundo.alaVantra = ala;
  mundo.lojaV = montaVantra(ala.g, { lado: VANTRA.lado, x: VANTRA.x0 + VANTRA.w / 2, w: VANTRA.w, d: VANTRA.d, zFundo: SH.zAl + VANTRA.d }, shim);
}

/* ---------- jogador ---------- */
const J = { pos: new THREE.Vector3(mundo.spawn.x, 0, mundo.spawn.z), rumo: Math.PI / 2, vel: 0, dest: null, camYaw: -Math.PI / 2, camPitch: .28, dist: 7.5, p: null, keys: {} };
const perfil = Perfil.ler();
const cfg = (perfil && perfil.cfg) || { corpo: 'fem', roupas: { camisa: 'top-referencia', calca: 'saia-assimetrica', calcado: 'bota-v' } };
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
const ficha = criaFicha({ J, irProvador, aviso });

/* ---------- colisão (retângulos orientados + círculos) ---------- */
function bate(x, z) {
  for (const o of mundo.obst) {
    if (o.t === 'c') { if (Math.hypot(x - o.x, z - o.z) < o.r) return true; }
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
  const len = Math.hypot(dx, dz), vmax = (k.ShiftLeft || k.ShiftRight) ? 4.2 : 2.2;
  if (len > .001) { dx /= len; dz /= len; J.vel += (vmax - J.vel) * Math.min(1, dt * 8); let dr = Math.atan2(dx, dz) - J.rumo; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); J.rumo += dr * Math.min(1, dt * 12); }
  else J.vel += (0 - J.vel) * Math.min(1, dt * 10);
  const passo = J.vel * dt, nx = J.pos.x + dx * passo, nz = J.pos.z + dz * passo;
  if (!bate(nx, J.pos.z)) J.pos.x = nx; if (!bate(J.pos.x, nz)) J.pos.z = nz;
  av.position.copy(J.pos); av.rotation.y = J.rumo; J.p && J.p.atualiza(dt, J.vel);
  const a = new THREE.Vector3(J.pos.x, 1.45, J.pos.z), cp = Math.cos(J.camPitch);
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
  $('#local').textContent = local;
}

/* ---------- entrada do usuário ---------- */
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(); let arr = null;
addEventListener('keydown', e => { J.keys[e.code] = true; }); addEventListener('keyup', e => { J.keys[e.code] = false; });
renderer.domElement.addEventListener('pointerdown', e => { arr = { x: e.clientX, y: e.clientY, mv: 0 }; renderer.domElement.setPointerCapture(e.pointerId); });
renderer.domElement.addEventListener('pointermove', e => { if (!arr) return; const dx = e.clientX - arr.x, dy = e.clientY - arr.y; arr.mv += Math.abs(dx) + Math.abs(dy); arr.x = e.clientX; arr.y = e.clientY; J.camYaw -= dx * .006; J.camPitch = Math.max(-.05, Math.min(1.15, J.camPitch + dy * .004)); });
renderer.domElement.addEventListener('pointerup', e => {
  const clique = arr && arr.mv < 6; arr = null; if (!clique) return;
  mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mouse, cam);
  if (mundo.clicaveis.length) {
    const hc = ray.intersectObjects(mundo.clicaveis, true)[0];
    if (hc && hc.distance < 14) { let o = hc.object; while (o && !(o.userData && o.userData.clic)) o = o.parent; if (o) { ficha.abrir(o.userData.clic, o); return; } }
  }
  const alvos = []; scene.traverse(o => { if (o.userData && o.userData.chao) alvos.push(o); });
  const h = ray.intersectObjects(alvos, false)[0]; if (h) J.dest = { x: h.point.x, z: h.point.z };
});
renderer.domElement.addEventListener('wheel', e => { J.dist = Math.max(2.2, Math.min(16, J.dist * (1 + e.deltaY * .001))); }, { passive: true });
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); });

setTimeout(() => { try { mundo.lojaV && mundo.lojaV.reflexo(renderer, scene); } catch (e) { console.error('reflexo', e); } }, 9000);
const clock = new THREE.Clock();
(function loop() { const dt = Math.min(clock.getDelta(), .05); atualiza(dt); atualizaNpcs(dt); mapa.update(dt); mundo.lojaV && mundo.lojaV.update(dt); renderer.render(scene, cam); requestAnimationFrame(loop); })();
window.__s = { J, cam, scene, mundo, renderer, ficha };

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
document.querySelector('#b-vantra').onclick = irVantra;
if (new URLSearchParams(location.search).get('loja') === 'vantra') irVantra();
window.__s.irVantra = irVantra;
