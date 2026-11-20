// SHOPPING NEW — ATELIÊ (2ª loja, ala street; base: clone da VANTRA em branco, rumo às referências do Google) (36 × 36 m). FASE 1: ARQUITETURA ORGÂNICA (referência: imagem do Flow assets/flow/ref-interior.jpg).
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
const mLed = new THREE.MeshStandardMaterial({ color: 0xfff6e6, emissive: 0xfff0d6, emissiveIntensity: 2.2 });
const mBranco = new THREE.MeshStandardMaterial({ color: 0xf7f8fa, roughness: .55 });
const mGesso = new THREE.MeshStandardMaterial({ color: 0xf7f4ee, roughness: .62, side: THREE.DoubleSide });
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

export function montaAtelie(scene, u, mundo) {
  CLIC = mundo.clicaveis || [];
  let desfile = () => {}, tela = () => {};
  const s = u.lado, zV = s * SH.zAl, z1 = s * u.zFundo, W = u.w, vitH = 5.2, teto = SH.teto, H = 8.6, YM = 4.3;
  const D = Math.abs(z1 - zV);
  const g = new THREE.Group(); g.position.set(u.x, 0, 0); scene.add(g);
  const Z = d => zV + s * d;
  const ret = (x0, x1, za, zb, lv = 0) => mundo.obst.push({ x0: u.x + x0, x1: u.x + x1, z0: Math.min(za, zb), z1: Math.max(za, zb), lv });
  const circ = (x, z, r, lv = 0) => mundo.obst.push({ t: 'c', x: u.x + x, z, r, lv });
  const rotAl = s > 0 ? Math.PI : 0;
  const Dt = D - .4;
  const bx = (w, h, d, m, x, y, z, rotY = 0) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.rotation.y = rotY; me.receiveShadow = true; g.add(me); return me; };
  const ala = u.ala, loc = (wx, wz) => { const lx = wx * ala.c + wz * ala.s - u.x, lz = -wx * ala.s + wz * ala.c; return { x: lx, d: s * (lz - zV) }; };

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
    const limaClaro = new THREE.Color(0xf1eee6);
    const topo = caixa(W, teto - vitH, .5, new THREE.MeshStandardMaterial({ color: limaClaro, roughness: .55 })); topo.position.set(0, vitH + (teto - vitH) / 2, zV + s * .15); g.add(topo);
    for (const dy of [vitH + .04, teto - .1]) { const fio = caixa(W, .08, .12, mLed); fio.position.set(0, dy, zV - s * .1); g.add(fio); }
    // portal em arco atrás de cada porta (pilares + arco + LED)
    for (const c of vaos) {
      for (const sx of [-1, 1]) { const pil = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, 1.75, 24), mGesso); pil.position.set(c + sx * 3.35, .875, Z(.9)); g.add(pil); circ(c + sx * 3.35, Z(.9), .35); }
      const tapete = caixa(5.6, .02, 3.2, mLed); tapete.position.set(c, .015, Z(-.9)); g.add(tapete);
      const entra = new THREE.Mesh(new THREE.PlaneGeometry(3.2, .55), new THREE.MeshBasicMaterial({ map: tex('ENTRE', 1024, 180, '#1d2430'), transparent: true, toneMapped: false })); entra.rotation.x = -Math.PI / 2; entra.rotation.z = s > 0 ? Math.PI : 0; entra.position.set(c, .03, Z(-.9)); g.add(entra);
      const arco = new THREE.Mesh(new THREE.TorusGeometry(3.35, .24, 16, 64, Math.PI), mGesso); arco.position.set(c, 1.75, Z(.9)); g.add(arco);
      const arcoLed = new THREE.Mesh(new THREE.TorusGeometry(3.08, .035, 6, 64, Math.PI), mLed); arcoLed.position.set(c, 1.75, Z(.72)); g.add(arcoLed);
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
      cx.fillStyle = gr; cx.font = `800 ${Math.round(H2 * .46)}px system-ui`; cx.textBaseline = 'middle'; cx.letterSpacing = '38px'; cx.fillText('ATELIÊ', 170, H2 * .42); cx.restore();
      cx.fillStyle = '#d8c8a6'; cx.fillRect(176, H2 * .7, 520, 10);
      cx.fillStyle = '#3b4250'; cx.font = `600 ${Math.round(H2 * .085)}px ui-monospace,Consolas,monospace`; cx.letterSpacing = '12px'; cx.fillText('MODA  ·  LOJA-CONCEITO  ·  NOVA COLEÇÃO', 176, H2 * .82);
      tB.needsUpdate = true;
    };
    desenha(null);
    const im = new Image(); im.onload = () => desenha(im); im.src = new URL('../assets/flow/banner1.jpg', import.meta.url).href;
    const y = vitH + .25 + bh / 2;
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), new THREE.MeshBasicMaterial({ map: tB, toneMapped: false })); banner.position.set(0, y, zV - s * .43); banner.rotation.y = rotAl; g.add(banner);
    for (const dy of [-bh / 2 - .08, bh / 2 + .08]) { const f = caixa(bw + .2, .08, .1, mLed); f.position.set(0, y + dy, zV - s * .45); g.add(f); }
  }


  /* ===== piso: terrazzo creme + madeira nas duas salas + caminho claro no eixo ===== */
  {
    const tc = document.createElement('canvas'); tc.width = tc.height = 1024; const tg = tc.getContext('2d');
    tg.fillStyle = '#e4e1dc'; tg.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 26; i++) { tg.strokeStyle = `rgba(${150 + Math.random() * 30 | 0},${152 + Math.random() * 30 | 0},${160 + Math.random() * 30 | 0},${.1 + Math.random() * .16})`; tg.lineWidth = .5 + Math.random() * 1.1; tg.beginPath(); let x = Math.random() * 1024, y = Math.random() * 1024; const dx = (Math.random() - .5) * 2, dy = Math.random() - .5; tg.moveTo(x, y); for (let k = 0; k < 12; k++) { x += 70 * dx + (Math.random() - .5) * 30; y += 70 * dy + (Math.random() - .5) * 30; tg.lineTo(x, y); } tg.stroke(); }
    const tt = new THREE.CanvasTexture(tc); tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(W / 9, D / 9); tt.colorSpace = THREE.SRGBColorSpace; tt.anisotropy = 8;
    const piso = caixa(W - .2, .012, D - .4, new THREE.MeshPhysicalMaterial({ map: tt, roughness: .16, clearcoat: .7, clearcoatRoughness: .08, metalness: 0 })); piso.position.set(0, .008, Z(D / 2)); piso.receiveShadow = true; g.add(piso);
  }


  /* ===== PAREDES: perímetro + divisórias com aberturas em arco (cada ambiente é separado) ===== */
  const mParede = new THREE.MeshStandardMaterial({ color: 0xf5efe5, roughness: .72 });
  // "sanca": fita de LED no topo da parede + lavado de luz quente descendo pela parede (como nas referências)
  const mLavado = (() => {
    const c = document.createElement('canvas'); c.width = 8; c.height = 256; const x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,226,180,.85)'); gr.addColorStop(.25, 'rgba(255,232,196,.38)'); gr.addColorStop(1, 'rgba(255,240,215,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 8, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  })();
  const sanca = (eixo, fixo, t0, t1, alt, faces = [-1, 1]) => {
    const len = t1 - t0, c = (t0 + t1) / 2, hL = 1.9;
    for (const f of faces) {
      const off = f * (.3 / 2 + .012);
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(len, hL), mLavado), st = new THREE.Mesh(new THREE.BoxGeometry(len, .05, .05), mLed);
      if (eixo === 'x') { pl.position.set(c, alt - hL / 2 - .02, Z(fixo) + off * s); pl.rotation.y = (f * s) > 0 ? 0 : Math.PI; st.position.set(c, alt - .04, Z(fixo) + off * s * 1.3); }
      else { pl.position.set(fixo + off, alt - hL / 2 - .02, Z(c)); pl.rotation.y = f > 0 ? Math.PI / 2 : -Math.PI / 2; st.rotation.y = Math.PI / 2; st.position.set(fixo + off * 1.3, alt - .04, Z(c)); }
      g.add(pl, st);
    }
  };
  // eixo 'x': parede corre ao longo de x em d=fixo. eixo 'd': corre ao longo de d em x=fixo. ab = abertura em arco [a,b]
  const muro = (eixo, fixo, ini, fim, { ab = null, abAlt = 3.7, alt = H, faces = [-1, 1] } = {}) => {
    const T = .3;
    const painel = (t0, t1) => {
      if (t1 - t0 < .05) return; const c = (t0 + t1) / 2, len = t1 - t0;
      if (eixo === 'x') { bx(len, alt, T, mParede, c, alt / 2, Z(fixo)); ret(t0, t1, Z(fixo) - T, Z(fixo) + T); }
      else { bx(T, alt, len, mParede, fixo, alt / 2, Z(c)); ret(fixo - T, fixo + T, Z(t0), Z(t1)); }
    };
    sanca(eixo, fixo, ini, fim, alt, faces);
    if (!ab) { painel(ini, fim); return; }
    painel(ini, ab[0]); painel(ab[1], fim);
    const r = (ab[1] - ab[0]) / 2, cx = (ab[0] + ab[1]) / 2, yb = abAlt - r;
    const sh = new THREE.Shape(); sh.moveTo(ab[0], yb); sh.absarc(cx, yb, r, Math.PI, 0, true); sh.lineTo(ab[1], alt); sh.lineTo(ab[0], alt); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false, curveSegments: 32 }); geo.translate(0, 0, -T / 2);
    const me = new THREE.Mesh(geo, mParede); me.receiveShadow = true;
    const arc = new THREE.Mesh(new THREE.TorusGeometry(r - .06, .028, 6, 40, Math.PI), mLed);
    if (eixo === 'x') { me.position.set(0, 0, Z(fixo)); arc.position.set(cx, yb, Z(fixo) - (T / 2 + .01)); }
    else {
      // o shape corre em x; vira pra correr ao longo de d (z do mundo = Z(d))
      me.rotation.y = -Math.PI / 2 * s; me.position.set(fixo, 0, Z(0));
      arc.rotation.y = -Math.PI / 2 * s; arc.position.set(fixo - (T / 2 + .01), yb, Z(0));
      const m4 = new THREE.Matrix4(); // posições: x do shape = d ao longo da parede
      me.position.z = Z(0); arc.position.z = Z(0);
    }
    g.add(me, arc);
  };
  muro('d', -W / 2 + .3, 0, D, { faces: [1] }); muro('d', W / 2 - .3, 0, D, { faces: [-1] }); muro('x', D - .3, -W / 2, W / 2, { faces: [-1] });
  muro('x', 9, -W / 2, -9); muro('d', -9, 9, 26, { ab: [13.5, 21.5], abAlt: 3.9 });
  muro('x', 26, -W / 2, -5.5, { ab: [-14.2, -8.8], abAlt: 3.9 }); muro('x', 26, 5.5, W / 2, { ab: [8.6, 14], abAlt: 3.9 });
  muro('d', -5.5, 26, D, { ab: [28.2, 33.2], abAlt: 3.9 }); muro('d', 5.5, 26, D);
  for (const d of [12.5, 19, 25]) { const pil = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, YM, 24), mParede); pil.position.set(8.9, YM / 2, Z(d)); g.add(pil); circ(8.9, Z(d), .35); }

  /* ===== FORRO alto + fitas de LED sinuosas + forros baixos dos ambientes ===== */
  {
    bx(W - .2, .2, D - .4, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .7 }), 0, H + .1, Z(D / 2));
    const fita = pts => g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, d]) => new THREE.Vector3(x, H - .02, Z(d)))), 140, .03, 6), mLed));
    for (const L of [-1, 1]) {
      fita(Array.from({ length: 19 }, (_, i) => { const t = i / 18; return [L * (4.5 + 1.8 * Math.sin(t * Math.PI * 3)), 1 + t * 34]; }));
      fita(Array.from({ length: 19 }, (_, i) => { const t = i / 18; return [L * (12 - 1.5 * Math.sin(t * Math.PI * 2 + 1)), 1 + t * 34]; }));
    }
    [[-W / 2 + .3, -9, 9, 26], [-W / 2 + .3, -5.5, 26, D - .3], [5.5, W / 2 - .3, 26, D - .3]].forEach(([xa, xb, da, db]) => {
      const cx = (xa + xb) / 2, cd = (da + db) / 2;
      bx(xb - xa, .2, db - da, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .7 }), cx, YM - .1, Z(cd));
      for (const dd of [da + .2, db - .2]) bx(xb - xa - .5, .04, .06, mLed, cx, YM - .22, Z(dd));
      for (const xx of [xa + .2, xb - .2]) bx(.06, .04, db - da - .5, mLed, xx, YM - .22, Z(cd));
      const lp = new THREE.PointLight(0xfff1dc, 22, 14, 1.6); lp.position.set(cx, YM - .6, Z(cd)); g.add(lp);
    });
    for (const [x, d] of [[0, 6], [0, 14], [0, 22], [0, 31]]) { const lp = new THREE.PointLight(0xfff4e6, 34, 20, 1.5); lp.position.set(x, H - 1, Z(d)); g.add(lp); }
    // spots embutidos (pontinhos de luz no forro, como nas referências) — InstancedMesh barato
    const pts = [];
    for (let x = -15; x <= 15; x += 3) for (let d = 2; d <= 25; d += 3) { if (x > 8.5 && d > 9) continue; if (x < -9 && d > 9) continue; pts.push([x, H - .005, d]); }
    for (let x = -16; x <= -10; x += 2) for (let d = 10.5; d <= 25; d += 2.5) pts.push([x, YM - .205, d]);
    for (let x = 10; x <= 16.5; x += 2) for (let d = 11; d <= 25; d += 2.5) pts.push([x, YM - .355, d]);
    for (let x = -16; x <= 16; x += 2.2) for (let d = 27.5; d <= 35; d += 2.5) if (Math.abs(x) > 6) pts.push([x, YM - .205, d]);
    const im = new THREE.InstancedMesh(new THREE.CircleGeometry(.075, 16), new THREE.MeshBasicMaterial({ color: 0xfff1d6, toneMapped: false }), pts.length);
    const ar = new THREE.InstancedMesh(new THREE.RingGeometry(.075, .11, 20), new THREE.MeshStandardMaterial({ color: 0xd8c8a6, metalness: .6, roughness: .35 }), pts.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
    pts.forEach(([x, y, d], i) => { m4.compose(new THREE.Vector3(x, y, Z(d)), q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, m4); ar.setMatrixAt(i, m4); });
    g.add(im, ar);
  }

  /* ===== MEZANINO (andar 2): laje, guarda-corpo de vidro, escada em espiral ===== */
  {
    const xa = 8.8, xb = W / 2 - .3, da = 9.6, db = 26;
    const mCarp = new THREE.MeshStandardMaterial({ color: 0xece3d3, roughness: .95 });
    bx(xb - xa, .35, db - da, new THREE.MeshStandardMaterial({ color: 0xfbf9f5, roughness: .5 }), (xa + xb) / 2, YM - .175, Z((da + db) / 2));
    const tapete = bx(xb - xa - .6, .02, db - da - .6, mCarp, (xa + xb) / 2, YM + .011, Z((da + db) / 2)); tapete.userData.chao = true;
    bx(xb - xa, .05, .06, mLed, (xa + xb) / 2, YM - .37, Z(da)); bx(.06, .05, db - da, mLed, xa, YM - .37, Z((da + db) / 2));
    const mVidro = new THREE.MeshPhysicalMaterial({ color: 0xe8f4f4, transparent: true, opacity: .26, roughness: .04, side: THREE.DoubleSide, depthWrite: false });
    const mCh = new THREE.MeshStandardMaterial({ color: 0xd8c8a6, metalness: .85, roughness: .3 });
    const guarda = (x0, d0, x1, d1) => {
      const len = Math.hypot(x1 - x0, d1 - d0), mx = (x0 + x1) / 2, md = (d0 + d1) / 2, ang = Math.atan2((d1 - d0) * s, x1 - x0);
      const v = new THREE.Mesh(new THREE.BoxGeometry(len, 1.1, .03), mVidro); v.position.set(mx, YM + .6, Z(md)); v.rotation.y = -ang; g.add(v);
      const c = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, len, 8), mCh); c.position.set(mx, YM + 1.17, Z(md)); c.rotation.set(0, -ang, Math.PI / 2); g.add(c);
    };
    guarda(xa, 11.9, xa, db);
    guarda(xa, da, xb, da);
    const cs = 7.0, cd = 10.9, R1 = 1.75, R0 = .55, N = 26, SW = 1.5 * Math.PI;
    const coluna = new THREE.Mesh(new THREE.CylinderGeometry(R0 - .05, R0 - .05, YM + 1.2, 28), mParede); coluna.position.set(cs, (YM + 1.2) / 2, Z(cd)); g.add(coluna);
    const mDegrau = new THREE.MeshStandardMaterial({ color: 0xf8f6f1, roughness: .45 });
    for (let i = 0; i < N; i++) {
      const u1 = SW * (1 - i / N), u0 = SW * (1 - (i + 1) / N), yt = YM * (i + .5) / N;
      const th0 = s > 0 ? Math.PI / 2 - u1 : Math.PI / 2 + u0;
      const st = new THREE.Mesh(new THREE.CylinderGeometry(R1, R1, .16, 8, 1, false, th0, u1 - u0 + .01), mDegrau); st.position.set(cs, yt - .08, Z(cd)); st.castShadow = true; g.add(st);
      const med = (u0 + u1) / 2; if (i % 2 === 0) { const bal = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 1, 6), mCh); bal.position.set(cs + Math.cos(med) * (R1 - .05), yt + .45, Z(cd + Math.sin(med) * (R1 - .05))); g.add(bal); }
    }
    const hel = new THREE.CatmullRomCurve3(Array.from({ length: 60 }, (_, i) => { const t = i / 59, uu = SW * (1 - t); return new THREE.Vector3(cs + Math.cos(uu) * (R1 - .05), YM * t + .98, Z(cd + Math.sin(uu) * (R1 - .05))); }));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(hel, 160, .03, 8), mCh));
    mundo.pisos.push((wx, wz) => { const p = loc(wx, wz); if (p.x > xa - .5 && p.x < xb && p.d > da && p.d < db) return { y: YM, k: 'l' }; return null; });
    const polar = (wx, wz) => { const p = loc(wx, wz), dx = p.x - cs, dd = p.d - cd, r = Math.hypot(dx, dd); return { r, uu: (Math.atan2(dd, dx) + 2 * Math.PI) % (2 * Math.PI) }; };
    mundo.pisos.push((wx, wz) => { const { r, uu } = polar(wx, wz); if (r < R0 || r > R1 + .03 || uu > SW) return null; return { y: YM * (SW - uu) / SW, k: 'r' }; });
    mundo.obst.push({ t: 'f', lv: 0, f: (wx, wz) => { const { r, uu } = polar(wx, wz); return r < R0 + .02 || (r < R1 + .1 && uu < SW - .32 * Math.PI); } });
    for (const d of [14, 22]) { const lp = new THREE.PointLight(0xffe9cc, 20, 11, 1.7); lp.position.set(13, YM + 2.4, Z(d)); g.add(lp); }
    for (const d of [13, 20]) bx(.05, 2.6, 4.2, new THREE.MeshStandardMaterial({ color: 0xffe9cc, emissive: 0xffd9a8, emissiveIntensity: .8 }), xb - .1, YM + 1.9, Z(d));
  }

  /* ===================== FASE 2: TÉRREO — piso de LED, caixa + telão, bar de mármore, mesas altas, coluna de vidro ===================== */
  const mMarm = new THREE.MeshPhysicalMaterial({ color: 0xf6f4f0, roughness: .12, clearcoat: 1, clearcoatRoughness: .06 });
  const mChamp = new THREE.MeshStandardMaterial({ color: 0xd8c8a6, metalness: .85, roughness: .3 });
  const mBoucle2 = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#efe7d7'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 4000; i++) { const v = 214 + Math.random() * 36 | 0; x.fillStyle = `rgba(${v},${v - 6},${v - 18},.55)`; x.beginPath(); x.arc(Math.random() * 256, Math.random() * 256, .8 + Math.random() * 2, 0, 6.3); x.fill(); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshStandardMaterial({ map: t, roughness: 1 }); })();
  // --- piso de LED em grade (salão central) ---
  {
    const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d'); const n = 8, q = 1024 / n;
    x.fillStyle = '#fdf6e8'; x.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const gr = x.createRadialGradient(i * q + q / 2, j * q + q / 2, 4, i * q + q / 2, j * q + q / 2, q * .75); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,238,205,.55)'); x.fillStyle = gr; x.fillRect(i * q + 7, j * q + 7, q - 14, q - 14); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const grade = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 9.6), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); grade.rotation.x = -Math.PI / 2; grade.position.set(-.4, .022, Z(17.2)); g.add(grade);
    bx(9.9, .02, .08, mChamp, -.4, .02, Z(12.25)); bx(9.9, .02, .08, mChamp, -.4, .02, Z(22.15)); bx(.08, .02, 9.9, mChamp, -5.35, .02, Z(17.2)); bx(.08, .02, 9.9, mChamp, 4.55, .02, Z(17.2));
  }
  // --- caixa em pódio curvo + telão emoldurado na parede do fundo ---
  {
    const podio = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.8, .22, 64, 1, false, -Math.PI * .34, Math.PI * .68), mMarm); podio.position.set(0, .11, Z(Dt - 5.2)); podio.rotation.y = s > 0 ? 0 : Math.PI; g.add(podio);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(4.62, 4.62, .04, 64, 1, true, -Math.PI * .34, Math.PI * .68), mLed); rim.position.set(0, .05, Z(Dt - 5.2)); rim.rotation.y = podio.rotation.y; g.add(rim);
    // balcão: corpo canelado (ripas) + tampo de mármore, em arco
    const ang0 = -Math.PI * .22, angL = Math.PI * .44, R = 3.4, cz0 = Dt - 5.2 - R * .0;
    const corpo = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1.05, 64, 1, false, ang0 + (s > 0 ? 0 : 0), angL), new THREE.MeshStandardMaterial({ color: 0xf1eee8, roughness: .45 })); corpo.position.set(0, .22 + .525, Z(Dt - 5.2)); corpo.rotation.y = podio.rotation.y; g.add(corpo);
    for (let i = 0; i <= 44; i++) { const a = ang0 + angL * i / 44 + (s > 0 ? 0 : Math.PI), r = R + .02; const rb = bx(.05, 1.0, .06, mChamp, Math.sin(a) * r, .22 + .5, Z(Dt - 5.2) + Math.cos(a) * r, a); rb.material = new THREE.MeshStandardMaterial({ color: 0xe8e2d6, roughness: .5 }); }
    const tampo = new THREE.Mesh(new THREE.CylinderGeometry(R + .14, R + .14, .07, 64, 1, false, ang0, angL), mMarm); tampo.position.set(0, .22 + 1.08, Z(Dt - 5.2)); tampo.rotation.y = podio.rotation.y; g.add(tampo);
    for (const dx of [-1.6, 0, 1.6]) { const tb = bx(.36, .02, .26, new THREE.MeshStandardMaterial({ color: 0x20232a }), dx, 1.35, Z(Dt - 5.2 - R * Math.cos(dx / R) + 0)); tb.rotation.x = -.3 * s; }
    for (let i = 0; i < 3; i++) { const cx2 = bx(.34, .14 + i * .03, .25, new THREE.MeshStandardMaterial({ color: i < 2 ? 0x15161a : 0xf4f1ea, roughness: .5 }), -2.2 + i * .45, 1.4 + i * .015, Z(Dt - 5.2 - R * Math.cos(-2.2 / R) + .15)); bx(.04, .15 + i * .03, .26, mChamp, -2.2 + i * .45, 1.4 + i * .015, Z(Dt - 5.2 - R * Math.cos(-2.2 / R) + .15)); }
    for (const a of [-1.2, 0, 1.2]) circ(a * 2.2, Z(Dt - 5.2 - 1.2), 1.3);
    const lp = new THREE.PointLight(0xfff1dc, 24, 12, 1.6); lp.position.set(0, 4.6, Z(Dt - 6)); g.add(lp);
    // telão curvo emoldurado
    const NS = 48, y0 = 1.7, y1 = 5.9, XW = 5.2, fx = x => Dt - .35 - 1.1 * (x / XW) ** 2, pos = [], uv = [], idx = [];
    for (let i = 0; i <= NS; i++) { const x = -XW + 2 * XW * i / NS; pos.push(x, y0, Z(fx(x)), x, y1, Z(fx(x))); uv.push(i / NS, 0, i / NS, 1); }
    for (let i = 0; i < NS; i++) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
    const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 826; const cx = cv.getContext('2d');
    const tt = new THREE.CanvasTexture(cv); tt.colorSpace = THREE.SRGBColorSpace; tt.anisotropy = 8;
    g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tt, side: THREE.DoubleSide, toneMapped: false })));
    for (const y of [y0 - .07, y1 + .07]) g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 25 }, (_, i) => { const x = -XW - .05 + (2 * XW + .1) * i / 24; return new THREE.Vector3(x, y, Z(fx(x) - .02)); })), 72, .05, 6), mChamp));
    for (const sx of [-1, 1]) { const m = bx(.1, y1 - y0 + .2, .12, mChamp, sx * (XW + .05), (y0 + y1) / 2, Z(fx(sx * XW) - .02)); }
    const vids = [0, 1, 2].map(n => { const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.crossOrigin = 'anonymous'; v.src = new URL(`../assets/flow/video${n}.mp4`, import.meta.url).href; v.onerror = () => { v._erro = true; }; return v; });
    const imgs = ['flow4', 'flow2', 'flow5', 'flow3', 'flow0', 'flow1'].map(n => { const im = new Image(); im.src = new URL(`../assets/flow/${n}.webp`, import.meta.url).href; return im; });
    let acc = 0, ti = 0, vi = 0, off = 0;
    tela = dt => {
      acc += dt; ti += dt; if (acc < 1 / 24) return; off += 60 * acc; acc = 0;
      if (ti > 9) { ti = 0; for (let k = 1; k <= 3; k++) { const n = (vi + k) % 3, v = vids[n]; if (!v._erro && v.readyState >= 2) { vids[vi].pause(); vi = n; break; } } }
      const v = vids[vi]; cx.fillStyle = '#f1efea'; cx.fillRect(0, 0, 2048, 826);
      if (!v._erro && v.readyState >= 2) { if (v.paused) v.play().catch(() => {}); const e = Math.max(2048 / v.videoWidth, 826 / v.videoHeight), w = v.videoWidth * e, h = v.videoHeight * e; cx.drawImage(v, (2048 - w) / 2, (826 - h) / 2, w, h); }
      else { const ok = imgs.filter(im => im.complete && im.naturalWidth); if (ok.length) { const ws = ok.map(im => im.naturalWidth * 826 / im.naturalHeight + 16), tot = ws.reduce((a, b) => a + b, 0); let x = -(off % tot); for (let r = 0; r < 3 && x < 2048; r++) ok.forEach((im, i) => { if (x < 2048 && x + ws[i] > 0) cx.drawImage(im, x, 0, ws[i] - 16, 826); x += ws[i]; }); } }
      tt.needsUpdate = true;
    };
  }
  // --- bar de mármore (esquerda): nicho de ônix iluminado, prateleira com garrafas, balcão canelado, banquetas ---
  {
    const xN = -W / 2 + .35;
    const cn = document.createElement('canvas'); cn.width = 1024; cn.height = 400; const nx = cn.getContext('2d');
    const gr = nx.createRadialGradient(512, 160, 40, 512, 200, 620); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(.6, '#fbf0dc'); gr.addColorStop(1, '#f2e2c4'); nx.fillStyle = gr; nx.fillRect(0, 0, 1024, 400);
    nx.filter = 'blur(6px)';
    for (let i = 0; i < 18; i++) { nx.strokeStyle = `rgba(${215 + Math.random() * 30 | 0},${185 + Math.random() * 30 | 0},${140 + Math.random() * 30 | 0},${.08 + Math.random() * .12})`; nx.lineWidth = 8 + Math.random() * 26; nx.beginPath(); let y = Math.random() * 400; nx.moveTo(-20, y); for (let k = 1; k <= 9; k++) { y += (Math.random() - .5) * 22; nx.lineTo(k * 128, y); } nx.stroke(); }
    nx.filter = 'none';
    for (let i = 0; i < 10; i++) { nx.strokeStyle = `rgba(205,170,120,${.06 + Math.random() * .08})`; nx.lineWidth = 1 + Math.random() * 2; nx.beginPath(); let y = Math.random() * 400; nx.moveTo(0, y); for (let k = 1; k <= 16; k++) { y += (Math.random() - .5) * 10; nx.lineTo(k * 64, y); } nx.stroke(); }
    const tn = new THREE.CanvasTexture(cn); tn.colorSpace = THREE.SRGBColorSpace;
    const onix = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 3.4), new THREE.MeshBasicMaterial({ map: tn, toneMapped: false })); onix.position.set(xN + .12, 2.5, Z(17.2)); onix.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2; g.add(onix);
    bx(.2, 3.7, .12, mChamp, xN + .1, 2.5, Z(11.9)); bx(.2, 3.7, .12, mChamp, xN + .1, 2.5, Z(22.5)); bx(.2, .12, 10.6, mChamp, xN + .1, 4.35, Z(17.2)); bx(.2, .12, 10.6, mChamp, xN + .1, .65, Z(17.2));
    bx(.4, .03, 10, new THREE.MeshPhysicalMaterial({ color: 0xe8f4f4, transparent: true, opacity: .45, roughness: .05 }), xN + .35, 2.2, Z(17.2));
    const cores = [0x3a2a1c, 0xc8a24a, 0x23402a, 0x2b2118, 0xd8c08a, 0x4a1e1e];
    for (let i = 0; i < 18; i++) { const z = Z(12.6 + i * .53), b = new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, .34 + (i % 3) * .05, 12), new THREE.MeshPhysicalMaterial({ color: cores[i % 6], roughness: .15, clearcoat: 1 })); b.position.set(xN + .4, 2.2 + .19, z); g.add(b); }
    const R0 = -W / 2 + 4.6;
    bx(1.1, 1.05, 10, new THREE.MeshStandardMaterial({ color: 0xf1eee8, roughness: .45 }), R0, .525, Z(17.2));
    for (let i = 0; i <= 46; i++) bx(.06, 1.0, .05, new THREE.MeshStandardMaterial({ color: 0xe6dfd2, roughness: .5 }), R0 + .56, .5, Z(12.3 + i * .216));
    bx(1.35, .07, 10.2, mMarm, R0 + .1, 1.08, Z(17.2)); bx(.04, .05, 10.2, mChamp, R0 + .78, 1.04, Z(17.2));
    for (let i = 0; i < 6; i++) {
      const z = Z(13.2 + i * 1.6), st = new THREE.Group(); st.position.set(R0 + 1.5, 0, z); g.add(st);
      const disco = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .03, 24), mChamp); disco.position.y = .02; st.add(disco);
      const hasta = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .7, 10), mChamp); hasta.position.y = .38; st.add(hasta);
      const ass = new THREE.Mesh(new THREE.CylinderGeometry(.23, .21, .1, 28), mBoucle2); ass.position.y = .76; st.add(ass);
      const enc = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .22, 24, 1, true, Math.PI * .6, Math.PI * .8), mBoucle2); enc.position.set(0, .93, 0); enc.rotation.y = s > 0 ? 0 : 0; st.add(enc);
      circ(R0 + 1.5, z, .3);
    }
    ret(R0 - .6, R0 + .8, Z(12), Z(22.4)); ret(xN - .2, xN + .5, Z(11.9), Z(22.5));
    const lp = new THREE.PointLight(0xffe2b0, 26, 10, 1.7); lp.position.set(xN + 2, 3.4, Z(17.2)); g.add(lp);
  }
  // --- mesas altas de coquetel (salão) ---
  [[-6.4, 12.8], [-6.4, 21.8], [3.6, 24.6], [-2.4, 25.2]].forEach(([x, d]) => {
    const z = Z(d), tp = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .04, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3 })); tp.position.set(x, 1.1, z); g.add(tp);
    const hs = new THREE.Mesh(new THREE.CylinderGeometry(.13, .17, 1.1, 24), new THREE.MeshStandardMaterial({ color: 0xfbf9f5, roughness: .4 })); hs.position.set(x, .55, z); g.add(hs);
    circ(x, z, .55);
  });
  // --- coluna de vidro com bolsa no átrio ---
  {
    const z = Z(5.6), x = 0, vid = new THREE.MeshPhysicalMaterial({ color: 0xe6f2f2, transparent: true, opacity: .2, roughness: .03, depthWrite: false, side: THREE.DoubleSide });
    bx(1.0, .3, 1.0, mMarm, x, .15, z); const col = bx(.9, 3.6, .9, vid, x, .3 + 1.8, z); col.receiveShadow = false;
    for (const dx of [-.45, .45]) for (const dz of [-.45, .45]) bx(.03, 3.6, .03, mChamp, x + dx, 2.1, z + dz);
    const b = new THREE.Group(), mb = new THREE.MeshStandardMaterial({ color: 0xf6f3ee, emissive: 0xfff3dc, emissiveIntensity: .8, roughness: .3 });
    const c1 = bx(.5, .32, .22, mb, 0, .16, 0); g.remove(c1); b.add(c1); const al = new THREE.Mesh(new THREE.TorusGeometry(.13, .015, 6, 20, Math.PI), mChamp); al.position.y = .34; b.add(al); b.position.set(x, 2.1, z); g.add(b);
    const lp = new THREE.PointLight(0xfff3dc, 8, 5, 2); lp.position.set(x, 2.1, z); g.add(lp); circ(x, z, .8);
    const girar = tela; tela = dt => { girar(dt); b.rotation.y += dt * .7; };
  }

  /* ===================== FASE 3: LOUNGE DO MEZANINO (andar 2) — sofás curvos de bouclé, mesas de mármore, espelho em arco, oliveiras, pendentes ===================== */
  {
    const setor = (r0, r1, u0, u1, alt, y) => {                       // setor anular, ângulos u no plano (x, d); sobe a partir de y
      const a0 = Math.min(-s * u0, -s * u1), a1 = Math.max(-s * u0, -s * u1);
      const sh = new THREE.Shape(); sh.absarc(0, 0, r1, a0, a1, false); sh.absarc(0, 0, r0, a1, a0, true); sh.closePath();
      const geo = new THREE.ExtrudeGeometry(sh, { depth: alt, bevelEnabled: true, bevelSize: .07, bevelThickness: .07, bevelSegments: 4, curveSegments: 40 });
      geo.rotateX(-Math.PI / 2); const m = new THREE.Mesh(geo, mBoucle2); m.position.y = y; m.castShadow = true; return m;
    };
    const sofaC = (cx, cd, ctr, A = 1.75) => {
      const u0 = ctr - A / 2, u1 = ctr + A / 2, base = new THREE.Group(); base.position.set(cx, 0, Z(cd)); g.add(base);
      base.add(setor(1.15, 2.0, u0, u1, .2, YM + .1)); base.add(setor(1.2, 1.95, u0, u1, .16, YM + .34)); base.add(setor(1.8, 2.3, u0 - .08, u1 + .08, .62, YM + .32));
      for (const a of [-.8, 0, .8]) circ(cx + Math.cos(ctr + a) * 1.7, Z(cd + Math.sin(ctr + a) * 1.7), .8, 1);
    };
    const mesaM = (x, d, r = .5, h = .5) => {
      const z = Z(d), t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .04, 40), mMarm); t.position.set(x, YM + h, z); g.add(t);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(.08, .22, h, 24), mParede); p.position.set(x, YM + h / 2, z); g.add(p);
      const cores = [0x3a2a1c, 0xc8a24a, 0x23402a];
      for (let i = 0; i < 2; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, .28 + i * .06, 12), new THREE.MeshPhysicalMaterial({ color: cores[i], roughness: .15, clearcoat: 1 })); b.position.set(x - .12 + i * .2, YM + h + .17, z + .05); g.add(b); }
      for (let i = 0; i < 2; i++) { const gl = new THREE.Mesh(new THREE.CylinderGeometry(.04, .02, .14, 12), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .45, roughness: .05 })); gl.position.set(x + .05 + i * .14, YM + h + .09, z - .12); g.add(gl); }
    };
    sofaC(14.6, 13.8, 0); mesaM(14.6, 13.8); sofaC(14.6, 22.2, 0); mesaM(14.6, 22.2);
    // poltronas redondas + mesa de apoio no meio
    mesaM(12.3, 18, .38, .45);
    for (const [x, d] of [[12.9, 16.6], [12.9, 19.4]]) { const z = Z(d), as = new THREE.Mesh(new THREE.CylinderGeometry(.46, .42, .36, 32), mBoucle2); as.position.set(x, YM + .2, z); g.add(as); const tp = new THREE.Mesh(new THREE.TorusGeometry(.42, .1, 10, 32), mBoucle2); tp.rotation.x = Math.PI / 2; tp.position.set(x, YM + .4, z); g.add(tp); const en = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .55, 32, 1, false, 0, Math.PI), mBoucle2); en.position.set(x, YM + .62, z); en.rotation.y = s > 0 ? 0 : Math.PI; g.add(en); circ(x, z, .55, 1); }
    // espelho em arco entre os sofás, moldura champanhe
    {
      const sh = new THREE.Shape(); sh.moveTo(-.8, 0); sh.lineTo(.8, 0); sh.lineTo(.8, 2.1); sh.absarc(0, 2.1, .8, 0, Math.PI, false); sh.lineTo(-.8, 0);
      const e = new THREE.Mesh(new THREE.ShapeGeometry(sh, 32), new THREE.MeshStandardMaterial({ color: 0xdde6ec, metalness: .35, roughness: .08, emissive: 0x9aa8b4, emissiveIntensity: .55 })); e.position.set(17.25, YM + .3, Z(18)); e.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(e);
      const bd = sh.getPoints(40).map(p => new THREE.Vector3(p.x * (s > 0 ? 1 : -1) * 0, p.y + YM + .3, Z(18) + p.x * s)); bd.forEach(v => { v.x = 17.23; });
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bd, true), 100, .03, 8, true), mChamp));
    }
    // oliveiras em vasos
    const mFolha = new THREE.MeshStandardMaterial({ color: 0x8a9a6c, roughness: .85 }), mFolha2 = new THREE.MeshStandardMaterial({ color: 0x6f8257, roughness: .85 }), mTronco = new THREE.MeshStandardMaterial({ color: 0x7a6650, roughness: .9 });
    const oliveira = (x, d) => {
      const z = Z(d), v = new THREE.Mesh(new THREE.CylinderGeometry(.55, .4, .8, 36), mParede); v.position.set(x, YM + .4, z); g.add(v);
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, 1.5, 8), mTronco); tr.position.set(x, YM + 1.4, z); g.add(tr);
      for (let i = 0; i < 38; i++) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.2 + Math.random() * .18, 0), i % 3 ? mFolha : mFolha2); f.position.set(x + (Math.random() - .5) * 1.5, YM + 1.7 + Math.random() * 1.1, z + (Math.random() - .5) * 1.5); f.rotation.set(Math.random() * 3, Math.random() * 3, 0); g.add(f); }
      circ(x, z, .7, 1);
    };
    oliveira(16.4, 10.8); oliveira(16.4, 25.1); oliveira(10.1, 25.1);
    // pendentes esféricos (do forro alto, descendo sobre o lounge)
    for (const [x, d] of [[13, 15.6], [13, 20.4]]) { const z = Z(d), fio = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, 2.6, 6), mChamp); fio.position.set(x, H - 1.3, z); g.add(fio); const es = new THREE.Mesh(new THREE.SphereGeometry(.5, 32, 24), new THREE.MeshStandardMaterial({ color: 0xfff6e8, emissive: 0xffecc8, emissiveIntensity: 1.1 })); es.position.set(x, H - 2.9, z); g.add(es); }
  }

  /* ===================== FASE 4: SALA DE DESFILE, PROVADORES, ESTANTES (acessórios sob o mezanino + araras de parede) ===================== */
  {
    const mVid = new THREE.MeshPhysicalMaterial({ color: 0xe8f2f2, transparent: true, opacity: .38, roughness: .05, depthWrite: false });
    const mPainel = new THREE.MeshStandardMaterial({ color: 0xfaf8f4, roughness: .6, emissive: 0xfff2dc, emissiveIntensity: .12 });
    const mEsp = new THREE.MeshStandardMaterial({ color: 0xdde6ec, metalness: .35, roughness: .08, emissive: 0x9aa8b4, emissiveIntensity: .55 });
    const COR = [0x1c1c1e, 0xbfa88a, 0x6e5b4a, 0xe9e0d0, 0x2b2b30, 0x9a8670];
    const bolsa = (cor, esc = 1) => {
      const b = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: cor, roughness: .45 });
      const c = new THREE.Mesh(new THREE.BoxGeometry(.34, .22, .15), m); c.position.y = .11; b.add(c);
      const t = new THREE.Mesh(new THREE.BoxGeometry(.3, .05, .12), m); t.position.y = .245; b.add(t);
      const al = new THREE.Mesh(new THREE.TorusGeometry(.085, .01, 6, 20, Math.PI), mChamp); al.position.y = .27; b.add(al);
      b.scale.setScalar(esc); return b;
    };
    const sapato = cor => {
      const sh = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: cor, roughness: .4 });
      const a = new THREE.Mesh(new THREE.BoxGeometry(.1, .015, .26), m); a.position.y = .12; sh.add(a);
      const b = new THREE.Mesh(new THREE.BoxGeometry(.095, .05, .12), m); b.position.set(0, .15, .07); sh.add(b);
      const c = new THREE.Mesh(new THREE.BoxGeometry(.09, .08, .1), m); c.position.set(0, .165, -.07); c.rotation.x = .35; sh.add(c);
      const d = new THREE.Mesh(new THREE.CylinderGeometry(.008, .014, .12, 8), mChamp); d.position.set(0, .06, -.11); sh.add(d);
      return sh;
    };
    // estante de parede iluminada; +z local = pra fora da parede
    const estante = (x, z, rotY, w, h = 3.3) => {
      const u = new THREE.Group(); u.position.set(x, 0, z); u.rotation.y = rotY; g.add(u);
      const pn = new THREE.Mesh(new THREE.BoxGeometry(w, h, .1), mPainel); pn.position.y = h / 2 + .05; u.add(pn);
      [.8, 1.5, 2.2, 2.9].forEach((y, n) => {
        const v = new THREE.Mesh(new THREE.BoxGeometry(w - .06, .025, .4), mVid); v.position.set(0, y, .24); u.add(v);
        const ar = new THREE.Mesh(new THREE.BoxGeometry(w - .06, .03, .015), mChamp); ar.position.set(0, y, .44); u.add(ar);
        const led = new THREE.Mesh(new THREE.BoxGeometry(w - .12, .02, .04), mLuz); led.position.set(0, y + .62, .1); u.add(led);
        const q = Math.max(2, Math.floor((w - .3) / .52));
        for (let k = 0; k < q; k++) { const px = -w / 2 + .22 + (w - .44) * k / (q - 1); const it = n === 0 ? sapato(COR[(k + 2) % 6]) : bolsa(COR[(k * 2 + n) % 6], .92 + (k % 2) * .12); it.position.set(px, y + .012, .24); it.rotation.y = .15 * (k % 2 ? -1 : 1); u.add(it); }
      });
    };
    const espelho = (x, z, rotY, w = .8, h = 2.7) => {
      const u = new THREE.Group(); u.position.set(x, 0, z); u.rotation.y = rotY; g.add(u);
      const f = new THREE.Mesh(new THREE.BoxGeometry(w + .08, h + .08, .04), mChamp); f.position.y = h / 2 + .04; u.add(f);
      const e = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mEsp); e.position.set(0, h / 2 + .04, .025); u.add(e);
    };
    const poltrona = (x, d, rotY) => {
      const u = new THREE.Group(); u.position.set(x, 0, Z(d)); u.rotation.y = rotY; g.add(u);
      const as = new THREE.Mesh(new THREE.CylinderGeometry(.42, .38, .34, 32), mBoucle2); as.position.y = .27; as.castShadow = true; u.add(as);
      const tp = new THREE.Mesh(new THREE.TorusGeometry(.38, .09, 10, 32), mBoucle2); tp.rotation.x = Math.PI / 2; tp.position.y = .46; u.add(tp);
      const en = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .62, 32, 1, false, Math.PI * .5, Math.PI), mBoucle2); en.position.y = .56; u.add(en);
      const bs = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .05, 24), mChamp); bs.position.y = .03; u.add(bs);
      circ(x, Z(d), .5);
    };
    // ---- sala de desfile: passarela ao longo de d (x=-11.5), plateia dos dois lados, telão no fundo ----
    {
      const cx = -11.5;
      bx(2.4, .14, 7.8, new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .1, clearcoat: 1 }), cx, .07, Z(31.3));
      for (const sx of [-1, 1]) bx(.05, .03, 7.8, mLed, cx + sx * 1.21, .15, Z(31.3));
      bx(2.5, .03, .05, mLed, cx, .15, Z(27.4));
      for (const sx of [-1, 1]) for (const d of [28.6, 30.2, 31.8, 33.4]) poltrona(cx + sx * 3.0, d, sx > 0 ? -Math.PI / 2 : Math.PI / 2);
      // telão emoldurado no fundo da sala
      const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 480; const c2 = cv.getContext('2d');
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 3.4), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false })); pl.position.set(cx, 2.15, Z(D - .46)); pl.rotation.y = rotAl; g.add(pl);
      bx(7.4, .08, .06, mChamp, cx, 3.88, Z(D - .5)); bx(7.4, .08, .06, mChamp, cx, .42, Z(D - .5)); bx(.08, 3.5, .06, mChamp, cx - 3.64, 2.15, Z(D - .5)); bx(.08, 3.5, .06, mChamp, cx + 3.64, 2.15, Z(D - .5));
      const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.crossOrigin = 'anonymous'; v.src = new URL('../assets/flow/video0.mp4', import.meta.url).href; v.onerror = () => { v._erro = true; };
      let ac = 0; const prev = tela; tela = dt => { prev(dt); ac += dt; if (ac < 1 / 20) return; ac = 0; c2.fillStyle = '#efede8'; c2.fillRect(0, 0, 1024, 480); if (!v._erro && v.readyState >= 2) { if (v.paused) v.play().catch(() => {}); const e = Math.max(1024 / v.videoWidth, 480 / v.videoHeight), w = v.videoWidth * e, h = v.videoHeight * e; c2.drawImage(v, (1024 - w) / 2, (480 - h) / 2, w, h); } tx.needsUpdate = true; };
      const lp = new THREE.PointLight(0xfff1dc, 18, 10, 1.7); lp.position.set(cx, 3.2, Z(D - 3)); g.add(lp);
    }
    // ---- provadores: 5 portas altas champanhe alinhadas na parede, pufes e espelhos ----
    {
      const wz = Z(D - .45);
      for (let i = 0; i < 5; i++) {
        const x = 7.6 + i * 2.0, dr = new THREE.Group(); dr.position.set(x, 0, wz); dr.rotation.y = rotAl; g.add(dr); dr.userData.clic = { tipo: 'provador' }; CLIC.push(dr);
        const mold = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.1, .08), new THREE.MeshStandardMaterial({ color: 0xd8c8a6, metalness: .2, roughness: .4 })); mold.position.set(0, 1.55, .0); dr.add(mold);
        const pt = new THREE.Mesh(new THREE.BoxGeometry(1.14, 2.84, .05), new THREE.MeshStandardMaterial({ color: 0xeadfc6, metalness: .1, roughness: .45, emissive: 0xd9c9a4, emissiveIntensity: .25 })); pt.position.set(0, 1.45, .045); dr.add(pt);
        const mao = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .5, 8), mChamp); mao.position.set(.42, 1.25, .1); dr.add(mao);
        const led = new THREE.Mesh(new THREE.BoxGeometry(1.0, .03, .03), mLed); led.position.set(0, 3.25, .03); dr.add(led);
      }
      espelho(5.8, Z(33.4), s > 0 ? Math.PI / 2 : -Math.PI / 2, .9, 2.7); espelho(17.1, Z(33.4), s > 0 ? -Math.PI / 2 : Math.PI / 2, .9, 2.7);
      for (const [x, d, r] of [[8.8, 32.4, .5], [11.6, 32.0, .5], [14.4, 32.4, .5]]) { const z = Z(d), p = new THREE.Mesh(new THREE.CylinderGeometry(r, r * .92, .44, 36), mBoucle2); p.position.set(x, .22, z); g.add(p); const tp = new THREE.Mesh(new THREE.TorusGeometry(r * .92, .09, 10, 32), mBoucle2); tp.rotation.x = Math.PI / 2; tp.position.set(x, .46, z); g.add(tp); circ(x, z, .65); }
      // mesa branca central com peças dobradas
      { const z = Z(29.2), tb = bx(1.6, .8, 1.0, mParede, 11.6, .4, z); for (let k = 0; k < 4; k++) bx(.4, .08 + (k % 2) * .05, .32, new THREE.MeshStandardMaterial({ color: [0x1c1c1e, 0xe9e0d0, 0x8a8f96, 0xbfa88a][k], roughness: .8 }), 11.0 + k * .38, .85 + (k % 2) * .02, z); ret(10.7, 12.5, z - .6, z + .6); }
      const lp = new THREE.PointLight(0xfff1dc, 16, 10, 1.7); lp.position.set(11.6, 3.4, Z(31)); g.add(lp);
    }
    // ---- sala de acessórios sob o mezanino: estantes de vidro na parede do fundo + mesa-ilha de vitrine ----
    {
      const rotP = s > 0 ? -Math.PI / 2 : Math.PI / 2;                          // frente voltada pro -x
      [11.4, 14.6, 17.8, 21.0, 24.2].forEach(d => { estante(17.12, Z(d), rotP, 2.8, 3.3); ret(16.6, 17.3, Z(d - 1.4), Z(d + 1.4)); });
      const ilha = z => { bx(2.2, .85, 1.2, mMarm, 13.2, .425, z); const gl = bx(2.1, .5, 1.1, mVid, 13.2, 1.1, z); for (let k = 0; k < 3; k++) { const b = bolsa(COR[(k * 2) % 6]); b.position.set(12.5 + k * .7, .86, z); g.add(b); } ret(12.0, 14.4, z - .65, z + .65); };
      ilha(Z(14.6)); ilha(Z(21.6));
      const lp = new THREE.PointLight(0xfff1dc, 22, 11, 1.6); lp.position.set(13, YM - .6, Z(18)); g.add(lp);
    }
    // ---- arara de parede com peças reais (lado direito da sala de provadores) ----
    {
      const x = 17.15, y = 1.95;
      const trilho = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 7.6, 8), mChamp); trilho.rotation.x = Math.PI / 2; trilho.position.set(x - .12, y, Z(30.8)); g.add(trilho);
      ['top-referencia', 'calca-vacuo', 'saia-assimetrica', 'tee-ceramica', 'camiseta-preta', 'top-crop04', 'calca-preta'].forEach((id, i) => penduraPeca(g, id, new THREE.Vector3(x - .14, y, Z(27.6 + i * .95)), s > 0 ? -Math.PI / 2 : Math.PI / 2).catch(() => {}));
    }
  }

  /* ===================== DESIGN v2 (fiel às referências): nichos embutidos, telas de campanha, produto, parede do logo, bar de ônix ===================== */
  {
    const COR = [0x1c1c1e, 0xbfa88a, 0x6e5b4a, 0xe9e0d0, 0x2b2b30, 0x9a8670, 0xd9d2c5];
    const mVid = new THREE.MeshPhysicalMaterial({ color: 0xeef6f6, transparent: true, opacity: .32, roughness: .04, depthWrite: false });
    const fundoQuente = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#fff3dc'); gr.addColorStop(.5, '#fbeeda'); gr.addColorStop(1, '#f1e3cb'); x.fillStyle = gr; x.fillRect(0, 0, 64, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshBasicMaterial({ map: t, toneMapped: false }); })();
    const bolsa = (cor, esc = 1, tipo = 0) => {
      const b = new THREE.Group(), m = new THREE.MeshPhysicalMaterial({ color: cor, roughness: .38, clearcoat: .4 });
      if (tipo === 1) { // bolsa estruturada tipo "bowling"
        const c = new THREE.Mesh(new THREE.CapsuleGeometry(.1, .2, 6, 16), m); c.rotation.z = Math.PI / 2; c.scale.set(1, 1, .75); c.position.y = .11; b.add(c);
        const al = new THREE.Mesh(new THREE.TorusGeometry(.09, .011, 6, 24, Math.PI), m); al.position.y = .2; b.add(al);
      } else {
        const c = new THREE.Mesh(new THREE.BoxGeometry(.34, .22, .14), m); c.position.y = .11; b.add(c);
        const t = new THREE.Mesh(new THREE.BoxGeometry(.35, .06, .15), m); t.position.y = .235; b.add(t);
        const al = new THREE.Mesh(new THREE.TorusGeometry(.085, .01, 6, 20, Math.PI), mChamp); al.position.y = .27; b.add(al);
        const fe = new THREE.Mesh(new THREE.BoxGeometry(.05, .03, .01), mChamp); fe.position.set(0, .2, .077); b.add(fe);
      }
      b.scale.setScalar(esc); return b;
    };
    const salto = cor => {
      const sh = new THREE.Group(), m = new THREE.MeshPhysicalMaterial({ color: cor, roughness: .35, clearcoat: .6 });
      const pl = new THREE.Mesh(new THREE.BoxGeometry(.075, .012, .24), m); pl.position.set(0, .085, 0); pl.rotation.x = -.32; sh.add(pl);
      const bi = new THREE.Mesh(new THREE.ConeGeometry(.045, .12, 12, 1, false, 0, Math.PI), m); bi.rotation.set(Math.PI / 2, 0, Math.PI / 2); bi.position.set(0, .05, .1); sh.add(bi);
      const sa = new THREE.Mesh(new THREE.CylinderGeometry(.006, .012, .14, 8), m); sa.position.set(0, .07, -.1); sh.add(sa);
      return sh;
    };
    // nicho embutido iluminado: moldura grossa cor de parede + fundo quente aceso + prateleiras de vidro com aro champanhe
    const nicho = (x, z, rotY, w, h = 2.9, y0 = .55, niveis = 3, itens = 'misto') => {
      const u = new THREE.Group(); u.position.set(x, 0, z); u.rotation.y = rotY; g.add(u);
      const P = .32, F = .22;
      const add = (gw, gh, gd, m, px, py, pz) => { const me = new THREE.Mesh(new THREE.BoxGeometry(gw, gh, gd), m); me.position.set(px, py, pz); u.add(me); return me; };
      add(w + 2 * F, F, P, mParede, 0, y0 + h + F / 2, P / 2); add(w + 2 * F, F, P, mParede, 0, y0 - F / 2, P / 2);
      add(F, h, P, mParede, -w / 2 - F / 2, y0 + h / 2, P / 2); add(F, h, P, mParede, w / 2 + F / 2, y0 + h / 2, P / 2);
      add(w + 2 * F, y0 - F, P, mParede, 0, (y0 - F) / 2, P / 2);
      const fd = new THREE.Mesh(new THREE.PlaneGeometry(w, h), fundoQuente); fd.position.set(0, y0 + h / 2, .01); u.add(fd);
      for (const sx of [-1, 1]) add(.03, h, .03, mLuz, sx * (w / 2 - .02), y0 + h / 2, .04);
      add(w + .02, .025, .025, mChamp, 0, y0 + h, P - .01); add(w + .02, .025, .025, mChamp, 0, y0, P - .01);
      for (let n = 0; n < niveis; n++) {
        const y = y0 + (n + .5) * h / niveis - .15;
        add(w - .02, .02, P - .04, mVid, 0, y, P / 2); add(w - .02, .025, .015, mChamp, 0, y, P - .02);
        const q = Math.max(1, Math.floor((w - .2) / .55));
        for (let k = 0; k < q; k++) {
          const px = q === 1 ? 0 : -w / 2 + .3 + (w - .6) * k / (q - 1);
          const usaSalto = itens === 'sapatos' || (itens === 'misto' && n === 0);
          const it = usaSalto ? salto(COR[(k + n) % 7]) : bolsa(COR[(k * 3 + n) % 7], .85 + ((k + n) % 2) * .15, (k + n) % 3 === 2 ? 1 : 0);
          if (usaSalto) { const it2 = salto(COR[(k + n) % 7]); it2.position.set(px + .09, y + .01, P / 2); u.add(it2); it.position.set(px - .02, y + .01, P / 2); }
          else it.position.set(px, y + .01, P / 2);
          it.rotation.y = usaSalto ? .5 : .12 * (k % 2 ? -1 : 1); u.add(it);
        }
      }
      return u;
    };
    // tela de campanha (lightbox emoldurado, foto do Flow), com halo
    const loaderC = new THREE.TextureLoader();
    const cartaz = (x, z, rotY, foto, w = 1.5, h = 2.1, y = 2.3) => {
      const u = new THREE.Group(); u.position.set(x, 0, z); u.rotation.y = rotY; g.add(u);
      const t = loaderC.load(new URL(`../assets/flow/${foto}.jpg`, import.meta.url).href); t.colorSpace = THREE.SRGBColorSpace;
      const mo = new THREE.Mesh(new THREE.BoxGeometry(w + .12, h + .12, .08), mChamp); mo.position.set(0, y, .04); u.add(mo);
      const im = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); im.position.set(0, y, .085); u.add(im);
      const ha = new THREE.Mesh(new THREE.PlaneGeometry(w + .9, h + .9), new THREE.MeshBasicMaterial({ color: 0xffeccc, transparent: true, opacity: .22, depthWrite: false, toneMapped: false })); ha.position.set(0, y, .01); u.add(ha);
    };
    const PX = Math.PI / 2, MX = -Math.PI / 2, FD = rotAl;           // virado pra +x, pra -x, pra -d (entrada)
    const xE = -W / 2 + .45, xD = W / 2 - .45;                      // faces internas das paredes laterais

    // ---- ÁTRIO: nichos embutidos nas laterais, arara com roupa real à direita ----
    nicho(xE, Z(2.6), PX, 2.6); nicho(xE, Z(6.5), PX, 2.6, 2.9, .55, 3, 'sapatos');
    nicho(xD, Z(2.6), MX, 2.6);
    { // arara de parede à direita (d 4.6..8.6)
      const trilho = new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, 4.2, 8), mChamp); trilho.rotation.x = Math.PI / 2; trilho.position.set(xD - .3, 1.95, Z(6.6)); g.add(trilho);
      for (const dd of [4.5, 8.7]) { const br = new THREE.Mesh(new THREE.BoxGeometry(.32, .03, .03), mChamp); br.position.set(xD - .16, 1.95, Z(dd)); g.add(br); }
      ['japi-jaqueta', 'japi-calca', 'atelie-jaqueta', 'atelie-saia', 'atelie-camiseta', 'atelie-calca'].forEach((id, i) => penduraPeca(g, id, new THREE.Vector3(xD - .3, 1.95, Z(4.9 + i * .72)), MX).catch(() => {}));
      ret(xD - .6, xD + .2, Z(4.4), Z(8.8));
      const lp = new THREE.SpotLight(0xfff0d8, 30, 9, .6, .6, 1.4); lp.position.set(xD - 3, 4.5, Z(6.6)); lp.target.position.set(xD, 1.4, Z(6.6)); g.add(lp, lp.target);
    }
    // ---- ÁTRIO esquerdo: parede do logo (frente do bar) + pódio redondo com manequim ----
    {
      const zL = Z(8.83);
      const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 512; const x = cv.getContext('2d');
      x.fillStyle = 'rgba(0,0,0,0)'; x.clearRect(0, 0, 2048, 512);
      x.font = '400 250px "Didot","Bodoni MT","Times New Roman",serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.letterSpacing = '70px';
      x.shadowColor = 'rgba(255,205,140,.95)'; x.shadowBlur = 50; x.fillStyle = '#c9b38a'; x.fillText('ATELIÊ', 1024, 270); x.shadowBlur = 0; x.fillStyle = '#8f7a55'; x.fillText('ATELIÊ', 1024, 270);
      const tl = new THREE.CanvasTexture(cv); tl.colorSpace = THREE.SRGBColorSpace;
      const logo = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.4), new THREE.MeshBasicMaterial({ map: tl, transparent: true, depthWrite: false }));
      const cx = -13.3; logo.position.set(cx, 3.35, zL - s * .02); logo.rotation.y = FD; g.add(logo);
      for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.035, 2.2, .03), mLuz); l.position.set(cx + sx * 3.1, 2.6, zL - s * .02); g.add(l); }
      const pz = Z(6.4), podio = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.3, .18, 64), mMarm); podio.position.set(cx, .09, pz); g.add(podio);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(1.27, .022, 8, 64), mLed); aro.rotation.x = Math.PI / 2; aro.position.set(cx, .03, pz); g.add(aro);
      const cir = new THREE.Mesh(new THREE.TorusGeometry(1.6, .02, 6, 96), mLed); cir.rotation.x = Math.PI / 2; cir.position.set(cx, H - .02, pz); g.add(cir);
      manequim(g, new THREE.Vector3(cx, .18, pz), { corpo: 'fem', roupas: { camisa: 'japi-jaqueta', calca: 'japi-calca', calcado: 'bota-v' }, nome: 'Look JAPI' }, FD).catch(e => console.error('manequim', e));
      circ(cx, pz, 1.45);
      const sp = new THREE.SpotLight(0xfff2de, 40, 10, .45, .5, 1.3); sp.position.set(cx, H - .4, pz); sp.target.position.set(cx, 0, pz); g.add(sp, sp.target);
    }
    // ---- ÁTRIO direito: galeria de manequins em pedestais pretos com borda de luz ----
    {
      const mPreto = new THREE.MeshPhysicalMaterial({ color: 0x0e0f12, roughness: .15, clearcoat: 1 });
      [[11.6, 3.4, { corpo: 'fem', roupas: { camisa: 'atelie-jaqueta', calca: 'atelie-saia', calcado: 'bota-v' }, nome: 'Look Ateliê noite' }], [13.9, 5.0, HOMENS[3]], [11.3, 6.9, { corpo: 'fem', roupas: { camisa: 'atelie-camiseta', calca: 'atelie-calca', calcado: 'bota-v' }, nome: 'Look Ateliê dia' }]].forEach(([x, d, cfg], i) => {
        const z = Z(d), b = new THREE.Mesh(new THREE.BoxGeometry(1.1, .26, 1.1), mPreto); b.position.set(x, .13, z); g.add(b);
        const fr = new THREE.Mesh(new THREE.BoxGeometry(1.12, .02, 1.12), mLed); fr.position.set(x, .01, z); g.add(fr);
        manequim(g, new THREE.Vector3(x, .26, z), cfg, FD + (i - 1) * .35).catch(e => console.error('manequim', e));
        ret(x - .7, x + .7, z - .7, z + .7);
      });
    }
    // ---- SALÃO: telas de campanha nas paredes, cúpulas de vidro com bolsa ----
    cartaz(-8.83, Z(11.3), PX, 'camp-mulher'); cartaz(-8.83, Z(23.8), PX, 'camp-3');
    cartaz(-7.15, Z(25.83), FD, 'camp-homem', 1.4, 1.95, 2.25); cartaz(7.05, Z(25.83), FD, 'camp-mulher', 1.4, 1.95, 2.25);
    const cupula = (x, d, cor) => {
      const z = Z(d), pl = new THREE.Mesh(new THREE.BoxGeometry(.7, 1.0, .7), mMarm); pl.position.set(x, .5, z); g.add(pl);
      const dm = new THREE.Mesh(new THREE.SphereGeometry(.33, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mVid); dm.position.set(x, 1.0 + .25, z); g.add(dm);
      const cl = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .25, 32, 1, true), mVid); cl.position.set(x, 1.0 + .125, z); g.add(cl);
      const bb = bolsa(cor, .9, 1); bb.position.set(x, 1.0, z); g.add(bb);
      const pq = new THREE.PointLight(0xfff3dc, 3, 2.5, 2); pq.position.set(x, 1.9, z); g.add(pq);
      circ(x, z, .6);
    };
    cupula(-7.4, 17.2, 0x16161a); cupula(6.3, 18.6, 0xbfa88a);
    // ---- BAR: moldura arredondada em volta do ônix + garrafas com gargalo + taças ----
    {
      const xN = -W / 2 + .35, cz = 17.2, w = 10.6, h = 3.6, rr = .45;
      const sh = new THREE.Shape(); sh.moveTo(-w / 2 - .35, -.35); sh.lineTo(w / 2 + .35, -.35); sh.lineTo(w / 2 + .35, h + .35); sh.lineTo(-w / 2 - .35, h + .35); sh.closePath();
      const ho = new THREE.Path(); ho.moveTo(-w / 2, 0); ho.lineTo(w / 2, 0); ho.lineTo(w / 2, h - rr); ho.absarc(w / 2 - rr, h - rr, rr, 0, Math.PI / 2, false); ho.lineTo(-w / 2 + rr, h); ho.absarc(-w / 2 + rr, h - rr, rr, Math.PI / 2, Math.PI, false); ho.lineTo(-w / 2, 0); sh.holes.push(ho);
      const fr = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .28, bevelEnabled: false, curveSegments: 16 }), mParede);
      fr.rotation.y = PX; fr.position.set(xN, .7, Z(cz)); g.add(fr);
      const contorno = ho.getPoints(24).map(p => new THREE.Vector3(xN + .27, .7 + p.y, Z(cz) - p.x * (s > 0 ? 1 : -1) * -1 * -1));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(contorno, true), 160, .02, 6, true), mChamp));
      const mVidG = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .35, roughness: .05, depthWrite: false });
      const cores = [0x3a2a1c, 0xc8a24a, 0x23402a, 0x5a1e22, 0xd8c08a, 0x1d1a16];
      for (let i = 0; i < 14; i++) {
        const z = Z(12.9 + i * .66), c = cores[i % 6], mg = new THREE.MeshPhysicalMaterial({ color: c, roughness: .12, clearcoat: 1, transparent: true, opacity: .92 });
        const corpo = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .24, 16), mg); corpo.position.set(xN + .42, 2.2 + .14, z); g.add(corpo);
        const om = new THREE.Mesh(new THREE.CylinderGeometry(.02, .055, .07, 16), mg); om.position.set(xN + .42, 2.2 + .295, z); g.add(om);
        const ga = new THREE.Mesh(new THREE.CylinderGeometry(.016, .018, .1, 10), mg); ga.position.set(xN + .42, 2.2 + .38, z); g.add(ga);
        const rot = new THREE.Mesh(new THREE.BoxGeometry(.11, .07, .002), new THREE.MeshStandardMaterial({ color: 0xf3ead6 })); rot.position.set(xN + .42 + .056, 2.2 + .13, z); rot.rotation.y = PX; g.add(rot);
        if (i % 3 === 1) { const ta = new THREE.Mesh(new THREE.CylinderGeometry(.04, .02, .1, 12, 1, true), mVidG); ta.position.set(xN + .45, 2.2 + .14, z + .3 * s); g.add(ta); const ha = new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, .08, 6), mVidG); ha.position.set(xN + .45, 2.2 + .05, z + .3 * s); g.add(ha); }
      }
    }
  }

  // reflexo: captura o ambiente da loja uma vez (CubeCamera) e aplica no mármore polido, metais e vidros
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
  const cubeCam = new THREE.CubeCamera(.2, 60, cubeRT); cubeCam.position.set(0, 2.2, Z(15)); g.add(cubeCam);
  const reflexo = (renderer, cena) => {
    cubeCam.update(renderer, cena);
    g.traverse(o => { const m = o.isMesh && o.material; if (m && !m.isMeshBasicMaterial && ((m.metalness || 0) > .3 || (m.clearcoat || 0) > .5)) { m.envMap = cubeRT.texture; m.envMapIntensity = (m.metalness || 0) > .8 ? 1.2 : .9; m.needsUpdate = true; } });
  };

  return { update(dt) { desfile(dt); tela(dt); }, reflexo };
}
