# Shopping NEW — guia pro Claude Code

Shopping 3D de moda no navegador (Three.js 0.160, sem build: ES modules + importmap). Você (Claude Code) deve ler este arquivo inteiro antes de mexer em qualquer coisa. O dono do projeto fala português brasileiro, tom direto, e prefere ver o resultado antes de aprovar.

## Como rodar

1. Este repo depende de uma pasta vizinha `shared/personagem` (corpo 3D, roupas, perfil/saldo). Ela vive no repo **MUNDO-MEX** (`https://github.com/rfnhaia-boop/MUNDO-MEX`, branch `ceasa-padrao`, pasta `shared/personagem`). O layout esperado:
   ```
   <raiz>/
     shopping-3d/        <- este repo
     shared/personagem/  <- do MUNDO-MEX
   ```
   Dica: o MUNDO-MEX é enorme; use clone parcial (`git sparse-checkout set shared/personagem`) e deixe `shopping-3d` ao lado de `shared/`.
2. Sirva a **raiz** (a pasta que contém `shopping-3d` e `shared`) com qualquer servidor estático, ex.: `npx serve <raiz>` ou `python -m http.server 8099`.
3. Abra `http://localhost:8099/shopping-3d/index.html`. Precisa de internet (Three.js e fontes vêm de CDN).

## Mapa dos arquivos (js/)

| Arquivo | O que faz |
|---|---|
| `main.js` | Ponto de entrada: render, jogador, colisão, spawn, portais, menu "Ir para" (tecla T) |
| `planta.js` | Medidas e posição de cada loja (VANTRA, ATELIE, LEFERRI) e das alas |
| `arquitetura.js` | Átrio hexagonal, 3 alas, vitrines "em breve" em arco |
| `interior-organico.js` | Abóbada, ilhas com jardim, anéis de luz (a parte curva do shopping) |
| `loja-vantra.js` / `loja-atelie.js` | Lojas âncora e ATELIÊ (2 andares) |
| `loja-leferri.js` | Boutique LE FERRI no shopping + portal pro universo |
| `leferri-mundo.js` | Universo da marca LE FERRI (passarela, cinema, balada...) em x=600 |
| `lojas-new.js` | Ala street: NEW WEAR, NEW LAB, Central de Vendas (maquete etapa 2), Sua Loja Aqui |
| `sacola.js`, `caixa.js`, `provador.js`, `closet.js`, `ficha.js` | Jornada de compra (sacola por loja, caixa, provador, closet) |
| `robo.js`, `robo-painel.js` | Robô Neo: carrega as embalagens, drone, painel de sacolas e conversa |
| `mapa.js` | Mapa do shopping |

## Regras do projeto (importantes)

- **Cores:** NEW = roxo (`#8b5cf6`, `#4c1d95`, `#c4b5fd`); NEX = laranja. Nunca misturar. LE FERRI = preto, marfim e champanhe (fontes Bodoni Moda e Jost).
- **Compras são por loja:** cada item entra na sacola marcado com a loja e só é pago no caixa dela. O robô recebe uma embalagem de marca por peça.
- **Coordenadas das alas:** `ala.mundo(x, z)` converte local → mundo. Colisões: `ala.ret(x0,x1,z0,z1)` e `ala.circ(x,z,r)`.
- **Sem música gerada.** Música só via Spotify/YouTube embutido.
- Não deixe o viewport mobile ligado no preview ao terminar.
- Mudou algo visual? Confira com screenshot antes de dizer que está pronto; erro de console antigo pode persistir, verifique o estado.
- Mudanças grandes: mostre a estrutura de arquivos antes de criar, e faça módulo por módulo.

## Jeito de trabalhar aqui

1. Rode o servidor e abra o preview.
2. Mexa num módulo por vez e verifique no navegador (`window.__s` expõe `J`, `cam`, `scene`, `mundo`, `robo`, `caixa`, `teleporta`, `DESTINOS` para testar pelo console).
3. Commits pequenos e com mensagem clara em português.

## Pendências conhecidas

- Maquete externa do shopping mostrando a etapa 2 (piso superior + anel circular de trás), navegável, pra apresentar a compradores. Hoje existe só a maquete na mesa da Central de Vendas.
- Árvores das ilhas são formas simples; trocar por modelo 3D melhor.
- Conversa do robô Neo é roteirizada (sem IA); dá pra ligar a um agente depois.
- O Google deve sugerir mudanças de design: comece lendo as referências que ele mandou e proponha o plano antes de implementar.

## Primeiro passo ao abrir o projeto

Ao ser aberto pela primeira vez: leia este arquivo, rode o servidor, abra o shopping e confira se carrega sem erros. Depois pergunte ao dono o que ele quer mudar primeiro.
