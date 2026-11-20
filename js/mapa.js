// SHOPPING NEW — minimapa (canto da tela) que abre o MAPA inteiro do lugar. Mostra átrio, alas, a loja VANTRA, as vitrines "em breve", você e o pessoal andando.
// Clicar numa região da VANTRA no mapa grande leva você até a porta dela.
import { SH, ALAS, EM_BREVE, VANTRA, ATELIE, LEFERRI, COR_BREVE } from './planta.js';

export function criaMapa({ J, npcs, irPara }) {
  const R6 = SH.apotema / Math.cos(Math.PI / 6), zAl = SH.zAl;
  const w = (a, x, z) => ({ x: x * Math.cos(a.ang) - z * Math.sin(a.ang), z: x * Math.sin(a.ang) + z * Math.cos(a.ang) });
  const rect = (a, x0, x1, z0, z1) => [w(a, x0, z0), w(a, x1, z0), w(a, x1, z1), w(a, x0, z1)];
  const hex = []; for (let k = 0; k < 6; k++) { const an = Math.PI / 6 + k * Math.PI / 3; hex.push({ x: Math.cos(an) * R6, z: Math.sin(an) * R6 }); }
  // formas do mapa (em metros)
  const formas = [];
  const ala = id => ALAS.find(a => a.id === id);
  ALAS.forEach(a => formas.push({ tipo: 'ala', nome: a.nome, pts: rect(a, SH.apotema - .5, SH.apotema + a.comp, -zAl, zAl), cor: '#eceae4', borda: '#cdbf9f' }));
  const av = ala(VANTRA.ala);
  formas.push({ tipo: 'vantra', nome: 'VANTRA', sub: 'loja âncora · moda', pts: rect(av, VANTRA.x0, VANTRA.x0 + VANTRA.w, zAl, zAl + VANTRA.d), cor: '#e4f6a8', borda: '#a9c93a' });
  { const lf = ala(LEFERRI.ala); formas.push({ tipo: 'vantra', nome: 'LE FERRI', sub: 'maison · portal pro mundo da marca', pts: rect(lf, LEFERRI.x0, LEFERRI.x0 + LEFERRI.w, -zAl - LEFERRI.d, -zAl), cor: '#1a1a1a', borda: '#cdba9a' }); }
  { const at = ala(ATELIE.ala); formas.push({ tipo: 'vantra', nome: 'ATELIÊ', sub: 'nova loja · em construção', pts: rect(at, ATELIE.x0, ATELIE.x0 + ATELIE.w, zAl, zAl + ATELIE.d), cor: '#f1ece2', borda: '#b9a98a' }); }
  ALAS.forEach(a => {
    const lista = EM_BREVE[a.id] || {};
    for (const lad of [-1, 1]) {
      if ((a.id === VANTRA.ala && lad === VANTRA.lado) || (a.id === ATELIE.ala && lad === ATELIE.lado) || (a.id === LEFERRI.ala && lad === LEFERRI.lado)) continue;
      const nomes = lista[String(lad)] || [], slot = (a.comp - 6) / Math.max(nomes.length, 1);
      nomes.forEach((nome, i) => {
        const x0 = SH.apotema + 3 + slot * i, z0 = lad > 0 ? zAl : -zAl - 7, z1 = lad > 0 ? zAl + 7 : -zAl;
        formas.push({ tipo: 'breve', nome, sub: 'em breve', pts: rect(a, x0 + .3, x0 + slot - .3, z0, z1), cor: COR_BREVE[(i + (lad > 0 ? 3 : 0)) % COR_BREVE.length], borda: '#ffffff', suave: true });
      });
    }
  });
  const todos = [...hex, ...formas.flatMap(f => f.pts)];
  const mn = { x: Math.min(...todos.map(p => p.x)) - 6, z: Math.min(...todos.map(p => p.z)) - 6 }, mx = { x: Math.max(...todos.map(p => p.x)) + 6, z: Math.max(...todos.map(p => p.z)) + 6 };
  const cx = (mn.x + mx.x) / 2, cz = (mn.z + mx.z) / 2, sx = mx.x - mn.x, sz = mx.z - mn.z;

  const desenha = (ctx, W, H, grande) => {
    const esc = Math.min(W / sx, H / sz), px = p => W / 2 + (p.x - cx) * esc, py = p => H / 2 + (p.z - cz) * esc;
    ctx.clearRect(0, 0, W, H);
    const poli = (pts, fill, stroke, lw) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(px(p), py(p)) : ctx.moveTo(px(p), py(p)))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); };
    formas.forEach(f => poli(f.pts, f.cor, f.borda, grande ? 2 : 1));
    poli(hex, '#f6efe0', '#c8b07a', grande ? 3 : 1.5);
    // entrada: seta pra praça
    const en = ala('entrada'), pe = w(en, SH.apotema + en.comp + 4, 0), pf = w(en, SH.apotema + en.comp - 1, 0);
    ctx.fillStyle = '#1D9E75'; ctx.beginPath(); ctx.moveTo(px(pe), py(pe)); ctx.lineTo(px(pf) , py(pf) - 7 * (grande ? 1.6 : 1)); ctx.lineTo(px(pf), py(pf) + 7 * (grande ? 1.6 : 1)); ctx.fill();
    if (grande) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      formas.forEach(f => {
        const m = f.pts.reduce((s, p) => ({ x: s.x + p.x / 4, z: s.z + p.z / 4 }), { x: 0, z: 0 });
        ctx.fillStyle = f.tipo === 'breve' ? 'rgba(255,255,255,.95)' : '#223'; ctx.font = f.tipo === 'vantra' ? '800 30px system-ui' : f.tipo === 'ala' ? '600 15px system-ui' : '700 15px system-ui';
        if (f.tipo === 'ala') { ctx.fillStyle = 'rgba(80,80,70,.55)'; }
        ctx.fillText(f.nome, px(m), py(m) - (f.sub ? 8 : 0)); if (f.sub) { ctx.font = '600 12px ui-monospace,Consolas,monospace'; ctx.fillText(f.sub.toUpperCase(), px(m), py(m) + 14); }
      });
      ctx.fillStyle = '#8a7a4f'; ctx.font = '700 18px system-ui'; ctx.fillText('ÁTRIO', px({ x: 0, z: 7 }), py({ x: 0, z: 7 }));
      ctx.fillStyle = '#1D9E75'; ctx.font = '700 15px system-ui'; ctx.fillText('ENTRADA · praça', px(pe), py(pe) - 16);
    }
    return { esc, px, py };
  };

  const pequeno = document.querySelector('#mini-c'), grande = document.querySelector('#mapa-c');
  const cp = pequeno.getContext('2d'), cg = grande.getContext('2d');
  const base = c => { const o = document.createElement('canvas'); o.width = c.width; o.height = c.height; return o; };
  const bp = base(pequeno), bg = base(grande);
  const gp = desenha(bp.getContext('2d'), pequeno.width, pequeno.height, false), gg = desenha(bg.getContext('2d'), grande.width, grande.height, true);

  const pontos = (ctx, g, grandeMapa) => {
    for (const n of npcs) { const p = n.ala.mundo(n.x, n.z); ctx.fillStyle = n.p.cfg && n.p.cfg.corpo === 'masc' ? '#378ADD' : '#D4537E'; ctx.beginPath(); ctx.arc(g.px(p), g.py(p), grandeMapa ? 4 : 2, 0, 6.3); ctx.fill(); }
    const x = g.px(J.pos), y = g.py(J.pos), r = grandeMapa ? 9 : 5;
    ctx.fillStyle = '#d4ff3a'; ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(J.rumo) * r * 2.2, y + Math.cos(J.rumo) * r * 2.2); ctx.stroke();   // direção
  };
  const mini = document.querySelector('#mini'), mapa = document.querySelector('#mapa');
  const abre = () => { mapa.classList.add('on'); }; const fecha = () => { mapa.classList.remove('on'); };
  mini.onclick = abre; document.querySelector('#m-fecha').onclick = fecha;
  mapa.addEventListener('click', e => { if (e.target === mapa) fecha(); });
  addEventListener('keydown', e => { if (e.code === 'KeyM') mapa.classList.toggle('on'); if (e.code === 'Escape') fecha(); });
  // clicar na VANTRA no mapa grande: leva até a porta dela
  grande.addEventListener('click', e => {
    const r = grande.getBoundingClientRect(), x = (e.clientX - r.left) * grande.width / r.width, y = (e.clientY - r.top) * grande.height / r.height;
    const wx = (x - grande.width / 2) / gg.esc + cx, wz = (y - grande.height / 2) / gg.esc + cz;
    const c = Math.cos(-av.ang), s = Math.sin(-av.ang), lx = wx * c - wz * s, lz = wx * s + wz * c;
    if (lx > VANTRA.x0 && lx < VANTRA.x0 + VANTRA.w && lz > zAl && lz < zAl + VANTRA.d) { const m = w(av, VANTRA.x0 + VANTRA.w * .72, zAl - 3); irPara(m.x, m.z, av.ang + Math.PI / 2); fecha(); }
  });
  let t = 0;
  return { update(dt) {
    t += dt; if (t < .1) return; t = 0;
    cp.clearRect(0, 0, pequeno.width, pequeno.height); cp.drawImage(bp, 0, 0); pontos(cp, gp, false);
    if (mapa.classList.contains('on')) { cg.clearRect(0, 0, grande.width, grande.height); cg.drawImage(bg, 0, 0); pontos(cg, gg, true); }
  } };
}
