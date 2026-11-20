// SHOPPING NEW — MEU CLOSET. Tudo que a personagem tem (grátis + comprado) por tipo de peça; clique veste na hora.
// Aba "Personagem": troca corpo (mulher/homem) e, no homem, pele, cabelo, cor do cabelo e barba. Salva no Perfil global.
import { CATALOGO_ROUPAS, SLOTS, KIT_INICIAL } from '../../shared/personagem/guarda-roupa.js';
import { PELES, CABELOS, CORES_CABELO, BARBAS, PADRAO, MODELOS } from '../../shared/personagem/personagem.js';
import { Perfil } from '../../shared/personagem/perfil.js';

const $ = s => document.querySelector(s);
const item = id => CATALOGO_ROUPAS.find(r => r.id === id);

export function criaCloset({ J, aviso, sacola, trocaPersonagem }) {
  const painel = $('#closet'); let aba = 'roupas', ocupado = false;
  const salva = () => { const p = Perfil.ler() || {}; Perfil.salvar({ nome: p.nome || 'Visitante', cfg: { ...J.p.cfg, roupas: { ...J.p.cfg.roupas } } }); };
  const meu = r => !r.preco || Perfil.possui(r.id, r.preco);
  const serve = (r, corpo) => !r.corpos || r.corpos.includes(corpo);

  function desenha() {
    if (!J.p) return;
    document.querySelectorAll('#closet .cl-aba').forEach(b => b.classList.toggle('on', b.dataset.aba === aba));
    const cfg = J.p.cfg, corpo = cfg.corpo, alvo = $('#cl-corpo');
    if (aba === 'roupas') {
      alvo.innerHTML = SLOTS.map(sl => {
        const meus = CATALOGO_ROUPAS.filter(r => r.slot === sl.id && r.id !== 'nenhum' && (meu(r) || cfg.roupas[sl.id] === r.id || (cfg._usadas || []).includes(r.id)));
        const chips = meus.map(r => { const ok = serve(r, corpo), v = cfg.roupas[sl.id] === r.id; return `<button class="cl-peca ${v ? 'on' : ''}" data-slot="${sl.id}" data-id="${r.id}" ${ok ? '' : 'disabled title="Não serve nesse corpo"'}><i style="background:${r.cor || '#ccc'}"></i>${r.nome.replace(/ \(CLO, teste\)/, '')}</button>`; }).join('');
        const sem = sl.id === 'casaco' ? `<button class="cl-peca ${!cfg.roupas.casaco || cfg.roupas.casaco === 'nenhum' ? 'on' : ''}" data-slot="casaco" data-id="nenhum"><i style="background:transparent;border:1px dashed #aaa"></i>Sem casaco</button>` : '';
        return (meus.length || sem) ? `<div class="cl-grupo"><div class="mono">${sl.nome}</div><div class="cl-pecas">${sem}${chips}</div></div>` : '';
      }).join('') + `<p class="mono cl-nota">${Perfil.ler() && Perfil.ler().compras.length ? '' : 'Compre peças nas lojas e elas aparecem aqui.'}</p>`;
    } else {
      const proprio = MODELOS[corpo] && MODELOS[corpo].proprio;
      const bolinhas = (lista, chave) => lista.map(c => `<button class="cl-cor ${cfg[chave] === c ? 'on' : ''}" data-k="${chave}" data-v="${c}" style="background:${c}" aria-label="${c}"></button>`).join('');
      alvo.innerHTML = `<div class="cl-grupo"><div class="mono">Corpo</div><div class="cl-pecas">
          <button class="cl-peca ${corpo === 'fem' ? 'on' : ''}" data-k="corpo" data-v="fem">Mulher</button><button class="cl-peca ${corpo === 'masc' ? 'on' : ''}" data-k="corpo" data-v="masc">Homem</button></div></div>` +
        (proprio ? '<p class="mono cl-nota">O corpo feminino realista já vem com pele e cabelo próprios. Mais opções dela chegam com o criador novo.</p>' :
        `<div class="cl-grupo"><div class="mono">Pele</div><div class="cl-cores">${bolinhas(PELES, 'pele')}</div></div>
         <div class="cl-grupo"><div class="mono">Cabelo</div><div class="cl-pecas">${CABELOS.filter(c => c.para.includes(corpo)).map(c => `<button class="cl-peca ${cfg.cabelo === c.id ? 'on' : ''}" data-k="cabelo" data-v="${c.id}">${c.nome}</button>`).join('')}</div></div>
         <div class="cl-grupo"><div class="mono">Cor do cabelo</div><div class="cl-cores">${bolinhas(CORES_CABELO, 'corCabelo')}</div></div>
         <div class="cl-grupo"><div class="mono">Barba</div><div class="cl-pecas">${BARBAS.map(b => `<button class="cl-peca ${cfg.barba === b.id ? 'on' : ''}" data-k="barba" data-v="${b.id}">${b.nome}</button>`).join('')}</div></div>`);
    }
  }

  async function aplica(mud) {
    if (ocupado || !J.p) return; ocupado = true;
    try { if (mud.corpo && mud.corpo !== J.p.cfg.corpo) await trocaPersonagem({ ...J.p.cfg, ...mud }); else await J.p.muda(mud); salva(); } catch (e) { console.error('closet', e); aviso('Não deu pra trocar agora'); }
    ocupado = false; desenha();
  }
  painel.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t || t.disabled) return;
    if (t.classList.contains('cl-aba')) { aba = t.dataset.aba; desenha(); return; }
    if (t.dataset.slot) {                                            // vestir peça
      const base = { ...J.p.cfg.roupas };
      if (J.provando) {                                   // o que estava sendo provado e não é seu volta antes de trocar
        for (const [sl, id] of Object.entries(base)) { const r = item(id); if (r && !meu(r)) base[sl] = J.provando.antes[sl]; }
        J.provando = null; const pb = document.querySelector('#provando'); pb && pb.classList.remove('on');
      }
      aplica({ roupas: { ...base, [t.dataset.slot]: t.dataset.id } }); return;
    }
    if (t.dataset.k === 'corpo') {                                   // trocar corpo: o que não serve no corpo novo volta pro padrão
      const novo = t.dataset.v; if (novo === J.p.cfg.corpo) return;
      const roupas = { ...J.p.cfg.roupas };
      for (const sl of ['camisa', 'calca', 'calcado', 'casaco']) {
        const r = item(roupas[sl]); if (r && serve(r, novo)) continue;
        if (sl === 'casaco') { roupas.casaco = 'nenhum'; continue; }
        const tenho = CATALOGO_ROUPAS.find(x => x.slot === sl && x.id !== 'nenhum' && serve(x, novo) && meu(x));
        if (tenho) roupas[sl] = tenho.id;
        else { roupas[sl] = KIT_INICIAL[novo][sl]; Perfil.compra(roupas[sl], 0); }      // kit inicial do corpo novo
      }
      aviso(novo === 'fem' ? 'Trocando pra corpo feminino…' : 'Trocando pra corpo masculino…');
      aplica({ corpo: novo, roupas }); return;
    }
    if (t.dataset.k) aplica({ [t.dataset.k]: t.dataset.v });
  });
  // câmera chega perto e fica de frente pra personagem enquanto o closet está aberto (tipo espelho de camarim); ao fechar, volta
  let camAntes = null;
  function foco(on) {
    if (on && !camAntes) { camAntes = { yaw: J.camYaw, pitch: J.camPitch, dist: J.dist }; J.dest = null; J.camYaw = J.rumo + .35; J.camPitch = .06; J.dist = 2.3; }
    else if (!on && camAntes) { J.camYaw = camAntes.yaw; J.camPitch = camAntes.pitch; J.dist = camAntes.dist; camAntes = null; }
  }
  const abre = () => { sacola.fechaPainel(); painel.classList.add('on'); foco(true); desenha(); };
  const fecha = () => { painel.classList.remove('on'); foco(false); };
  $('#b-closet').onclick = () => painel.classList.contains('on') ? fecha() : abre();
  $('#cl-fecha').onclick = fecha;
  $('#b-sacola').addEventListener('click', () => { if (painel.classList.contains('on')) fecha(); });
  addEventListener('keydown', e => { if (e.code === 'Escape' && painel.classList.contains('on')) fecha(); });
  addEventListener('perfil:mudou', () => { if (painel.classList.contains('on') && !ocupado) desenha(); });
  return { abre, fecha };
}
