# KaiserPlay — Contexto do Projeto

## O que é
KaiserPlay é um app de treinamento auditivo para guitarristas. O usuário ouve um acorde e deve identificá-lo. É gamificado — tem XP, níveis, moedas, loja, ranking e modos de treino.

Criado por Marcos Kaiser, professor de violão e dono da escola online KaiserPlay (kaiserplay.com.br).

## Stack técnica
- Arquivo único: `index.html` (~3100 linhas)
- HTML + CSS + JavaScript vanilla
- Howler.js para áudio
- Hospedado no GitHub Pages: marcoskaiserviolonista.github.io/appkaiserplay
- Áudios em: github.com/marcoskaiserviolonista/audios-ouvido
- Sem build system, sem framework, sem dependências locais

## Arquitetura
Todo o app está em `index.html` com três seções:
1. `<style>` — todo o CSS
2. HTML estático mínimo (header, canvas, content div)
3. `<script>` — toda a lógica JS

O render é centralizado na função `render()` que reconstrói o innerHTML baseado em `state.phase`.

## Design System
- Fundo: #111
- Cor principal: #F5A623 (laranja)
- Cor secundária: #60dcff (azul ciano — usado no Treino Focado)
- Fontes: Poppins (corpo), Fredoka (títulos), VT323 (números de nível)
- Botões principais: estilo MBE (borda 3px preta + sombra offset)
- Layout mobile-first, max-width 520px

## Modos de jogo

### Jornada
- Progressão por 100 níveis
- Pool de acordes aumenta conforme o nível
- Sistema de combo: pontuação = 10 × streak × multiplicador
- Perguntas Diamante: acordes avançados do CHORDS_DIAMOND, fundo azul especial
- Perguntas de Qualidade: 2 botões (ex: Maior ou Menor)
- Erro: -10 XP e -10 Pontos

### Treino Focado
- Switches por categoria de acorde
- 4 switches gratuitos: maior_menor, menor_diminuto, triades_maiores, tetrades_menores
- Demais switches bloqueados (fullAccess: false na versão oficial)
- Pontuação: 5 + streak por acerto, -5 por erro
- Não interfere no bestStreak nem chordStats da Jornada
- XP concedido normalmente

## Banco de acordes
- CHORDS: 40 acordes (pool normal, níveis 1-26)
- CHORDS_DIAMOND: 57 acordes avançados (aparecem no nível 27+)
- Categorias: tríades maiores/menores, dominantes, tétrades maiores/menores, sextas, sus, inversões, aumentados, diminutos, meio-diminutos, extensões, dissonantes

## Sistema de economia
- Pontos (state.notas): ganhos jogando, trocados por moedas (10 pontos = 1 moeda)
- Moedas (state.moedas): usadas na loja
- Diamantes (state.diamantes): ganhos em perguntas diamante, trocados por moedas
- XP (state.xp): progressão de nível, não tem relação direta com moedas

## Loja
- Violões: cada um tem % de bônus de pontos
- Ao comprar violão: equipado automaticamente
- Materiais didáticos: itens de conteúdo educativo
- Items comprados com moedas

## Pendências importantes
- Firebase: login/senha, ranking real, persistência de progresso — implementar por último
- Sistema de pagamento (In-App Purchase via App Store/Google Play) para fullAccess
- Versão oficial: fullAccess:false, notas:0, moedas:0
- Versão de teste: fullAccess:true, notas:500, moedas:500

## Regras de segurança obrigatórias
- NUNCA commitar arquivos com API keys, senhas, tokens ou qualquer credencial — verificar sempre antes do commit
- SEMPRE checar o `.gitignore` antes de qualquer `git add` para confirmar que arquivos sensíveis estão protegidos
- NUNCA criar arquivos de teste, backup ou variantes (ex: index-test.html) contendo credenciais reais — usar `[REMOVED]` ou variável de ambiente
- SEMPRE alertar o Marcos antes de qualquer operação que possa expor dados sensíveis no repositório público (push, PR, novo arquivo com config)
- Credenciais do Firebase pertencem APENAS ao `index.html` de produção, jamais a arquivos auxiliares
- O arquivo `android/keystore.properties` NUNCA deve ser commitado — está protegido pelo `.gitignore`
- Em caso de exposição acidental: revogar a chave imediatamente no console do provedor, limpar o histórico git com filter-branch, fazer force push

## Regras de desenvolvimento
- NUNCA implementar nada que não foi explicitamente pedido
- Edições cirúrgicas — não tocar no que não foi solicitado
- Rodar node --check no JS após toda alteração
- Marcos revisa pelo celular após cada mudança
- Marcos é leigo em código — explicar decisões em linguagem simples
- Sempre gerar index.html (versão oficial) e index-test.html (versão de teste) juntos

## Convenções de nomenclatura
- "Pontos" = state.notas (carteira de pontos convertíveis)
- "XP" = state.xp (progressão de nível)
- "Moedas" = state.moedas
- Cifras sem parênteses para extensão única: A9, E9, Em9
- Cifras com parênteses quando há outra qualificação: Em7(9), C6(9), B7(#9)
- "Meio Diminuto" sem hífen (mas a chave JS permanece meio-diminuto)

## Arquivos no repositório
- index.html — versão oficial (produção)
- index-test.html — versão de teste (fullAccess liberado)
- sons em /sounds
- imagens PNG na raiz (violao.png, moeda.png, etc.)
