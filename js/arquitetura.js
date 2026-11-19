// SHOPPING NEW (moda) — arquitetura em TRÊS ALAS: átrio hexagonal alto com claraboia e escultura, 3 alas de 16 m de largura (entrada, VANTRA, em breve),
// aletas inclinadas nas paredes do átrio, vitrines "em breve" em vidro colorido. Só a VANTRA é loja de verdade (loja-vantra.js).
import * as THREE from 'three';
import { SH, ALAS, EM_BREVE, VANTRA, COR_BREVE } from './planta.js';

const caixa = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
function textoTex(txt, sub, cor, w = 768, h = 240, subCor = 'rgba(255,255,255,.88)') {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.clearRect(0, 0, w, h); g.fillStyle = cor; g.font = '800 88px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 - (sub ? 26 : 0));
  if (sub) { g.font = '600 38px ui-monospace,Consolas,monospace'; g.fillStyle = subCor; g.fillText(sub.toUpperCase(), w / 2, h / 2 + 56); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const claro = (hex, k) => new THREE.Color(hex).lerp(new THREE.Color(0xffffff), k);

export function construirShopping(scene) {
  const obst = [];
  const add = (o, p = scene) => (p.add(o), o);
  const { apotema, teto, tetoAtrio, zAl } = SH, R6 = apotema / Math.cos(Math.PI / 6);

  const mBranco = new THREE.MeshStandardMaterial({ color: 0xf7f8fa, roughness: .7 });
  const mLima = new THREE.MeshStandardMaterial({ color: 0xd4ff3a, emissive: 0xd4ff3a, emissiveIntensity: 1.3 });
  const mCromo = new THREE.MeshStandardMaterial({ color: 0xf6f7f9, metalness: .15, roughness: .35 });
  const mVidro = new THREE.MeshPhysicalMaterial({ color: 0xe6f3ff, roughness: .04, transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false });
  const mLuz = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.2 });
  const mMadeira = new THREE.MeshStandardMaterial({ color: 0xe6c9a0, roughness: .65 });

  /* ---------- cada ala: transformação local→mundo + colisões orientadas ---------- */
  const alas = {};
  ALAS.forEach(a => {
    const g = new THREE.Group(); g.rotation.y = -a.ang; scene.add(g);
    const c = Math.cos(a.ang), s = Math.sin(a.ang);
    alas[a.id] = {
      ...a, g, c, s, mundo: (x, z) => ({ x: x * c - z * s, z: x * s + z * c }),
      ret(x0, x1, z0, z1) { const m = this.mundo((x0 + x1) / 2, (z0 + z1) / 2); obst.push({ t: 'o', cx: m.x, cz: m.z, a: a.ang, hx: Math.abs(x1 - x0) / 2, hz: Math.abs(z1 - z0) / 2 }); },
      circ(x, z, r) { const m = this.mundo(x, z); obst.push({ t: 'c', x: m.x, z: m.z, r }); },
    };
  });

  /* ---------- piso: pedra polida (mármore claro com veios), reflexivo, com desenhos geométricos que seguem a arquitetura ---------- */
  const veios = (g, w, h, n, alpha) => {
    for (let i = 0; i < n; i++) {
      g.strokeStyle = `rgba(${150 + (Math.random() * 40) | 0},${145 + (Math.random() * 40) | 0},${140 + (Math.random() * 40) | 0},${alpha * (.4 + Math.random() * .6)})`;
      g.lineWidth = .6 + Math.random() * 1.8; g.beginPath(); let x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += (Math.random() - .3) * w * .12; y += (Math.random() - .5) * h * .12; g.lineTo(x, y); }
      g.stroke();
    }
  };
  const mármore = (g, w, h) => {
    const base = g.createLinearGradient(0, 0, w, h); base.addColorStop(0, '#efece7'); base.addColorStop(.5, '#e9e5df'); base.addColorStop(1, '#f2efea'); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${200 + (Math.random() * 30) | 0},${195 + (Math.random() * 30) | 0},${188 + (Math.random() * 30) | 0},.10)`; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 40 + Math.random() * 160, 30 + Math.random() * 90, Math.random() * 3, 0, 6.3); g.fill(); }
    veios(g, w, h, 26, .22);
  };
  const juntas = (g, w, h, passo) => { g.strokeStyle = 'rgba(110,100,90,.22)'; g.lineWidth = 3; for (let x = 0; x <= w; x += passo) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += passo) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } };
  const OURO = '#c8b07a', LIMA = '#cfee3a';
  const matPiso = tex => new THREE.MeshPhysicalMaterial({ map: tex, roughness: .22, metalness: .08, clearcoat: 1, clearcoatRoughness: .06, envMapIntensity: 1.3 });
  const hexPts = (k, esc = 1) => { const a = Math.PI / 6 + k * Math.PI / 3; return new THREE.Vector2(Math.cos(a) * R6 * esc, Math.sin(a) * R6 * esc); };
  const hexShape = esc => { const sh = new THREE.Shape(); for (let k = 0; k < 6; k++) { const p = hexPts(k, esc); k ? sh.lineTo(p.x, p.y) : sh.moveTo(p.x, p.y); } sh.closePath(); return sh; };

  // átrio: mármore com anéis hexagonais concêntricos (ouro champanhe + cinza suave) e raios apontando pras 3 alas
  const ca = document.createElement('canvas'); ca.width = ca.height = 2048; const ga = ca.getContext('2d');
  mármore(ga, 2048, 2048); juntas(ga, 2048, 2048, 256);
  const hexPath = (g, r, rot) => { g.beginPath(); for (let k = 0; k < 6; k++) { const a = rot + k * Math.PI / 3, x = 1024 + Math.cos(a) * r, y = 1024 + Math.sin(a) * r; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); };
  const esc = 1024 / R6;                                                       // metros → pixels do canvas
  [[.92, 10, OURO], [.86, 5, OURO], [.66, 26, '#d9d4cb'], [.6, 6, OURO], [.34, 18, '#cfc8bb']].forEach(([f, lw, cor]) => { hexPath(ga, R6 * f * esc, Math.PI / 6); ga.strokeStyle = cor; ga.lineWidth = lw; ga.stroke(); });
  for (const deg of [60, 180, 300]) { const a = deg * Math.PI / 180; ga.strokeStyle = LIMA; ga.lineWidth = 12; ga.beginPath(); ga.moveTo(1024 + Math.cos(a) * R6 * .34 * esc, 1024 + Math.sin(a) * R6 * .34 * esc); ga.lineTo(1024 + Math.cos(a) * R6 * .98 * esc, 1024 + Math.sin(a) * R6 * .98 * esc); ga.stroke(); }
  const ta = new THREE.CanvasTexture(ca); ta.colorSpace = THREE.SRGBColorSpace; ta.anisotropy = 16; ta.repeat.set(1 / (2 * R6), 1 / (2 * R6)); ta.offset.set(.5, .5);
  const pisoHex = add(new THREE.Mesh(new THREE.ShapeGeometry(hexShape(1)), matPiso(ta))); pisoHex.rotation.x = -Math.PI / 2; pisoHex.scale.y = -1; pisoHex.userData.chao = true; pisoHex.receiveShadow = true;

  // alas: pedra com faixa central de contorno ouro, fio lima nas bordas, juntas a cada 2,6 m
  Object.values(alas).forEach(a => {
    const w = 2048, h = Math.round(2048 * (zAl * 2) / a.comp), cw = document.createElement('canvas'); cw.width = w; cw.height = h; const gw = cw.getContext('2d');
    mármore(gw, w, h); juntas(gw, w, h, Math.round(w / (a.comp / 2.6)));
    gw.strokeStyle = OURO; gw.lineWidth = 6; gw.strokeRect(0, h * .30, w, h * .40);
    gw.fillStyle = 'rgba(214,208,196,.35)'; gw.fillRect(0, h * .30, w, h * .40);
    for (const y of [h * .06, h * .94]) { gw.fillStyle = LIMA; gw.fillRect(0, y - 4, w, 8); }
    const tx = new THREE.CanvasTexture(cw); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 16;
    const p = add(new THREE.Mesh(new THREE.PlaneGeometry(a.comp, zAl * 2), matPiso(tx)), a.g); p.rotation.x = -Math.PI / 2; p.position.set(apotema + a.comp / 2 - .01, 0, 0); p.userData.chao = true; p.receiveShadow = true;
  });

  /* ---------- átrio: 3 paredes fechadas em aletas inclinadas, teto alto com claraboia hexagonal, escultura ---------- */
  const lado = R6;                                                       // comprimento de cada aresta do hexágono
  [0, 120, 240].forEach((deg, ix) => {
    const th = deg * Math.PI / 180, g = new THREE.Group(); g.position.set(Math.cos(th) * apotema, 0, Math.sin(th) * apotema); g.rotation.y = -th - Math.PI / 2; scene.add(g);
    const fundo = add(caixa(lado, tetoAtrio, .3, new THREE.MeshStandardMaterial({ color: claro(COR_BREVE[ix * 2], .55), roughness: .6 })), g); fundo.position.set(0, tetoAtrio / 2, .2);
    for (let i = 0; i < 5; i++) {
      const x = -lado / 2 + 1.6 + i * ((lado - 3.2) / 4);
      const fin = add(caixa(.5, tetoAtrio - 1, 2.6, mBranco), g); fin.position.set(x, (tetoAtrio - 1) / 2 + .5, -1.1); fin.rotation.y = i % 2 ? .45 : -.45;
      const led = add(caixa(.06, tetoAtrio - 2, .06, mLima), g); led.position.set(x, (tetoAtrio - 1) / 2 + .5, -2.4);
    }
    obst.push({ t: 'o', cx: Math.cos(th) * (apotema - 1.3), cz: Math.sin(th) * (apotema - 1.3), a: th + Math.PI / 2, hx: lado / 2, hz: 1.4 });
  });
  const tetoShape = hexShape(1), furo = new THREE.Path();
  for (let k = 0; k < 6; k++) { const p = hexPts(k, .58); k ? furo.lineTo(p.x, p.y) : furo.moveTo(p.x, p.y); } furo.closePath(); tetoShape.holes.push(furo);
  const tetoA = add(new THREE.Mesh(new THREE.ShapeGeometry(tetoShape), new THREE.MeshStandardMaterial({ color: 0xfbf9f6, roughness: .9, side: THREE.DoubleSide }))); tetoA.rotation.x = Math.PI / 2; tetoA.scale.y = -1; tetoA.position.y = tetoAtrio;
  const clara = add(new THREE.Mesh(new THREE.ShapeGeometry(hexShape(.58)), new THREE.MeshBasicMaterial({ color: 0xd2e9ff, transparent: true, opacity: .8, side: THREE.DoubleSide }))); clara.rotation.x = -Math.PI / 2; clara.position.y = tetoAtrio + .7;
  for (let k = 0; k < 6; k++) { const a = hexPts(k, .58), b = hexPts((k + 1) % 6, .58); const m = add(caixa(a.distanceTo(b), .14, .2, mLima)); m.position.set((a.x + b.x) / 2, tetoAtrio - .06, (a.y + b.y) / 2); m.rotation.y = -Math.atan2(b.y - a.y, b.x - a.x); }
  // escultura: três lâminas inclinadas que se encontram, sobre base hexagonal
  [0, 1, 2].forEach(i => {
    const a = i * 2.094; const l = add(caixa(.5, 9, 3.4, mBranco)); l.position.set(Math.cos(a) * .9, 4.5, Math.sin(a) * .9); l.rotation.set(Math.sin(a) * .12, -a, -Math.cos(a) * .12);
    const led = add(caixa(.07, 8.6, .07, mLima)); led.position.set(Math.cos(a) * 1.2, 4.5, Math.sin(a) * 1.2);
  });
  const base = add(new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, .5, 6), mBranco)); base.position.y = .25; base.rotation.y = Math.PI / 6;
  obst.push({ t: 'c', x: 0, z: 0, r: 3.9 });
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 1.047, b = add(caixa(3.4, .45, .9, mMadeira)); b.position.set(Math.cos(a) * 7.2, .25, Math.sin(a) * 7.2); b.rotation.y = -a + Math.PI / 2; obst.push({ t: 'c', x: b.position.x, z: b.position.z, r: 1.4 }); }

  /* ---------- alas: teto, luz, fundo de vidro, vitrines "em breve" ---------- */
  Object.values(alas).forEach(a => {
    const L = a.comp, x0 = apotema, x1 = apotema + L, g = a.g;
    const tetoW = add(caixa(L, .3, zAl * 2, mBranco), g); tetoW.position.set(x0 + L / 2, teto + .15, 0);
    for (let k = 0; k * 6 < L - 3; k++) { const l = add(caixa(.18, .05, zAl * 1.5, mLuz), g); l.position.set(x0 + 4 + k * 6, teto - .02, 0); }
    for (const sz of [-1, 1]) { const f = add(caixa(L, .08, .14, mLima), g); f.position.set(x0 + L / 2, teto - .05, sz * (zAl - .5)); }
    if (a.id === 'entrada') {
      // ENTRADA TOTALMENTE ABERTA: sem vidro, só um pórtico alto com faixa lima e a palavra ENTRADA
      const verga = add(caixa(.6, 1.6, zAl * 2 + .6, mBranco), g); verga.position.set(x1, teto - .8, 0);
      for (const sz of [-1, 1]) { const pil = add(caixa(.8, teto, .8, mBranco), g); pil.position.set(x1, teto / 2, sz * (zAl + .1)); }
      const luz = add(caixa(.12, .12, zAl * 2, mLima), g); luz.position.set(x1 - .35, teto - 1.65, 0);
      const pl = add(new THREE.Mesh(new THREE.PlaneGeometry(9, 1.3), new THREE.MeshBasicMaterial({ map: textoTex('SHOPPING NEW', 'entrada', '#1d2430', 768, 240, 'rgba(29,36,48,.75)'), transparent: true, toneMapped: false })), g); pl.position.set(x1 + .32, teto - .8, 0); pl.rotation.y = Math.PI / 2;
    } else {
      const vg = add(caixa(.06, teto, zAl * 2, mVidro), g); vg.position.set(x1, teto / 2, 0);
      for (let i = 0; i <= 8; i++) { const mx = add(caixa(.12, teto, .12, mCromo), g); mx.position.set(x1, teto / 2, -zAl + i * (zAl * 2 / 8)); }
      a.ret(x1 - .2, x1 + .2, -zAl, zAl);
    }
    const lista = EM_BREVE[a.id] || {};
    for (const lad of [-1, 1]) {
      if (a.id === VANTRA.ala && lad === VANTRA.lado) continue;            // esse lado é a loja VANTRA
      const nomes = lista[String(lad)] || [], slot = (L - 6) / Math.max(nomes.length, 1), zf = lad * zAl;
      nomes.forEach((nome, i) => {
        const cx = x0 + 3 + slot * (i + .5), cor = COR_BREVE[(i + (lad > 0 ? 3 : 0)) % COR_BREVE.length];
        const painel = add(caixa(slot - .6, teto - 1.2, .25, new THREE.MeshPhysicalMaterial({ color: claro(cor, .3), roughness: .25, transparent: true, opacity: .78 })), g); painel.position.set(cx, (teto - 1.2) / 2 + .6, zf - lad * .12);
        const letr = add(new THREE.Mesh(new THREE.PlaneGeometry(slot - 1.6, (slot - 1.6) * .3), new THREE.MeshBasicMaterial({ map: textoTex(nome, 'em breve', '#ffffff'), transparent: true, toneMapped: false })), g); letr.position.set(cx, 4.2, zf - lad * .27); letr.rotation.y = lad < 0 ? 0 : Math.PI;
        for (const y of [1.0, teto - 1.0]) { const fio = add(caixa(slot - .6, .08, .12, new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 1.2 })), g); fio.position.set(cx, y, zf - lad * .3); }
        const pil = add(caixa(.5, teto, .5, mBranco), g); pil.position.set(cx - slot / 2, teto / 2, zf);
      });
      a.ret(x0, x1, lad * zAl - .3, lad * zAl + .3);
    }
  });

  /* ---------- praça lá fora (a oeste, depois da ala de entrada) ---------- */
  const praca = add(new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0xe0ddd6, roughness: .85 })));
  praca.rotation.x = -Math.PI / 2; praca.position.set(-(apotema + alas.entrada.comp + 40), -.01, 0); praca.userData.chao = true;
  return { obst, alas, spawn: { x: -(apotema + alas.entrada.comp + 8), z: 0 } };
}
