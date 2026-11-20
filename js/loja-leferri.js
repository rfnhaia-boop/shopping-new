// LE FERRI — BOUTIQUE NO SHOPPING (lado -1 da ala VANTRA). Vitrine da marca no corredor + o PORTAL pro mundo próprio dela.
// Coordenadas: as da ala (x ao longo da ala; d = metros pra dentro da loja). Colisões passam pelo shim do main.
import * as THREE from 'three';
import { SH } from './planta.js';
import { Personagem } from '../../shared/personagem/personagem.js';

const cvTex = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const d = () => { x.clearRect(0, 0, w, h); f(x, w, h); t.needsUpdate = true; }; d(); document.fonts && document.fonts.ready.then(d); return t; };

export function montaLeFerriMall(scene, u, mundo) {
  const CLIC = mundo.clicaveis;
  const s = u.lado, zV = s * SH.zAl, W = u.w, D = u.d, H = 7;
  const g = new THREE.Group(); g.position.set(u.x, 0, 0); scene.add(g);
  const Z = d => zV + s * d, rotAl = s > 0 ? Math.PI : 0;
  const ret = (x0, x1, za, zb) => mundo.obst.push({ x0: u.x + x0, x1: u.x + x1, z0: Math.min(za, zb), z1: Math.max(za, zb) });
  const circ = (x, z, r) => mundo.obst.push({ t: 'c', x: u.x + x, z, r });
  const box = (w, h, d, m, x, y, z, ry = 0) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.rotation.y = ry; me.receiveShadow = true; g.add(me); return me; };
  const M = {
    parede: new THREE.MeshStandardMaterial({ color: 0xf6f2ec, roughness: .72 }), preto: new THREE.MeshPhysicalMaterial({ color: 0x070708, roughness: .2, clearcoat: 1 }),
    champ: new THREE.MeshStandardMaterial({ color: 0xcdba9a, metalness: .8, roughness: .3 }), luz: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3dd, emissiveIntensity: 2.4 }),
    vidro: new THREE.MeshPhysicalMaterial({ color: 0xeef6f6, transparent: true, opacity: .18, roughness: .03, depthWrite: false, side: THREE.DoubleSide }),
    pedra: new THREE.MeshPhysicalMaterial({ color: 0xe9e4da, roughness: .2, clearcoat: .8 }),
  };
  // piso de mármore + teto com uma linha de luz
  { const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); x.fillStyle = '#f1eee9'; x.fillRect(0, 0, 512, 512); for (let i = 0; i < 18; i++) { x.strokeStyle = `rgba(150,146,140,${.08 + Math.random() * .14})`; x.lineWidth = .6 + Math.random(); x.beginPath(); let a = Math.random() * 512, b = Math.random() * 512; x.moveTo(a, b); for (let k = 0; k < 10; k++) { a += (Math.random() - .3) * 60; b += (Math.random() - .5) * 60; x.lineTo(a, b); } x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(W / 6, D / 6);
    const p = box(W - .2, .02, D - .2, new THREE.MeshPhysicalMaterial({ map: t, roughness: .14, clearcoat: .8 }), 0, .012, Z(D / 2)); p.userData.chao = true;
    box(W, .2, D, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .8 }), 0, H + .1, Z(D / 2)); box(.07, .03, D - 1.4, M.luz, 0, H - .02, Z(D / 2)); }
  // paredes (laterais e fundo) com sanca de luz quente
  for (const sx of [-1, 1]) { box(.3, H, D, M.parede, sx * (W / 2 - .15), H / 2, Z(D / 2)); ret(sx * (W / 2 - .3), sx * (W / 2), Z(0), Z(D)); box(.05, .05, D, M.luz, sx * (W / 2 - .35), H - .1, Z(D / 2)); }
  box(W, H, .3, M.parede, 0, H / 2, Z(D - .15)); ret(-W / 2, W / 2, Z(D - .3), Z(D)); box(W - 1, .05, .05, M.luz, 0, H - .1, Z(D - .35));

  // FACHADA de maison: parede de pedra marfim até o teto do shopping, portal em arco aberto (sem portas) com moldura champanhe,
  // duas vitrines em arco com caixilho preto, foto de campanha iluminada e manequim; o nome em letras champanhe sobre a pedra.
  {
    const HT = SH.teto, zF = Z(-.2), T = .4;
    const pedraTx = cvTex(1024, 1024, (x, w, h) => { x.fillStyle = '#efe9df'; x.fillRect(0, 0, w, h); for (let i = 0; i < 2400; i++) { const v = 222 + Math.random() * 22 | 0; x.fillStyle = `rgba(${v},${v - 5},${v - 14},.35)`; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 5, .6 + Math.random() * 1.6); } x.strokeStyle = 'rgba(190,178,160,.35)'; x.lineWidth = 2; for (let y = 128; y < h; y += 128) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); } });
    pedraTx.wrapS = pedraTx.wrapT = THREE.RepeatWrapping; pedraTx.repeat.set(W / 6, HT / 6);
    const mPedra = new THREE.MeshStandardMaterial({ map: pedraTx, roughness: .82 });
    const pr = 3, pAlt = 5.6, vw = 6.4, vh = 4.6, vy = .7, vc = 11.4;
    const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(-pr, 0); sh.lineTo(-pr, pAlt - pr); sh.absarc(0, pAlt - pr, pr, Math.PI, 0, true); sh.lineTo(pr, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, HT); sh.lineTo(-W / 2, HT); sh.closePath();
    for (const sx of [-1, 1]) { const cx = sx * vc, r = vw / 2, hole = new THREE.Path(); hole.moveTo(cx - r, vy); hole.lineTo(cx + r, vy); hole.lineTo(cx + r, vy + vh - r); hole.absarc(cx, vy + vh - r, r, 0, Math.PI, false); hole.lineTo(cx - r, vy); sh.holes.push(hole); }
    const geo = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false, curveSegments: 40 }); geo.translate(0, 0, -T / 2);
    const fach = new THREE.Mesh(geo, mPedra); fach.position.set(0, 0, zF); fach.rotation.y = rotAl; fach.receiveShadow = true; g.add(fach);
    ret(-W / 2, -pr - .1, zF - .3, zF + .3); ret(pr + .1, W / 2, zF - .3, zF + .3);
    // moldura champanhe fina no portal + luz no intradorso
    const arcoP = new THREE.Mesh(new THREE.TorusGeometry(pr + .04, .045, 8, 64, Math.PI), M.champ); arcoP.position.set(0, pAlt - pr, Z(-.42)); g.add(arcoP);
    for (const sx of [-1, 1]) box(.09, pAlt - pr, .09, M.champ, sx * (pr + .04), (pAlt - pr) / 2, Z(-.42));
    const arcoL = new THREE.Mesh(new THREE.TorusGeometry(pr - .06, .02, 6, 64, Math.PI), M.luz); arcoL.position.set(0, pAlt - pr, Z(-.05)); g.add(arcoL);
    // nome em letras champanhe sobre a pedra, com luz de cima lavando a parede
    const nome = cvTex(3000, 420, (x, w, h) => { x.clearRect(0, 0, w, h); x.font = '400 260px "Bodoni Moda", Didot, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.letterSpacing = '96px'; x.shadowColor = 'rgba(120,96,60,.45)'; x.shadowBlur = 6; x.shadowOffsetY = 5; const gr = x.createLinearGradient(0, 60, 0, 360); gr.addColorStop(0, '#e9d9b8'); gr.addColorStop(.5, '#c4ab7f'); gr.addColorStop(1, '#a38b62'); x.fillStyle = gr; x.fillText('LE FERRI', w / 2, h / 2); });
    const nm = new THREE.Mesh(new THREE.PlaneGeometry(13, 1.82), new THREE.MeshBasicMaterial({ map: nome, transparent: true, depthWrite: false })); nm.position.set(0, 7.75, Z(-.42)); nm.rotation.y = rotAl; g.add(nm);
    const lav = cvTex(16, 256, (x, w, h) => { const gg = x.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, 'rgba(255,232,196,.7)'); gg.addColorStop(1, 'rgba(255,240,215,0)'); x.fillStyle = gg; x.fillRect(0, 0, w, h); });
    const lv = new THREE.Mesh(new THREE.PlaneGeometry(W, 3.2), new THREE.MeshBasicMaterial({ map: lav, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); lv.position.set(0, HT - 1.6, Z(-.41)); lv.rotation.y = rotAl; g.add(lv);
    box(W, .06, .08, M.luz, 0, HT - .08, Z(-.45));
    box(W, .22, .5, M.champ, 0, .11, Z(-.45));       // rodapé champanhe
    // vitrines em arco: caixilho preto, vidro, fundo com foto de campanha iluminada, manequim em plinto preto
    const loaderV = new THREE.TextureLoader();
    [[-1, 'camp4.jpg', 0], [1, 'camp7.jpg', 1]].forEach(([sx, foto, i]) => {
      const cx = sx * vc, r = vw / 2;
      const cont = []; for (let k = 0; k <= 32; k++) { const a = Math.PI * k / 32; cont.push(new THREE.Vector3(cx + Math.cos(a) * r, vy + vh - r + Math.sin(a) * r, Z(-.43))); }
      cont.push(new THREE.Vector3(cx - r, vy, Z(-.43)), new THREE.Vector3(cx + r, vy, Z(-.43)), new THREE.Vector3(cx + r, vy + vh - r, Z(-.43)));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cont, true, 'catmullrom', 0), 160, .05, 8, true), M.preto));
      const vsh = new THREE.Shape(); vsh.moveTo(cx - r, vy); vsh.lineTo(cx + r, vy); vsh.lineTo(cx + r, vy + vh - r); vsh.absarc(cx, vy + vh - r, r, 0, Math.PI, false); vsh.lineTo(cx - r, vy);
      const vd = new THREE.Mesh(new THREE.ShapeGeometry(vsh, 32), M.vidro); vd.position.z = Z(-.3); vd.rotation.y = rotAl; if (rotAl === 0) vd.position.x = 0; g.add(vd);
      // caixa da vitrine (fundo + teto + piso) e a foto
      box(vw + .2, .1, 1.9, M.preto, cx, vy - .05, Z(.85)); box(vw + .2, .08, 1.9, M.parede, cx, vy + vh + .1, Z(.85));
      const t = loaderV.load(new URL(`../assets/leferri/${foto}`, import.meta.url).href); t.colorSpace = THREE.SRGBColorSpace;
      const ft = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 4.4), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); ft.position.set(cx + sx * 1.3, vy + 2.3, Z(1.75)); ft.rotation.y = rotAl; g.add(ft);
      box(3.42, 4.52, .05, M.champ, cx + sx * 1.3, vy + 2.3, Z(1.79));
      box(vw + .2, vh + .5, .1, M.parede, cx, vy + vh / 2, Z(1.85));
      box(1.2, .28, 1.2, M.preto, cx - sx * 1.1, vy + .14, Z(.95)); box(1.22, .02, 1.22, M.luz, cx - sx * 1.1, vy + .005, Z(.95));
      const sp = new THREE.SpotLight(0xfff2de, 18, 7, .7, .6, 1.4); sp.position.set(cx, vy + vh - .2, Z(.3)); sp.target.position.set(cx - sx * 1.1, vy, Z(.95)); g.add(sp, sp.target);
      ret(cx - r - .2, cx + r + .2, Z(0), Z(1.95));
      const cfg = [{ corpo: 'fem', roupas: { camisa: 'vantra-jaqueta-japi', calca: 'japi-calca', calcado: 'bota-v' } }, { corpo: 'fem', roupas: { camisa: 'atelie-jaqueta', calca: 'atelie-calca', calcado: 'bota-v' } }][i];
      Personagem.cria({ ...cfg, roupas: { ...cfg.roupas, casaco: 'nenhum' } }).then(p => { try { p.toca('parado'); p.atualiza(.4 + i * .5, 0); } catch (e) {} p.grupo.position.set(cx - sx * 1.1, vy + .28, Z(.95)); p.grupo.rotation.y = rotAl + sx * .2; p.grupo.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } }); g.add(p.grupo); p.grupo.userData.clic = { tipo: 'look', roupas: { ...cfg.roupas }, nome: ['Look JAPI', 'Look Ateliê'][i] }; CLIC.push(p.grupo); }).catch(e => console.error('leferri vitrine', e));
    });
    // dois manequins logo depois do portal, recebendo quem entra
    [[-5, 0], [5, 1]].forEach(([x, i]) => { box(1.1, .25, 1.1, M.preto, x, .125, Z(3.2)); box(1.12, .02, 1.12, M.luz, x, .005, Z(3.2)); circ(x, Z(3.2), .8);
      const cfg = [{ corpo: 'fem', roupas: { camisa: 'top-freecrop', calca: 'saia-studs', calcado: 'bota-v' } }, { corpo: 'masc', roupas: { camisa: 'camiseta-preta', calca: 'calca-preta', calcado: 'tenis-preto' } }][i];
      Personagem.cria({ ...cfg, roupas: { ...cfg.roupas, casaco: 'nenhum' } }).then(p => { try { p.toca('parado'); p.atualiza(.2 + i, 0); } catch (e) {} p.grupo.position.set(x, .25, Z(3.2)); p.grupo.rotation.y = rotAl + (i ? -.3 : .3); p.grupo.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } }); g.add(p.grupo); p.grupo.userData.clic = { tipo: 'look', roupas: { ...cfg.roupas }, nome: ['Look Noite', 'Look Noir'][i] }; CLIC.push(p.grupo); }).catch(() => {}); });
  }
  // dentro: prateleiras iluminadas com bolsas nas laterais + sofá curvo e mesa de pedra
  const bolsa = (cor, tipo) => { const b = new THREE.Group(), m = new THREE.MeshPhysicalMaterial({ color: cor, roughness: .38, clearcoat: .4 }); if (tipo) { const c = new THREE.Mesh(new THREE.CapsuleGeometry(.1, .2, 6, 16), m); c.rotation.z = Math.PI / 2; c.scale.set(1, 1, .75); c.position.y = .11; b.add(c); } else { const c = new THREE.Mesh(new THREE.BoxGeometry(.34, .22, .14), m); c.position.y = .11; b.add(c); } const al = new THREE.Mesh(new THREE.TorusGeometry(.085, .01, 6, 20, Math.PI), M.champ); al.position.y = .24; b.add(al); return b; };
  for (const sx of [-1, 1]) for (let n = 0; n < 4; n++) { const y = .8 + n * .7, x = sx * (W / 2 - .5); box(.4, .025, 5, M.vidro, x, y, Z(7.5)); box(.02, .015, 4.8, M.luz, x, y - .03, Z(7.5)); for (let k = 0; k < 6; k++) { const b = bolsa([0x0e0e10, 0xbfa88a, 0x9b968d, 0xefe9de][(k + n) % 4], (k + n) % 3 === 2); b.position.set(x, y + .012, Z(5.4 + k * .84)); b.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(b); } ret(sx > 0 ? x - .3 : x - .1, sx > 0 ? x + .1 : x + .3, Z(5), Z(10)); }

  // ===== SALÃO OVAL (loja agora vai até d=26): sanca oval acesa no teto + lustre de anéis, plinto giratório com 3 looks,
  // sofá curvo de bouclé, nichos em arco nas paredes (sapatos/bolsas), cantos do fundo arredondados, caixa de pedra curva =====
  const giram = [];
  {
    const zS = Z(15.5), rx = 7.5, rz = 5.2, mBoucle = new THREE.MeshStandardMaterial({ color: 0xefe9de, roughness: 1 });
    // cantos do fundo arredondados (quarto de cilindro) — a sala deixa de ser caixa
    for (const sx of [-1, 1]) {
      const rc = 4.5, cx = sx * (W / 2 - rc), cz = Z(D - rc), t0 = s < 0 ? (sx > 0 ? Math.PI / 2 : Math.PI) : (sx > 0 ? 0 : Math.PI * 1.5);
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(rc, rc, H, 32, 1, true, t0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf6f2ec, roughness: .72, side: THREE.DoubleSide }));
      cyl.position.set(cx, H / 2, cz); g.add(cyl);
      const lzC = new THREE.Mesh(new THREE.TorusGeometry(rc - .05, .025, 6, 32, Math.PI / 2), M.luz); lzC.rotation.x = -Math.PI / 2; lzC.rotation.z = t0 - Math.PI / 2; lzC.position.set(cx, H - .12, cz); g.add(lzC);
      for (let k = 0; k <= 5; k++) { const th = t0 + Math.PI / 2 * k / 5; circ(cx + Math.sin(th) * rc, cz + Math.cos(th) * rc, .45); }
    }
    // teto: sanca oval (anel de luz) + disco claro + lustre de 3 anéis champanhe
    const anel = new THREE.Mesh(new THREE.TorusGeometry(1, .05, 8, 120), M.luz); anel.rotation.x = Math.PI / 2; anel.scale.set(rx, rz, 1); anel.position.set(0, H - .08, zS); g.add(anel);
    const disco = new THREE.Mesh(new THREE.CircleGeometry(1, 80), new THREE.MeshStandardMaterial({ color: 0xf6f0e6, emissive: 0xfff3e0, emissiveIntensity: .35, roughness: .9 })); disco.rotation.x = Math.PI / 2; disco.scale.set(rx - .3, rz - .3, 1); disco.position.set(0, H - .02, zS); g.add(disco);
    [1.6, 1.15, .7].forEach((r, k) => { const l = new THREE.Mesh(new THREE.TorusGeometry(r, .025, 8, 64), M.champ); l.rotation.x = Math.PI / 2; l.position.set(0, H - 1.2 - k * .45, zS); g.add(l); const lz = new THREE.Mesh(new THREE.TorusGeometry(r - .03, .012, 6, 64), M.luz); lz.rotation.x = Math.PI / 2; lz.position.set(0, H - 1.22 - k * .45, zS); g.add(lz); giram.push({ o: l, v: (k % 2 ? -1 : 1) * .15 }); giram.push({ o: lz, v: (k % 2 ? -1 : 1) * .15 }); });
    for (let k = 0; k < 3; k++) { const f = box(.008, 1.2 + k * .45, .008, M.champ, 0, H - .6 - k * .22, zS); }
    const lpS = new THREE.PointLight(0xfff1dc, 26, 18, 1.5); lpS.position.set(0, H - 1, zS); g.add(lpS);
    // plinto giratório de pedra com 3 looks
    const plinto = new THREE.Group(); plinto.position.set(0, 0, zS); g.add(plinto);
    const pd = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.2, .3, 64), M.pedra); pd.position.y = .15; pd.castShadow = pd.receiveShadow = true; plinto.add(pd);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(2.21, .02, 6, 80), M.luz); aro.rotation.x = Math.PI / 2; aro.position.y = .02; plinto.add(aro);
    circ(0, zS, 2.5); giram.push({ o: plinto, v: .12 });
    const LOOKS3 = [{ corpo: 'fem', roupas: { camisa: 'atelie-jaqueta', calca: 'saia-trumpet', calcado: 'bota-v' }, nome: 'Look Maison' }, { corpo: 'fem', roupas: { camisa: 'top-freecrop', calca: 'japi-calca', calcado: 'bota-v' }, nome: 'Look Soirée' }, { corpo: 'masc', roupas: { camisa: 'camiseta-preta', calca: 'calca-preta', calcado: 'tenis-preto' }, nome: 'Look Noir' }];
    LOOKS3.forEach((cfg, i) => { const a = i * Math.PI * 2 / 3;
      Personagem.cria({ corpo: cfg.corpo, roupas: { ...cfg.roupas, casaco: 'nenhum' } }).then(p => { try { p.toca('parado'); p.atualiza(.3 + i * .4, 0); } catch (e) {} p.grupo.position.set(Math.sin(a) * 1.25, .3, Math.cos(a) * 1.25); p.grupo.rotation.y = a; p.grupo.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } }); plinto.add(p.grupo); p.grupo.userData.clic = { tipo: 'look', roupas: { ...cfg.roupas }, nome: cfg.nome }; CLIC.push(p.grupo); }).catch(() => {}); });
    // sofá curvo de bouclé (arco de ~140°) em volta, voltado pro plinto, nos dois lados
    for (const sx of [-1, 1]) {
      const arcG = new THREE.TorusGeometry(4.2, .32, 10, 40, Math.PI * .45); const so = new THREE.Mesh(arcG, mBoucle); so.rotation.x = Math.PI / 2; so.rotation.z = sx > 0 ? -Math.PI * .225 : Math.PI - Math.PI * .225; so.scale.z = 1.3; so.position.set(0, .34, zS); so.castShadow = true; g.add(so);
      const enc = new THREE.Mesh(new THREE.TorusGeometry(4.55, .14, 8, 40, Math.PI * .45), mBoucle); enc.rotation.copy(so.rotation); enc.position.set(0, .7, zS); g.add(enc);
      for (let k = -2; k <= 2; k++) { const a = (sx > 0 ? 0 : Math.PI) + k * Math.PI * .1; circ(Math.cos(a) * 4.3, zS + Math.sin(a) * 4.3, .55); }
    }
    // nichos em arco nas paredes laterais (sapatos e bolsas sobre pedestal iluminado)
    for (const sx of [-1, 1]) for (const d of [12.5, 18.5]) {
      const x = sx * (W / 2 - .32), zN = Z(d), r = 1.1, hN = 3.2;
      const fundo = new THREE.Mesh(new THREE.PlaneGeometry(2.2, hN + r), new THREE.MeshStandardMaterial({ color: 0xe9dfcf, roughness: .8 })); fundo.position.set(x + sx * .0, (hN + r) / 2, zN); fundo.rotation.y = -sx * Math.PI / 2; g.add(fundo);
      const arc = new THREE.Mesh(new THREE.TorusGeometry(r, .04, 8, 40, Math.PI), M.champ); arc.position.set(x - sx * .05, hN, zN); arc.rotation.y = -sx * Math.PI / 2; g.add(arc);
      for (const dz of [-1, 1]) box(.06, hN, .06, M.champ, x - sx * .05, hN / 2, zN + dz * r);
      const lN = new THREE.Mesh(new THREE.TorusGeometry(r - .08, .015, 6, 40, Math.PI), M.luz); lN.position.set(x - sx * .07, hN, zN); lN.rotation.y = -sx * Math.PI / 2; g.add(lN);
      const ped = box(.9, 1, .9, M.pedra, x - sx * .7, .5, zN); ped.castShadow = true; box(.92, .015, .92, M.luz, x - sx * .7, .005, zN);
      const b = bolsa([0x0e0e10, 0xbfa88a, 0x9b968d, 0xefe9de][(d > 15 ? 2 : 0) + (sx > 0 ? 1 : 0)], d > 15); b.scale.setScalar(1.5); b.position.set(x - sx * .7, 1.01, zN); b.rotation.y = -sx * Math.PI / 2; g.add(b);
      ret(sx > 0 ? x - 1.2 : x + .2, sx > 0 ? x - .2 : x + 1.2, zN - .5, zN + .5);
    }
    // caixa: balcão curvo de pedra com tampo champanhe (lado +x, perto do portal)
    { const xC = 10.5, zC = Z(22), forma = new THREE.Shape(); forma.absarc(0, 0, 1.6, 0, Math.PI, false); forma.lineTo(-1.1, 0); forma.absarc(0, 0, 1.1, Math.PI, 0, true); forma.closePath();
      const bc = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: 1.05, bevelEnabled: false, curveSegments: 32 }), M.pedra); bc.rotation.x = -Math.PI / 2; const bg = new THREE.Group(); bg.position.set(xC, 0, zC); bg.rotation.y = s > 0 ? 0 : Math.PI; bg.add(bc); g.add(bg);
      const tp = new THREE.Mesh(new THREE.TorusGeometry(1.35, .25, 4, 40, Math.PI), M.champ); tp.rotation.x = Math.PI / 2; tp.scale.z = .08; tp.position.set(0, 1.07, 0); bg.add(tp);
      ret(xC - 1.7, xC + 1.7, zC + s * .1, zC - s * 1.7);
    }
  }

  // o PORTAL pro mundo da marca, no fundo: arco champanhe aceso + luz marfim + chamada
  { const zP = Z(D - .32), r = 2.3;
    const arco = new THREE.Mesh(new THREE.TorusGeometry(r, .09, 12, 64, Math.PI), new THREE.MeshStandardMaterial({ color: 0xffe9c4, emissive: 0xffd9a0, emissiveIntensity: 2.4 })); arco.position.set(0, 3.0, zP); g.add(arco);
    for (const sx of [-1, 1]) box(.18, 3.0, .18, new THREE.MeshStandardMaterial({ color: 0xffe9c4, emissive: 0xffd9a0, emissiveIntensity: 2.4 }), sx * r, 1.5, zP);
    const sh = new THREE.Shape(); sh.moveTo(-r, 0); sh.lineTo(r, 0); sh.lineTo(r, 3); sh.absarc(0, 3, r, 0, Math.PI, false); sh.lineTo(-r, 0);
    const luz = cvTex(512, 1024, (x, w, h) => { const gr = x.createRadialGradient(w / 2, h * .55, 20, w / 2, h * .55, h * .7); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.5, '#fbf3e4'); gr.addColorStop(1, '#ead9b8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
    const pl = new THREE.Mesh(new THREE.ShapeGeometry(sh, 32), new THREE.MeshBasicMaterial({ map: luz, toneMapped: false })); pl.position.set(0, 0, zP - s * .02); pl.rotation.y = rotAl; g.add(pl);
    const ch = cvTex(2048, 300, (x, w, h) => { x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#8f7a55'; x.font = '300 74px Jost, sans-serif'; x.letterSpacing = '24px'; x.fillText('ENTRAR NO UNIVERSO', w / 2, h * .3); x.font = '400 120px "Bodoni Moda", Didot, serif'; x.letterSpacing = '40px'; x.fillStyle = '#1c1a17'; x.fillText('LE FERRI', w / 2, h * .72); });
    const tx = new THREE.Mesh(new THREE.PlaneGeometry(6.4, .94), new THREE.MeshBasicMaterial({ map: ch, transparent: true, depthWrite: false })); tx.position.set(0, 6.0, Z(D - .32) - s * .03); tx.rotation.y = rotAl; g.add(tx);
    const tap = new THREE.Mesh(new THREE.CircleGeometry(2.2, 64), new THREE.MeshBasicMaterial({ color: 0xfff1d8, transparent: true, opacity: .5, toneMapped: false, depthWrite: false })); tap.rotation.x = -Math.PI / 2; tap.position.set(0, .03, Z(D - 1.8)); g.add(tap);
    const lp = new THREE.PointLight(0xffe2b0, 16, 10, 1.6); lp.position.set(0, 3.5, Z(D - 3)); g.add(lp);
    const lp2 = new THREE.PointLight(0xfff4e6, 18, 16, 1.6); lp2.position.set(0, 5, Z(5)); g.add(lp2);
  }
  // pontos (em coordenadas da ala) pro main: gatilho do portal e onde a pessoa reaparece ao voltar
  let tG = 0;
  const update = dt => { tG += dt; giram.forEach(q => { q.o.rotation[q.o === giram[giram.length - 1].o ? 'y' : 'z'] += dt * q.v; }); };
  return { update, caixa: { x: u.x + 10.5, z: Z(19.6), olhaZ: Z(23) }, portal: { x: u.x, z: Z(D - 1.3) }, chegada: { x: u.x, z: Z(D - 4.5), olhaZ: Z(0) }, frente: { x: u.x, z: Z(-3.5), olhaZ: Z(4) } };
}
