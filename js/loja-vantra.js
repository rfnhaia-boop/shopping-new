// SHOPPING NEW — VANTRA, loja âncora (36 × 36 m). FASE 1: ARQUITETURA ORGÂNICA (referência: imagem do Flow assets/flow/ref-interior.jpg).
// Paredes curvas de gesso com alcovas, portal em arco nas 2 portas, letreiro VANTRA em cromo 3D, sala FEMININO (alcovas com cabideiros),
// sala MASCULINO (alcovas iluminadas com manequins), palco central sob uma cúpula de luz, tela curva de campanha atrás do caixa,
// calçados e provadores nos cantos do fundo. Fitas de LED lima correndo pelas curvas, embaixo e em cima, como na referência.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { Personagem } from '../../shared/personagem/personagem.js';
import { CATALOGO_ROUPAS } from '../../shared/personagem/guarda-roupa.js';
import { PECAS } from './catalogo.js';
import { SH } from './planta.js';

const _gl = new GLTFLoader(), _cache = new Map();
const urlPeca = id => { const r = CATALOGO_ROUPAS.find(x => x.id === id); return r && r.glb ? new URL('../../shared/personagem/modelos/' + r.glb, import.meta.url).href : null; };
const cargaPeca = id => { const u = urlPeca(id); if (!u) return Promise.resolve(null); if (!_cache.has(u)) _cache.set(u, _gl.loadAsync(u).then(g => g.scene)); return _cache.get(u); };
const mCromo = new THREE.MeshStandardMaterial({ color: 0xf2f4f8, metalness: .5, roughness: .25 });
const mLima = new THREE.MeshStandardMaterial({ color: 0xd4ff3a, emissive: 0xd4ff3a, emissiveIntensity: 1.4 });
const mBranco = new THREE.MeshStandardMaterial({ color: 0xf7f8fa, roughness: .55 });
const mGesso = new THREE.MeshStandardMaterial({ color: 0xf6f1e8, roughness: .92, side: THREE.DoubleSide });
const mLuz = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3dd, emissiveIntensity: 2.6 });
const mMadeira = new THREE.MeshStandardMaterial({ color: 0xd9bf94, roughness: .55 });
const mLatao = new THREE.MeshStandardMaterial({ color: 0xd6b36a, metalness: 1, roughness: .28 });
const caixa = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const tex = (nome, w = 1024, h = 256, cor = '#1d2430', sub = '') => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = cor; g.font = `800 ${h * .42}px system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '8px'; g.fillText(nome, w / 2, sub ? h * .4 : h / 2);
  if (sub) { g.font = `600 ${h * .14}px ui-monospace,Consolas,monospace`; g.fillStyle = 'rgba(60,66,76,.75)'; g.fillText(sub.toUpperCase(), w / 2, h * .8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};

function cabide(larg) {
  const g = new THREE.Group();
  const gancho = new THREE.Mesh(new THREE.TorusGeometry(.035, .005, 6, 16, Math.PI * 1.4), mCromo); gancho.position.y = .095; g.add(gancho);
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, .06, 6), mCromo); haste.position.y = .055; g.add(haste);
  const ombro = new THREE.Mesh(new THREE.CapsuleGeometry(.006, Math.min(.46, Math.max(.26, larg * .85)), 4, 8), mCromo); ombro.rotation.z = Math.PI / 2; ombro.position.y = .025; g.add(ombro);
  return g;
}
async function penduraPeca(grupo, id, pos, rotY) {
  const base = await cargaPeca(id); if (!base) return;
  const peca = SkeletonUtils.clone(base); peca.traverse(o => { if (o.isMesh) { o.frustumCulled = false; o.castShadow = true; if (o.material) o.material.side = THREE.DoubleSide; } });
  peca.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(peca);
  const un = new THREE.Group(); un.add(cabide(box.max.x - box.min.x));
  peca.position.set(-(box.min.x + box.max.x) / 2, -box.max.y - .02, -(box.min.z + box.max.z) / 2); un.add(peca);
  un.position.copy(pos); un.rotation.y = rotY; grupo.add(un);
  un.userData.clic = { tipo: 'peca', id }; CLIC.push(un);
}
async function manequim(grupo, pos, cfg, rot) {
  const p = await Personagem.cria({ ...cfg, roupas: { ...cfg.roupas, casaco: cfg.roupas.casaco || 'nenhum' } });
  try { p.toca('Idle_Loop'); p.atualiza(.7 + Math.random() * .8, 0); } catch (e) {}
  p.grupo.position.copy(pos); p.grupo.rotation.y = rot; p.grupo.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
  grupo.add(p.grupo);
  p.grupo.userData.clic = { tipo: 'look', roupas: { ...cfg.roupas }, nome: cfg.nome }; CLIC.push(p.grupo);
}
async function botaNaPrateleira(grupo, pos, rot, esc = 1.1) {
  const base = await cargaPeca('bota-v'); if (!base) return;
  const b = SkeletonUtils.clone(base); b.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
  b.position.copy(pos); b.rotation.y = rot; b.scale.setScalar(esc); grupo.add(b);
}
let CLIC = [];
const HOMENS = [
  { corpo: 'masc', roupas: { camisa: 'moletom-vinho', calca: 'calca-preta', calcado: 'tenis-branco' } },
  { corpo: 'masc', roupas: { camisa: 'camiseta-preta', calca: 'jeans-claro', calcado: 'tenis-preto' } },
  { corpo: 'masc', roupas: { camisa: 'manga-longa-azul', calca: 'bermuda-bege', calcado: 'tenis-lima' } },
  { corpo: 'masc', roupas: { camisa: 'camiseta-cinza', calca: 'jeans-escuro', calcado: 'tenis-branco', casaco: 'jaqueta-vacuo' } },
];

export function montaVantra(scene, u, mundo) {
  CLIC = mundo.clicaveis || [];
  let desfile = () => {}, tela = () => {};
  const s = u.lado, zV = s * SH.zAl, z1 = s * u.zFundo, W = u.w, vitH = 5.2, teto = SH.teto, H = 7.2;
  const D = Math.abs(z1 - zV);                                  // profundidade (36)
  const g = new THREE.Group(); g.position.set(u.x, 0, 0); scene.add(g);
  const Z = d => zV + s * d;                                     // d = metros a partir da vitrine, pra dentro
  const ret = (x0, x1, za, zb) => mundo.obst.push({ x0: u.x + x0, x1: u.x + x1, z0: Math.min(za, zb), z1: Math.max(za, zb) });
  const circ = (x, z, r) => mundo.obst.push({ t: 'c', x: u.x + x, z, r });
  const rotAl = s > 0 ? Math.PI : 0;                             // virado pra porta

  /* ---------- parede curva: fita vertical de gesso ao longo de uma linha (x,d), com LED lima embaixo e em cima, e colisão ---------- */
  const parede = (pts, alt = H, { ledBaixo = true, ledAlto = true, colide = true } = {}) => {
    const pos = [], idx = [];
    pts.forEach(([x, d]) => { pos.push(x, 0, Z(d), x, alt, Z(d)); });
    for (let i = 0; i < pts.length - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mGesso); m.receiveShadow = true; g.add(m);
    const curva = y => new THREE.CatmullRomCurve3(pts.map(([x, d]) => new THREE.Vector3(x, y, Z(d))));
    if (ledBaixo) g.add(new THREE.Mesh(new THREE.TubeGeometry(curva(.32), pts.length * 3, .035, 6), mLima));
    if (ledAlto) g.add(new THREE.Mesh(new THREE.TubeGeometry(curva(alt - .35), pts.length * 3, .035, 6), mLima));
    if (colide) for (let i = 0; i < pts.length - 1; i++) { const [xa, da] = pts[i], [xb, db] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(xb - xa, db - da) / .45)); for (let k = 0; k < n; k++) { const t = k / n; circ(xa + (xb - xa) * t, Z(da + (db - da) * t), .32); } }
    return m;
  };
  const linha = (x0, d0, x1, d1, n = 8) => Array.from({ length: n + 1 }, (_, i) => [x0 + (x1 - x0) * i / n, d0 + (d1 - d0) * i / n]);
  const alcovas = (lado, d0, n, comp, xRaso, fundo) => {           // n alcovas semicirculares ao longo de d; xRaso = linha da parede; fundo = profundidade da curva
    const pts = [];
    for (let k = 0; k < n; k++) for (let i = 0; i <= 16; i++) { if (k && !i) continue; const t = i / 16; pts.push([lado * (xRaso + fundo * Math.sin(Math.PI * t)), d0 + k * comp + comp * t]); }
    return pts;
  };
  const XR = 15.4, FUNDO = 2.0, A0 = 7, NA = 5, CA = 4;           // alcovas: parede rasa em |x|=15.4, cavam até 17.4, de d=7 a d=27
  const Dt = D - .4;                                             // parede do fundo

  /* ===== vitrine de vidro com 2 portas + fachada (topo lima) ===== */
  {
    const mVidro = new THREE.MeshPhysicalMaterial({ color: 0xe6f3ff, roughness: .04, transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false });
    const vaos = [-W * .22, W * .22], porta = 6.2, cortes = [-W / 2];
    vaos.forEach(c => cortes.push(c - porta / 2, c + porta / 2)); cortes.push(W / 2);
    for (let i = 0; i < cortes.length; i += 2) {
      const a = cortes[i], b = cortes[i + 1], w = b - a, mid = (a + b) / 2; if (w < .3) continue;
      const v = caixa(w, vitH, .06, mVidro); v.position.set(mid, vitH / 2, zV); g.add(v);
      const nm = Math.max(1, Math.round(w / 3.3));
      for (let m = 0; m <= nm; m++) { const mx = caixa(.07, vitH, .1, mCromo); mx.position.set(a + (w / nm) * m, vitH / 2, zV); g.add(mx); }
      ret(a, b, zV - .2, zV + .2);
    }
    const limaClaro = new THREE.Color(0xd4ff3a).lerp(new THREE.Color(0xffffff), .55);
    const topo = caixa(W, teto - vitH, .5, new THREE.MeshStandardMaterial({ color: limaClaro, roughness: .55 })); topo.position.set(0, vitH + (teto - vitH) / 2, zV + s * .15); g.add(topo);
    for (const dy of [vitH + .04, teto - .1]) { const fio = caixa(W, .08, .12, mLima); fio.position.set(0, dy, zV - s * .1); g.add(fio); }
    // portal em arco atrás de cada porta (pilares + arco + LED)
    for (const c of vaos) {
      for (const sx of [-1, 1]) { const pil = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, 1.75, 24), mGesso); pil.position.set(c + sx * 3.35, .875, Z(.9)); g.add(pil); circ(c + sx * 3.35, Z(.9), .35); }
      const tapete = caixa(5.6, .02, 3.2, mLima); tapete.position.set(c, .015, Z(-.9)); g.add(tapete);
      const entra = new THREE.Mesh(new THREE.PlaneGeometry(3.2, .55), new THREE.MeshBasicMaterial({ map: tex('ENTRE', 1024, 180, '#1d2430'), transparent: true, toneMapped: false })); entra.rotation.x = -Math.PI / 2; entra.rotation.z = s > 0 ? Math.PI : 0; entra.position.set(c, .03, Z(-.9)); g.add(entra);
      const arco = new THREE.Mesh(new THREE.TorusGeometry(3.35, .24, 16, 64, Math.PI), mGesso); arco.position.set(c, 1.75, Z(.9)); g.add(arco);
      const arcoLed = new THREE.Mesh(new THREE.TorusGeometry(3.08, .035, 6, 64, Math.PI), mLima); arcoLed.position.set(c, 1.75, Z(.72)); g.add(arcoLed);
      const lp = new THREE.PointLight(0xfff6e8, 22, 12, 1.6); lp.position.set(c, vitH - .6, Z(-1.2)); g.add(lp);
    }
  }

  /* ===== BANNER ÚNICO da fachada: logo VANTRA + slogan + foto de campanha do Flow, de ponta a ponta ===== */
  {
    const bw = W - .4, bh = teto - vitH - .5, cv = document.createElement('canvas'); cv.width = 3600; cv.height = Math.round(3600 * bh / bw);
    const H2 = cv.height, cx = cv.getContext('2d');
    const tB = new THREE.CanvasTexture(cv); tB.colorSpace = THREE.SRGBColorSpace; tB.anisotropy = 16;
    const desenha = foto => {
      const fundo = cx.createLinearGradient(0, 0, 3600, 0); fundo.addColorStop(0, '#f4f5f1'); fundo.addColorStop(.55, '#eceee8'); fundo.addColorStop(1, '#e4e6df');
      cx.fillStyle = fundo; cx.fillRect(0, 0, 3600, H2);
      if (foto) {
        const x0 = 1650, w = 3600 - x0, esc = Math.max(w / foto.naturalWidth, H2 / foto.naturalHeight), dw = foto.naturalWidth * esc, dh = foto.naturalHeight * esc;
        cx.save(); cx.beginPath(); cx.rect(x0, 0, w, H2); cx.clip(); cx.drawImage(foto, x0 + (w - dw) / 2, (H2 - dh) / 2 + dh * .06, dw, dh); cx.restore();
        const fd = cx.createLinearGradient(x0, 0, x0 + 520, 0); fd.addColorStop(0, '#eceee8'); fd.addColorStop(1, 'rgba(236,238,232,0)'); cx.fillStyle = fd; cx.fillRect(x0, 0, 520, H2);
      }
      const gr = cx.createLinearGradient(160, 0, 1650, H2); gr.addColorStop(0, '#5a606a'); gr.addColorStop(.42, '#ffffff'); gr.addColorStop(.58, '#a4aab3'); gr.addColorStop(1, '#4a505a');
      cx.save(); cx.shadowColor = 'rgba(40,46,56,.35)'; cx.shadowBlur = 18; cx.shadowOffsetY = 8;
      cx.fillStyle = gr; cx.font = `800 ${Math.round(H2 * .46)}px system-ui`; cx.textBaseline = 'middle'; cx.letterSpacing = '38px'; cx.fillText('VANTRA', 170, H2 * .42); cx.restore();
      cx.fillStyle = '#d4ff3a'; cx.fillRect(176, H2 * .7, 520, 10);
      cx.fillStyle = '#3b4250'; cx.font = `600 ${Math.round(H2 * .085)}px ui-monospace,Consolas,monospace`; cx.letterSpacing = '12px'; cx.fillText('LOJA-CONCEITO  ·  DROP 01  ·  ÓRBITA FRIA', 176, H2 * .82);
      tB.needsUpdate = true;
    };
    desenha(null);
    const im = new Image(); im.onload = () => desenha(im); im.src = new URL('../assets/flow/banner1.jpg', import.meta.url).href;
    const y = vitH + .25 + bh / 2;
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), new THREE.MeshBasicMaterial({ map: tB, toneMapped: false })); banner.position.set(0, y, zV - s * .43); banner.rotation.y = rotAl; g.add(banner);
    for (const dy of [-bh / 2 - .08, bh / 2 + .08]) { const f = caixa(bw + .2, .08, .1, mLima); f.position.set(0, y + dy, zV - s * .45); g.add(f); }
  }

  /* ===== piso: terrazzo creme + madeira nas duas salas + caminho claro no eixo ===== */
  {
    const tc = document.createElement('canvas'); tc.width = tc.height = 1024; const tg = tc.getContext('2d');
    tg.fillStyle = '#e9e1d2'; tg.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 5200; i++) { const c = [[196, 170, 128], [214, 198, 168], [160, 150, 138], [235, 228, 214], [120, 108, 92]][(Math.random() * 5) | 0]; tg.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${.35 + Math.random() * .5})`; const r = 1.2 + Math.random() * 4.5; tg.beginPath(); tg.ellipse(Math.random() * 1024, Math.random() * 1024, r, r * (.5 + Math.random() * .7), Math.random() * 3, 0, 6.3); tg.fill(); }
    const tt = new THREE.CanvasTexture(tc); tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(W / 4, D / 4); tt.colorSpace = THREE.SRGBColorSpace; tt.anisotropy = 8;
    const piso = caixa(W - .2, .012, D - .4, new THREE.MeshPhysicalMaterial({ map: tt, roughness: .28, clearcoat: .8, clearcoatRoughness: .12 })); piso.position.set(0, .008, Z(D / 2)); piso.receiveShadow = true; g.add(piso);
    for (const sx of [-1, 1]) { const mad = caixa(6.2, .016, 21, mMadeira); mad.position.set(sx * 12.4, .012, Z(17)); g.add(mad); }
    for (const sx of [-1, 1]) { const l = caixa(.06, .02, D - 6, mLima); l.position.set(sx * 2.9, .02, Z(D / 2 + 1)); g.add(l); }
  }

  /* ===== paredes curvas: contorno orgânico com alcovas + cantos do fundo + tela curva da campanha ===== */
  for (const L of [-1, 1]) {
    const pts = [[L * (W / 2 - .4), .5], [L * (W / 2 - .4), 4], [L * (XR + .6), 6.2], [L * XR, A0]];
    alcovas(L, A0, NA, CA, XR, FUNDO).forEach(p => pts.push(p));
    pts.push([L * (XR + .4), 28.5], [L * (W / 2 - .4), 30.5], [L * (W / 2 - .4), Dt - 1.2], [L * (W / 2 - 1.4), Dt], [L * 9.6, Dt]);
    parede(pts);
    // aletas curvas que separam as salas do eixo central (deixam passagens largas)
    for (const [da, db] of [[8.5, 12.5], [22.5, 26.5]]) {
      const arco = Array.from({ length: 13 }, (_, i) => { const t = i / 12; return [L * (9.4 + .9 * Math.sin(Math.PI * t)), da + (db - da) * t]; });
      parede(arco, 4.6);
    }
  }
  // tela curva ao fundo (côncava, abraça quem chega): onde ficam as campanhas
  const telaPts = Array.from({ length: 25 }, (_, i) => { const x = -9.6 + 19.2 * i / 24; return [x, Dt - 2.2 * (x / 9.6) ** 2 + 0]; });
  parede(telaPts);

  /* ===== forro: placa com furo oval sobre o palco + cúpula de luz + cofres ovais ===== */
  {
    const zP = 19.8, rP = 7.2;
    const sh = new THREE.Shape(); sh.moveTo(-W / 2, .2); sh.lineTo(W / 2, .2); sh.lineTo(W / 2, D - .2); sh.lineTo(-W / 2, D - .2); sh.closePath();
    const furo = new THREE.Path(); furo.absellipse(0, zP, rP + .4, rP + .4, 0, Math.PI * 2, true); sh.holes.push(furo);
    const forro = new THREE.Mesh(new THREE.ShapeGeometry(sh, 64), new THREE.MeshStandardMaterial({ color: 0xfbf8f2, roughness: .9, side: THREE.DoubleSide }));
    forro.rotation.x = Math.PI / 2; forro.position.y = H; if (s < 0) { forro.scale.y = -1; } forro.position.z = zV; g.add(forro);
    const cupula = new THREE.Mesh(new THREE.CylinderGeometry(rP + .4, rP + .4, 1.6, 72, 1, true), new THREE.MeshStandardMaterial({ color: 0xf8f3ea, roughness: .9, side: THREE.BackSide })); cupula.position.set(0, H + .8, Z(zP)); g.add(cupula);
    const tampa = new THREE.Mesh(new THREE.CircleGeometry(rP + .4, 72), new THREE.MeshBasicMaterial({ color: 0xffe7c4, toneMapped: false })); tampa.rotation.x = Math.PI / 2; tampa.position.set(0, H + 1.6, Z(zP)); g.add(tampa);
    for (const [r, y] of [[rP + .4, H + .02], [rP + .1, H + 1.55]]) { const a = new THREE.Mesh(new THREE.TorusGeometry(r, .05, 8, 96), mLima); a.rotation.x = Math.PI / 2; a.position.set(0, y, Z(zP)); g.add(a); }
    const quente = new THREE.MeshBasicMaterial({ color: 0xffe6c2, toneMapped: false });
    const oval = (x, d, rx, rz) => {
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 72), quente); disc.rotation.x = Math.PI / 2; disc.scale.set(rx, rz, 1); disc.position.set(x, H - .03, Z(d)); g.add(disc);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(1, .035, 8, 96), mLima); aro.rotation.x = Math.PI / 2; aro.scale.set(rx + .15, rz + .15, 1); aro.position.set(x, H - .05, Z(d)); g.add(aro);
    };
    oval(0, 5.2, 6.5, 2.4); oval(-12.4, 17, 2.4, 8.5); oval(12.4, 17, 2.4, 8.5); oval(0, 31.2, 6, 1.6);
  }

  /* ===== vitrines: 3 manequins atrás do vidro ===== */
  [[-14, 0], [0, 4], [14, 2]].forEach(([x, i], k) => {
    const z = Z(2.8);
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.15, .3, 40), mBranco); plat.position.set(x, .15, z); g.add(plat);
    const ar = new THREE.Mesh(new THREE.TorusGeometry(1.12, .02, 6, 48), mLima); ar.rotation.x = Math.PI / 2; ar.position.set(x, .3, z); g.add(ar);
    manequim(g, new THREE.Vector3(x, .3, z), { corpo: 'fem', roupas: PECAS[i].roupas, nome: PECAS[i].nome }, rotAl + (k - 1) * .25).catch(e => console.error('vitrine', e));
    ret(x - 1.2, x + 1.2, z - 1.2, z + 1.2);
  });

  /* ===== placas das salas (em cima das aletas da entrada) ===== */
  for (const [L, nome] of [[-1, 'FEMININO'], [1, 'MASCULINO']]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(3.4, .85), new THREE.MeshBasicMaterial({ map: tex(nome, 1024, 256, '#1d2430', 'looks do drop'), transparent: true, toneMapped: false }));
    p.position.set(L * 9.6, 4.15, Z(8.4)); p.rotation.y = rotAl; g.add(p);
  }

  /* ===== sala FEMININO: em cada alcova, cabideiro curvo de latão com peças reais + luz na alcova ===== */
  const FEM = [0, 1, 2, 3, 4, 5, 6, 7];
  for (let k = 0; k < NA; k++) {
    const dc = A0 + k * CA + CA / 2, xs = -(XR + FUNDO * .55);
    const tr = new THREE.Mesh(new THREE.TorusGeometry(1.55, .022, 8, 40, Math.PI), mLatao); tr.rotation.set(Math.PI / 2, 0, Math.PI / 2); tr.position.set(-(XR + .1), 2.45, Z(dc)); tr.scale.set(1, 1, 1); g.add(tr);
    const ids = [PECAS[FEM[(k * 2) % 8]].roupas.camisa, PECAS[FEM[(k * 2) % 8]].roupas.calca, PECAS[FEM[(k * 2 + 1) % 8]].roupas.camisa];
    ids.forEach((id, j) => { const a = (j - 1) * .75; penduraPeca(g, id, new THREE.Vector3(-(XR + .1) - Math.cos(a) * 1.3, 2.45, Z(dc + Math.sin(a) * 1.3)), Math.PI / 2 + a * s).catch(() => {}); });
    if (k % 2 === 0) { const lp = new THREE.PointLight(0xfff1dc, 10, 6, 1.8); lp.position.set(-(XR - .5), 4.6, Z(dc)); g.add(lp); }
  }

  /* ===== sala MASCULINO: alcovas com pedestal + manequim homem; a do meio tem espelho alto ===== */
  for (let k = 0; k < NA; k++) {
    const dc = A0 + k * CA + CA / 2, x = XR + FUNDO * .45;
    if (k === 2) {
      const esp = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 4.2), new THREE.MeshStandardMaterial({ color: 0xeef3f8, metalness: 1, roughness: .04 })); esp.position.set(XR + FUNDO - .15, 2.4, Z(dc)); esp.rotation.y = -Math.PI / 2; g.add(esp);
      const mold = new THREE.Mesh(new THREE.TorusGeometry(.9, .04, 8, 48), mLatao); mold.scale.set(1, 2.4, 1); mold.position.set(XR + FUNDO - .18, 2.4, Z(dc)); mold.rotation.y = Math.PI / 2; g.add(mold);
      continue;
    }
    const plin = new THREE.Mesh(new THREE.CylinderGeometry(.85, .9, .3, 40), mBranco); plin.position.set(x, .15, Z(dc)); g.add(plin);
    const ar = new THREE.Mesh(new THREE.TorusGeometry(.87, .02, 6, 40), mLima); ar.rotation.x = Math.PI / 2; ar.position.set(x, .3, Z(dc)); g.add(ar);
    manequim(g, new THREE.Vector3(x, .3, Z(dc)), HOMENS[k > 2 ? k - 1 : k], -Math.PI / 2 + (k % 2 ? .3 : -.3)).catch(e => console.error('homem', e));
    circ(x, Z(dc), 1.0);
    if (k % 2 === 1) { const lp = new THREE.PointLight(0xfff1dc, 10, 6, 1.8); lp.position.set(XR - .5, 4.6, Z(dc)); g.add(lp); }
  }

  /* ===== palco Órbita (centro, sob a cúpula) ===== */
  {
    const zP = Z(19.8), rP = 6.4;
    const palco = new THREE.Mesh(new THREE.CylinderGeometry(rP, rP + .2, .4, 72), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .15, clearcoat: 1 })); palco.position.set(0, .2, zP); palco.receiveShadow = true; g.add(palco);
    const anel = new THREE.Mesh(new THREE.RingGeometry(rP * .45, rP * .9, 72), new THREE.MeshStandardMaterial({ color: 0xeef2f7, metalness: .35, roughness: .12, emissive: 0xdfe8f2, emissiveIntensity: .35 })); anel.rotation.x = -Math.PI / 2; anel.position.set(0, .405, zP); g.add(anel);
    for (const [r, m] of [[rP + .02, mLima], [rP * .9, mCromo], [rP * .45, mCromo]]) { const a = new THREE.Mesh(new THREE.TorusGeometry(r, .05, 8, 96), m); a.rotation.x = Math.PI / 2; a.position.set(0, .42, zP); g.add(a); }
    const modelos = [], rr = rP * .66, vel = 1.0;
    const DESF = [{ corpo: 'fem', roupas: PECAS[3].roupas, nome: PECAS[3].nome }, HOMENS[0], { corpo: 'fem', roupas: PECAS[5].roupas, nome: PECAS[5].nome }, HOMENS[3]];
    DESF.forEach((cfg, i) => {
      Personagem.cria({ ...cfg, roupas: { ...cfg.roupas, casaco: cfg.roupas.casaco || 'nenhum' } }).then(p => {
        p.grupo.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
        p._sway = cfg.corpo === 'fem' ? 1 : .55; g.add(p.grupo);
        p.grupo.userData.clic = { tipo: 'look', roupas: { ...cfg.roupas }, nome: cfg.nome }; CLIC.push(p.grupo);
        modelos.push({ p, ang: (i * Math.PI / 2 + .4) % (Math.PI * 2), pausa: 0, posou: false });
      }).catch(e => console.error('desfile', e));
    });
    desfile = dt => {
      for (const m of modelos) {
        const gr = m.p.grupo;
        if (m.pausa > 0) {                                  // pose na frente do palco, virada pra quem entra
          m.pausa -= dt; m.p.atualiza(dt, 0);
          let d = rotAl - gr.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); gr.rotation.y += d * (1 - Math.exp(-dt * 5)); continue;
        }
        const antes = m.ang; m.ang += vel / rr * dt;
        if (m.ang >= Math.PI * 2) { m.ang -= Math.PI * 2; m.posou = false; }
        if (!m.posou && antes < Math.PI && m.ang >= Math.PI) { m.posou = true; m.pausa = 2.6; }
        const x = Math.sin(m.ang) * rr, z = zP + Math.cos(m.ang) * rr * s;
        gr.position.set(x, .4, z);
        const alvo = Math.atan2(Math.cos(m.ang), -Math.sin(m.ang) * s); let d = alvo - gr.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); gr.rotation.y += d * (1 - Math.exp(-dt * 8));
        m.p.atualiza(dt, vel);
      }
    };
    const lp = new THREE.PointLight(0xfff0dd, 46, 22, 1.5); lp.position.set(0, H + .6, zP); g.add(lp);
    circ(0, zP, rP + .6);
  }

  /* ===== fundo: campanhas do Flow na tela curva, caixa, calçados (canto esquerdo), provadores (canto direito) ===== */
  {
    const loader = new THREE.TextureLoader();
    {
      const N = 48, y0 = 1.0, y1 = 6.4, pos = [], uv = [], idx = [], fx = x => Dt - 2.2 * (x / 9.6) ** 2 - .2;
      for (let i = 0; i <= N; i++) { const x = -9.3 + 18.6 * i / N; pos.push(x, y0, Z(fx(x)), x, y1, Z(fx(x))); uv.push(i / N, 0, i / N, 1); }
      for (let i = 0; i < N; i++) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
      const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 592; const cx = cv.getContext('2d');
      const tt = new THREE.CanvasTexture(cv); tt.colorSpace = THREE.SRGBColorSpace; tt.anisotropy = 8;
      g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tt, side: THREE.DoubleSide, toneMapped: false })));
      for (const y of [y0 - .1, y1 + .1]) g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 25 }, (_, i) => { const x = -9.3 + 18.6 * i / 24; return new THREE.Vector3(x, y, Z(fx(x) - .02)); })), 72, .05, 6), mLima));
      const imgs = ['flow4', 'flow2', 'flow5', 'flow3', 'flow0', 'flow1'].map(n => { const im = new Image(); im.src = new URL(`../assets/flow/${n}.webp`, import.meta.url).href; return im; });
      // vídeos de publicidade (feitos no Flow/Veo) rodando em sequência; sem vídeo ainda, as fotos do Flow passam como antes
      const vids = [0, 1, 2].map(n => { const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.crossOrigin = 'anonymous'; v.src = new URL(`../assets/flow/video${n}.mp4`, import.meta.url).href; v.onerror = () => { v._erro = true; }; return v; });
      let off = 0, acc = 0, t = 0, vi = 0, vt = 0, vtocando = null;
      tela = dt => {
        acc += dt; t += dt; vt += dt; if (acc < 1 / 30) return; off += 70 * acc; acc = 0;
        cx.fillStyle = '#eef0f2'; cx.fillRect(0, 0, 2048, 592);
        const prontos = vids.filter(v => !v._erro && v.readyState >= 2);
        if (prontos.length) {
          if (vt > 9 || !vtocando || !prontos.includes(vtocando)) { vt = 0; vi = (vi + 1) % prontos.length; if (vtocando && vtocando !== prontos[vi]) vtocando.pause(); vtocando = prontos[vi]; vtocando.currentTime = 0; const pr = vtocando.play(); if (pr && pr.catch) pr.catch(() => {}); }
          const v = vtocando, esc = Math.max(2048 / v.videoWidth, 592 / v.videoHeight), dw = v.videoWidth * esc, dh = v.videoHeight * esc;
          cx.drawImage(v, (2048 - dw) / 2, (592 - dh) / 2, dw, dh);
        } else {
          const ok = imgs.filter(im => im.complete && im.naturalWidth);
          if (ok.length) {
            const ws = ok.map(im => im.naturalWidth * 592 / im.naturalHeight + 16), tot = ws.reduce((a, b) => a + b, 0);
            let x = -(off % tot);
            for (let rep = 0; rep < 3 && x < 2048; rep++) ok.forEach((im, i) => { if (x < 2048 && x + ws[i] > 0) cx.drawImage(im, x, 0, ws[i] - 16, 592); x += ws[i]; });
          }
        }
        const fade = (vids.some(x => !x._erro && x.readyState >= 2) ? .0 : 1) * Math.max(0, Math.sin(t * .45)) ** 3;            // de tempos em tempos o VANTRA aparece por cima
        if (fade > .02) {
          cx.fillStyle = `rgba(246,247,244,${.78 * fade})`; cx.fillRect(0, 0, 2048, 592);
          cx.globalAlpha = fade; cx.fillStyle = '#20252e'; cx.font = '800 210px system-ui'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('VANTRA', 1024, 270);
          cx.font = '600 44px ui-monospace,Consolas,monospace'; cx.fillStyle = '#4a515c'; cx.fillText('DROP 01 · LOJA-CONCEITO', 1024, 420); cx.globalAlpha = 1;
        }
        cx.fillStyle = '#d4ff3a'; cx.fillRect(0, 578, 2048 * ((t * .2) % 1), 14);
        tt.needsUpdate = true;
      };
    }
    const bal = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 1.1, 48, 1, false, -Math.PI * .3, Math.PI * .6), mBranco); bal.position.set(0, .55, Z(28.6 - 3.4 * s * 0)); bal.rotation.y = s > 0 ? 0 : Math.PI; g.add(bal);
    const topoB = new THREE.Mesh(new THREE.TorusGeometry(3.4, .06, 8, 48, Math.PI * .6), mLima); topoB.rotation.set(Math.PI / 2, 0, (s > 0 ? Math.PI / 2 : -Math.PI / 2) - Math.PI * .3); topoB.position.set(0, 1.12, Z(28.6)); g.add(topoB);
    circ(0, Z(30.6), 2.2);
    // calçados: prateleiras iluminadas na parede do fundo, canto esquerdo
    for (let n = 0; n < 3; n++) {
      const y = .9 + n * .95, pr = caixa(5.6, .06, .6, mBranco); pr.position.set(-13.4, y, Z(Dt - .35)); g.add(pr);
      const luz = caixa(5.6, .04, .05, mLuz); luz.position.set(-13.4, y + .55, Z(Dt - .6)); g.add(luz);
      for (let k = 0; k < 3; k++) botaNaPrateleira(g, new THREE.Vector3(-15.4 + k * 2.0, y + .03, Z(Dt - .4)), rotAl + .2 * (k % 2 ? -1 : 1)).catch(() => {});
    }
    const pb = new THREE.Mesh(new THREE.PlaneGeometry(4.4, .9), new THREE.MeshBasicMaterial({ map: tex('CALÇADOS', 1024, 200, '#1d2430'), transparent: true, toneMapped: false })); pb.position.set(-13.4, 4.1, Z(Dt - .3)); pb.rotation.y = rotAl; g.add(pb);
    ret(-16.6, -10.4, Z(Dt - .8), Z(Dt));
    // provadores: 3 cabines arredondadas no canto direito do fundo
    [16.0, 13.6, 11.2].forEach(x => {
      const z = Z(Dt - 1.2);
      const cab = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 3.2, 32, 1, false, 0, Math.PI * 1.5), mGesso); cab.position.set(x, 1.6, z); cab.rotation.y = s > 0 ? Math.PI * .75 : -Math.PI * .25; g.add(cab);
      const cort = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, 2.7, 24, 1, true, 0, Math.PI * .5), new THREE.MeshStandardMaterial({ color: 0xd4ff3a, roughness: .7, side: THREE.DoubleSide })); cort.position.set(x, 1.45, z); cort.rotation.y = (s > 0 ? Math.PI * .75 : -Math.PI * .25) + Math.PI * 1.5; g.add(cort);
      circ(x, z, 1.25);
    });
    mundo.provador = { x: u.x + 13.6, z: Z(Dt - 4.2), olha: Z(Dt) };
    const pp = new THREE.Mesh(new THREE.PlaneGeometry(4.4, .9), new THREE.MeshBasicMaterial({ map: tex('PROVADORES', 1024, 200, '#1d2430'), transparent: true, toneMapped: false })); pp.position.set(13.6, 4.1, Z(Dt - 2.6)); pp.rotation.y = rotAl; g.add(pp);
    // mesas de exposição com moldura de latão nas passagens
    [[-5.2, 11.5], [5.2, 11.5], [-5.6, 27.2], [5.6, 27.2]].forEach(([x, d]) => {
      const z = Z(d), base = caixa(1.5, .78, 1.0, mBranco); base.position.set(x, .39, z); g.add(base);
      for (const [dx, dz] of [[-.7, -.45], [.7, -.45], [-.7, .45], [.7, .45]]) { const pe = caixa(.03, 1.2, .03, mLatao); pe.position.set(x + dx, .6, z + dz); g.add(pe); }
      const vt = caixa(1.5, .02, 1.0, mLatao); vt.position.set(x, 1.22, z); g.add(vt);
      for (let k = 0; k < 4; k++) { const it = caixa(.28, .1 + (k % 2) * .08, .22, new THREE.MeshStandardMaterial({ color: [0x2a2d34, 0xd4ff3a, 0xece7da, 0x8d8f96][k], roughness: .5 })); it.position.set(x - .5 + k * .33, .93 + (k % 2) * .04, z); g.add(it); }
      ret(x - .85, x + .85, z - .6, z + .6);
    });
    for (const x of [-11, 11]) { const l = new THREE.PointLight(0xfff4e6, 24, 16, 1.5); l.position.set(x, H - 1.2, Z(31)); g.add(l); }
    const l2 = new THREE.PointLight(0xfff4e6, 30, 18, 1.5); l2.position.set(0, H - 1.2, Z(8)); g.add(l2);
  }

  /* ===================== FASE 4: ACABAMENTO PREMIUM ===================== */
  // gesso texturizado (leve variação de tom, como reboco fino)
  if (!mGesso.map) {
    const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
    x.fillStyle = '#f6f1e8'; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) { const v = 228 + Math.random() * 24 | 0; x.fillStyle = `rgba(${v},${v - 4},${v - 12},.22)`; x.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 1 + Math.random() * 3); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 2); t.colorSpace = THREE.SRGBColorSpace; mGesso.map = t; mGesso.color.set(0xffffff); mGesso.needsUpdate = true;
  }
  const cil = (a, b, r, m) => { const d = b.clone().sub(a), me = new THREE.Mesh(new THREE.CylinderGeometry(r * .8, r, d.length(), 10), m); me.position.copy(a).add(b).multiplyScalar(.5); me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(me); };
  // oliveiras em vasos de design (cantos da entrada e laterais do caixa)
  const mFolha = new THREE.MeshStandardMaterial({ color: 0x8a9a6c, roughness: .85 }), mFolha2 = new THREE.MeshStandardMaterial({ color: 0x6f8257, roughness: .85 });
  const mTronco = new THREE.MeshStandardMaterial({ color: 0x7a6650, roughness: .9 }), mVaso = new THREE.MeshStandardMaterial({ color: 0xeae2d3, roughness: .65 });
  const oliveira = (x, d) => {
    const z = Z(d), v = new THREE.Mesh(new THREE.CylinderGeometry(.78, .56, 1.05, 48), mVaso); v.position.set(x, .525, z); g.add(v);
    const b = new THREE.Mesh(new THREE.TorusGeometry(.78, .035, 8, 48), mLatao); b.rotation.x = Math.PI / 2; b.position.set(x, 1.05, z); g.add(b);
    let p = new THREE.Vector3(x, 1.0, z); const pts = [];
    for (let i = 0; i < 3; i++) { const q = p.clone().add(new THREE.Vector3((Math.random() - .5) * .55, .85, (Math.random() - .5) * .55)); cil(p, q, .1 - i * .025, mTronco); pts.push(q); p = q; }
    for (let i = 0; i < 46; i++) { const c = pts[1 + (i % 2)], f = new THREE.Mesh(new THREE.IcosahedronGeometry(.22 + Math.random() * .2, 0), i % 3 ? mFolha : mFolha2); f.position.set(c.x + (Math.random() - .5) * 1.9, c.y + .2 + (Math.random() - .3) * 1.1, c.z + (Math.random() - .5) * 1.9); f.rotation.set(Math.random() * 3, Math.random() * 3, 0); f.castShadow = true; g.add(f); }
    circ(x, z, .95);
  };
  oliveira(-11.4, 4.8); oliveira(11.4, 4.8); oliveira(-7.6, 30.2); oliveira(7.6, 30.2);
  // pufes estofados nas salas (verde-sálvia e creme, base de latão)
  [[-12.4, 12.2, 0xc9d4b5], [-12.4, 22.2, 0xe9dfcc], [12.4, 12.2, 0xe9dfcc], [12.4, 22.2, 0xc9d4b5]].forEach(([x, d, cor]) => {
    const z = Z(d), pf = new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, .42, 40), new THREE.MeshStandardMaterial({ color: cor, roughness: .95 })); pf.position.set(x, .32, z); g.add(pf);
    const top = new THREE.Mesh(new THREE.TorusGeometry(.56, .09, 10, 40), new THREE.MeshStandardMaterial({ color: cor, roughness: .95 })); top.rotation.x = Math.PI / 2; top.position.set(x, .52, z); g.add(top);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .1, 32), mLatao); base.position.set(x, .05, z); g.add(base);
    circ(x, z, .75);
  });
  // espelhos de chão em arco, moldura de latão, virados pro centro de cada sala
  const mEspelho = new THREE.MeshStandardMaterial({ color: 0xf2f6fa, metalness: 1, roughness: .03 });
  for (const L of [-1, 1]) {
    const sh = new THREE.Shape(); sh.moveTo(-.6, 0); sh.lineTo(.6, 0); sh.lineTo(.6, 1.8); sh.absarc(0, 1.8, .6, 0, Math.PI, false); sh.lineTo(-.6, 0);
    const esp = new THREE.Mesh(new THREE.ShapeGeometry(sh, 24), mEspelho); const x = L * 11.0, z = Z(17.2);
    esp.position.set(x, .1, z); esp.rotation.y = L < 0 ? Math.PI / 2 : -Math.PI / 2; g.add(esp);
    const borda = sh.getPoints(40).map(p => new THREE.Vector3(0, p.y + .1, -p.x * (L < 0 ? -1 : 1)));
    const mold = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(borda, true), 120, .045, 8, true), mLatao); mold.position.set(x + L * -.01, 0, z); g.add(mold);
    const pe = caixa(.5, .06, .5, mLatao); pe.position.set(x, .03, z); g.add(pe);
    ret(x - .4, x + .4, z - .8, z + .8);
  }
  // quadros de arte (fotos do Flow) nas aletas, virados pro corredor central
  const loaderArte = new THREE.TextureLoader();
  [[-1, 10.5, 'arte0'], [1, 10.5, 'arte1'], [-1, 24.5, 'arte2'], [1, 24.5, 'arte3']].forEach(([L, d, f]) => {
    const t = loaderArte.load(new URL(`../assets/flow/${f}.jpg`, import.meta.url).href); t.colorSpace = THREE.SRGBColorSpace;
    const x = L * 9.25, z = Z(d), rot = L < 0 ? Math.PI / 2 : -Math.PI / 2;
    const mold = caixa(1.76, 2.3, .06, mLatao); mold.position.set(x - L * .02, 2.3, z); mold.rotation.y = rot; g.add(mold);
    const img = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.13), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); img.position.set(x - L * .06, 2.3, z); img.rotation.y = rot; g.add(img);
    const spot = new THREE.PointLight(0xfff0d8, 5, 3.5, 2); spot.position.set(x - L * .9, 3.8, z); g.add(spot);
  });
  // reflexo real: captura o ambiente da loja uma vez e aplica nos metais, espelhos e no piso
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
  const cubeCam = new THREE.CubeCamera(.2, 90, cubeRT); cubeCam.position.set(0, 2.2, Z(18)); g.add(cubeCam);
  const reflexo = (renderer, cena) => {
    cubeCam.update(renderer, cena);
    g.traverse(o => { const m = o.isMesh && o.material; if (m && !m.isMeshBasicMaterial && ((m.metalness || 0) > .3 || (m.clearcoat || 0) > .5)) { m.envMap = cubeRT.texture; m.envMapIntensity = (m.metalness || 0) > .9 ? 1.4 : .8; m.needsUpdate = true; } });
  };
  return { update(dt) { desfile(dt); tela(dt); }, reflexo };
}
