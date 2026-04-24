# KaiserPlay — Contexto do Projeto

## O que é
App de treinamento auditivo para guitarristas. O usuário ouve um acorde e deve identificá-lo.
Gamificado: XP, níveis, moedas, loja, ranking, modos de treino.

Criado por Marcos Kaiser, professor de violão — kaiserplay.com.br

## Stack
- HTML + CSS + JavaScript vanilla, Howler.js para áudio
- Hospedado no GitHub Pages: marcoskaiserviolonista.github.io/appkaiserplay
- Sem build system, sem framework, sem dependências locais

## Arquitetura (multi-arquivo)
`index.html` é um shell de 98 linhas que carrega CSS e JS externos via tags `<link>` e `<script>`.
Render centralizado em `render()` (js/render.js) que reconstrói innerHTML baseado em `state.phase`.

### Estrutura de arquivos
```
index.html              ← shell prod (fullAccess:false, saldo zerado)
index-test.html         ← shell teste (fullAccess:true, saldo 500)
styles/
  animations.css        ← todos os @keyframes
  base.css              ← :root, reset, body, .app
  layout.css            ← .header, .logo-*, .tab, #tab-*
  game.css              ← XP bar, combo, play area, choices, level-up, diamond
  profile.css           ← profile card, níveis, user-stats, ranking
  shop.css              ← loja, shop cards, modal, toast, .gc
  tools.css             ← fretboard, sala de aula, metrônomo, afinador
js/
  config.js             ← GAME_CONFIG para prod
  config.test.js        ← GAME_CONFIG para teste
  i18n.js               ← STRINGS + t()
  chords.js             ← CHORDS, CHORDS_DIAMOND, LEVELS, helpers
  constants.js          ← LOJA_ITEMS, VIOLOES, FB_*, buildFbSVG
  audio.js              ← getAudioCtx, howls, playChord, playSfx*
  particles.js          ← canvas, makeParticles, showToast, spawnFloat
  engine.js             ← state (usa GAME_CONFIG), genQ, combo, sala de aula
  render.js             ← render() dispatcher central
  persistence.js        ← saveStreak/loadStreak, saveProgress/loadProgress
  onboarding.js         ← OB_STEPS, updateObOverlay, obNext/Skip/End
  app.js                ← detecção de idioma, onAuthStateChanged, fretboard click
  features/
    auth.js             ← renderLogin, loginUser, signupUser, logoutUser
    journey.js          ← renderStart, renderGame, renderLevelUp, startGame
    focused.js          ← genFocusedQ, renderTreinoFocadoMenu, renderTreinoFocado
    shop.js             ← renderLoja, renderInventario, confirmarCompra, shopModal
    ranking.js          ← loadRankingData, renderRanking
    profile.js          ← renderPerfil, goToPerfil
    niveis.js           ← NIVEL_GROUPS, renderNiveis
    tools.js            ← renderMetronomo, renderAfinador
assets/
  *.png                 ← todas as imagens do jogo (77 arquivos)
sounds/
  *.mp3, *.ogg          ← áudios dos acordes (não mover)
```

### Ordem de carregamento dos scripts (importante!)
config → i18n → chords → constants → audio → particles → engine →
features/focused → render → features/tools → features/auth → features/journey →
features/shop → features/ranking → features/profile → features/niveis →
persistence → onboarding → app

Não usar ES Modules (import/export) — handlers onclick="..." precisam de globals.

## Design System
- Fundo: `#111` | Principal: `#F5A623` (laranja) | Secundária: `#60dcff` (ciano — Treino Focado)
- Fontes: Poppins (corpo), Fredoka (títulos), VT323 (nível)
- Botões: estilo MBE (borda 3px preta + sombra offset)
- Layout mobile-first, max-width 520px

## Modos de jogo

### Jornada
- Progressão por 100 níveis; pool de acordes cresce com o nível
- Combo: pontuação = 10 × streak × multiplicador
- Perguntas Diamante: CHORDS_DIAMOND, fundo azul especial
- Perguntas de Qualidade: 2 botões (ex: Maior ou Menor)
- Erro: −10 XP e −10 Pontos

### Treino Focado
- Switches por categoria de acorde
- 4 switches gratuitos: maior_menor, menor_diminuto, triades_maiores, tetrades_menores
- Demais bloqueados (fullAccess: false na versão oficial)
- Pontuação: 5 + streak por acerto, −5 por erro
- Não interfere em bestStreak nem chordStats da Jornada; XP concedido normalmente

## Banco de acordes
- CHORDS: 40 acordes (pool normal)
- CHORDS_DIAMOND: 57 acordes avançados (nível 27+)

## Sistema de economia
- Pontos (`state.notas`): ganhos jogando, trocados por moedas (10 pts = 1 moeda)
- Moedas (`state.moedas`): usadas na loja
- Diamantes (`state.diamantes`): ganhos em perguntas diamante
- XP (`state.xp`): progressão de nível

## Loja
- Violões com % de bônus de pontos; compra equipa automaticamente
- Materiais didáticos: itens de conteúdo educativo

## Convenções de nomenclatura
- "Pontos" = `state.notas` | "XP" = `state.xp` | "Moedas" = `state.moedas`
- Cifras sem parênteses para extensão única: A9, E9, Em9
- Cifras com parênteses quando há outra qualificação: Em7(9), C6(9), B7(#9)
- "Meio Diminuto" sem hífen (a chave JS permanece `meio-diminuto`)

## Pendências
- `#LOJA_URL` → substituir após publicação na Play Store
- Firebase App Check (Play Integrity API) — próximo passo técnico
- Firestore Rules com limites numéricos
- fullAccess via Firestore após confirmação de pagamento (antes de ativar venda)

## Regras de desenvolvimento

- **Nunca implementar nada não solicitado explicitamente.** Não tocar no que não foi pedido.
- **Sempre gerar `index.html` e `index-test.html` juntos** após qualquer mudança.
  - `index.html`: carrega `js/config.js` → fullAccess:false, saldo zerado
  - `index-test.html`: carrega `js/config.test.js` → fullAccess:true, saldo 500
  - Diferença entre os dois: apenas a linha `<script src="js/config.js">` vs `<script src="js/config.test.js">`
- **Sempre fazer push para o GitHub** após cada alteração aprovada.
- **Verificar sintaxe do JS manualmente** após alterações — `node --check` funciona em arquivos `.js`.
- **Todo texto visível ao usuário** deve ter versão PT e EN via `t()`. Nunca string PT hardcoded sem equivalente EN.
- **Botões em HTML estático** (fora de template literals) não aceitam `t()` diretamente — atualizar o `textContent` no `render()`.
- **Imagens**: todas as imagens ficam em `assets/`. Ao referenciar: `src="assets/nome.png"` ou via `'assets/'+nome+'.png'`.
- **Adicionar nova imagem**: colocar o arquivo em `assets/` e referenciar com `assets/` prefix.
- **Novo arquivo JS**: adicionar `<script src="js/novo.js">` em AMBOS `index.html` e `index-test.html`, na ordem correta.
- **Novo arquivo CSS**: adicionar `<link rel="stylesheet" href="styles/novo.css">` em AMBOS os arquivos HTML.
- Explicar decisões técnicas em linguagem simples (Marcos é leigo em código).

## Regras de segurança

- **Nunca commitar credenciais** (API keys, senhas, tokens) em nenhum arquivo. Checar `.gitignore` antes de qualquer `git add`.
- **Credenciais do Firebase** pertencem apenas ao `index.html` de produção — nunca em arquivos auxiliares.
- **Nunca instalar programas ou ferramentas** sem autorização explícita do Marcos.
- **Avisar antes de qualquer operação que possa expor dados sensíveis** (push de arquivo novo com config, PR público, alteração de .gitignore).
- **Em caso de credencial exposta acidentalmente:** avisar Marcos imediatamente, explicar o que precisa ser feito, e aguardar autorização antes de executar qualquer ação.
