// VANTRA — Drop 01. Looks REAIS montados com as peças do guarda-roupa do personagem (preços em R$ do criador; peças CLO são só de teste).
// Trocar pelo catálogo real (ou ligar ao ERP) — o resto da loja lê daqui.
// Configuração da loja: playlist padrão (link do Spotify ou YouTube) — a marca troca pela dela.
export const LOJA_CFG = { playlist: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ' };

export const DROP = { nome: 'DROP 01', subtitulo: 'Órbita Fria', total: 8 };

export const PECAS = [
  { id: 'halo', nome: 'Conjunto Corset V', look: 'halo', preco: 70, tams: ['PP', 'P', 'M', 'G'], cor: 'Grafite + lima + cromo',
    tecido: 'Malha canelada, sarja fosca, ferragens cromadas', foto: null,
    roupas: { camisa: 'top-referencia', calca: 'saia-assimetrica', calcado: 'bota-v' },
    desc: 'Top corset canelado, saia assimétrica com aba e bota de bico fino.' },
  { id: 'vacuo', nome: 'Cropped V + Calça Vácuo', look: 'vacuo', preco: 40, tams: ['PP', 'P', 'M', 'G'], cor: 'Grafite + lima',
    tecido: 'Malha jersey e sarja técnica', foto: null,
    roupas: { camisa: 'tee-ceramica', calca: 'calca-vacuo', calcado: 'bota-v' },
    desc: 'Cropped com o V no peito sobre calça de cintura alta e boca de sino.' },
  { id: 'nevoa', nome: 'Blusa Free Crop + Trumpet', look: 'nevoa', preco: 70, tams: ['PP', 'P', 'M', 'G'], cor: 'Azul floral + bege',
    tecido: 'Algodão estampado e crepe', foto: null,
    roupas: { camisa: 'top-freecrop', calca: 'saia-trumpet', calcado: 'bota-v' },
    desc: 'Blusa curta estampada e saia trumpet até a panturrilha.' },
  { id: 'orbe', nome: 'Tomara-que-caia + Puffer', look: 'orbe', preco: 70, tams: ['PP', 'P', 'M', 'G'], cor: 'Branco + preto',
    tecido: 'Malha e nylon acolchoado', foto: null,
    roupas: { camisa: 'top-crop04', calca: 'calca-puffer', calcado: 'bota-v' },
    desc: 'Tomara-que-caia limpo sobre calça puffer oversized.' },
  { id: 'lunar', nome: 'Corset V + Calça Vácuo', look: 'lunar', preco: 60, tams: ['PP', 'P', 'M', 'G'], cor: 'Grafite + lima',
    tecido: 'Malha canelada e sarja', foto: null,
    roupas: { camisa: 'top-referencia', calca: 'calca-vacuo', calcado: 'bota-v' },
    desc: 'O top corset com a calça de boca de sino. Silhueta alongada.' },
  { id: 'eclipse', nome: 'Tomara-que-caia + Studs', look: 'eclipse', preco: 60, tams: ['PP', 'P', 'M', 'G'], cor: 'Branco + preto',
    tecido: 'Malha e couro trançado', foto: null,
    roupas: { camisa: 'top-crop04', calca: 'saia-studs', calcado: 'bota-v' },
    desc: 'Top branco sobre mini saia tecida com tachas metálicas.' },
  { id: 'pulso', nome: 'Cropped V + Trumpet', look: 'pulso', preco: 50, tams: ['PP', 'P', 'M', 'G'], cor: 'Grafite + bege',
    tecido: 'Jersey e crepe', foto: null,
    roupas: { camisa: 'tee-ceramica', calca: 'saia-trumpet', calcado: 'bota-v' },
    desc: 'Cropped grafite com saia trumpet clara. Contraste suave.' },
  { id: 'artico', nome: 'Free Crop + Assimétrica', look: 'artico', preco: 70, tams: ['PP', 'P', 'M', 'G'], cor: 'Azul + grafite',
    tecido: 'Algodão e sarja com organza', foto: null,
    roupas: { camisa: 'top-freecrop', calca: 'saia-assimetrica', calcado: 'bota-v' },
    desc: 'Blusa floral com a saia assimétrica de barra translúcida.' },
];

export const brl = v => 'R$ ' + v.toLocaleString('pt-BR');
