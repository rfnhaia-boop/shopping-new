// LE FERRI — MUNDO PRÓPRIO DA MARCA (cliente). Fica num lugar separado do shopping (x = OX) e se chega pelo portal da boutique.
// Segue o briefing/mockups do site da marca: loja (praça com expositor central, ala de roupas, ala de bolsas e calçados, caixa sob o nome),
// galeria de manequins, provadores, lounge + café, área VIP, e as ativações: passarela, ponto de foto, balada (com camarote) e cinema.
// Identidade: Bodoni Moda (nome), Jost (textos), marfim F3EFE8, champanhe CDBA9A, cinza 9B968D, preto 050505, mármore branco, bouclé creme, aço champanhe.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { Personagem } from '../../shared/personagem/personagem.js';
import { CATALOGO_ROUPAS } from '../../shared/personagem/guarda-roupa.js';

export const OX = 600;                                    // o mundo LE FERRI começa em x = 600 (longe do shopping)
export const ENTRADA = { x: OX, z: 3.2 };                 // onde a pessoa chega pelo portal (olhando pra +z)
const TAU = Math.PI * 2;

/* ---------------- materiais da marca ---------------- */
const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
const texMarmore = (base = '#f1eee9', veio = 'rgba(150,146,140,', n = 30) => {
  const t = cv(1024, 1024, (x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) { x.strokeStyle = veio + (.08 + Math.random() * .16) + ')'; x.lineWidth = .5 + Math.random() * 1.4; x.beginPath(); let a = Math.random() * w, b = Math.random() * h; const dx = (Math.random() - .5) * 2, dy = Math.random() - .5; x.moveTo(a, b); for (let k = 0; k < 12; k++) { a += 70 * dx + (Math.random() - .5) * 30; b += 70 * dy + (Math.random() - .5) * 30; x.lineTo(a, b); } x.stroke(); }
  }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
};
const texBoucle = () => { const t = cv(256, 256, (x) => { x.fillStyle = '#efe7d7'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 4000; i++) { const v = 214 + Math.random() * 36 | 0; x.fillStyle = `rgba(${v},${v - 6},${v - 18},.55)`; x.beginPath(); x.arc(Math.random() * 256, Math.random() * 256, .8 + Math.random() * 2, 0, 6.3); x.fill(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t; };
const M = {
  parede: new THREE.MeshStandardMaterial({ color: 0xf7f4ef, roughness: .72 }),
  teto: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .8 }),
  champ: new THREE.MeshStandardMaterial({ color: 0xcdba9a, metalness: .8, roughness: .3 }),
  champFosco: new THREE.MeshStandardMaterial({ color: 0xd8c8a6, metalness: .25, roughness: .45, emissive: 0xcdba9a, emissiveIntensity: .12 }),
  led: new THREE.MeshStandardMaterial({ color: 0xfff6e6, emissive: 0xfff0d6, emissiveIntensity: 2.3 }),
  luz: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3dd, emissiveIntensity: 2.6 }),
  vidro: new THREE.MeshPhysicalMaterial({ color: 0xeef6f6, transparent: true, opacity: .26, roughness: .03, depthWrite: false }),
  boucle: new THREE.MeshStandardMaterial({ map: texBoucle(), roughness: 1 }),
  preto: new THREE.MeshPhysicalMaterial({ color: 0x0b0b0d, roughness: .14, clearcoat: 1 }),
  branco: new THREE.MeshStandardMaterial({ color: 0xfbfaf7, roughness: .5 }),
  pedra: new THREE.MeshPhysicalMaterial({ color: 0xe9e4da, roughness: .2, clearcoat: .8 }),
  espelho: new THREE.MeshStandardMaterial({ color: 0xdde6ec, metalness: .35, roughness: .08, emissive: 0x9aa8b4, emissiveIntensity: .55 }),
  escuro: new THREE.MeshStandardMaterial({ color: 0x17161a, roughness: .6 }),
};
const mPiso = (rep = 6) => { const t = texMarmore(); t.repeat.set(rep, rep); return new THREE.MeshPhysicalMaterial({ map: t, roughness: .14, clearcoat: .8, clearcoatRoughness: .07 }); };
const mLavado = (() => {
  const t = cv(8, 256, (x) => { const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,226,180,.85)'); g.addColorStop(.25, 'rgba(255,232,196,.35)'); g.addColorStop(1, 'rgba(255,240,215,0)'); x.fillStyle = g; x.fillRect(0, 0, 8, 256); });
  return new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
})();

// texto com a tipografia da marca (redesenha quando a fonte termina de carregar)
function textoTex(txt, { fonte = 'Bodoni Moda', peso = 400, px = 220, cor = '#1a1814', ls = .3, w = 2048, h = 400, brilho = null } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const desenha = () => {
    x.clearRect(0, 0, w, h); x.font = `${peso} ${px}px "${fonte}", Didot, "Times New Roman", serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.letterSpacing = `${Math.round(px * ls)}px`;
    if (brilho) { x.shadowColor = brilho; x.shadowBlur = px * .25; x.fillStyle = cor; x.fillText(txt, w / 2, h / 2); x.shadowBlur = 0; }
    x.fillStyle = cor; x.fillText(txt, w / 2, h / 2); t.needsUpdate = true;
  };
  desenha(); document.fonts && document.fonts.load(`${peso} ${px}px "${fonte}"`).then(desenha).catch(() => {});
  return t;
}

/* ---------------- peças reais (cabide) e manequins ---------------- */
const _gl = new GLTFLoader(), _cache = new Map();
const urlPeca = id => { const r = CATALOGO_ROUPAS.find(x => x.id === id); return r && r.glb ? new URL('../../shared/personagem/modelos/' + r.glb, import.meta.url).href : null; };
const cargaPeca = id => { const u = urlPeca(id); if (!u) return Promise.resolve(null); if (!_cache.has(u)) _cache.set(u, _gl.loadAsync(u).then(g => g.scene)); return _cache.get(u); };

export function montaLeFerri(scene, mundo) {
  const CLIC = mundo.clicaveis;
  const G = new THREE.Group(); G.position.set(OX, 0, 0); scene.add(G);
  const add = (o) => { G.add(o); return o; };
  const box = (w, h, d, m, x, y, z, ry = 0) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.rotation.y = ry; me.receiveShadow = true; return add(me); };
  const cil = (rt, rb, h, m, x, y, z, seg = 32) => { const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); me.position.set(x, y, z); return add(me); };
  const col = (x0, x1, z0, z1, lv = 0) => mundo.obst.push({ t: 'o', cx: OX + (x0 + x1) / 2, cz: (z0 + z1) / 2, a: 0, hx: Math.abs(x1 - x0) / 2, hz: Math.abs(z1 - z0) / 2, lv });
  const circ = (x, z, r, lv = 0) => mundo.obst.push({ t: 'c', x: OX + x, z, r, lv });
  const tarefasAtivar = [];                                // personagens e peças: só carregam quando a pessoa entra no mundo
  const atualizaveis = [];

  /* ---- paredes com aberturas em arco (eixo 'x' = corre em x num z fixo; 'z' = corre em z num x fixo) + sanca de luz ---- */
  const sanca = (eixo, fixo, a, b, alt, lados) => {
    const L = b - a, c = (a + b) / 2;
    for (const f of lados) {
      const off = f * .17, pl = new THREE.Mesh(new THREE.PlaneGeometry(L, 1.8), mLavado), st = new THREE.Mesh(new THREE.BoxGeometry(L, .05, .05), M.led);
      if (eixo === 'x') { pl.position.set(c, alt - .92, fixo + off); pl.rotation.y = f > 0 ? 0 : Math.PI; st.position.set(c, alt - .05, fixo + off * 1.2); }
      else { pl.position.set(fixo + off, alt - .92, c); pl.rotation.y = f > 0 ? Math.PI / 2 : -Math.PI / 2; st.rotation.y = Math.PI / 2; st.position.set(fixo + off * 1.2, alt - .05, c); }
      add(pl); add(st);
    }
  };
  const muro = (eixo, fixo, a, b, h, { aberturas = [], mat = M.parede, lados = [-1, 1], sem = false } = {}) => {
    const T = .3; let cur = a;
    const peca = (p, q) => { if (q - p < .05) return; const c = (p + q) / 2, L = q - p; if (eixo === 'x') { box(L, h, T, mat, c, h / 2, fixo); col(p, q, fixo - .15, fixo + .15); } else { box(T, h, L, mat, fixo, h / 2, c); col(fixo - .15, fixo + .15, p, q); } };
    for (const [p, q, alt = 3.8] of [...aberturas].sort((u, v) => u[0] - v[0])) {
      peca(cur, p); cur = q;
      const r = Math.min((q - p) / 2, alt * .6), cx = (p + q) / 2, yb = alt - r;
      const sh = new THREE.Shape(); sh.moveTo(p, yb); sh.absarc(cx, yb, r, Math.PI, 0, true); sh.lineTo(q, h); sh.lineTo(p, h); sh.closePath();
      const geo = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false, curveSegments: 32 }); geo.translate(0, 0, -T / 2);
      const me = new THREE.Mesh(geo, mat); const arc = new THREE.Mesh(new THREE.TorusGeometry(r - .05, .026, 6, 40, Math.PI), M.led);
      if (eixo === 'x') { me.position.set(0, 0, fixo); arc.position.set(cx, yb, fixo - .17); }
      else { me.rotation.y = -Math.PI / 2; me.position.set(fixo, 0, 0); arc.rotation.y = -Math.PI / 2; arc.position.set(fixo + .17, yb, cx); }
      add(me); add(arc);
      if (eixo === 'x') box(q - p, .04, .1, M.champ, cx, .02, fixo); else box(.1, .04, q - p, M.champ, fixo, .02, cx);   // soleira champanhe
    }
    peca(cur, b);
    if (!sem) sanca(eixo, fixo, a, b, h, lados);
  };
  const piso = (x0, x1, z0, z1, m) => { const p = box(x1 - x0, .02, z1 - z0, m, (x0 + x1) / 2, .01, (z0 + z1) / 2); p.userData.chao = true; return p; };
  const spots = [];
  const teto = (x0, x1, z0, z1, h, { m = M.teto, linha = 'z', passo = 3 } = {}) => {
    box(x1 - x0, .2, z1 - z0, m, (x0 + x1) / 2, h + .1, (z0 + z1) / 2);
    // uma só linha de luz contínua + spots embutidos
    if (linha === 'z') box(.07, .03, z1 - z0 - 1.2, M.luz, (x0 + x1) / 2, h - .015, (z0 + z1) / 2);
    else if (linha === 'x') box(x1 - x0 - 1.2, .03, .07, M.luz, (x0 + x1) / 2, h - .015, (z0 + z1) / 2);
    for (let x = x0 + passo / 2; x < x1; x += passo) for (let z = z0 + passo / 2; z < z1; z += passo) spots.push([x, h - .005, z]);
  };
  const quina = (x, z, h, r = .55) => cil(r, r, h, M.parede, x, h / 2, z, 24);      // arredonda os cantos (sem cantos retos)

  /* ---- CASCA ORGÂNICA (fiel aos mockups): parede curva sem cantos que sobe e vira teto numa sanca curva; portas recortadas.
         Fica um pouco pra dentro das paredes estruturais (que guardam as colisões e os arcos). ---- */
  const mCasca = new THREE.MeshStandardMaterial({ color: 0xf8f5f0, roughness: .78, side: THREE.DoubleSide });
  const casca = (x0, x1, z0, z1, h, { r = 3, rc = 1.1, off = .3, ab = 4.7, aberturas = [], laco = 2.6 } = {}) => {
    const a0 = x0 + off, a1 = x1 - off, b0 = z0 + off, b1 = z1 - off, R = Math.min(r, (a1 - a0) / 2 - .1, (b1 - b0) / 2 - .1);
    // caminho: retângulo arredondado (anti-horário visto de cima), pontos com normal pra dentro + lado
    const pts = [];
    const reta = (xa, za, xb, zb, nx, nz, lado) => { const L = Math.hypot(xb - xa, zb - za), n = Math.max(2, Math.ceil(L / .5)); for (let i = 0; i < n; i++) { const t = i / n; pts.push({ x: xa + (xb - xa) * t, z: za + (zb - za) * t, nx, nz, lado }); } };
    const arco = (cx, cz, aIni) => { for (let i = 0; i < 10; i++) { const a = aIni + (Math.PI / 2) * i / 10; pts.push({ x: cx + Math.cos(a) * R, z: cz + Math.sin(a) * R, nx: -Math.cos(a), nz: -Math.sin(a), lado: 'c' }); } };
    reta(a0 + R, b0, a1 - R, b0, 0, 1, 'S'); arco(a1 - R, b0 + R, -Math.PI / 2);
    reta(a1, b0 + R, a1, b1 - R, -1, 0, 'E'); arco(a1 - R, b1 - R, 0);
    reta(a1 - R, b1, a0 + R, b1, 0, -1, 'N'); arco(a0 + R, b1 - R, Math.PI / 2);
    reta(a0, b1 - R, a0, b0 + R, 1, 0, 'W'); arco(a0 + R, b0 + R, Math.PI);
    const naPorta = p => aberturas.some(([lado, a, b]) => p.lado === lado && ((lado === 'S' || lado === 'N') ? (p.x > a - .05 && p.x < b + .05) : (p.z > a - .05 && p.z < b + .05)));
    // varre um perfil [(recuo, y)] ao longo de uma lista de pontos
    const varre = (lista, perfil, fecha) => {
      const pos = [], idx = [], N = lista.length, Mp = perfil.length;
      lista.forEach(p => perfil.forEach(([d, y]) => pos.push(p.x + p.nx * d, y, p.z + p.nz * d)));
      const segs = fecha ? N : N - 1;
      for (let i = 0; i < segs; i++) { const j = (i + 1) % N; for (let k = 0; k < Mp - 1; k++) { const a = i * Mp + k, b = j * Mp + k; idx.push(a, b, a + 1, a + 1, b, b + 1); } }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      const me = new THREE.Mesh(g, mCasca); me.receiveShadow = true; add(me); return me;
    };
    // parte de baixo (até a altura das portas), com os recortes
    let run = [];
    const fechaRun = () => { if (run.length > 1) varre(run, [[0, 0], [0, ab]], false); run = []; };
    const iniPorta = pts.findIndex(p => naPorta(p)); const ordem = iniPorta < 0 ? pts : pts.slice(iniPorta).concat(pts.slice(0, iniPorta));
    if (iniPorta < 0) varre(pts, [[0, 0], [0, ab]], true);
    else { for (const p of ordem) { if (naPorta(p)) fechaRun(); else run.push(p); } fechaRun(); }
    // parte de cima contínua + sanca curva virando teto
    const perfil = [[0, ab], [0, h - rc]]; for (let i = 1; i <= 8; i++) { const f = (Math.PI / 2) * i / 8; perfil.push([rc * (1 - Math.cos(f)), h - rc + rc * Math.sin(f)]); }
    varre(pts, perfil, true);
    // LED escondido na sanca + filete champanhe no rodapé
    const sanc = pts.map(p => new THREE.Vector3(p.x + p.nx * (rc + .05), h - .03, p.z + p.nz * (rc + .05)));
    add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sanc, true), 220, .025, 6, true), M.led));
    // a única linha de luz contínua do teto: um laço que acompanha a forma da sala
    if (laco) { const lp = pts.map(p => new THREE.Vector3(p.x + p.nx * (rc + laco), h - .02, p.z + p.nz * (rc + laco))); add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lp, true), 260, .03, 6, true), M.luz)); }
    // colisão nos cantos curvos (não deixa entrar atrás da casca)
    pts.filter(p => p.lado === 'c').forEach((p, i) => { if (i % 3 === 0) circ(p.x - p.nx * .35, p.z - p.nz * .35, .45); });
  };

  /* ---- objetos da marca ---- */
  const HALO = cv(256, 128, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,228,190,.9)'); g.addColorStop(1, 'rgba(255,228,190,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const logo = (txt, x, y, z, ry, w = 6, cor = '#1c1a17', brilho = 'rgba(255,215,160,.9)', fonte = 'Bodoni Moda', alto = .18) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, w * alto), new THREE.MeshBasicMaterial({ map: textoTex(txt, { cor, brilho, fonte, px: fonte === 'Jost' ? 150 : 220, peso: fonte === 'Jost' ? 300 : 400, ls: fonte === 'Jost' ? .35 : .32 }), transparent: true, depthWrite: false }));
    p.position.set(x, y, z); p.rotation.y = ry; add(p);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.25, w * alto * 2.6), new THREE.MeshBasicMaterial({ map: HALO, transparent: true, opacity: .28, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })); halo.position.copy(p.position); halo.rotation.y = ry; halo.translateZ(-.01); add(halo);
    return p;
  };
  const loaderI = new THREE.TextureLoader();
  const cartaz = (x, y, z, ry, foto, w = 1.6, h = 2.2) => {
    const t = loaderI.load(new URL(`../assets/${foto}`, import.meta.url).href); t.colorSpace = THREE.SRGBColorSpace;
    const u = new THREE.Group(); u.position.set(x, y, z); u.rotation.y = ry; add(u);
    const mo = new THREE.Mesh(new THREE.BoxGeometry(w + .1, h + .1, .06), M.champ); mo.position.z = .03; u.add(mo);
    const im = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); im.position.z = .065; u.add(im);
    return u;
  };
  // tela com vídeo (desenhado num canvas), moldura de aço champanhe; curva opcional
  const tela = (x, y, z, ry, w, h, video, { curva = 0, fundo = '#111', sala = null } = {}) => {
    const c = document.createElement('canvas'); c.width = 1280; c.height = Math.round(1280 * h / w); const k = c.getContext('2d');
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    let geo;
    if (curva) { geo = new THREE.CylinderGeometry(curva, curva, h, 48, 1, true, Math.PI - w / curva / 2, w / curva); geo.scale(-1, 1, 1); }
    else geo = new THREE.PlaneGeometry(w, h);
    const me = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, toneMapped: false, side: THREE.DoubleSide }));
    const u = new THREE.Group(); u.position.set(x, y, z); u.rotation.y = ry; add(u);
    if (curva) me.position.z = curva; u.add(me);
    if (!curva) { const mo = new THREE.Mesh(new THREE.BoxGeometry(w + .14, h + .14, .05), M.champ); mo.position.z = -.03; u.add(mo); }
    const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none'; v.crossOrigin = 'anonymous'; v.src = new URL(`../assets/flow/${video}`, import.meta.url).href; v.onerror = () => { v._erro = true; };
    let ac = 0;
    atualizaveis.push((dt, perto) => {
      const naSala = !sala || (zonaAtual && zonaAtual.nome === sala);
      if (!perto || !naSala) { if (!v.paused) v.pause(); if (sala && !naSala && v.currentTime) { v.currentTime = 0; k.fillStyle = fundo; k.fillRect(0, 0, c.width, c.height); t.needsUpdate = true; } return; }
      ac += dt; if (ac < 1 / 20) return; ac = 0;
      k.fillStyle = fundo; k.fillRect(0, 0, c.width, c.height);
      if (!v._erro) { if (v.paused) v.play().catch(() => {}); if (v.readyState >= 2) { const e = Math.max(c.width / v.videoWidth, c.height / v.videoHeight), ww = v.videoWidth * e, hh = v.videoHeight * e; k.drawImage(v, (c.width - ww) / 2, (c.height - hh) / 2, ww, hh); } }
      t.needsUpdate = true;
    });
    return u;
  };
  const setor = (r0, r1, a0, a1, alt, y, m = M.boucle) => {
    const sh = new THREE.Shape(); sh.absarc(0, 0, r1, a0, a1, false); sh.absarc(0, 0, r0, a1, a0, true); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: alt, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 3, curveSegments: 36 }); geo.rotateX(-Math.PI / 2);
    const me = new THREE.Mesh(geo, m); me.position.y = y; me.castShadow = true; return me;
  };
  // sofá curvo em C: abre pra direção `abre` (ângulo no plano x,z; 0 = +x)
  const sofa = (x, z, abre, A = 1.8, R = 1.0, y = 0, lv = 0) => {
    const u = new THREE.Group(); u.position.set(x, y, z); add(u); const ctr = abre + Math.PI, a0 = -(ctr) - A / 2, a1 = -(ctr) + A / 2;
    u.add(setor(R + .1, R + .85, a0, a1, .2, .12)); u.add(setor(R + .15, R + .8, a0, a1, .16, .36)); u.add(setor(R + .7, R + 1.15, a0 - .08, a1 + .08, .62, .34));
    for (const a of [-.7, 0, .7]) circ(x + Math.cos(ctr + a) * (R + .6), z + Math.sin(ctr + a) * (R + .6), .65, lv);
  };
  const mesaRedonda = (x, z, r = .45, h = .48, m = M.pedra) => { cil(r, r, .04, m, x, h, z, 40); cil(.07, .2, h, M.branco, x, h / 2, z, 20); circ(x, z, r + .1); };
  const poltrona = (x, z, ry) => {
    const u = new THREE.Group(); u.position.set(x, 0, z); u.rotation.y = ry; add(u);
    const a = new THREE.Mesh(new THREE.CylinderGeometry(.42, .38, .34, 32), M.boucle); a.position.y = .27; u.add(a);
    const tp = new THREE.Mesh(new THREE.TorusGeometry(.38, .09, 10, 32), M.boucle); tp.rotation.x = Math.PI / 2; tp.position.y = .46; u.add(tp);
    const en = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .62, 32, 1, false, Math.PI * .5, Math.PI), M.boucle); en.position.y = .56; u.add(en);
    circ(x, z, .5);
  };
  const pufe = (x, z, r = .45) => { cil(r, r * .94, .42, M.boucle, x, .21, z, 32); const tp = new THREE.Mesh(new THREE.TorusGeometry(r * .92, .08, 10, 32), M.boucle); tp.rotation.x = Math.PI / 2; tp.position.set(x, .43, z); add(tp); circ(x, z, r + .1); };
  const bolsa = (cor, esc = 1, tipo = 0) => {
    const b = new THREE.Group(), m = new THREE.MeshPhysicalMaterial({ color: cor, roughness: .38, clearcoat: .4 });
    if (tipo === 1) { const c = new THREE.Mesh(new THREE.CapsuleGeometry(.1, .2, 6, 16), m); c.rotation.z = Math.PI / 2; c.scale.set(1, 1, .75); c.position.y = .11; b.add(c); const al = new THREE.Mesh(new THREE.TorusGeometry(.09, .011, 6, 24, Math.PI), m); al.position.y = .2; b.add(al); }
    else { const c = new THREE.Mesh(new THREE.BoxGeometry(.34, .22, .14), m); c.position.y = .11; b.add(c); const t = new THREE.Mesh(new THREE.BoxGeometry(.35, .06, .15), m); t.position.y = .235; b.add(t); const al = new THREE.Mesh(new THREE.TorusGeometry(.085, .01, 6, 20, Math.PI), M.champ); al.position.y = .27; b.add(al); }
    b.scale.setScalar(esc); return b;
  };
  const sapato = cor => { const sh = new THREE.Group(), m = new THREE.MeshPhysicalMaterial({ color: cor, roughness: .35, clearcoat: .6 }); const pl = new THREE.Mesh(new THREE.BoxGeometry(.075, .012, .24), m); pl.position.y = .085; pl.rotation.x = -.32; sh.add(pl); const sa = new THREE.Mesh(new THREE.CylinderGeometry(.006, .012, .14, 8), m); sa.position.set(0, .07, -.1); sh.add(sa); const bi = new THREE.Mesh(new THREE.BoxGeometry(.07, .05, .1), m); bi.position.set(0, .03, .09); sh.add(bi); return sh; };
  const CORES = [0x0e0e10, 0xbfa88a, 0x9b968d, 0xefe9de, 0x2b2b30, 0xd8c8a6];
  // prateleiras de parede com LED embaixo de cada nível (rotY: frente da prateleira)
  const prateleiras = (x, z, ry, w, niveis = 4, itens = 'bolsas') => {
    const u = new THREE.Group(); u.position.set(x, 0, z); u.rotation.y = ry; add(u);
    const bk = new THREE.Mesh(new THREE.BoxGeometry(w + .3, 3.2, .06), M.branco); bk.position.set(0, 1.9, .03); u.add(bk);
    for (let n = 0; n < niveis; n++) {
      const y = .7 + n * .72;
      const v = new THREE.Mesh(new THREE.BoxGeometry(w, .025, .38), M.vidro); v.position.set(0, y, .22); u.add(v);
      const ar = new THREE.Mesh(new THREE.BoxGeometry(w, .03, .015), M.champ); ar.position.set(0, y, .41); u.add(ar);
      const led = new THREE.Mesh(new THREE.BoxGeometry(w - .1, .015, .03), M.luz); led.position.set(0, y - .03, .3); u.add(led);
      const q = Math.max(2, Math.floor(w / .6));
      for (let k = 0; k < q; k++) { const px = -w / 2 + .3 + (w - .6) * k / (q - 1); const it = itens === 'sapatos' ? sapato(CORES[(k + n) % 6]) : bolsa(CORES[(k * 2 + n) % 6], .9 + (k % 2) * .12, (k + n) % 3 === 2 ? 1 : 0); it.position.set(px, y + .012, .22); it.rotation.y = itens === 'sapatos' ? .5 : .12 * (k % 2 ? -1 : 1); u.add(it); }
    }
    return u;
  };
  const espelho = (x, z, ry, w = .9, h = 3) => { const u = new THREE.Group(); u.position.set(x, 0, z); u.rotation.y = ry; add(u); const f = new THREE.Mesh(new THREE.BoxGeometry(w + .08, h + .08, .04), M.champ); f.position.y = h / 2 + .05; u.add(f); const e = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.espelho); e.position.set(0, h / 2 + .05, .025); u.add(e); const gl = new THREE.Mesh(new THREE.PlaneGeometry(w + .5, h + .5), new THREE.MeshBasicMaterial({ color: 0xfff1dc, transparent: true, opacity: .16, depthWrite: false, toneMapped: false })); gl.position.set(0, h / 2 + .05, -.005); u.add(gl); return u; };
  // peça real pendurada (cabide de aço) — carrega quando ativar
  const cabide = (larg) => { const g = new THREE.Group(); const ga = new THREE.Mesh(new THREE.TorusGeometry(.035, .005, 6, 16, Math.PI * 1.4), M.champ); ga.position.y = .095; g.add(ga); const om = new THREE.Mesh(new THREE.CapsuleGeometry(.006, Math.min(.46, Math.max(.26, larg * .85)), 4, 8), M.champ); om.rotation.z = Math.PI / 2; om.position.y = .025; g.add(om); return g; };
  const pendura = (id, x, y, z, ry) => tarefasAtivar.push(async () => {
    const base = await cargaPeca(id); if (!base) return;
    const p = SkeletonUtils.clone(base); p.traverse(o => { if (o.isMesh) { o.frustumCulled = false; o.castShadow = true; if (o.material) o.material.side = THREE.DoubleSide; } });
    p.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(p); const un = new THREE.Group(); un.add(cabide(bb.max.x - bb.min.x));
    p.position.set(-(bb.min.x + bb.max.x) / 2, -bb.max.y - .02, -(bb.min.z + bb.max.z) / 2); un.add(p); un.position.set(x, y, z); un.rotation.y = ry; add(un);
    un.userData.clic = { tipo: 'peca', id }; CLIC.push(un);
  });
  const arara = (x, z, ry, L, ids) => {   // arara de aço fina, solta no piso
    const u = new THREE.Group(); u.position.set(x, 0, z); u.rotation.y = ry; add(u);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 1.95, 8), M.champ); p.position.set(s * L / 2, .975, 0); u.add(p); const b = new THREE.Mesh(new THREE.BoxGeometry(.03, .02, .5), M.champ); b.position.set(s * L / 2, .01, 0); u.add(b); }
    const t = new THREE.Mesh(new THREE.CylinderGeometry(.013, .013, L, 8), M.champ); t.rotation.z = Math.PI / 2; t.position.y = 1.95; u.add(t);
    const c = Math.cos(ry), s = Math.sin(ry);
    ids.forEach((id, i) => { const lx = -L / 2 + .3 + (L - .6) * (ids.length === 1 ? .5 : i / (ids.length - 1)); pendura(id, x + lx * c, 1.95, z - lx * s, ry); });
    col(x - Math.abs(c) * L / 2 - .25, x + Math.abs(c) * L / 2 + .25, z - Math.abs(s) * L / 2 - .25, z + Math.abs(s) * L / 2 + .25);
  };
  const manequins = [];
  const manequim = (x, z, ry, cfg, nome, y = 0) => tarefasAtivar.push(async () => {
    const p = await Personagem.cria({ ...cfg, roupas: { ...cfg.roupas, casaco: cfg.roupas.casaco || 'nenhum' } });
    try { p.toca('parado'); p.atualiza(.5 + Math.random(), 0); } catch (e) {}
    p.grupo.position.set(x, y, z); p.grupo.rotation.y = ry; p.grupo.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } }); add(p.grupo);
    p.grupo.userData.clic = { tipo: 'look', roupas: { ...cfg.roupas }, nome }; CLIC.push(p.grupo); manequins.push(p);
    return p;
  });
  const plataforma = (x, z, w = 1.2) => { box(w, .3, w, M.preto, x, .15, z); box(w + .02, .02, w + .02, M.luz, x, .005, z); col(x - w / 2, x + w / 2, z - w / 2, z + w / 2); };

  const LOOKS = {
    japi: { corpo: 'fem', roupas: { camisa: 'japi-jaqueta', calca: 'japi-calca', calcado: 'bota-v' } },
    noite: { corpo: 'fem', roupas: { camisa: 'top-freecrop', calca: 'saia-studs', calcado: 'bota-v' } },
    dia: { corpo: 'fem', roupas: { camisa: 'atelie-camiseta', calca: 'atelie-calca', calcado: 'bota-v' } },
    preto: { corpo: 'fem', roupas: { camisa: 'tee-ceramica', calca: 'calca-vacuo', calcado: 'bota-v' } },
    saia: { corpo: 'fem', roupas: { camisa: 'atelie-jaqueta', calca: 'atelie-saia', calcado: 'bota-v' } },
    trumpet: { corpo: 'fem', roupas: { camisa: 'top-crop04', calca: 'saia-trumpet', calcado: 'bota-v' } },
    homem: { corpo: 'masc', roupas: { camisa: 'camiseta-preta', calca: 'calca-preta', calcado: 'tenis-preto' } },
    homem2: { corpo: 'masc', roupas: { camisa: 'camiseta-branca', calca: 'jeans-escuro', calcado: 'tenis-branco', casaco: 'jaqueta-vacuo' } },
  };
  const ZONAS = [];
  const zona = (nome, x0, x1, z0, z1, luzes) => ZONAS.push({ nome, x0, x1, z0, z1, luzes });
  const mBranco = mPiso(6);

  /* ===================================== 1. LOJA — PRAÇA CENTRAL ===================================== */
  {
    const H = 9;
    piso(-16, 16, 0, 34, mPiso(5)); teto(-16, 16, 0, 34, H, { linha: 'none' });
    casca(-16, 16, 0, 34, H, { r: 3.6, rc: 1.4, ab: 5.3, laco: 3.4, aberturas: [['S', -3.2, 3.2], ['W', 8, 14], ['W', 23, 29], ['E', 8, 14], ['E', 23, 29], ['N', -3, 3]] });
    muro('x', 0, -16, 16, H, { aberturas: [[-3.2, 3.2, 5.2]], lados: [1] });                        // frente: portal aberto (volta pro shopping)
    muro('z', -16, 0, 34, H, { aberturas: [[8, 14, 4.4], [23, 29, 4.4]], lados: [1, -1] });         // esquerda: galeria e provadores
    muro('z', 16, 0, 34, H, { aberturas: [[8, 14, 4.4], [23, 29, 4.4]], lados: [-1, 1] });          // direita: lounge/café e VIP
    muro('x', 34, -16, 16, H, { aberturas: [[-3, 3, 4.6]], lados: [-1] });                           // fundo: ativações
        // nome da marca, uma vez, na parede do fundo, sobre o caixa
    logo('LE FERRI', 0, 6.2, 33.6, Math.PI, 7.5);
    // expositor central: coluna de vidro iluminada por dentro + círculo de pedra no piso + uma peça em destaque
    { const c = new THREE.Mesh(new THREE.CircleGeometry(2.4, 64), M.pedra); c.rotation.x = -Math.PI / 2; c.position.set(0, .025, 13); add(c); const ar = new THREE.Mesh(new THREE.RingGeometry(2.38, 2.45, 64), M.champ); ar.rotation.x = -Math.PI / 2; ar.position.set(0, .03, 13); add(ar);
      box(1.1, .35, 1.1, M.pedra, 0, .175, 13); box(1.0, 3.6, 1.0, M.vidro, 0, 2.15, 13); for (const dx of [-.5, .5]) for (const dz of [-.5, .5]) box(.03, 3.6, .03, M.champ, dx, 2.15, 13 + dz);
      box(.9, .03, .9, M.luz, 0, 3.92, 13); const b = bolsa(0x0e0e10, 1.4, 1); b.position.set(0, .36, 13); add(b); atualizaveis.push(dt => { b.rotation.y += dt * .5; }); circ(0, 13, 1.0); }
    // mesa de exposição branca (tampo fosco, sem vidro) + sofá curvo bouclé e mesa de apoio
    { box(2.4, .78, 1.1, M.branco, -6.5, .39, 21.5); for (let k = 0; k < 5; k++) box(.36, .07 + (k % 2) * .05, .3, new THREE.MeshStandardMaterial({ color: [0x0e0e10, 0xefe9de, 0x9b968d, 0x2b2b30, 0xd8c8a6][k], roughness: .85 }), -7.4 + k * .45, .82 + (k % 2) * .02, 21.5); col(-7.8, -5.2, 20.9, 22.1);
      sofa(6.8, 21.5, Math.PI); mesaRedonda(6.8, 21.5, .42); }
    // caixa: balcão curvo de pedra branca, terminais minimalistas, sacolas sem logotipo
    { const R = 3.6, me = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1.05, 64, 1, false, Math.PI * .72, Math.PI * .56), M.pedra); me.position.set(0, .525, 32.6); add(me);
      const tp = new THREE.Mesh(new THREE.CylinderGeometry(R + .12, R + .12, .06, 64, 1, false, Math.PI * .72, Math.PI * .56), M.champ); tp.position.set(0, 1.08, 32.6); add(tp);
      for (const dx of [-1.2, 1.2]) { const t = box(.3, .02, .22, M.preto, dx, 1.13, 29.2); t.rotation.x = .3; }
      for (let i = 0; i < 3; i++) { box(.32, .38, .14, new THREE.MeshStandardMaterial({ color: i === 1 ? 0x0e0e10 : 0xf1ece2, roughness: .8 }), -2.4 + i * .4, 1.3, 29.4); }
      for (const a of [-1, 0, 1]) circ(a * 2.2, 29.6 + Math.abs(a) * .8, 1.2); }
    // ala de roupas (esquerda): araras finas com peças reais + prateleiras com malhas + espelhos de piso a teto
    arara(-11.5, 5, Math.PI / 2, 3.2, ['japi-jaqueta', 'atelie-jaqueta', 'atelie-camiseta', 'top-freecrop']);
    arara(-11.5, 18.5, Math.PI / 2, 3.2, ['japi-calca', 'atelie-calca', 'atelie-saia', 'saia-trumpet']);
    for (const [z0, z1] of [[4.2, 7.6], [14.6, 22.4]]) { const zc = (z0 + z1) / 2; for (let n = 0; n < 3; n++) { box(.4, .03, z1 - z0 - .4, M.champ, -15.42, .9 + n * .7, zc); box(.03, .015, z1 - z0 - .6, M.luz, -15.55, .87 + n * .7, zc); for (let k = 0; k < 5; k++) box(.32, .08, .4, new THREE.MeshStandardMaterial({ color: CORES[(k + n) % 6], roughness: .9 }), -15.42, .96 + n * .7, z0 + .5 + k * (z1 - z0 - 1) / 4); } }
    espelho(-15.62, 10.9, Math.PI / 2, .0001, .0001);
    // ala de bolsas e acessórios + calçados (direita): prateleiras iluminadas, pedestais de mármore (uma bolsa em cada), balcão de vidro
    prateleiras(15.6, 5.9, -Math.PI / 2, 3.4, 4, 'sapatos'); col(15.0, 16, 4.1, 7.7);
    prateleiras(15.6, 18.5, -Math.PI / 2, 6.6, 4, 'bolsas'); col(15.0, 16, 15, 22);
        [[11.5, 17], [11.5, 20.5], [11.5, 26]].forEach(([x, z], i) => { box(.7, .9, .7, M.pedra, x, .45, z); const b = bolsa(CORES[i * 2], 1.1, i % 2); b.position.set(x, .9, z); add(b); circ(x, z, .55); });
    { box(2.2, .9, .7, M.branco, 12.5, .45, 9.6); box(2.1, .3, .62, M.vidro, 12.5, 1.05, 9.6); for (let k = 0; k < 4; k++) { const b = bolsa(CORES[k], .55); b.position.set(11.8 + k * .45, .9, 9.6); add(b); } col(11.3, 13.7, 9.2, 10); }
    pufe(9.8, 4.5); pufe(9.8, 6.5);
    zona('Loja · Praça', -16, 16, 0, 34, [[0, 7, 6, 0xfff4e6, 40, 22], [0, 7, 20, 0xfff4e6, 40, 22], [-11, 5, 12, 0xfff1dc, 22, 14], [11, 5, 12, 0xfff1dc, 22, 14], [0, 5, 30, 0xfff1dc, 24, 12], [0, 4.5, 13, 0xfff6e8, 10, 6]]);
  }

  /* ===================================== 2. GALERIA DE MANEQUINS ===================================== */
  {
    const H = 6; piso(-36, -16, 2, 17, mBranco); teto(-36, -16, 2, 17, H, { linha: 'none' });
    casca(-36, -16, 2, 17, H, { r: 2.4, rc: .9, ab: 4.6, laco: 2.2, aberturas: [['E', 8, 14]] });
    muro('z', -36, 2, 17, H, { lados: [1] }); muro('x', 2, -36, -16, H, { lados: [1] }); muro('x', 17, -36, -16, H, { lados: [-1] });
    tela(-35.55, 2.5, 9.5, Math.PI / 2, 7.4, 3.2, 'leferri-campanha.mp4');
    logo('LE FERRI', -35.6, 4.75, 9.5, Math.PI / 2, 3.4);
    const pos = [[-30, 5.2], [-30, 9.5], [-30, 13.8], [-23.5, 5.2], [-23.5, 13.8]], looks = ['japi', 'noite', 'dia', 'saia', 'trumpet'];
    pos.forEach(([x, z], i) => { plataforma(x, z, 1.3); manequim(x, z, Math.PI / 2 * (x < -26 ? 1 : 1) + (i % 2 ? .3 : -.3), LOOKS[looks[i]], 'Look ' + ['JAPI', 'Noite', 'Dia', 'Ateliê saia', 'Trumpet'][i], .3); });
    zona('Galeria de manequins', -36, -16, 2, 17, [[-26, 4.5, 9.5, 0xfff6ec, 34, 16], [-31, 4, 5, 0xffffff, 14, 8], [-31, 4, 14, 0xffffff, 14, 8]]);
  }

  /* ===================================== 3. PROVADORES + ESPELHO INTERATIVO ===================================== */
  const provadorPonto = { x: OX - 26, z: 30.2, olhaZ: 22 };
  {
    const H = 6; piso(-36, -16, 19, 34, mBranco); teto(-36, -16, 19, 34, H, { linha: 'none' });
    casca(-36, -16, 19, 34, H, { r: 2.4, rc: .9, ab: 4.6, laco: 2.4, aberturas: [['E', 23, 29]] });
    muro('z', -36, 19, 34, H, { lados: [1] }); muro('x', 19, -36, -16, H, { lados: [1] }); muro('x', 34, -36, -16, H, { lados: [-1] });
        // cabines na parede curva do fundo: arco de parede + portas champanhe
    const arcoPts = Array.from({ length: 25 }, (_, i) => { const t = i / 24, a = Math.PI * (.28 + .44 * t); return [-26 + Math.cos(a) * 9.5, 22 + Math.sin(a) * 11.2]; });
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * (.34 + .32 * i / 4), x = -26 + Math.cos(a) * 9.2, z = 22 + Math.sin(a) * 10.9;
      const u = new THREE.Group(); u.position.set(x, 0, z); u.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)); add(u);
      const mo = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.2, .3), M.parede); mo.position.y = 1.6; u.add(mo);
      const pt = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.8, .05), M.champFosco); pt.position.set(0, 1.45, .16); u.add(pt);
      const mao = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .5, 8), M.champ); mao.position.set(.4, 1.3, .2); u.add(mao);
      const l = new THREE.Mesh(new THREE.BoxGeometry(1.1, .03, .03), M.led); l.position.set(0, 3.0, .17); u.add(l);
      u.userData.clic = { tipo: 'provador' }; CLIC.push(u); circ(x, z, .8);
    }
    // parede curva atrás das cabines
    for (let i = 0; i < arcoPts.length - 1; i++) { const [xa, za] = arcoPts[i], [xb, zb] = arcoPts[i + 1]; const L = Math.hypot(xb - xa, zb - za), me = box(L + .02, H, .25, M.parede, (xa + xb) / 2, H / 2, (za + zb) / 2); me.rotation.y = -Math.atan2(zb - za, xb - xa); }
    espelho(-35.6, 22.8, Math.PI / 2, 1.1, 3.2); espelho(-16.4, 31, -Math.PI / 2, 1.1, 3.2);
    pufe(-26, 27.5, .5); pufe(-23.4, 26.6, .42); pufe(-28.6, 26.6, .42);
    zona('Provadores', -36, -16, 19, 34, [[-26, 4.5, 26, 0xfff2e2, 30, 14], [-26, 4, 31, 0xfff6ec, 12, 8]]);
  }

  /* ===================================== 4. LOUNGE + CAFÉ ===================================== */
  {
    const H = 6; piso(16, 36, 2, 17, mBranco); teto(16, 36, 2, 17, H, { linha: 'none' });
    casca(16, 36, 2, 17, H, { r: 1.4, rc: .9, ab: 4.6, laco: 2.4, aberturas: [['W', 8, 14]] });
    muro('z', 36, 2, 17, H, { lados: [-1] }); muro('x', 2, 16, 36, H, { lados: [1] }); muro('x', 17, 16, 36, H, { lados: [-1] });
        // lounge: sofá curvo sobre tapete claro + tela de campanha embutida + peça em destaque sob cúpula de vidro
    { const tp = new THREE.Mesh(new THREE.CircleGeometry(3.2, 48), new THREE.MeshStandardMaterial({ color: 0xece4d6, roughness: 1 })); tp.rotation.x = -Math.PI / 2; tp.position.set(23.5, .025, 12.5); add(tp);
      sofa(23.5, 13.4, -Math.PI / 2, 2.0, 1.1); mesaRedonda(23.5, 12.2, .45); poltrona(21.2, 9.8, Math.PI * .8); poltrona(25.8, 9.8, -Math.PI * .8);
      cartaz(23.5, 2.6, 16.6, Math.PI, 'leferri/camp0.jpg', 1.8, 2.4);
      box(.7, 1, .7, M.pedra, 18.2, .5, 15.6); const dm = new THREE.Mesh(new THREE.SphereGeometry(.34, 32, 16, 0, TAU, 0, Math.PI / 2), M.vidro); dm.position.set(18.2, 1.25, 15.6); add(dm); const cl = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .25, 32, 1, true), M.vidro); cl.position.set(18.2, 1.125, 15.6); add(cl); const b = bolsa(0xbfa88a, .9, 1); b.position.set(18.2, 1.0, 15.6); add(b); circ(18.2, 15.6, .6); }
    // café: balcão curvo de mármore com cafeteira e xícaras + mesas altas + telas de campanha luminosas
    { const R = 3.2, me = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1.05, 48, 1, false, -Math.PI * .5, Math.PI * .5), M.pedra); me.position.set(35.6, .525, 2.4); add(me);
      const tp = new THREE.Mesh(new THREE.CylinderGeometry(R + .1, R + .1, .06, 48, 1, false, -Math.PI * .5, Math.PI * .5), mBranco); tp.position.set(35.6, 1.08, 2.4); add(tp);
      const maq = box(.6, .45, .4, M.champ, 34.6, 1.34, 3.2); box(.5, .05, .3, M.preto, 34.6, 1.12, 3.5);
      for (let i = 0; i < 6; i++) { const xi = cil(.045, .035, .07, M.branco, 33.2 + (i % 3) * .3, 1.15, 4.4 + (i > 2 ? .3 : 0), 16); }
      col(32, 36, 2, 5.8);
      for (const [x, z] of [[28, 4.4], [30.6, 7.6], [27.4, 8.2]]) { cil(.36, .36, .04, M.pedra, x, 1.1, z, 32); cil(.1, .15, 1.1, M.branco, x, .55, z, 20); circ(x, z, .5); }
      cartaz(35.6, 3, 9.2, -Math.PI / 2, 'leferri/camp5.jpg', 1.6, 2.2); cartaz(35.6, 3, 12.9, -Math.PI / 2, 'leferri/camp2.jpg', 1.6, 2.2); }
    zona('Lounge e café', 16, 36, 2, 17, [[23, 4.5, 11, 0xfff1dc, 30, 14], [32, 4.5, 5, 0xffe8c8, 22, 10]]);
  }

  /* ===================================== 5. ÁREA VIP (luz champanhe própria) ===================================== */
  {
    const H = 6; piso(16, 36, 19, 34, (() => { const m = mPiso(4); m.color = new THREE.Color(0xf6efe2); return m; })()); teto(16, 36, 19, 34, H, { linha: 'none' });
    casca(16, 36, 19, 34, H, { r: 1.4, rc: .9, ab: 4.6, laco: 2.4, aberturas: [['W', 23, 29]] });
    muro('z', 36, 19, 34, H, { lados: [-1] }); muro('x', 19, 16, 36, H, { lados: [1] }); muro('x', 34, 16, 36, H, { lados: [-1] });
        logo('VIP', 30.5, 4.6, 33.6, Math.PI, 1.6, '#8f7a55', 'rgba(255,205,140,.95)');
    // fundo de ônix iluminado + bar curvo de mármore canelado
    { const on = cv(1024, 400, (x, w, h) => { const g = x.createRadialGradient(512, 160, 40, 512, 200, 620); g.addColorStop(0, '#fffaf0'); g.addColorStop(.6, '#fbf0dc'); g.addColorStop(1, '#f0dfbf'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.filter = 'blur(6px)'; for (let i = 0; i < 16; i++) { x.strokeStyle = `rgba(${215 + Math.random() * 30 | 0},${180 + Math.random() * 30 | 0},${130 + Math.random() * 30 | 0},${.08 + Math.random() * .12})`; x.lineWidth = 8 + Math.random() * 24; x.beginPath(); let y = Math.random() * h; x.moveTo(-20, y); for (let k = 1; k <= 9; k++) { y += (Math.random() - .5) * 22; x.lineTo(k * 128, y); } x.stroke(); } });
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.2), new THREE.MeshBasicMaterial({ map: on, toneMapped: false })); pl.position.set(35.6, 2.5, 26.5); pl.rotation.y = -Math.PI / 2; add(pl);
      box(.1, 3.4, 9.2, M.champ, 35.66, 2.5, 26.5);
      box(.35, .03, 8, M.vidro, 35.38, 2.1, 26.5); const cs = [0x3a2a1c, 0xc8a24a, 0x23402a, 0x5a1e22, 0xd8c08a];
      for (let i = 0; i < 12; i++) { const m = new THREE.MeshPhysicalMaterial({ color: cs[i % 5], roughness: .12, clearcoat: 1 }); cil(.05, .05, .24, m, 35.38, 2.25, 23 + i * .62, 14); cil(.016, .02, .12, m, 35.38, 2.43, 23 + i * .62, 10); }
      const R = 4.2, me = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1.08, 64, 1, false, -Math.PI * .5 - .55, 1.1), new THREE.MeshStandardMaterial({ color: 0xf1ece4, roughness: .4 })); me.position.set(36.5, .54, 26.5); add(me);
      for (let i = 0; i <= 40; i++) { const a = -Math.PI * .5 - .55 + 1.1 * i / 40, x = 36.5 + Math.sin(a) * (R + .02), z = 26.5 + Math.cos(a) * (R + .02); const r = box(.045, 1.0, .05, new THREE.MeshStandardMaterial({ color: 0xe6dfd2, roughness: .5 }), x, .5, z); r.rotation.y = a; }
      const tp = new THREE.Mesh(new THREE.CylinderGeometry(R + .14, R + .14, .07, 64, 1, false, -Math.PI * .5 - .55, 1.1), M.pedra); tp.position.set(36.5, 1.1, 26.5); add(tp);
      for (let i = 0; i < 4; i++) { const a = -Math.PI * .5 - .4 + .8 * i / 3, x = 36.5 + Math.sin(a) * (R + .75), z = 26.5 + Math.cos(a) * (R + .75); cil(.2, .2, .03, M.champ, x, .02, z, 20); cil(.025, .025, .72, M.champ, x, .38, z, 8); cil(.22, .2, .1, M.boucle, x, .76, z, 24); circ(x, z, .3); }
      col(32.2, 36, 24.2, 28.8); }
    // coluna de vidro com uma bolsa em holograma flutuando
    { box(1, .3, 1, M.pedra, 22, .15, 26.5); box(.9, 3.4, .9, M.vidro, 22, 2, 26.5); for (const dx of [-.45, .45]) for (const dz of [-.45, .45]) box(.03, 3.4, .03, M.champ, 22 + dx, 2, 26.5 + dz);
      const hol = new THREE.Group(); const mh = new THREE.MeshBasicMaterial({ color: 0xe8f6ff, wireframe: true, transparent: true, opacity: .75, toneMapped: false }); const c = new THREE.Mesh(new THREE.BoxGeometry(.5, .34, .22, 6, 4, 3), mh); hol.add(c); const al = new THREE.Mesh(new THREE.TorusGeometry(.14, .012, 6, 20, Math.PI), mh); al.position.y = .2; hol.add(al); hol.position.set(22, 2.1, 26.5); add(hol);
      const gl = new THREE.Mesh(new THREE.SphereGeometry(.45, 16, 12), new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: .12, depthWrite: false, toneMapped: false })); gl.position.copy(hol.position); add(gl);
      atualizaveis.push(dt => { hol.rotation.y += dt * .8; hol.position.y = 2.1 + Math.sin(performance.now() / 700) * .06; }); circ(22, 26.5, .8); }
    // nichos iluminados com peças em destaque + tela de campanha
    for (const [x, ry, zz] of [[16.48, Math.PI / 2, 21.6], [16.48, Math.PI / 2, 31.0]]) { const u = new THREE.Group(); u.position.set(x, 0, zz); u.rotation.y = ry; add(u); const fd = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2), new THREE.MeshBasicMaterial({ color: 0xfbeed6, toneMapped: false })); fd.position.set(0, 1.9, .01); u.add(fd); const fr = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.3, .25), M.parede); fr.position.set(0, 1.9, -.1); u.add(fr); const pr = new THREE.Mesh(new THREE.BoxGeometry(1.3, .03, .3), M.vidro); pr.position.set(0, 1.5, .15); u.add(pr); const b = bolsa(zz < 25 ? 0x0e0e10 : 0xbfa88a, 1.1, 0); b.position.set(0, 1.52, .15); u.add(b); }
    tela(25.5, 3.2, 33.6, Math.PI, 3.6, 2, 'leferri-campanha.mp4');
    sofa(26.5, 21.4, Math.PI / 2, 1.9, 1.0); mesaRedonda(26.5, 22.3, .38);
    zona('Área VIP', 16, 36, 19, 34, [[26, 4.4, 26.5, 0xffd9a0, 34, 14], [33, 3, 26.5, 0xffc77a, 18, 8], [22, 4, 26.5, 0xcfe8ff, 6, 5]]);
  }

  /* ===================================== 6. CORREDOR DAS ATIVAÇÕES ===================================== */
  {
    const H = 5.5; piso(-4, 4, 34, 40, mBranco); teto(-4, 4, 34, 40, H);
    muro('z', -4, 34.15, 40, H, { lados: [1] }); muro('z', 4, 34.15, 40, H, { lados: [-1] });
    piso(-34, 34, 40, 46, mBranco); teto(-34, 34, 40, 46, H, { linha: 'x' });
    muro('x', 40, -34, 34, H, { aberturas: [[-4, 4, 4.4]], lados: [1] });
    muro('x', 46, -34, 34, H, { aberturas: [[-21.5, -16.5, 4.2], [-2, 2, 3.6], [16.5, 21.5, 4.2]], lados: [-1] });
    muro('z', -34, 40, 46, H, { lados: [1] }); muro('z', 34, 40, 46, H, { lados: [-1] });
    cartaz(-10, 2.4, 40.18, 0, 'leferri/camp4.jpg', 1.5, 2); cartaz(10, 2.4, 40.18, 0, 'leferri/camp1.jpg', 1.5, 2);
    for (const [txt, x] of [['PASSARELA', -19], ['FOTO', 0], ['BALADA', 19]]) logo(txt, x, 4.85, 45.82, Math.PI, 2.2, '#6f6a62', null, 'Jost', .2);
    zona('Ativações', -34, 34, 34, 46, [[0, 4.5, 43, 0xfff4e6, 28, 18], [-19, 4.5, 43, 0xfff1dc, 18, 10], [19, 4.5, 43, 0xfff1dc, 18, 10]]);
  }

  /* ===================================== 7. PASSARELA ===================================== */
  const desfile = [], spotsDesfile = [], show = { on: false, t: 0 };
  {
    const H = 7; piso(-34, -4, 46, 66, mBranco); teto(-34, -4, 46, 66, H, { linha: 'none' });
    casca(-34, -4, 46, 66, H, { r: 3, rc: 1.1, ab: 4.5, laco: 0, aberturas: [['S', -21.5, -16.5], ['N', -21.5, -16.5]] });
    muro('z', -34, 46, 66, H, { lados: [1] }); muro('z', -4, 46, 66, H, { lados: [-1, 1] });
    muro('x', 66, -34, -4, H, { aberturas: [[-21.5, -16.5, 4.2]], lados: [-1] });
    logo('LE FERRI', -19, 5.5, 65.6, Math.PI, 5);
    const cx = -19; box(2.6, .3, 15, M.preto, cx, .15, 56.5); for (const sx of [-1, 1]) box(.05, .03, 15, M.luz, cx + sx * 1.31, .31, 56.5); box(2.66, .03, .05, M.luz, cx, .31, 49);
    for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { const z = 50 + i * 2.3; if (i % 2) pufe(cx + sx * 3.2, z, .42); else { box(1.5, .42, .55, M.boucle, cx + sx * 3.4, .21, z, Math.PI / 2); col(cx + sx * 3.4 - .4, cx + sx * 3.4 + .4, z - .8, z + .8); } }
    for (const dz of [52, 56.5, 61]) { const s = new THREE.SpotLight(0xfff6e8, 0, 9, .5, .5, 1.2); s.position.set(cx, H - .3, dz); s.target.position.set(cx, 0, dz); add(s); add(s.target); spotsDesfile.push(s); }
    tela(-27.5, 3.4, 65.55, Math.PI, 6.6, 3.2, 'leferri-campanha.mp4', { sala: 'Passarela' }); tela(-10.5, 3.4, 65.55, Math.PI, 6.6, 3.2, 'leferri-campanha.mp4', { sala: 'Passarela' });
    [LOOKS.japi, LOOKS.homem, LOOKS.trumpet, LOOKS.homem2, LOOKS.saia].forEach((cfg, i) => tarefasAtivar.push(async () => {
      const p = await Personagem.cria({ ...cfg, roupas: { ...cfg.roupas, casaco: cfg.roupas.casaco || 'nenhum' } }); p.grupo.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } }); p._sway = cfg.corpo === 'fem' ? 1 : .5; add(p.grupo);
      p.grupo.userData.clic = { tipo: 'look', roupas: { ...cfg.roupas }, nome: ['Look JAPI', 'Look Noir', 'Look Trumpet', 'Look Vácuo', 'Look Ateliê'][i] }; CLIC.push(p.grupo);
      p.grupo.visible = false; desfile.push({ p, i });
    }));
    zona('Passarela', -34, -4, 46, 66, [[-19, 6, 51, 0xfff6ec, 26, 14], [-19, 6, 61, 0xfff6ec, 26, 14]]);
  }

  /* ===================================== 8. PONTO DE FOTO ===================================== */
  {
    const H = 5.5; piso(-4, 4, 46, 56, mBranco); teto(-4, 4, 46, 56, H, { linha: 'none' });
    muro('x', 56, -4, 4, H, { lados: [-1] }); muro('z', 4, 46, 56, H, { lados: [-1, 1] });
    for (const [x, z] of [[-3.6, 55.6], [3.6, 55.6]]) quina(x, z, H, .9);
    const pd = cil(1.25, 1.3, .22, M.pedra, 0, .11, 52); const ar = new THREE.Mesh(new THREE.TorusGeometry(1.27, .02, 8, 64), M.luz); ar.rotation.x = Math.PI / 2; ar.position.set(0, .02, 52); add(ar);
    const anel = new THREE.Mesh(new THREE.TorusGeometry(1.5, .06, 10, 96), new THREE.MeshStandardMaterial({ color: 0xffe7c2, emissive: 0xffd9a0, emissiveIntensity: 2.2 })); anel.rotation.x = Math.PI / 2; anel.position.set(0, H - .05, 52); add(anel);
    logo('@LEFERRI', 0, 3.2, 55.82, Math.PI, 2.4, '#8f7a55', 'rgba(255,205,140,.7)', 'Jost', .2);
    zona('Ponto de foto', -4, 4, 46, 56, [[0, 5, 52, 0xffe6c0, 26, 9]]);
    mundo.pisos.push((wx, wz) => { const x = wx - OX; if (Math.hypot(x, wz - 52) < 1.25) return { y: .22, k: 'g' }; return null; });   // sobe no pódio
  }

  /* ===================================== 9. BALADA (pista de LED, DJ, parede de LED curva, camarote no mezanino, bar) ===================================== */
  const pistaCv = document.createElement('canvas'); pistaCv.width = pistaCv.height = 512; const pk = pistaCv.getContext('2d'); const pistaTex = new THREE.CanvasTexture(pistaCv); pistaTex.colorSpace = THREE.SRGBColorSpace;
  const dancarinos = [];
  {
    const H = 9.5, YC = 4.2;
    const mEsc = new THREE.MeshPhysicalMaterial({ color: 0x141317, roughness: .18, clearcoat: 1 });
    piso(4, 34, 46, 74, mEsc); teto(4, 34, 46, 74, H, { m: new THREE.MeshStandardMaterial({ color: 0x1a191d, roughness: .9 }), linha: 'none', passo: 4 });
    const mParedeB = new THREE.MeshStandardMaterial({ color: 0x232126, roughness: .7 });
    muro('z', 4, 56, 74, H, { mat: mParedeB, lados: [1] }); muro('z', 34, 46, 74, H, { mat: mParedeB, lados: [-1] }); muro('x', 74, 4, 34, H, { mat: mParedeB, lados: [-1] });
    // pista com piso de LED (anima)
    const pista = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ map: pistaTex, toneMapped: false })); pista.rotation.x = -Math.PI / 2; pista.position.set(16, .03, 59); add(pista); pista.userData.chao = true;
    box(12.2, .02, .08, M.champ, 16, .03, 53); box(12.2, .02, .08, M.champ, 16, .03, 65); box(.08, .02, 12.2, M.champ, 10, .03, 59); box(.08, .02, 12.2, M.champ, 22, .03, 59);
    // palco do DJ com a marca + parede de LED curva atrás
    box(9, .7, 3.2, M.preto, 16, .35, 71.6); box(9.05, .03, 3.25, M.luz, 16, .71, 71.6); col(11.5, 20.5, 70, 73.4);
    box(3.4, 1.1, .9, M.preto, 16, 1.25, 71.2); logo('LE FERRI', 16, 1.3, 70.73, Math.PI, 2.6, '#f3efe8', 'rgba(255,215,160,.7)');
    box(.5, .08, .35, M.champ, 15.2, 1.84, 71.2); box(.5, .08, .35, M.champ, 16.8, 1.84, 71.2);
    tela(16, 4.6, 73.4, Math.PI, 14, 5.2, 'video0.mp4', { curva: 7.4, sala: 'Balada' });
    // bar ao lado, com fundo iluminado
    { const fd = new THREE.Mesh(new THREE.PlaneGeometry(9, 3), new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false })); fd.position.set(4.18, 2.4, 59); fd.rotation.y = Math.PI / 2; add(fd);
      box(.4, .03, 8.6, M.vidro, 4.4, 2.0, 59); for (let i = 0; i < 12; i++) cil(.05, .05, .26, new THREE.MeshPhysicalMaterial({ color: [0x3a2a1c, 0xc8a24a, 0x23402a, 0xd8c08a][i % 4], roughness: .1, clearcoat: 1 }), 4.4, 2.16, 55 + i * .72, 12);
      box(1.1, 1.08, 8.4, M.preto, 6.6, .54, 59); box(1.3, .06, 8.6, M.pedra, 6.6, 1.1, 59); box(.04, .04, 8.4, M.led, 7.2, .1, 59); col(5.9, 7.3, 54.8, 63.2);
      for (let i = 0; i < 5; i++) { const z = 55.8 + i * 1.6; cil(.2, .2, .03, M.champ, 7.9, .02, z, 20); cil(.025, .025, .72, M.champ, 7.9, .38, z, 8); cil(.22, .2, .1, M.boucle, 7.9, .76, z, 24); circ(7.9, z, .28); } }
    // camarote VIP no mezanino (lado direito), com sacada de vidro e escada
    { const xa = 26.5, xb = 33.85, za = 55.5, zb = 73.8, x0 = 31.2, x1 = 33.8;
      box(xb - xa, .35, zb - za, M.preto, (xa + xb) / 2, YC - .175, (za + zb) / 2); const tp = box(xb - xa - .3, .02, zb - za - .3, new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: .9 }), (xa + xb) / 2, YC + .01, (za + zb) / 2); tp.userData.chao = true;
      box(.04, .04, zb - za, M.led, xa, YC - .37, (za + zb) / 2);
      const vg = box(.03, 1.1, zb - za - 2.2, M.vidro, xa + .02, YC + .55, (za + zb) / 2 + 1.1); box(.05, .05, zb - za - 2.2, M.champ, xa + .02, YC + 1.12, (za + zb) / 2 + 1.1);
      box(x0 - xa, 1.1, .03, M.vidro, (xa + x0) / 2, YC + .55, za + .02);
      for (const z of [58, 66]) { const pl = cil(.14, .14, YC, M.champ, xa + .3, YC / 2, z, 16); circ(xa + .3, z, .25); }
      // escada reta encostada na parede (sobe de z 47 até z 55.5)
      const N = 14; for (let i = 0; i < N; i++) { const z = 47.2 + (i + .5) * (8.3 / N), y = YC * (i + 1) / N; box(x1 - x0, .14, 8.3 / N + .02, M.preto, (x0 + x1) / 2, y - .07, z); box(x1 - x0, .02, .04, M.led, (x0 + x1) / 2, y + .005, z - 8.3 / N / 2 + .03); }
      box(.04, YC + .9, 8.3, M.vidro, x0 - .02, (YC + .9) / 2, 51.35);
      mundo.pisos.push((wx, wz) => { const x = wx - OX; if (x > x0 && x < x1 && wz > 47.2 && wz < 55.6) return { y: YC * Math.min(1, (wz - 47.2) / 8.3), k: 'r' }; return null; });
      mundo.pisos.push((wx, wz) => { const x = wx - OX; if (x > xa - .1 && x < xb && wz > za && wz < zb) return { y: YC, k: 'l' }; return null; });
      col(x0 - .25, x0 + .1, 47.2, 55.5);       // lateral da escada (do lado da pista), só embaixo
      // no camarote: sofá + mesa, luz champanhe
      sofa(31.6, 64.2, Math.PI, 1.6, .9, YC, 1); cil(.4, .4, .04, M.pedra, 31.4, YC + .48, 64.2); cil(.07, .2, .48, M.branco, 31.4, YC + .24, 64.2); circ(31.4, 64.2, .5, 1);
    }
    for (let i = 0; i < 3; i++) { const cfg = [LOOKS.noite, LOOKS.homem2, LOOKS.trumpet][i]; tarefasAtivar.push(async () => { const p = await Personagem.cria({ ...cfg, roupas: { ...cfg.roupas, casaco: cfg.roupas.casaco || 'nenhum' } }); p.grupo.position.set(13 + i * 3, 0, 58 + (i % 2) * 2.5); p.grupo.rotation.y = Math.PI + (i - 1) * .4; p.grupo.traverse(o => { if (o.isMesh) o.frustumCulled = false; }); add(p.grupo); try { p.toca('dancar', 0); } catch (e) {} p.atualiza(i * .7, 0, 'dancar'); dancarinos.push(p); }); }
    zona('Balada', 4, 34, 46, 74, [[16, 8, 59, 0xffc9a0, 30, 18], [16, 6, 70, 0xffd9b0, 26, 12], [6, 3, 59, 0xffc77a, 16, 8], [30, YC + 3, 64, 0xffd9a0, 18, 9]]);
  }

  /* ===================================== 10. CINEMA ===================================== */
  {
    const H = 7; const mCin = new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: .8 });
    piso(-34, -4, 66, 86, new THREE.MeshStandardMaterial({ color: 0x3a342e, roughness: .95 })); teto(-34, -4, 66, 86, H, { m: new THREE.MeshStandardMaterial({ color: 0x1d1c1b, roughness: .9 }), linha: 'none', passo: 4 });
    muro('z', -34, 66.15, 86, H, { mat: mCin, lados: [1] }); muro('z', -4, 66.15, 86, H, { mat: mCin, lados: [-1] }); muro('x', 86, -34, -4, H, { mat: mCin, lados: [-1] });
    // painéis canelados brancos nas paredes laterais
    for (const sx of [-1, 1]) { const x = sx < 0 ? -33.82 : -4.18; for (let i = 0; i < 70; i++) { const z = 70 + i * .22; box(.06, 4.2, .12, new THREE.MeshStandardMaterial({ color: 0xece8e1, roughness: .6 }), x, 2.5, z); } }
    tela(-19, 3.6, 85.4, Math.PI, 22, 5.6, 'leferri-campanha.mp4', { curva: 14, sala: 'Cinema' });
    // poltronas em bouclé creme em degraus com luz embutida
    for (let r = 0; r < 4; r++) { const z = 70.5 + r * 2.1, y = (3 - r) * .22; if (y > 0) { box(26, y, 2.1, mCin, -19, y / 2, z); box(26, .02, .04, M.led, -19, y + .01, z + 1.04); }
      for (let i = 0; i < 8; i++) { const x = -29 + i * 2.8 + (r % 2) * 1.4; if (x > -9.5) continue; const u = new THREE.Group(); u.position.set(x, y, z); add(u); const a = new THREE.Mesh(new THREE.BoxGeometry(.85, .42, .8), M.boucle); a.position.y = .21; u.add(a); const e = new THREE.Mesh(new THREE.BoxGeometry(.85, .7, .2), M.boucle); e.position.set(0, .55, -.38); u.add(e); circ(x, z, .5); } }
    mundo.pisos.push((wx, wz) => { const x = wx - OX; if (x > -32 && x < -6 && wz > 69.45 && wz < 78.9) { const r = Math.max(0, Math.min(3, Math.floor((wz - 69.45) / 2.1))); return { y: (3 - r) * .22, k: 'g' }; } return null; });
    zona('Cinema', -34, -4, 66, 86, [[-19, 5.5, 74, 0xffe8c8, 12, 12], [-19, 3, 82, 0xbcd0ff, 8, 10]]);
  }

  /* ---------------- spots embutidos (InstancedMesh) ---------------- */
  {
    const im = new THREE.InstancedMesh(new THREE.CircleGeometry(.07, 14), new THREE.MeshBasicMaterial({ color: 0xfff1d6, toneMapped: false }), spots.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
    spots.forEach(([x, y, z], i) => { m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, m4); }); add(im);
  }
  // portal de volta pro shopping (na entrada)
  { const pt = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 5), new THREE.MeshBasicMaterial({ color: 0xf6efe2, transparent: true, opacity: .85, toneMapped: false })); pt.position.set(0, 2.5, -.4); add(pt);
    logo('SHOPPING NEW', 0, 2.6, -.38, 0, 2.6, '#8f7a55', null, 'Jost', .2); col(-3.2, 3.2, -1.2, -.6); }

  /* ---------------- luzes: um "pool" fixo que muda pra zona onde a pessoa está (custo constante) ---------------- */
  const pool = Array.from({ length: 6 }, () => { const l = new THREE.PointLight(0xffffff, 0, 10, 1.6); l.position.set(0, -50, 0); add(l); return l; });
  let zonaAtual = null;
  const aplicaLuzes = (z) => { pool.forEach((l, i) => { const d = z && z.luzes[i]; if (d) { l.position.set(d[0], d[1], d[2]); l.color.setHex(d[3]); l.intensity = d[4]; l.distance = d[5]; } else { l.intensity = 0; } }); };

  const dentro = (wx, wz) => { const x = wx - OX; return x > -40 && x < 40 && wz > -2 && wz < 90; };
  const zonaDe = (wx, wz) => { const x = wx - OX; return ZONAS.find(z => x >= z.x0 && x <= z.x1 && wz >= z.z0 && wz <= z.z1) || null; };
  let ativo = false;
  async function ativa() { if (ativo) return; ativo = true; for (const t of tarefasAtivar) { try { await t(); } catch (e) { console.error('leferri', e); } } }

  let tLed = 0;
  function update(dt, J) {
    const den = dentro(J.pos.x, J.pos.z);
    if (den) {
      const z = zonaDe(J.pos.x, J.pos.z); if (z !== zonaAtual) { zonaAtual = z; aplicaLuzes(z); }
    } else if (zonaAtual) { zonaAtual = null; aplicaLuzes(null); }
    if (!den) { atualizaveis.forEach(f => f(dt, false)); return; }
    atualizaveis.forEach(f => f(dt, true));
    // pista de LED
    tLed += dt; if (zonaAtual && zonaAtual.nome === 'Balada') {
      const n = 8, q = 512 / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = .5 + .5 * Math.sin(tLed * 3 + i * .9 + j * 1.3 + Math.sin(tLed + i) * 2); const r = 255, g2 = 200 + v * 50 | 0, b = 140 + v * 100 | 0; pk.fillStyle = `rgba(${r},${g2},${b},${.25 + v * .75})`; pk.fillRect(i * q + 5, j * q + 5, q - 10, q - 10); }
      pk.globalCompositeOperation = 'destination-over'; pk.fillStyle = '#0c0b0e'; pk.fillRect(0, 0, 512, 512); pk.globalCompositeOperation = 'source-over'; pistaTex.needsUpdate = true;
    }
    dancarinos.forEach(p => p.atualiza(dt, 0, 'dancar'));
    // desfile: vai e volta na passarela, pausa na ponta
    // SHOW: entrou na passarela -> luzes sobem, telões começam, e os modelos entram pela coxia um de cada vez (5 looks, 4 s entre cada)
    const naPass = zonaAtual && zonaAtual.nome === 'Passarela';
    if (naPass && !show.on) { show.on = true; show.t = 0; }
    if (!naPass && show.on) { show.on = false; desfile.forEach(m => { m.p.grupo.visible = false; }); }
    spotsDesfile.forEach(sp => { sp.intensity += ((show.on ? 30 : 0) - sp.intensity) * Math.min(1, dt * 2); });
    if (show.on) {
      show.t += dt; const ciclo = 20, n = Math.max(desfile.length, 1);
      for (const m of desfile) {
        const tm = show.t - 1.2 - m.i * 4; if (tm < 0) { m.p.grupo.visible = false; continue; }
        m.p.grupo.visible = true;
        const u = (tm % Math.max(ciclo, n * 4)) / Math.max(ciclo, n * 4); let z, ry, vel = 1.1;
        if (u < .38) { z = 67 - (u / .38) * 17.5; ry = Math.PI; } else if (u < .46) { z = 49.5; ry = Math.PI; vel = 0; } else if (u < .84) { z = 49.5 + ((u - .46) / .38) * 17.5; ry = 0; } else { z = 67; ry = 0; vel = 0; m.p.grupo.visible = false; }
        m.p.grupo.position.set(-19 + (m.i % 2 ? .45 : -.45), z > 64.4 ? 0 : .3, z); m.p.grupo.rotation.y = ry; m.p.atualiza(dt, vel);
      }
    }
  }

  return {
    update, ativa, dentro, zona: (wx, wz) => { if (!dentro(wx, wz)) return null; const z = zonaDe(wx, wz); return 'LE FERRI · ' + (z ? z.nome : 'Maison'); },
    provador: provadorPonto, caixa: { x: OX, z: 28.3, olhaZ: 33 }, retangulo: { x0: OX - 40, x1: OX + 40, z0: -2, z1: 90 },
  };
}
