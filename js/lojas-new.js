// SHOPPING NEW — lado -1 da ala street (em frente ao ATELIÊ): 4 salas de arquitetura curva (fundo em meia-lua, sanca de luz oval).
//  1. NEW WEAR  — loja da NEW (roupa)          2. NEW LAB — loja da NEW (tênis/acessórios, pedestais de luz)
//  3. CENTRAL DE VENDAS — tipo stand de lançamento imobiliário: maquete do shopping com a ETAPA 2 (andar de cima + anel de trás)
//  4. SUA LOJA AQUI — demonstração pra cliente: loja modelo com pontos numerados explicando cada recurso
// Tudo em coordenadas locais da ala (x ao longo da ala, z de lado; lado -1 => z negativo). As luzes acendem quando a pessoa entra.
import * as THREE from 'three';
import { Personagem } from '../../shared/personagem/personagem.js';
import { SH } from './planta.js';

export const NEWSTREET = { ala: 'street', lado: -1, x0: 17, w: 48, d: 13 };
const ROXO = 0x8b5cf6, ROXO_ESC = 0x4c1d95, LILAS = 0xc4b5fd;

function cvTex(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function texto(txt, { cor = '#fff', fonte = '600 150px system-ui, sans-serif', esp = '24px', w = 1600, h = 300, sub, corSub } = {}) {
  return cvTex(w, h, (x, W, H) => { x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = cor; x.font = fonte; x.letterSpacing = esp; x.fillText(txt, W / 2, sub ? H * .4 : H / 2); if (sub) { x.font = '500 48px system-ui, sans-serif'; x.letterSpacing = '14px'; x.fillStyle = corSub || cor; x.fillText(sub, W / 2, H * .82); } });
}

export function montaLojasNew(ala, { clicaveis, aviso }) {
  const g = new THREE.Group(); ala.g.add(g);
  const { x0, w, d } = NEWSTREET, n = 4, larg = w / n, zF = -SH.zAl, zB = zF - d, HT = SH.teto, HS = 5.8;
  const add = (m, p = g) => { p.add(m); return m; };
  const box = (bw, bh, bd, mat, x, y, z) => { const m = add(new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
  const plano = (pw, ph, mat, x, y, z, ry = 0) => { const m = add(new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat)); m.position.set(x, y, z); m.rotation.y = ry; return m; };
  const mBranco = new THREE.MeshStandardMaterial({ color: 0xf7f6f3, roughness: .75 });
  const mPreto = new THREE.MeshStandardMaterial({ color: 0x15121c, roughness: .4 });
  const mRoxo = new THREE.MeshPhysicalMaterial({ color: ROXO_ESC, roughness: .3, clearcoat: 1 });
  const mLuz = new THREE.MeshBasicMaterial({ color: 0xfff4e6, toneMapped: false });
  const mVidro = new THREE.MeshPhysicalMaterial({ color: 0xf2eeff, roughness: .05, transparent: true, opacity: .22, depthWrite: false, side: THREE.DoubleSide });

  // a parede do corredor desse lado (arquitetura.js pula esse lado): só nas pontas
  ala.ret(SH.apotema, x0, zF - .3, zF + .3); ala.ret(x0 + w, SH.apotema + 52, zF - .3, zF + .3);
  box(x0 - SH.apotema, HT, .3, mBranco, (SH.apotema + x0) / 2, HT / 2, zF - .15);
  box(SH.apotema + 52 - x0 - w, HT, .3, mBranco, (x0 + w + SH.apotema + 52) / 2, HT / 2, zF - .15);

  const salas = [], destinos = [], lojas = [], caixas = [];
  const SALAS = [
    { id: 'wear', nome: 'NEW WEAR', sub: 'moda NEW', piso: 0xe9e4f5, parede: 0xf4f1fb, acento: ROXO, letra: '#4c1d95' },
    { id: 'lab', nome: 'NEW LAB', sub: 'tênis & acessórios', piso: 0x1d1830, parede: 0x241d3a, acento: 0x34d399, letra: '#ffffff' },
    { id: 'vendas', nome: 'CENTRAL DE VENDAS', sub: 'Shopping NEW · etapa 2', piso: 0xf1ede6, parede: 0xfbf9f5, acento: 0xcdba9a, letra: '#2a2238' },
    { id: 'demo', nome: 'SUA LOJA AQUI', sub: 'veja como funciona', piso: 0xf5f5f7, parede: 0xffffff, acento: ROXO, letra: '#4c1d95' },
  ];

  const montaSalas = () => SALAS.forEach((S, i) => {
    const cx = x0 + larg * (i + .5), r = larg / 2 - .15, zC = zB + r;      // centro da meia-lua do fundo
    const sg = new THREE.Group(); g.add(sg);
    const mParede = new THREE.MeshStandardMaterial({ color: S.parede, roughness: .8, side: THREE.DoubleSide });
    // piso (clicável pra andar) e teto
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(larg - .3, d), new THREE.MeshPhysicalMaterial({ color: S.piso, roughness: .3, clearcoat: .6 }));
    piso.rotation.x = -Math.PI / 2; piso.position.set(cx, .005, zF - d / 2); piso.userData.chao = true; piso.receiveShadow = true; sg.add(piso);
    const teto = new THREE.Mesh(new THREE.PlaneGeometry(larg - .3, d), mBranco); teto.rotation.x = Math.PI / 2; teto.position.set(cx, HS, zF - d / 2); sg.add(teto);
    // paredes laterais retas até o começo da curva + fundo em meia-lua (casca contínua)
    for (const sx of [-1, 1]) { const pw = new THREE.Mesh(new THREE.PlaneGeometry(zF - zC, HS), mParede); pw.position.set(cx + sx * r, HS / 2, (zF + zC) / 2); pw.rotation.y = Math.PI / 2; sg.add(pw); ala.ret(cx + sx * r - .15, cx + sx * r + .15, zC, zF); }
    const curva = new THREE.Mesh(new THREE.CylinderGeometry(r, r, HS, 48, 1, true, Math.PI / 2, Math.PI), mParede); curva.position.set(cx, HS / 2, zC); sg.add(curva);
    for (let k = 0; k <= 10; k++) { const a = Math.PI * k / 10, px = cx + Math.cos(a) * r, pz = zC - Math.sin(a) * r; ala.circ(px, pz, .45); }
    // sanca oval de luz no teto (acende ao entrar) + rodapé de luz seguindo a curva
    const anel = new THREE.Mesh(new THREE.TorusGeometry(1, .035, 8, 96), new THREE.MeshBasicMaterial({ color: S.acento, toneMapped: false, transparent: true, opacity: .15 }));
    anel.rotation.x = Math.PI / 2; anel.scale.set(r - .8, (d - 2) / 2, 1); anel.position.set(cx, HS - .06, zF - d / 2); sg.add(anel);
    const rod = new THREE.Mesh(new THREE.TorusGeometry(r - .05, .025, 6, 64, Math.PI), new THREE.MeshBasicMaterial({ color: S.acento, toneMapped: false, transparent: true, opacity: .15 }));
    rod.rotation.x = Math.PI / 2; rod.rotation.z = Math.PI; rod.position.set(cx, .06, zC); sg.add(rod);
    const luz = new THREE.PointLight(0xfff1de, 0, 16, 1.4); luz.position.set(cx, HS - .6, zF - d / 2); sg.add(luz);
    // FACHADA: parede alta com portal em arco (sem porta), nome em cima
    const pr = 2.8, pAlt = 4.8, T = .35;
    const sh = new THREE.Shape(); sh.moveTo(-larg / 2, 0); sh.lineTo(-pr, 0); sh.lineTo(-pr, pAlt - pr); sh.absarc(0, pAlt - pr, pr, Math.PI, 0, true); sh.lineTo(pr, 0); sh.lineTo(larg / 2, 0); sh.lineTo(larg / 2, HT); sh.lineTo(-larg / 2, HT); sh.closePath();
    const fg = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false, curveSegments: 36 }); fg.translate(0, 0, -T / 2);
    const fach = new THREE.Mesh(fg, i === 1 ? new THREE.MeshStandardMaterial({ color: 0x1b1628, roughness: .5 }) : new THREE.MeshStandardMaterial({ color: i === 2 ? 0xf3efe8 : 0xfbfaff, roughness: .7 }));
    fach.position.set(cx, 0, zF); fach.castShadow = fach.receiveShadow = true; sg.add(fach);
    ala.ret(cx - larg / 2, cx - pr - .1, zF - .3, zF + .3); ala.ret(cx + pr + .1, cx + larg / 2, zF - .3, zF + .3);
    const arco = new THREE.Mesh(new THREE.TorusGeometry(pr + .03, .05, 8, 64, Math.PI), new THREE.MeshBasicMaterial({ color: S.acento, toneMapped: false })); arco.position.set(cx, pAlt - pr, zF + .2); sg.add(arco);
    for (const sx of [-1, 1]) { const b = box(.08, pAlt - pr, .08, arco.material, cx + sx * (pr + .03), (pAlt - pr) / 2, zF + .2); sg.add(b); }
    const placa = plano(larg - 2, (larg - 2) * .19, new THREE.MeshBasicMaterial({ map: texto(S.nome, { cor: i === 1 ? '#ffffff' : S.letra, sub: S.sub.toUpperCase(), corSub: i === 1 ? '#34d399' : '#8b5cf6', fonte: `${i === 2 ? 600 : 700} ${S.nome.length > 12 ? 118 : 150}px system-ui, sans-serif` }), transparent: true, toneMapped: false }), cx, 6.6, zF + .2);
    sg.add(placa);
    // símbolo NEW (onda verde→roxo) sobre o nome das lojas da NEW
    if (i < 2) {
      const pts = Array.from({ length: 30 }, (_, k) => { const t = k / 29; return new THREE.Vector3(-1.1 + 2.2 * t, Math.sin(t * Math.PI * 1.6 - .5) * .32, 0); });
      const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, .07, 10); const pos = geo.attributes.position, cores = [];
      for (let k = 0; k < pos.count; k++) { const c = new THREE.Color(0x34d399).lerp(new THREE.Color(0xa78bfa), (pos.getX(k) + 1.1) / 2.2); cores.push(c.r, c.g, c.b); }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));
      const onda = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })); onda.position.set(cx, 8.4, zF + .3); sg.add(onda);
    }
    const sala = { S, cx, zC, r, anel, rod, luz, ativa: 0, grupo: sg, update: null };
    salas.push(sala);
    const p = ala.mundo(cx, zF + 4.6), o = ala.mundo(cx, zF - 6);
    destinos.push({ grupo: i < 2 ? 'Lojas' : 'NEW Negócios', nome: S.nome, sub: { wear: 'loja NEW · roupa', lab: 'loja NEW · tênis e acessórios', vendas: 'maquete do shopping · etapa 2', demo: 'demonstração de loja pra cliente' }[S.id], x: p.x, z: p.z, ox: o.x, oz: o.z, apelidos: { wear: ['wear', 'loja da new'], lab: ['lab'], vendas: ['central', 'vendas', 'maquete', 'etapa 2'], demo: ['sua loja', 'demonstracao', 'demo'] }[S.id] });
    if (i < 2) { lojas.push({ nome: S.nome, ala, x0: cx - larg / 2, x1: cx + larg / 2, z0: zB, z1: zF - .2 }); }
    montaInterior[S.id](sala);
  });

  /* ===================== interiores ===================== */
  function manequim(sala, x, z, cfg, nome, ry = 0, alt = .22) {
    const { S } = sala;
    box(1, alt, 1, new THREE.MeshPhysicalMaterial({ color: S.id === 'lab' ? 0x0f0c18 : 0xffffff, roughness: .25, clearcoat: 1 }), x, alt / 2, z);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(.52, .015, 6, 40), new THREE.MeshBasicMaterial({ color: S.acento, toneMapped: false })); aro.rotation.x = Math.PI / 2; aro.position.set(x, alt + .01, z); sala.grupo.add(aro);
    ala.circ(x, z, .75);
    Personagem.cria({ ...cfg, roupas: { ...cfg.roupas, casaco: 'nenhum' } }).then(p => {
      try { p.toca('parado'); p.atualiza(.3 + Math.random(), 0); } catch (e) {}
      p.grupo.position.set(x, alt, z); p.grupo.rotation.y = ry; p.grupo.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
      sala.grupo.add(p.grupo); p.grupo.userData.clic = { tipo: 'look', roupas: { ...cfg.roupas }, nome }; clicaveis.push(p.grupo);
    }).catch(() => {});
  }
  function arara(sala, x, z, cores, ry = 0) {
    const gr = new THREE.Group(); gr.position.set(x, 0, z); gr.rotation.y = ry; sala.grupo.add(gr);
    const met = new THREE.MeshStandardMaterial({ color: 0xcdba9a, metalness: .85, roughness: .3 });
    for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1.7, 10), met); p.position.set(sx * 1.1, .85, 0); gr.add(p); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 2.3, 10), met); bar.rotation.z = Math.PI / 2; bar.position.y = 1.68; gr.add(bar);
    cores.forEach((c, k) => { const peca = new THREE.Mesh(new THREE.BoxGeometry(.06, .95, .5), new THREE.MeshStandardMaterial({ color: c, roughness: .9 })); peca.position.set(-.95 + k * (1.9 / (cores.length - 1)), 1.15, 0); peca.castShadow = true; gr.add(peca); });
    const m = ala.mundo(x, z); ala.ret(x - 1.2, x + 1.2, z - .35, z + .35);
  }
  function balcao(sala, x, z, cor, larg = 3) {
    const forma = new THREE.Shape(); forma.absarc(0, 0, larg / 2, 0, Math.PI, false); forma.lineTo(-larg / 2 + .5, 0); forma.absarc(0, 0, larg / 2 - .5, Math.PI, 0, true); forma.closePath();
    const geo = new THREE.ExtrudeGeometry(forma, { depth: 1.05, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, curveSegments: 32 });
    const b = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: cor, roughness: .25, clearcoat: 1 })); b.rotation.x = -Math.PI / 2; b.castShadow = true; const bg = new THREE.Group(); bg.position.set(x, 0, z); bg.rotation.y = Math.PI; bg.add(b); sala.grupo.add(bg);   // lado curvo virado pra quem entra
    const fio = new THREE.Mesh(new THREE.TorusGeometry(larg / 2 + .02, .015, 6, 48, Math.PI), new THREE.MeshBasicMaterial({ color: sala.S.acento, toneMapped: false })); fio.rotation.x = Math.PI / 2; fio.position.set(x, .12, z); sala.grupo.add(fio);
    ala.ret(x - larg / 2, x + larg / 2, z - .1, z + larg / 2);
  }
  function tela(sala, x, y, z, pw, ph, tex, ry = 0) { const t = plano(pw, ph, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), x, y, z, ry); sala.grupo.add(t); box(pw + .12, ph + .12, .05, mPreto, x, y, z - .04 * Math.cos(ry)).rotation.y = ry; return t; }

  const montaInterior = {
    wear(sala) {
      const { cx, zC } = sala;
      manequim(sala, cx - 2.6, zF - 3.2, { corpo: 'fem', roupas: { camisa: 'top-crop04', calca: 'calca-puffer', calcado: 'bota-v' } }, 'Look NEW Puffer', .5);
      manequim(sala, cx + 2.6, zF - 3.2, { corpo: 'masc', roupas: { camisa: 'moletom-vinho', calca: 'jeans-escuro', calcado: 'tenis-branco' } }, 'Look NEW Casual', -.5);
      manequim(sala, cx, zC - 1.2, { corpo: 'fem', roupas: { camisa: 'tee-ceramica', calca: 'calca-vacuo', calcado: 'bota-v' } }, 'Look NEW Studio', 0, .5);
      arara(sala, cx - 3.6, zC - 1.4, [0x4c1d95, 0x8b5cf6, 0xc4b5fd, 0xede9fe, 0x15121c], .9);
      arara(sala, cx + 3.6, zC - 1.4, [0xf7f6f3, 0x34d399, 0xa78bfa, 0x1d1430, 0xddd6fe], -.9);
      balcao(sala, cx, zF - 7.2, 0xffffff, 2.6);
      caixas.push({ nome: 'NEW WEAR', ala, x: cx, z: zF - 5.2, olhaZ: zF - 8 });
    },
    lab(sala) {
      const { cx, zC } = sala;
      // pedestais de luz com tênis/acessórios (formas simples brilhando) + 2 manequins
      const ped = new THREE.MeshPhysicalMaterial({ color: 0x0f0c18, roughness: .2, clearcoat: 1 });
      const itens = [];
      [[-3.4, -3], [3.4, -3], [-3.6, -7.4], [3.6, -7.4]].forEach(([dx, dz], k) => {
        const x = cx + dx, z = zF + dz;
        const c = new THREE.Mesh(new THREE.CylinderGeometry(.45, .5, 1.05, 40), ped); c.position.set(x, .525, z); c.castShadow = true; sala.grupo.add(c);
        const topo = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .02, 40), new THREE.MeshBasicMaterial({ color: 0x34d399, toneMapped: false })); topo.position.set(x, 1.06, z); sala.grupo.add(topo);
        const cup = new THREE.Mesh(new THREE.SphereGeometry(.45, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mVidro); cup.position.set(x, 1.07, z); sala.grupo.add(cup);
        const tenis = new THREE.Group(); tenis.position.set(x, 1.16, z); sala.grupo.add(tenis);
        const sola = new THREE.Mesh(new THREE.CapsuleGeometry(.07, .22, 6, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .5 })); sola.rotation.z = Math.PI / 2; sola.scale.set(1, 1, 1.25); tenis.add(sola);
        const cab = new THREE.Mesh(new THREE.SphereGeometry(.11, 20, 12), new THREE.MeshStandardMaterial({ color: [0x8b5cf6, 0x34d399, 0xc6ff3d, 0xf472b6][k], roughness: .5 })); cab.scale.set(1.5, .75, .85); cab.position.set(-.02, .07, 0); tenis.add(cab);
        itens.push(tenis); ala.circ(x, z, .8);
      });
      manequim(sala, cx - 1.5, zC - 1, { corpo: 'masc', roupas: { camisa: 'camiseta-preta', calca: 'calca-preta', calcado: 'tenis-lima' } }, 'Look LAB Noir', .2, .4);
      manequim(sala, cx + 1.5, zC - 1, { corpo: 'fem', roupas: { camisa: 'top-freecrop', calca: 'japi-calca', calcado: 'bota-v' } }, 'Look LAB Night', -.2, .4);
      tela(sala, cx, 3.6, zC - sala.r + .4, 5.2, 1.4, texto('NEW LAB', { cor: '#ffffff', sub: 'DROP 01 · EM BREVE', corSub: '#34d399', w: 1600, h: 430 }));
      caixas.push({ nome: 'NEW LAB', ala, x: cx, z: zF - 5.2, olhaZ: zF - 7 });
      sala.update = (dt, t) => itens.forEach((it, k) => { it.rotation.y += dt * .6; it.position.y = 1.18 + Math.sin(t * 1.5 + k) * .03; });
    },
    vendas(sala) {
      const { cx, zC } = sala, zM = zF - 6.4;
      // mesa redonda da maquete
      const mesa = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.1, .9, 64), new THREE.MeshPhysicalMaterial({ color: 0xfbf9f5, roughness: .3, clearcoat: 1 })); mesa.position.set(cx, .45, zM); mesa.castShadow = true; sala.grupo.add(mesa);
      const fio = new THREE.Mesh(new THREE.TorusGeometry(2.31, .02, 6, 96), new THREE.MeshBasicMaterial({ color: 0xcdba9a, toneMapped: false })); fio.rotation.x = Math.PI / 2; fio.position.set(cx, .9, zM); sala.grupo.add(fio);
      ala.circ(cx, zM, 2.6);
      // MAQUETE (escala ~1:45): átrio hexagonal + 3 alas + lojas; etapa 2 em roxo translúcido (andar de cima + anel de trás)
      const maq = new THREE.Group(); maq.position.set(cx, .92, zM); sala.grupo.add(maq);
      const E = 1 / 45, mMaq = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .6 }), mVid = new THREE.MeshPhysicalMaterial({ color: 0xdfe8f2, roughness: .1, transparent: true, opacity: .55 });
      const hex = new THREE.Mesh(new THREE.CylinderGeometry(SH.apotema / Math.cos(Math.PI / 6) * E, SH.apotema / Math.cos(Math.PI / 6) * E, SH.tetoAtrio * E, 6), mVid); hex.rotation.y = Math.PI / 6; hex.position.y = SH.tetoAtrio * E / 2; maq.add(hex);
      const etapa1 = new THREE.Group(); maq.add(etapa1);
      [Math.PI, Math.PI / 3, -Math.PI / 3].forEach((ang, k) => {
        const a = new THREE.Group(); a.rotation.y = -ang; etapa1.add(a);
        const comp = k === 0 ? 30 : 52;
        const ala3 = new THREE.Mesh(new THREE.BoxGeometry(comp * E, SH.teto * E, SH.zAl * 2 * E), mVid); ala3.position.set((SH.apotema + comp / 2) * E, SH.teto * E / 2, 0); a.add(ala3);
        for (const lz of [-1, 1]) { const lj = new THREE.Mesh(new THREE.BoxGeometry((comp - 4) * E, SH.teto * E * .9, (k === 0 ? 4 : 13) * E), mMaq); lj.position.set((SH.apotema + comp / 2) * E, SH.teto * E * .45, lz * (SH.zAl + (k === 0 ? 2 : 6.5)) * E); lj.castShadow = true; a.add(lj); }
      });
      const mE2 = new THREE.MeshPhysicalMaterial({ color: 0x8b5cf6, roughness: .2, transparent: true, opacity: .42, emissive: 0x4c1d95, emissiveIntensity: .5, depthWrite: false });
      const etapa2 = new THREE.Group(); maq.add(etapa2);
      const cima = etapa1.clone(); cima.traverse(o => { if (o.isMesh) o.material = mE2; }); cima.position.y = SH.teto * E + .005; etapa2.add(cima);
      const anelR = 78 * E, anel = new THREE.Mesh(new THREE.TorusGeometry(anelR, 7 * E, 12, 96, Math.PI * .95), mE2); anel.rotation.x = -Math.PI / 2; anel.rotation.z = Math.PI * .52; anel.position.y = 4 * E; anel.scale.z = .7; etapa2.add(anel);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, .02, 64), new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: .9 })); base.position.y = -.01; maq.add(base);
      maq.scale.setScalar(1.15);
      // placas e telões
      tela(sala, cx, 3.2, zC - sala.r + .45, 5.6, 2.1, cvTex(1600, 600, (x, W, H) => { const gr = x.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#1d1430'); gr.addColorStop(1, '#4c1d95'); x.fillStyle = gr; x.fillRect(0, 0, W, H); x.fillStyle = '#c4b5fd'; x.font = '500 46px system-ui'; x.letterSpacing = '14px'; x.fillText('LANÇAMENTO', 90, 150); x.fillStyle = '#fff'; x.font = '700 120px system-ui'; x.letterSpacing = '4px'; x.fillText('Shopping NEW', 90, 290); x.font = '400 58px system-ui'; x.letterSpacing = '0px'; x.fillStyle = '#ede9fe'; x.fillText('Etapa 2 · piso superior + anel circular', 90, 400); x.fillStyle = '#34d399'; x.font = '600 46px system-ui'; x.fillText('Lojas a partir do lançamento · fale com a gente', 90, 500); }));
      [-1, 1].forEach(sx => {
        const txt = sx < 0 ? ['ETAPA 1', 'no ar agora', '3 alas · átrio', 'VANTRA · ATELIÊ · LE FERRI'] : ['ETAPA 2', 'em lançamento', 'piso superior', 'anel circular de trás'];
        tela(sala, cx + sx * (sala.r - .25), 2.6, zF - 3.6, 3, 1.9, cvTex(900, 570, (x, W, H) => { x.fillStyle = sx < 0 ? '#ffffff' : '#1d1430'; x.fillRect(0, 0, W, H); x.fillStyle = sx < 0 ? '#4c1d95' : '#c4b5fd'; x.font = '700 92px system-ui'; x.fillText(txt[0], 60, 140); x.font = '400 46px system-ui'; x.fillStyle = sx < 0 ? '#6b6480' : '#ede9fe'; x.fillText(txt[1], 60, 220); x.fillStyle = sx < 0 ? '#1d1430' : '#ffffff'; x.font = '500 50px system-ui'; x.fillText(txt[2], 60, 360); x.fillText(txt[3], 60, 440); }), -sx * Math.PI / 2);
      });
      balcao(sala, cx - 3.4, zC - .6, 0xf3efe8, 2.2);          // recepção num canto, sem tampar o portal
      // a maquete é clicável: alterna etapa 1 / etapa 1+2
      let mostra2 = true;
      const clic = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 1.6, 24), new THREE.MeshBasicMaterial({ visible: false })); clic.position.set(cx, 1.3, zM); sala.grupo.add(clic);
      clic.userData.clic = { tipo: 'acao', acao: () => { mostra2 = !mostra2; etapa2.visible = mostra2; aviso(mostra2 ? 'Maquete: etapa 1 + ETAPA 2 (roxo: piso superior e anel de trás)' : 'Maquete: só a etapa 1 (o que já está no ar)'); } };
      clicaveis.push(clic);
      sala.update = (dt, t) => { maq.rotation.y += dt * .12; mE2.opacity = .32 + Math.sin(t * 2) * .12; };
    },
    demo(sala) {
      const { cx, zC } = sala;
      // loja-modelo genérica: vitrine, manequim, arara, provador, caixa, agente, painel de dados — cada um com um número flutuante
      manequim(sala, cx - 3.4, zF - 2.6, { corpo: 'fem', roupas: { camisa: 'top-referencia', calca: 'calca-vacuo', calcado: 'bota-v' } }, 'Look de exemplo', .4);
      arara(sala, cx + 3.4, zF - 3.4, [0xf4a6b8, 0x8fc6f4, 0xffd36b, 0x9be0b0, 0xc9aef5], -1.2);
      // provador (cabine curva) e caixa
      const cab = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.6, 32, 1, true, 0, Math.PI * 1.5), new THREE.MeshStandardMaterial({ color: 0xede9fe, roughness: .7, side: THREE.DoubleSide })); cab.position.set(cx - 3.6, 1.3, zC - 1.4); cab.rotation.y = .6; sala.grupo.add(cab); ala.circ(cx - 3.6, zC - 1.4, 1.2);
      balcao(sala, cx + 2.8, zC - .8, 0xffffff, 2.2);
      const tv = tela(sala, cx, 3, zC - sala.r + .45, 4.4, 1.9, cvTex(1200, 520, (x, W, H) => { x.fillStyle = '#0f0c18'; x.fillRect(0, 0, W, H); x.fillStyle = '#c4b5fd'; x.font = '500 34px system-ui'; x.fillText('PAINEL DA SUA LOJA · HOJE', 50, 70); [['Visitas', '1.284'], ['Provaram', '312'], ['Compraram', '86'], ['Ticket', '142 m']].forEach(([k, v], j) => { x.fillStyle = '#8a83a0'; x.font = '400 30px system-ui'; x.fillText(k, 50 + j * 285, 160); x.fillStyle = '#fff'; x.font = '700 64px system-ui'; x.fillText(v, 50 + j * 285, 235); }); x.strokeStyle = '#34d399'; x.lineWidth = 6; x.beginPath(); for (let j = 0; j <= 20; j++) { const px = 50 + j * 55, py = 440 - (Math.sin(j * .7) * .5 + .5 + j / 30) * 120; j ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }));
      // marcadores numerados (sprites) — clicar mostra a explicação
      const PONTOS = [
        [cx - 3.4, 2.4, zF - 2.6, 'Vitrine e manequins', 'Cada look é clicável: a pessoa vê as peças, prova no corpo dela e põe na sacola.'],
        [cx + 3.4, 2.3, zF - 3.4, 'Arara com o catálogo', 'Seu catálogo real vira peças 3D. Preço, tamanho e estoque vêm do seu sistema.'],
        [cx - 3.6, 2.9, zC - 1.4, 'Provador com espelho', 'Câmera de espelho: veste, tira, compara. O que não pagar volta sozinho.'],
        [cx + 2.8, 1.9, zC - .8, 'Caixa da loja', 'Cada loja cobra no próprio caixa. Depois de pago, o robozinho leva a sacola com a sua marca.'],
        [cx, 4.4, zC - sala.r + .5, 'Painel de dados', 'Quem entrou, o que provou, o que comprou. Você acompanha tudo em tempo real.'],
        [cx, 2.2, zF - 6.5, 'Agente de IA da loja', 'Um vendedor virtual com a voz da sua marca: tira dúvida, indica look, leva até a peça.'],
      ];
      const marc = [];
      PONTOS.forEach(([x, y, z, tit, txt], k) => {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cvTex(128, 128, (c, W) => { c.fillStyle = '#4c1d95'; c.beginPath(); c.arc(64, 64, 56, 0, 7); c.fill(); c.strokeStyle = '#c4b5fd'; c.lineWidth = 6; c.stroke(); c.fillStyle = '#fff'; c.font = '700 64px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(k + 1), 64, 68); }), toneMapped: false, transparent: true }));
        sp.scale.setScalar(.5); sp.position.set(x, y, z); sp.renderOrder = 5; sala.grupo.add(sp); marc.push(sp);
        sp.userData.clic = { tipo: 'acao', acao: () => aviso(`${k + 1}. ${tit} — ${txt}`) }; clicaveis.push(sp);
      });
      // o "agente" do ponto 6: um totem com a onda NEW
      const tot = new THREE.Mesh(new THREE.CapsuleGeometry(.28, .9, 8, 20), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .2, clearcoat: 1 })); tot.position.set(cx, .75, zF - 6.5); tot.castShadow = true; sala.grupo.add(tot); ala.circ(cx, zF - 6.5, .5);
      const vis = new THREE.Mesh(new THREE.SphereGeometry(.2, 20, 12), new THREE.MeshBasicMaterial({ color: 0x8b5cf6, toneMapped: false })); vis.scale.set(1, .5, .4); vis.position.set(cx, 1.15, zF - 6.28); sala.grupo.add(vis);
      tot.userData.clic = { tipo: 'acao', acao: () => aviso('Agente da loja: "Oi! Posso te mostrar os looks da semana?" — aqui entra o vendedor de IA da sua marca.') }; clicaveis.push(tot);
      sala.update = (dt, t) => marc.forEach((m, k) => { m.position.y += Math.sin(t * 2 + k) * .002; m.material.opacity = .75 + Math.sin(t * 3 + k) * .25; });
      // cartaz de chamada
      sala.grupo.add(plano(3.2, .8, new THREE.MeshBasicMaterial({ map: texto('QUER UMA LOJA ASSIM?', { cor: '#4c1d95', fonte: '700 96px system-ui', esp: '6px', h: 240, sub: 'FALE COM A NEW', corSub: '#8b5cf6' }), transparent: true, toneMapped: false }), cx + sala.r - .2, 3.6, zF - 5, -Math.PI / 2));
    },
  };

  montaSalas();

  /* ===================== por frame: acende a sala em que a pessoa entra ===================== */
  let t = 0;
  function update(dt, J) {
    t += dt;
    const lx = J.pos.x * ala.c + J.pos.z * ala.s, lz = -J.pos.x * ala.s + J.pos.z * ala.c;
    for (const s of salas) {
      const dentro = lz < zF + 1.5 && lz > zB - .5 && Math.abs(lx - s.cx) < larg / 2;
      s.ativa += ((dentro ? 1 : .25) - s.ativa) * Math.min(1, dt * 2.5);
      s.anel.material.opacity = .15 + s.ativa * .85; s.rod.material.opacity = .15 + s.ativa * .85; s.luz.intensity = s.ativa * 22;
      if (s.update && s.ativa > .3) s.update(dt, t);
    }
  }
  return { update, destinos, lojas, caixas, salas };
}
