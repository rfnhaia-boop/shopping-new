// SHOPPING NEW — camada ORGÂNICA das alas (pra não ficar "caixa"): abóbada curva no teto com claraboia e nervuras,
// sanca de luz nas duas laterais, ilhas em forma de cápsula no meio do corredor (jardim + banco curvo) e
// um anel de luz suspenso no átrio. Tudo em coordenadas locais de cada ala (x ao longo, z de lado).
import * as THREE from 'three';
import { SH } from './planta.js';

export function interiorOrganico(scene, alas) {
  const { apotema, teto, zAl } = SH;
  const mAbobada = new THREE.MeshStandardMaterial({ color: 0xfbfaf8, roughness: .85, side: THREE.DoubleSide, emissive: 0xfffaf2, emissiveIntensity: .28 });
  const mNerv = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .5 });
  const mLuz = new THREE.MeshBasicMaterial({ color: 0xfff6ea, toneMapped: false });
  const mClara = new THREE.MeshBasicMaterial({ color: 0xeaf4ff, toneMapped: false });
  const mPedra = new THREE.MeshPhysicalMaterial({ color: 0xf1ede6, roughness: .35, clearcoat: .6 });
  const mMadeira = new THREE.MeshStandardMaterial({ color: 0xd9bf98, roughness: .6 });
  const mFolha = [0x5f8f5a, 0x6fa267, 0x4f7d4c].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .85 }));
  const mRoxo = new THREE.MeshBasicMaterial({ color: 0xa78bfa, toneMapped: false });

  // abóbada: arco de círculo atravessando a ala (corda = 2·zAl, flecha f), eixo ao longo de x
  const f = 1.7, r = (zAl * zAl + f * f) / (2 * f), th = 2 * Math.asin(zAl / r), yC = teto - .02 - r, ySpring = teto - .02 - f;

  // pílula (cápsula achatada) como Shape
  const pilula = (comp, larg) => { const s = new THREE.Shape(), rr = larg / 2, a = comp / 2 - rr; s.moveTo(-a, -rr); s.lineTo(a, -rr); s.absarc(a, 0, rr, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-a, rr); s.absarc(-a, 0, rr, Math.PI / 2, Math.PI * 1.5, false); return s; };

  Object.values(alas).forEach(a => {
    const L = a.comp, x0 = apotema, g = a.g, cx = x0 + L / 2;
    // casca da abóbada
    const geo = new THREE.CylinderGeometry(r, r, L, 64, 1, true, -th / 2, th); geo.rotateX(-Math.PI / 2); geo.rotateY(Math.PI / 2);   // arco pra cima, eixo ao longo de x
    const ab = new THREE.Mesh(geo, mAbobada); ab.position.set(cx, yC, 0); ab.receiveShadow = true; g.add(ab);
    // claraboia contínua no topo + nervuras em arco a cada 6 m
    const clar = new THREE.Mesh(new THREE.PlaneGeometry(L - 1, 2.2), mClara); clar.rotation.x = Math.PI / 2; clar.position.set(cx, teto - .03, 0); g.add(clar);
    for (let k = 0; k * 6 <= L - 2; k++) {
      const ng = new THREE.TorusGeometry(r - .03, .07, 6, 40, th); ng.rotateZ(Math.PI / 2 - th / 2); ng.rotateY(Math.PI / 2);
      const nv = new THREE.Mesh(ng, mNerv); nv.position.set(x0 + 2 + k * 6, yC, 0); g.add(nv);
    }
    // sanca de luz nas laterais, no "pé" da abóbada
    for (const sz of [-1, 1]) {
      const sanca = new THREE.Mesh(new THREE.BoxGeometry(L - .4, .06, .06), mLuz); sanca.position.set(cx, ySpring - .05, sz * (zAl - .25)); g.add(sanca);
      const aba = new THREE.Mesh(new THREE.BoxGeometry(L - .4, .04, .45), mNerv); aba.position.set(cx, ySpring - .2, sz * (zAl - .3)); g.add(aba);
    }
    // ILHAS: cápsula de pedra com jardim e banco curvo de madeira dos dois lados
    const ilhas = a.id === 'entrada' ? [x0 + 10] : [x0 + 12, x0 + 30, x0 + 46];
    ilhas.forEach((ix, n) => {
      const comp = 5.2, larg = 1.25;
      const base = new THREE.Mesh(new THREE.ExtrudeGeometry(pilula(comp, larg), { depth: .5, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, curveSegments: 24 }), mPedra);
      base.rotation.x = -Math.PI / 2; base.position.set(ix, 0, 0); base.castShadow = base.receiveShadow = true; g.add(base);
      const fio = new THREE.Mesh(new THREE.ExtrudeGeometry(pilula(comp + .14, larg + .14), { depth: .02, bevelEnabled: false, curveSegments: 24 }), mRoxo); fio.rotation.x = -Math.PI / 2; fio.position.set(ix, .015, 0); g.add(fio);
      const terra = new THREE.Mesh(new THREE.ExtrudeGeometry(pilula(comp - .3, larg - .3), { depth: .02, bevelEnabled: false, curveSegments: 20 }), new THREE.MeshStandardMaterial({ color: 0x5a4636, roughness: 1 })); terra.rotation.x = -Math.PI / 2; terra.position.set(ix, .57, 0); g.add(terra);
      for (let k = 0; k < 9; k++) { const t = k / 8 - .5, fo = new THREE.Mesh(new THREE.IcosahedronGeometry(.32 + (k % 3) * .1, 1), mFolha[(k + n) % 3]); fo.position.set(ix + t * (comp - 1.4), .8 + (k % 2) * .18, ((k * 37) % 5 - 2) * .08); fo.scale.y = .8; fo.castShadow = true; g.add(fo); }
      // arvorezinha no meio (tronco + copa)
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, 2.2, 8), mMadeira); tr.position.set(ix, 1.6, 0); g.add(tr);
      const copa = new THREE.Mesh(new THREE.IcosahedronGeometry(.9, 1), mFolha[n % 3]); copa.position.set(ix, 3, 0); copa.scale.set(1.2, .85, 1.2); copa.castShadow = true; g.add(copa);
      // bancos curvos encostados na ilha (assento de madeira acompanhando a curva da ponta)
      for (const sx of [-1, 1]) {
        const banco = new THREE.Mesh(new THREE.TorusGeometry(larg / 2 + .32, .17, 6, 24, Math.PI), mMadeira);
        banco.rotation.x = -Math.PI / 2; banco.rotation.z = sx > 0 ? -Math.PI / 2 : Math.PI / 2; banco.scale.z = .35; banco.position.set(ix + sx * (comp / 2 - larg / 2), .45, 0); banco.castShadow = true; g.add(banco);
      }
      a.ret(ix - comp / 2 - .45, ix + comp / 2 + .45, -larg / 2 - .3, larg / 2 + .3);
    });
  });

  // ÁTRIO: anel de luz suspenso + segundo anel menor, girando devagar (é o "lustre" do shopping)
  const aneis = [];
  [[9.5, 11.6, .09], [6.8, 10.8, .06]].forEach(([rr, y, e], i) => {
    const an = new THREE.Mesh(new THREE.TorusGeometry(rr, e, 10, 160), mNerv); an.rotation.x = Math.PI / 2; an.position.y = y; scene.add(an);
    const lz = new THREE.Mesh(new THREE.TorusGeometry(rr, e * .45, 6, 160), mLuz); lz.rotation.x = Math.PI / 2; lz.position.y = y - e; scene.add(lz);
    for (let k = 0; k < 6; k++) { const ang = k * Math.PI / 3 + i * .5, cb = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, SH.tetoAtrio - y, 4), mNerv); cb.position.set(Math.cos(ang) * rr, (SH.tetoAtrio + y) / 2, Math.sin(ang) * rr); scene.add(cb); }
    aneis.push(an, lz);
  });
  return { update(dt) { aneis.forEach((a, i) => { a.rotation.z += dt * (i < 2 ? .03 : -.04); }); } };
}
