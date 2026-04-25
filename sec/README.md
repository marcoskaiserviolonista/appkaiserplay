# KaiserPlay — Auditoria de Segurança

Kit de análise automatizada de segurança para o app KaiserPlay.

## Por que Docker?

As ferramentas usadas aqui (TruffleHog, Gitleaks, Trivy, ZAP, Nikto, Semgrep, Retire.js, Nuclei, Bearer, Observatory, testssl.sh, DefectDojo, MobSF) têm runtimes diferentes — Java, Python, Go, Node. Instalar tudo manualmente seria trabalhoso e dependente de versão. Docker empacota cada ferramenta pronta para uso: basta ter Docker instalado e tudo funciona.

## Pré-requisito

Docker instalado e em execução:

```bash
docker --version
```

## Uso rápido

```bash
cd sec/
make all          # roda tudo contra produção: scan → sobe painel → importa → relatório
make all-local    # roda tudo contra http://localhost:5500 (requer servidor local — veja abaixo)
```

Ou passo a passo:

```bash
make scan                                   # scan contra URL de produção
make scan-local                             # scan contra http://localhost:5500
make scan-local LOCAL_URL=http://localhost:8080  # scan contra porta local customizada
make scan-url URL=https://staging.exemplo.com    # scan contra qualquer URL
make stack-up     # sobe DefectDojo (painel) e MobSF
make import       # importa os resultados do scan no DefectDojo
make report       # mostra links dos relatórios
make status       # lista containers e arquivos gerados
make clean        # para containers (preserva banco)
make reset        # para containers e apaga banco (recomeço do zero)
```

Para servir o app localmente antes de rodar `scan-local`, use Python (já vem instalado):

```bash
# Na raiz do projeto (outra aba do terminal):
cd ..
python3 -m http.server 5500
# App disponível em http://localhost:5500
```

## O que cada ferramenta faz

| Ferramenta | O que analisa |
|------------|---------------|
| **TruffleHog** | Segredos e chaves expostas no código e histórico git |
| **Gitleaks** | Segredos no histórico git (ruleset alternativo ao TruffleHog) |
| **Trivy** | CVEs em dependências, segredos e misconfigurações |
| **ZAP** | Scan passivo do site ao vivo (headers, CORS, etc.) |
| **Nikto** | Fingerprinting do servidor web e headers de segurança ausentes |
| **Semgrep** | Padrões inseguros no JavaScript (SAST) |
| **Retire.js** | Bibliotecas JavaScript com CVEs conhecidos |
| **Nuclei** | Templates Firebase, exposições e misconfigurações web |
| **Bearer** | Rastreamento de fluxo de dados sensíveis no código |
| **Observatory** | Grade de headers HTTP/CSP via Mozilla (só URL pública) |
| **testssl.sh** | Configuração TLS/SSL (só URL pública com HTTPS) |

## Onde ficam os resultados

Os resultados são salvos em `../audit-results/` (fora do repositório, ignorado pelo git):

```
audit-results/
  trufflehog.json
  gitleaks.json
  trivy.json
  zap-report.html    ← relatório visual do ZAP
  zap-report.xml
  zap-report.json
  nikto.json
  semgrep.json
  retirejs.json
  nuclei.json
  bearer.json
  observatory.json   ← pulado se URL for local
  testssl.json       ← pulado se URL for local ou HTTP
```

## Painéis web

Após `make stack-up`:

- **DefectDojo** → http://localhost:8080 — painel unificado com todos os achados  
  Login: `admin` / `kaiseraudit2026`
- **MobSF** → http://localhost:8089 — análise do APK (arraste o `.apk` na tela)

### Ver relatório ZAP no browser

O ZAP gera um arquivo HTML estático em `../audit-results/zap-report.html`. Alguns browsers bloqueiam arquivos locais — sirva assim:

```bash
cd ../audit-results
python3 -m http.server 9000
# Abrir: http://localhost:9000/zap-report.html
```

## Sobre os achados esperados

- **Firebase API key** no `index.html`: esperado e intencional. A chave Firebase de projetos web é pública por design — a segurança é garantida pelas Firestore Rules e App Check, não pelo sigilo da chave.
- **Howler.js / Firebase SDKs via CDN**: Retire.js pode apontar versões antigas. Verificar se as CVEs são relevantes para o contexto de uso.

## Estrutura do código que é auditada

O script monta o diretório raiz do repositório (`appkaiserplay/`) nos containers Docker. Com a nova estrutura multi-arquivo, os scanners analisam:

```
index.html              (shell HTML + Firebase init)
js/                     (20+ arquivos JavaScript)
js/features/            (8 módulos de funcionalidades)
styles/                 (7 arquivos CSS)
assets/                 (imagens — não contém código)
sounds/                 (áudios — não contém código)
```
