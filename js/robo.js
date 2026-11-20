// SHOPPING NEW — ROBOZINHO assistente (marca NEW): flutua atrás da personagem e carrega a sacola pendurada numa barrinha
// que ele segura na frente do corpo (a sacola nunca entra dentro dele). No peito, o símbolo da NEW (a onda de vidro verde→roxo).
import * as THREE from 'three';

const ROXO = 0x8b5cf6, ROXO_ESC = 0x4c1d95;

export function criaRobo({ J, scene, aviso }) {
  const g = new THREE.Group(); scene.add(g);
  const corpoG = new THREE.Group(); g.add(corpoG);
  const branco = new THREE.MeshPhysicalMaterial({ color: 0xf8f7f4, roughness: .16, clearcoat: 1, clearcoatRoughness: .06 });
  const cinza = new THREE.MeshStandardMaterial({ color: 0xd9dbe2, roughness: .4, metalness: .2 });
  const champ = new THREE.MeshStandardMaterial({ color: 0xcdba9a, metalness: .85, roughness: .28 });
  const roxo = new THREE.MeshPhysicalMaterial({ color: ROXO, roughness: .25, clearcoat: 1, emissive: ROXO_ESC, emissiveIntensity: .25 });
  const vidroEsc = new THREE.MeshPhysicalMaterial({ color: 0x0c0d14, roughness: .06, clearcoat: 1 });

  // ---- corpo: ovo arredondado com "cintura" cinza ----
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(.19, 40, 28), branco); corpo.scale.set(1, 1.15, .9); corpo.position.y = .28; corpo.castShadow = true; corpoG.add(corpo);
  const cint = new THREE.Mesh(new THREE.TorusGeometry(.172, .016, 10, 56), cinza); cint.rotation.x = Math.PI / 2; cint.scale.set(1, .9, 1); cint.position.y = .2; corpoG.add(cint);
  // ---- símbolo da NEW no peito: medalhão de vidro escuro + a onda verde→roxo + "NEW" ----
  {
    const md = new THREE.Mesh(new THREE.CircleGeometry(.085, 40), vidroEsc); md.position.set(0, .31, .171); md.rotation.x = -.12; corpoG.add(md);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(.086, .006, 8, 40), champ); aro.position.copy(md.position); aro.rotation.x = -.12; corpoG.add(aro);
    const pts = Array.from({ length: 24 }, (_, i) => { const t = i / 23, x = -.055 + .11 * t; return new THREE.Vector3(x, .012 + Math.sin(t * Math.PI * 1.6 - .5) * .022, 0); });
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .009, 10);
    const cores = []; const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) { const t = (pos.getX(i) + .06) / .12; const c = new THREE.Color(0x34d399).lerp(new THREE.Color(0xa78bfa), Math.min(1, Math.max(0, t))); cores.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));
    const onda = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })); onda.position.set(0, .325, .176); onda.rotation.x = -.12; corpoG.add(onda);
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#e9e4ff'; x.font = '600 40px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.letterSpacing = '10px'; x.fillText('NEW', 128, 34);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const tx = new THREE.Mesh(new THREE.PlaneGeometry(.08, .02), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false })); tx.position.set(0, .283, .177); tx.rotation.x = -.12; corpoG.add(tx);
  }
  // ---- cabeça: tela/visor com olhinhos + "fones" roxos ----
  const cab = new THREE.Group(); cab.position.y = .6; corpoG.add(cab);
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(.15, 40, 28), branco); cabeca.scale.set(1.2, .98, 1.02); cabeca.castShadow = true; cab.add(cabeca);
  const visor = new THREE.Mesh(new THREE.SphereGeometry(.142, 40, 20, -Math.PI * .36, Math.PI * .72, Math.PI * .3, Math.PI * .38), vidroEsc); visor.scale.set(1.2, 1, 1.06); cab.add(visor);
  const olhosCv = document.createElement('canvas'); olhosCv.width = 256; olhosCv.height = 128; const ok = olhosCv.getContext('2d'); const olhosTx = new THREE.CanvasTexture(olhosCv); olhosTx.colorSpace = THREE.SRGBColorSpace;
  let ultimo = '';
  const desenhaOlhos = (aberto, feliz) => {
    const chave = aberto + '|' + feliz; if (chave === ultimo) return; ultimo = chave;
    ok.clearRect(0, 0, 256, 128); ok.shadowColor = '#b9f3ff'; ok.shadowBlur = 18; ok.fillStyle = '#d9fbff';
    for (const cx of [86, 170]) { ok.beginPath(); if (feliz) { ok.lineWidth = 12; ok.strokeStyle = '#d9fbff'; ok.arc(cx, 72, 20, Math.PI * 1.1, Math.PI * 1.9); ok.stroke(); } else ok.ellipse(cx, 64, 15, 24 * aberto + 2, 0, 0, Math.PI * 2); ok.fill(); }
    olhosTx.needsUpdate = true;
  };
  desenhaOlhos(1, false);
  const olhos = new THREE.Mesh(new THREE.PlaneGeometry(.17, .085), new THREE.MeshBasicMaterial({ map: olhosTx, transparent: true, toneMapped: false, depthWrite: false })); olhos.position.set(0, .005, .152); cab.add(olhos);
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .04, 28), roxo); f.rotation.z = Math.PI / 2; f.position.set(s * .178, 0, 0); cab.add(f); const fa = new THREE.Mesh(new THREE.TorusGeometry(.045, .006, 8, 28), champ); fa.rotation.y = Math.PI / 2; fa.position.set(s * .199, 0, 0); cab.add(fa); }
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(.005, .005, .08, 8), champ); ant.position.y = .175; cab.add(ant);
  const luzAnt = new THREE.Mesh(new THREE.SphereGeometry(.02, 14, 10), new THREE.MeshBasicMaterial({ color: 0xc4b5fd, toneMapped: false })); luzAnt.position.y = .22; cab.add(luzAnt);

  // ---- braços: seguram uma barrinha champanhe na frente; a sacola pendura nela ----
  const ombroY = .36, frente = .31;
  const bracos = [-1, 1].map(s => {
    const b = new THREE.Group(); b.position.set(s * .19, ombroY, .02); corpoG.add(b);
    const junta = new THREE.Mesh(new THREE.SphereGeometry(.04, 16, 12), cinza); b.add(junta);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(.028, .16, 4, 12), branco); m.rotation.x = Math.PI / 2; m.position.set(0, 0, .11); b.add(m);
    const mao = new THREE.Mesh(new THREE.SphereGeometry(.034, 14, 12), champ); mao.position.set(-s * .03, 0, .22); b.add(mao);
    return b;
  });
  const barra = new THREE.Mesh(new THREE.CylinderGeometry(.009, .009, .3, 10), champ); barra.rotation.z = Math.PI / 2; barra.position.set(0, ombroY - .02, frente - .07); corpoG.add(barra);
  const gancho = new THREE.Mesh(new THREE.TorusGeometry(.022, .004, 6, 16, Math.PI * 1.3), champ); gancho.position.set(0, ombroY - .045, frente - .07); gancho.rotation.z = Math.PI * .85; corpoG.add(gancho);
  // ponto da sacola: logo abaixo do gancho, na frente do corpo (fora dele)
  const ponto = new THREE.Object3D(); ponto.position.set(0, ombroY - .06, frente - .07); corpoG.add(ponto);

  // ---- flutuação: anel roxo aceso + luz embaixo + sombra ----
  const anel = new THREE.Mesh(new THREE.TorusGeometry(.1, .012, 8, 40), new THREE.MeshBasicMaterial({ color: 0xc4b5fd, toneMapped: false })); anel.rotation.x = Math.PI / 2; anel.position.y = .07; corpoG.add(anel);
  const brilho = new THREE.Mesh(new THREE.CircleGeometry(.14, 28), new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: .3, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending })); brilho.rotation.x = Math.PI / 2; brilho.position.y = .065; corpoG.add(brilho);
  const sombra = new THREE.Mesh(new THREE.CircleGeometry(.2, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .13, depthWrite: false })); sombra.rotation.x = -Math.PI / 2; g.add(sombra);

  const pos = new THREE.Vector3(J.pos.x, J.pos.y, J.pos.z), alvo = new THREE.Vector3(); let rumo = 0, t = 0, carregando = false, pisca = 0, feliz = 0;
  g.position.copy(pos);
  function update(dt) {
    t += dt;
    const lx = Math.cos(J.rumo), lz = -Math.sin(J.rumo), fx = Math.sin(J.rumo), fz = Math.cos(J.rumo);
    alvo.set(J.pos.x - lx * .8 - fx * .65, J.pos.y, J.pos.z - lz * .8 - fz * .65);
    if (pos.distanceTo(alvo) > 8) pos.copy(alvo);
    const antes = pos.clone(); pos.lerp(alvo, 1 - Math.exp(-dt * 3.2));
    const mov = pos.clone().sub(antes); const v = mov.length() / Math.max(dt, 1e-3);
    const quer = v > .25 ? Math.atan2(mov.x, mov.z) : Math.atan2(J.pos.x - pos.x, J.pos.z - pos.z);
    let d = quer - rumo; d = Math.atan2(Math.sin(d), Math.cos(d)); rumo += d * (1 - Math.exp(-dt * 6));
    const bob = Math.sin(t * 2.4) * .03, alt = .5;
    g.position.set(pos.x, pos.y + alt + bob, pos.z); g.rotation.y = rumo;
    corpoG.rotation.z = -d * .2; corpoG.rotation.x = Math.min(.18, v * .05) - (carregando ? .06 : 0);
    sombra.position.y = -(alt + bob) + .02; sombra.scale.setScalar(1 - bob * 2);
    brilho.material.opacity = .22 + Math.sin(t * 9) * .07; anel.scale.setScalar(1 + Math.sin(t * 4) * .04);
    // braços: pra frente segurando a barrinha quando carrega; soltos e balançando quando não
    bracos.forEach((b, i) => { const ax = carregando ? 0 : 1.2 + Math.sin(t * 2 + i * 3) * .1; b.rotation.x += (ax - b.rotation.x) * Math.min(1, dt * 6); });
    barra.visible = gancho.visible = carregando;
    // olhinhos: piscam; ficam "felizes" um tempinho quando começa a carregar
    pisca -= dt; if (pisca < 0) pisca = 2.5 + Math.random() * 3;
    if (feliz > 0) { feliz -= dt; desenhaOlhos(1, true); } else desenhaOlhos(pisca < .12 ? .12 : 1, false);
    cab.rotation.y = Math.sin(t * .7) * .22;
    atualizaDrone(dt);
  }

  /* ===================== EMBALAGENS: uma sacola da marca por peça comprada ===================== */
  const MARCAS = {
    'ATELIÊ': { papel: '#f4ede0', texto: '#8f7a55', fonte: '400 46px "Bodoni Moda", Didot, serif', ls: 10, alca: 0xc9b38a, linha: '#c9b38a' },
    'LE FERRI': { papel: '#0b0b0c', texto: '#f3efe8', fonte: '400 40px "Bodoni Moda", Didot, serif', ls: 12, alca: 0xcdba9a, linha: '#cdba9a' },
    'VANTRA': { papel: '#23262c', texto: '#d4ff3a', fonte: '800 44px system-ui, sans-serif', ls: 8, alca: 0xd4ff3a, linha: '#d4ff3a' },
  };
  const PADRAO = { papel: '#ffffff', texto: '#7c3aed', fonte: '600 48px system-ui, sans-serif', ls: 10, alca: 0x8b5cf6, linha: '#a78bfa' };
  const texCache = {};
  const texSacola = loja => {
    if (texCache[loja]) return texCache[loja];
    const m = MARCAS[loja] || PADRAO, c = document.createElement('canvas'); c.width = 256; c.height = 300; const x = c.getContext('2d'); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const d = () => { x.fillStyle = m.papel; x.fillRect(0, 0, 256, 300); x.fillStyle = m.texto; x.font = m.fonte; x.textAlign = 'center'; x.textBaseline = 'middle'; x.letterSpacing = m.ls + 'px'; x.fillText(MARCAS[loja] ? loja : 'NEW', 128, 150); x.fillStyle = m.linha; x.fillRect(88, 186, 80, 3); t.needsUpdate = true; };
    d(); document.fonts && document.fonts.ready.then(d);
    return (texCache[loja] = t);
  };
  const fazSacola = loja => {
    const m = MARCAS[loja] || PADRAO, b = new THREE.Group();
    const papel = new THREE.MeshStandardMaterial({ color: m.papel, roughness: loja === 'LE FERRI' ? .35 : .85 }), frente = new THREE.MeshStandardMaterial({ map: texSacola(loja), roughness: loja === 'LE FERRI' ? .35 : .85 });
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(.3, .34, .12), [papel, papel, papel, papel, frente, frente]); corpo.position.y = -.25; corpo.castShadow = true; b.add(corpo);
    const alca = new THREE.Mesh(new THREE.TorusGeometry(.06, .006, 6, 20, Math.PI), new THREE.MeshStandardMaterial({ color: m.alca, roughness: .4, metalness: .3 })); alca.position.y = -.08; b.add(alca);
    return b;
  };
  const CHAVE = 'new_embalagens_v1';
  let sacolas = []; try { sacolas = JSON.parse(sessionStorage.getItem(CHAVE)) || []; } catch (e) {}
  const grava = () => { try { sessionStorage.setItem(CHAVE, JSON.stringify(sacolas)); } catch (e) {} };
  const NO_ROBO = 4, NO_DRONE = 10;
  // vagas no robô: penduradas na barrinha (escalonadas pra não se atravessarem)
  const vagasRobo = [[-.1, 0], [.1, 0], [-.03, .045], [.05, .07]];
  const meshesRobo = [], meshesDrone = [];
  const montaSacolas = () => {
    meshesRobo.forEach(m => m.parent && m.parent.remove(m)); meshesRobo.length = 0;
    meshesDrone.forEach(m => m.parent && m.parent.remove(m)); meshesDrone.length = 0;
    sacolas.slice(0, NO_ROBO).forEach((s, i) => { const b = fazSacola(s.loja); b.scale.setScalar(.5); const [dx, dz] = vagasRobo[i]; b.position.set(dx, ombroY - .035, frente - .07 + dz); b.rotation.y = (i % 2 ? .12 : -.1); corpoG.add(b); meshesRobo.push(b); });
    sacolas.slice(NO_ROBO, NO_ROBO + NO_DRONE).forEach((s, i) => { const b = fazSacola(s.loja); b.scale.setScalar(.55); const fila = i % 5, linha = Math.floor(i / 5); b.position.set(-.24 + fila * .12, -.12 - linha * .02, -.06 + linha * .14); b.rotation.y = (i % 2 ? .15 : -.12); drone.add(b); meshesDrone.push(b); });
    carregando = sacolas.length > 0;
  };
  function recebe(loja, n = 1, ids = []) {
    const antes = sacolas.length, quando = Date.now();
    for (let i = 0; i < n; i++) sacolas.push({ loja, id: ids[i] || null, quando });
    grava(); montaSacolas(); feliz = 1.8;
    if (antes <= NO_ROBO && sacolas.length > NO_ROBO) { droneChega = true; aviso && aviso('Muita sacola! O robozinho chamou um drone pra ajudar'); }
  }

  /* ===================== DRONE (chega voando quando passa de 4 sacolas) ===================== */
  const drone = new THREE.Group(); drone.visible = false; scene.add(drone);
  {
    const corpo = new THREE.Mesh(new THREE.SphereGeometry(.2, 32, 16), branco); corpo.scale.set(1.25, .45, 1.25); drone.add(corpo);
    const faixa = new THREE.Mesh(new THREE.TorusGeometry(.248, .012, 8, 48), new THREE.MeshBasicMaterial({ color: 0xc4b5fd, toneMapped: false })); faixa.rotation.x = Math.PI / 2; drone.add(faixa);
    const olhoD = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 10), vidroEsc); olhoD.position.set(0, -.04, .22); drone.add(olhoD);
    const luzD = new THREE.Mesh(new THREE.SphereGeometry(.018, 10, 8), new THREE.MeshBasicMaterial({ color: 0xbff3ff, toneMapped: false })); luzD.position.set(0, -.04, .265); drone.add(luzD);
    drone.userData.helices = [];
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + k * Math.PI / 2, bx = Math.cos(a) * .42, bz = Math.sin(a) * .42;
      const braco = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, .32, 8), cinza); braco.rotation.z = Math.PI / 2; braco.rotation.y = -a; braco.position.set(Math.cos(a) * .27, 0, Math.sin(a) * .27); drone.add(braco);
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .05, 16), roxo); motor.position.set(bx, .02, bz); drone.add(motor);
      const helice = new THREE.Group(); helice.position.set(bx, .06, bz); drone.add(helice);
      for (const r of [0, Math.PI / 2]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.3, .006, .035), champ); p.rotation.y = r; helice.add(p); }
      const disco = new THREE.Mesh(new THREE.CircleGeometry(.16, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .08, depthWrite: false })); disco.rotation.x = -Math.PI / 2; helice.add(disco);
      drone.userData.helices.push(helice);
    }
    // fios onde as sacolas ficam penduradas
    const fio = new THREE.Mesh(new THREE.BoxGeometry(.6, .006, .006), cinza); fio.position.y = -.1; drone.add(fio);
    const fio2 = fio.clone(); fio2.position.z = .14; fio2.position.y = -.12; drone.add(fio2);
  }
  const dPos = new THREE.Vector3(); let droneChega = false, dIni = false;
  function atualizaDrone(dt) {
    const precisa = sacolas.length > NO_ROBO; drone.visible = precisa;
    if (!precisa) { dIni = false; return; }
    const alvoD = new THREE.Vector3(g.position.x - Math.sin(rumo) * .35, g.position.y + 1.25 + Math.sin(t * 1.7) * .05, g.position.z - Math.cos(rumo) * .35);
    if (!dIni || droneChega) { dPos.copy(alvoD).add(new THREE.Vector3(0, 7, 0)); dIni = true; droneChega = false; }
    if (dPos.distanceTo(alvoD) > 12) dPos.copy(alvoD);
    dPos.lerp(alvoD, 1 - Math.exp(-dt * 2.2));
    drone.position.copy(dPos); drone.rotation.y = rumo; drone.rotation.z = Math.sin(t * 1.3) * .04;
    drone.userData.helices.forEach((h, i) => { h.rotation.y += dt * (40 + i * 3); });
  }
  montaSacolas();
  return { update, ponto, grupo: g, recebe, lista: () => sacolas.slice(), corpo: corpoG, sacolas: () => sacolas.length, carrega() {}, limpa() { sacolas = []; grava(); montaSacolas(); } };
}
