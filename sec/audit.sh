#!/usr/bin/env bash
# =============================================================================
#  KaiserPlay — Auditoria de Segurança
#  Uso: ./audit.sh [comando]
#
#  Comandos:
#    all        Roda tudo do início ao fim (padrão)
#    scan       TruffleHog + Trivy + ZAP + Semgrep + Retire.js + Nuclei
#    stack-up   Sobe DefectDojo + MobSF
#    import     Importa resultados no DefectDojo
#    report     Abre os relatórios
#    clean      Para e remove todos os containers
#    reset      Para containers + apaga banco (recomeço total)
#    status     Mostra o que está rodando
# =============================================================================
set -euo pipefail

# ── Configuração ──────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"   # sec/
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"       # repo root (appkaiserplay/)
RESULTS="$SCRIPT_DIR/../audit-results"         # appkaiserplay/../audit-results
PROD_URL="https://marcoskaiserviolonista.github.io/appkaiserplay/"
TARGET_URL="${TARGET_URL:-$PROD_URL}"     # override: TARGET_URL=http://localhost:5500 make scan
NETWORK="kaiseraudit-net"

MOBSF_PORT=8089
DOJO_PORT=8080

DOJO_USER="admin"
DOJO_PASS="kaiseraudit2026"
DOJO_SECRET="kaiseraudit2026secretkey123456x"
DOJO_AES="kaiseraudit12345678901234"

DB_NAME="kaiser-db"
REDIS_NAME="kaiser-redis"
DOJO_NAME="kaiser-dojo"
NGINX_NAME="kaiser-nginx"
MOBSF_NAME="kaiser-mobsf"

THOG_IMG="trufflesecurity/trufflehog:latest"
GITLEAKS_IMG="zricethezav/gitleaks:latest"
TRIVY_IMG="aquasec/trivy:0.61.0"
ZAP_IMG="ghcr.io/zaproxy/zaproxy:stable"
NIKTO_IMG="sullo/nikto:latest"
SEMGREP_IMG="semgrep/semgrep:latest"
NUCLEI_IMG="projectdiscovery/nuclei:latest"
NODE_IMG="node:20-alpine"
TESTSSL_IMG="drwetter/testssl.sh:stable"
MOBSF_IMG="opensecurity/mobile-security-framework-mobsf:latest"
DOJO_IMG="defectdojo/defectdojo-django:latest"
NGINX_IMG="defectdojo/defectdojo-nginx:latest"
PG_IMG="postgres:16-alpine"
REDIS_IMG="redis:7-alpine"

DOJO_ENV=(
  -e DD_DATABASE_URL="postgresql://defectdojo:defectdojo@$DB_NAME:5432/defectdojo" # trufflehog:ignore — local dev credential, $DB_NAME is a shell variable not a real host
  -e DD_SECRET_KEY="$DOJO_SECRET"
  -e DD_CREDENTIAL_AES_256_KEY="$DOJO_AES"
  -e DD_ALLOWED_HOSTS="*"
  -e DD_CELERY_BROKER_URL="redis://$REDIS_NAME:6379/0"
  -e DD_CELERY_RESULT_BACKEND="redis://$REDIS_NAME:6379/0"
  -e DD_DJANGO_METRICS_ENABLED="False"
  -e DD_INITIALIZE="true"
  -e DD_ADMIN_USER="$DOJO_USER"
  -e DD_ADMIN_PASSWORD="$DOJO_PASS"
  -e DD_ADMIN_MAIL="marcos@kaiserplay.com.br"
  -e DD_SESSION_COOKIE_SECURE="False"
  -e DD_CSRF_COOKIE_SECURE="False"
  -e DD_SECURE_SSL_REDIRECT="False"
)

# ── Helpers ───────────────────────────────────────────────────────────────────
BOLD='\033[1m'; CYAN='\033[0;36m'; GREEN='\033[0;32m'
YELLOW='\033[0;33m'; RED='\033[0;31m'; RESET='\033[0m'

step()  { echo -e "\n${CYAN}${BOLD}▶ $*${RESET}"; }
ok()    { echo -e "${GREEN}✔ $*${RESET}"; }
warn()  { echo -e "${YELLOW}⚠ $*${RESET}"; }
fail()  { echo -e "${RED}✖ $*${RESET}"; exit 1; }

wait_http() {
  local url=$1 label=$2 max_secs=${3:-60}
  printf "  Aguardando $label (max ${max_secs}s)"
  local end=$(( $(date +%s) + max_secs ))
  while [[ $(date +%s) -lt $end ]]; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null) || code="000"
    if echo "$code" | grep -qE "^[23]"; then echo " ok ($code)"; return 0; fi
    printf "."; sleep 3
  done
  echo " timeout (continuando mesmo assim)"
  return 0
}

wait_container_healthy() {
  local name=$1 max_secs=${2:-60}
  printf "  Aguardando $name (max ${max_secs}s)"
  local end=$(( $(date +%s) + max_secs ))
  while [[ $(date +%s) -lt $end ]]; do
    status=$(docker inspect "$name" --format '{{.State.Health.Status}}' 2>/dev/null) || status="gone"
    running=$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null) || running="false"
    if [[ "$status" == "healthy" ]]; then echo " ok"; return 0; fi
    if [[ "$status" == "none" || "$status" == "gone" ]] && [[ "$running" == "true" ]]; then
      echo " ok (sem healthcheck)"; return 0
    fi
    printf "."; sleep 3
  done
  echo " timeout (continuando)"
  return 0   # não falha
}

container_running() { docker inspect "$1" --format '{{.State.Running}}' 2>/dev/null | grep -q "true"; }

ensure_network() {
  docker network inspect "$NETWORK" &>/dev/null || docker network create "$NETWORK" &>/dev/null
}

# ── Scans ─────────────────────────────────────────────────────────────────────
run_trufflehog() {
  step "TruffleHog — segredos no código e histórico git"
  docker run --rm \
    -v "$REPO_DIR:/repo" \
    "$THOG_IMG" \
    git file:///repo --json --only-verified 2>/dev/null \
    > "$RESULTS/trufflehog.json" || true

  local count
  count=$(wc -l < "$RESULTS/trufflehog.json" | tr -d ' ')
  if [[ "$count" -gt 0 ]]; then
    warn "$count achado(s) — detalhes:"
    python3 -c "
import sys, json
for line in open('$RESULTS/trufflehog.json'):
    line = line.strip()
    if not line: continue
    try:
        d = json.loads(line)
        if 'DetectorName' not in d: continue
        f = d['SourceMetadata']['Data']['Git']
        v = 'VERIFICADO' if d['Verified'] else 'não verificado'
        print(f'  [{d[\"DetectorName\"]}] {f[\"file\"]}:{f[\"line\"]} ({v})')
        print(f'     commit {f[\"commit\"][:8]} | valor: {d[\"Redacted\"]}')
    except: pass
" 2>/dev/null || true
  else
    ok "Nenhum segredo encontrado"
  fi
}

run_trivy() {
  step "Trivy — vulnerabilidades em dependências e infraestrutura"
  docker run --rm \
    -v "$REPO_DIR:/repo" \
    "$TRIVY_IMG" \
    fs /repo \
    --scanners vuln,secret,misconfig \
    --skip-files index-test.html \
    --skip-files index-monolith-backup.html \
    --format json 2>/dev/null \
    > "$RESULTS/trivy.json" || true

  local vulns misconf secrets
  vulns=$(python3 -c "
import json
d=json.load(open('$RESULTS/trivy.json'))
print(sum(len(r.get('Vulnerabilities') or []) for r in d.get('Results',[])))
" 2>/dev/null || echo 0)
  misconf=$(python3 -c "
import json
d=json.load(open('$RESULTS/trivy.json'))
print(sum(len(r.get('Misconfigurations') or []) for r in d.get('Results',[])))
" 2>/dev/null || echo 0)
  secrets=$(python3 -c "
import json
d=json.load(open('$RESULTS/trivy.json'))
print(sum(len(r.get('Secrets') or []) for r in d.get('Results',[])))
" 2>/dev/null || echo 0)

  if [[ "$vulns" -eq 0 && "$misconf" -eq 0 && "$secrets" -eq 0 ]]; then
    ok "Limpo — sem CVEs, misconfigurações ou segredos"
  else
    warn "Vulnerabilidades: $vulns | Misconfigurações: $misconf | Segredos: $secrets"
  fi
}

run_zap() {
  step "OWASP ZAP — scan do site ao vivo ($TARGET_URL)"
  warn "Scan passivo — limite de 3 minutos."
  docker run --rm \
    -v "$RESULTS:/zap/wrk:rw" \
    "$ZAP_IMG" \
    zap-baseline.py \
    -t "$TARGET_URL" \
    -m 3 \
    -J zap-report.json \
    -x zap-report.xml \
    -r zap-report.html \
    -I 2>&1 | grep -E "WARN-NEW|FAIL-NEW|FAIL-INPROG|Total" || true

  ok "ZAP concluído — relatório em audit-results/zap-report.html"
}

run_semgrep() {
  step "Semgrep — análise estática do código (SAST)"
  docker run --rm \
    -v "$REPO_DIR:/src" \
    -e SEMGREP_APP_TOKEN="" \
    "$SEMGREP_IMG" \
    semgrep scan \
      --config=auto \
      --json \
      --no-rewrite-rule-ids \
      --quiet \
      --exclude 'index-test.html' \
      --exclude 'index-monolith-backup.html' \
      /src 2>/dev/null \
    > "$RESULTS/semgrep.json" || true

  local count
  count=$(python3 -c "
import json
try:
    d=json.load(open('$RESULTS/semgrep.json'))
    print(len(d.get('results',[])))
except: print(0)
" 2>/dev/null || echo 0)

  if [[ "$count" -gt 0 ]]; then
    warn "$count achado(s) no código:"
    python3 -c "
import json
d=json.load(open('$RESULTS/semgrep.json'))
seen=set()
for r in d.get('results',[])[:10]:
    sev=r.get('extra',{}).get('severity','?')
    msg=r.get('extra',{}).get('message','')[:80]
    f=r.get('path','').replace('/src/','')
    line=r.get('start',{}).get('line','?')
    key=f'{f}:{line}'
    if key not in seen:
        seen.add(key)
        print(f'  [{sev}] {f}:{line} — {msg}')
" 2>/dev/null || true
  else
    ok "Nenhum padrão inseguro encontrado"
  fi
}

run_retirejs() {
  step "Retire.js — CVEs em bibliotecas JavaScript"
  # Retire.js escaneia o HTML/JS diretamente, sem precisar de package.json
  docker run --rm \
    -v "$REPO_DIR:/src" \
    "$NODE_IMG" \
    sh -c "npm install -g retire@5 --silent 2>/dev/null && \
           retire --path /src --outputformat json --outputpath /src/retire-out.json \
           --ignore /src/sounds \
           --ignore /src/index-test.html \
           --ignore /src/index-monolith-backup.html 2>/dev/null; \
           cat /src/retire-out.json 2>/dev/null || echo '[]'" \
    > "$RESULTS/retirejs.json" 2>/dev/null || true

  # Limpar o arquivo de saída deixado no repo
  rm -f "$REPO_DIR/retire-out.json" 2>/dev/null || true

  local count
  count=$(python3 -c "
import json
try:
    d=json.load(open('$RESULTS/retirejs.json'))
    total=sum(len(f.get('results',[])) for f in (d if isinstance(d,list) else []))
    print(total)
except: print(0)
" 2>/dev/null || echo 0)

  if [[ "$count" -gt 0 ]]; then
    warn "$count biblioteca(s) vulnerável(is):"
    python3 -c "
import json
d=json.load(open('$RESULTS/retirejs.json'))
if not isinstance(d,list): d=[]
for f in d:
    for r in f.get('results',[]):
        name=r.get('component','?')
        ver=r.get('version','?')
        for v in r.get('vulnerabilities',[]):
            sev=v.get('severity','?')
            ids=', '.join(v.get('identifiers',{}).get('CVE',[]) or [v.get('identifiers',{}).get('summary','?')][:1])
            print(f'  [{sev}] {name} {ver} — {ids}')
" 2>/dev/null || true
  else
    ok "Nenhuma biblioteca vulnerável detectada"
  fi
}

run_nuclei() {
  step "Nuclei — templates Firebase + misconfigurações web"
  docker run --rm \
    "$NUCLEI_IMG" \
    -u "$TARGET_URL" \
    -tags firebase,javascript,misconfiguration,exposure,config \
    -severity low,medium,high,critical \
    -json-export /tmp/nuclei-out.json \
    -silent 2>/dev/null || true

  # Nuclei escreve no container — precisamos capturar via stdout
  docker run --rm \
    "$NUCLEI_IMG" \
    -u "$TARGET_URL" \
    -tags firebase,javascript,misconfiguration,exposure,config \
    -severity low,medium,high,critical \
    -jsonl \
    -silent 2>/dev/null \
    > "$RESULTS/nuclei.json" || true

  local count
  count=$(wc -l < "$RESULTS/nuclei.json" 2>/dev/null | tr -d ' ') || count=0

  if [[ "${count:-0}" -gt 0 ]]; then
    warn "$count achado(s):"
    python3 -c "
import json
for line in open('$RESULTS/nuclei.json'):
    line=line.strip()
    if not line: continue
    try:
        d=json.loads(line)
        sev=d.get('info',{}).get('severity','?').upper()
        name=d.get('info',{}).get('name','?')
        host=d.get('host','?')
        print(f'  [{sev}] {name} — {host}')
    except: pass
" 2>/dev/null || true
  else
    ok "Nenhum template disparado"
  fi
}

run_bearer() {
  step "Bearer — rastreamento de fluxo de dados sensíveis (tokens Firebase, credenciais)"
  docker run --rm \
    -v "$REPO_DIR:/tmp/scan" \
    ghcr.io/bearer/bearer:latest \
    scan /tmp/scan \
    --format json \
    --quiet \
    --exclude 'index-test.html,index-monolith-backup.html' 2>/dev/null \
    > "$RESULTS/bearer.json" || true

  local count
  count=$(python3 -c "
import json
try:
    d=json.load(open('$RESULTS/bearer.json'))
    print(sum(len(d.get(s,[])) for s in ['critical','high','medium','low','warning']))
except: print(0)
" 2>/dev/null || echo 0)

  if [[ "${count:-0}" -gt 0 ]]; then
    warn "$count achado(s) de fluxo de dados:"
    python3 -c "
import json
d=json.load(open('$RESULTS/bearer.json'))
for sev in ['critical','high','medium','low']:
    for f in d.get(sev,[])[:5]:
        title=f.get('title','?')
        fname=f.get('filename','?').replace('/tmp/scan/','')
        line=f.get('line_number','?')
        print(f'  [{sev.upper()}] {fname}:{line} — {title}')
" 2>/dev/null || true
  else
    ok "Nenhum vazamento de dados sensíveis detectado"
  fi
}

run_gitleaks() {
  step "Gitleaks — segredos no histórico git (ruleset alternativo ao TruffleHog)"
  docker run --rm \
    -v "$REPO_DIR:/repo" \
    -v "$RESULTS:/results" \
    "$GITLEAKS_IMG" \
    detect \
    --source /repo \
    --report-format json \
    --report-path /results/gitleaks.json \
    --ignore-path /repo/sec/.gitleaksignore \
    2>/dev/null || true

  local count
  count=$(python3 -c "
import json
try:
    d=json.load(open('$RESULTS/gitleaks.json'))
    print(len(d) if isinstance(d,list) else 0)
except: print(0)
" 2>/dev/null || echo 0)

  if [[ "${count:-0}" -gt 0 ]]; then
    warn "$count segredo(s) encontrado(s):"
    python3 -c "
import json
d=json.load(open('$RESULTS/gitleaks.json'))
if not isinstance(d,list): d=[]
for r in d[:10]:
    desc=r.get('Description','?')
    f=r.get('File','?')
    line=r.get('StartLine','?')
    commit=(r.get('Commit') or '')[:8]
    print(f'  [{desc}] {f}:{line} — commit {commit}')
" 2>/dev/null || true
  else
    ok "Nenhum segredo encontrado"
  fi
}

run_nikto() {
  step "Nikto — fingerprinting e headers do servidor web ($TARGET_URL)"
  docker run --rm \
    -v "$RESULTS:/results" \
    "$NIKTO_IMG" \
    -h "$TARGET_URL" \
    -Format json \
    -o /results/nikto.json \
    -nointeractive \
    2>/dev/null || true

  local count
  count=$(python3 -c "
import json
try:
    d=json.load(open('$RESULTS/nikto.json'))
    vulns=d.get('vulnerabilities',[]) if isinstance(d,dict) else []
    print(len(vulns))
except: print(0)
" 2>/dev/null || echo 0)

  if [[ "${count:-0}" -gt 0 ]]; then
    warn "$count achado(s):"
    python3 -c "
import json
d=json.load(open('$RESULTS/nikto.json'))
vulns=d.get('vulnerabilities',[]) if isinstance(d,dict) else []
for v in vulns[:10]:
    msg=v.get('msg','?')[:100]
    url=v.get('url','')
    print(f'  {msg}' + (f' ({url})' if url else ''))
" 2>/dev/null || true
  else
    ok "Nenhum problema encontrado"
  fi
}

run_observatory() {
  step "Mozilla HTTP Observatory — headers de segurança ($TARGET_URL)"

  local host
  host=$(python3 -c "from urllib.parse import urlparse; print(urlparse('$TARGET_URL').hostname)" 2>/dev/null)

  if [[ "$host" =~ ^(localhost|127\.) ]]; then
    warn "Observatory requer URL pública — pulando para URL local"
    echo '{}' > "$RESULTS/observatory.json"
    return 0
  fi

  printf "  Analisando $host"
  local i state
  for i in $(seq 1 10); do
    curl -s -X POST \
      "https://http-observatory.security.mozilla.org/api/v1/analyze?host=${host}&rescan=false" \
      --max-time 30 2>/dev/null \
      > "$RESULTS/observatory.json" || true
    state=$(python3 -c "
import json
try: print(json.load(open('$RESULTS/observatory.json')).get('state',''))
except: print('')
" 2>/dev/null || echo "")
    [[ "$state" == "FINISHED" ]] && break
    printf "."; sleep 5
  done
  echo ""

  python3 -c "
import json
try:
    d=json.load(open('$RESULTS/observatory.json'))
    grade=d.get('grade','?')
    score=d.get('score','?')
    failed=d.get('tests_failed',0)
    passed=d.get('tests_passed',0)
    total=failed+passed
    if str(grade).startswith(('A','B')):
        color='\033[0;32m'; tag='✔'
    else:
        color='\033[0;33m'; tag='⚠'
    print(f'{color}{tag} Grade: {grade} | Score: {score}/100 | Passou: {passed}/{total} testes\033[0m')
except:
    print('\033[0;33m⚠ Sem resposta do Observatory\033[0m')
" 2>/dev/null || warn "Observatory sem resposta"
}

run_testssl() {
  step "testssl.sh — configuração TLS/SSL"

  local scheme host port
  scheme=$(python3 -c "from urllib.parse import urlparse; print(urlparse('$TARGET_URL').scheme)" 2>/dev/null)
  host=$(python3 -c "from urllib.parse import urlparse; print(urlparse('$TARGET_URL').hostname)" 2>/dev/null)
  port=$(python3 -c "
from urllib.parse import urlparse
u=urlparse('$TARGET_URL')
print(u.port or (443 if u.scheme=='https' else 80))
" 2>/dev/null)

  if [[ "$scheme" != "https" || "$host" =~ ^(localhost|127\.) ]]; then
    warn "testssl.sh requer HTTPS público — pulando (URL local/HTTP detectada)"
    echo '[]' > "$RESULTS/testssl.json"
    return 0
  fi

  docker run --rm \
    -v "$RESULTS:/results" \
    "$TESTSSL_IMG" \
    -oj /results/testssl.json \
    --quiet \
    --nodns min \
    "${host}:${port}" 2>/dev/null || true

  local issues
  issues=$(python3 -c "
import json
try:
    d=json.load(open('$RESULTS/testssl.json'))
    bad=[x for x in (d if isinstance(d,list) else [])
         if x.get('severity','') in ('LOW','MEDIUM','HIGH','CRITICAL')]
    print(len(bad))
except: print(0)
" 2>/dev/null || echo 0)

  if [[ "${issues:-0}" -gt 0 ]]; then
    warn "$issues problema(s) TLS encontrado(s):"
    python3 -c "
import json
d=json.load(open('$RESULTS/testssl.json'))
if not isinstance(d,list): d=[]
for x in d:
    sev=x.get('severity','')
    if sev in ('LOW','MEDIUM','HIGH','CRITICAL'):
        print(f'  [{sev}] {x.get(\"id\",\"?\")} — {x.get(\"finding\",\"?\")}')
" 2>/dev/null || true
  else
    ok "Configuração TLS sem problemas detectados"
  fi
}

run_scans() {
  mkdir -p "$RESULTS"
  run_trufflehog
  run_gitleaks
  run_trivy
  run_zap
  run_nikto
  run_semgrep
  run_retirejs
  run_nuclei
  run_bearer
  run_observatory
  run_testssl
  echo -e "\n${GREEN}${BOLD}Scans concluídos. Resultados em: $RESULTS/${RESET}"
}

# ── Stack (DefectDojo + MobSF) ────────────────────────────────────────────────
start_stack() {
  step "Subindo infraestrutura de auditoria"
  ensure_network

  # ── Postgres ──
  if ! container_running "$DB_NAME"; then
    step "Postgres"
    docker run -d --name "$DB_NAME" \
      --network "$NETWORK" \
      -e POSTGRES_DB=defectdojo \
      -e POSTGRES_USER=defectdojo \
      -e POSTGRES_PASSWORD=defectdojo \
      -v kaiser-dojo-db:/var/lib/postgresql/data \
      --health-cmd="pg_isready -U defectdojo" \
      --health-interval=5s --health-timeout=3s --health-retries=10 \
      "$PG_IMG" &>/dev/null
  fi
  wait_container_healthy "$DB_NAME"

  # ── Redis ──
  if ! container_running "$REDIS_NAME"; then
    step "Redis"
    docker run -d --name "$REDIS_NAME" \
      --network "$NETWORK" \
      "$REDIS_IMG" &>/dev/null
  fi
  sleep 3; ok "Redis rodando"

  # ── DefectDojo — init + app (tudo num container só) ──
  # ── DefectDojo init (migrations + admin) ──
  local has_tables
  has_tables=$(docker exec "$DB_NAME" \
    psql -U defectdojo -d defectdojo -tAc \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" \
    2>/dev/null | tr -d '[:space:]') || has_tables="0"

  if [[ "${has_tables:-0}" -lt 50 ]]; then
    step "DefectDojo — rodando migrations (entrypoint-initializer)..."
    warn "Primeira execução, aguarde ~2 minutos"
    docker run --rm \
      --name kaiser-dojo-init \
      --network "$NETWORK" \
      "${DOJO_ENV[@]}" \
      --entrypoint /entrypoint-initializer.sh \
      "$DOJO_IMG" 2>&1 | grep -v "^$" | grep -v "auditlog\|Registering\|pghistory" | tail -20
    ok "Migrations concluídas"
  else
    ok "Banco já inicializado ($has_tables tabelas) — pulando migrations"
  fi

  # ── DefectDojo app (uwsgi — fala uwsgi protocol na porta 3031 interna) ──
  if ! container_running "$DOJO_NAME"; then
    step "DefectDojo — subindo uwsgi"
    docker run -d --name "$DOJO_NAME" \
      --network "$NETWORK" \
      --network-alias uwsgi \
      -v kaiser-dojo-media:/app/media \
      "${DOJO_ENV[@]}" \
      "$DOJO_IMG" &>/dev/null
    sleep 5
  fi
  ok "uwsgi rodando (porta interna 3031)"

  # ── Nginx — serve CSS/imagens e faz proxy para uwsgi ──
  if ! container_running "$NGINX_NAME"; then
    step "Nginx — servindo arquivos estáticos + proxy"
    docker run -d --name "$NGINX_NAME" \
      --network "$NETWORK" \
      -p "${DOJO_PORT}:8080" \
      -v kaiser-dojo-media:/usr/share/nginx/html/media \
      -e UWSGI_PASS="$DOJO_NAME:3031" \
      -e NGINX_METRICS_ENABLED="false" \
      "$NGINX_IMG" &>/dev/null
  fi
  wait_http "http://localhost:${DOJO_PORT}/" "DefectDojo+Nginx" 90
  ok "DefectDojo em http://localhost:${DOJO_PORT}  (${DOJO_USER} / ${DOJO_PASS})"

  # ── MobSF ──
  if ! container_running "$MOBSF_NAME"; then
    step "MobSF — análise mobile"
    docker run -d --name "$MOBSF_NAME" \
      -p "${MOBSF_PORT}:8000" \
      "$MOBSF_IMG" &>/dev/null
    warn "MobSF demora ~1 minuto para baixar ferramentas na primeira vez"
  fi
  ok "MobSF em http://localhost:${MOBSF_PORT}"

  echo -e "\n${GREEN}${BOLD}Stack no ar!${RESET}"
  echo -e "  DefectDojo → http://localhost:${DOJO_PORT}  (${DOJO_USER} / ${DOJO_PASS})"
  echo -e "  MobSF      → http://localhost:${MOBSF_PORT}"
}

# ── Import ────────────────────────────────────────────────────────────────────
import_results() {
  step "Importando resultados no DefectDojo"

  # Token
  local token
  token=$(curl -s -X POST "http://localhost:${DOJO_PORT}/api/v2/api-token-auth/" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$DOJO_USER\",\"password\":\"$DOJO_PASS\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
  if [[ -z "$token" ]]; then
    warn "Token vazio — tentando conectar em http://localhost:${DOJO_PORT}/api/v2/api-token-auth/"
    local raw
    raw=$(curl -sv -X POST "http://localhost:${DOJO_PORT}/api/v2/api-token-auth/" \
      -H "Content-Type: application/json" \
      -d "{\"username\":\"$DOJO_USER\",\"password\":\"$DOJO_PASS\"}" 2>&1 | tail -5)
    warn "Resposta: $raw"
    warn "Pulando import — rode 'make import' quando o DefectDojo estiver pronto"
    return 0
  fi
  ok "Autenticado"

  AUTH="-H 'Authorization: Token $token'"

  # Produto
  local product_id
  product_id=$(curl -s "http://localhost:${DOJO_PORT}/api/v2/products/?name=KaiserPlay" \
    -H "Authorization: Token $token" \
    | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['results'][0]['id'] if r['count']>0 else '')" 2>/dev/null)

  if [[ -z "$product_id" ]]; then
    product_id=$(curl -s -X POST "http://localhost:${DOJO_PORT}/api/v2/products/" \
      -H "Authorization: Token $token" \
      -H "Content-Type: application/json" \
      -d '{"name":"KaiserPlay","description":"App de treinamento auditivo — auditoria de segurança","prod_type":1}' \
      | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
    ok "Produto criado (ID $product_id)"
  else
    ok "Produto existente (ID $product_id)"
  fi

  # Engagement
  local today engagement_id
  today=$(date +%Y-%m-%d)
  engagement_id=$(curl -s -X POST "http://localhost:${DOJO_PORT}/api/v2/engagements/" \
    -H "Authorization: Token $token" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\":\"Auditoria $today\",
      \"product\":$product_id,
      \"target_start\":\"$today\",
      \"target_end\":\"$today\",
      \"engagement_type\":\"CI/CD\",
      \"status\":\"In Progress\"
    }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
  ok "Engagement criado (ID $engagement_id)"

  # Helper de importação
  import_scan() {
    local label=$1 type=$2 file=$3
    if [[ ! -f "$file" ]]; then warn "$label: arquivo não encontrado ($file)"; return; fi
    local result
    result=$(curl -s -X POST "http://localhost:${DOJO_PORT}/api/v2/import-scan/" \
      -H "Authorization: Token $token" \
      -F "scan_type=$type" \
      -F "engagement=$engagement_id" \
      -F "file=@$file" \
      -F "minimum_severity=Info" \
      -F "close_old_findings=false" \
      | python3 -c "
import sys,json
d=json.load(sys.stdin)
if 'test' in d: print(f'OK — test ID {d[\"test\"]}')
else: print('Erro: ' + str(d))
" 2>/dev/null)
    echo "  $label: $result"
  }

  import_scan "ZAP"         "ZAP Scan"            "$RESULTS/zap-report.xml"
  import_scan "TruffleHog"  "Trufflehog Scan"     "$RESULTS/trufflehog.json"
  import_scan "Gitleaks"    "Gitleaks Scan"        "$RESULTS/gitleaks.json"
  import_scan "Trivy"       "Trivy Scan"           "$RESULTS/trivy.json"
  import_scan "Nikto"       "Nikto Scan"           "$RESULTS/nikto.json"
  import_scan "Semgrep"     "Semgrep JSON Report"  "$RESULTS/semgrep.json"
  import_scan "Retire.js"   "Retire.js Scan"       "$RESULTS/retirejs.json"
  import_scan "Nuclei"      "Nuclei Scan"          "$RESULTS/nuclei.json"
  import_scan "Bearer"      "Bearer Scan"          "$RESULTS/bearer.json"
  import_scan "testssl"     "Testssl Scan"         "$RESULTS/testssl.json"

  echo ""
  ok "Importação concluída → http://localhost:${DOJO_PORT}/product/$product_id/finding/list"
}

# ── Report ────────────────────────────────────────────────────────────────────
open_reports() {
  step "Relatórios disponíveis"
  echo ""
  echo -e "  ${BOLD}HTML (ZAP):${RESET}      $RESULTS/zap-report.html"
  echo -e "  ${BOLD}DefectDojo:${RESET}      http://localhost:${DOJO_PORT}"
  echo -e "  ${BOLD}MobSF:${RESET}           http://localhost:${MOBSF_PORT}"
  echo ""

  if [[ -f "$RESULTS/zap-report.html" ]]; then
    if command -v xdg-open &>/dev/null; then
      xdg-open "$RESULTS/zap-report.html" &>/dev/null &
      ok "ZAP HTML aberto no navegador"
    else
      warn "Abra manualmente: $RESULTS/zap-report.html"
    fi
  fi

  echo -e "\n  ${BOLD}Sumário TruffleHog:${RESET}"
  python3 -c "
import json
findings=[]
for line in open('$RESULTS/trufflehog.json'):
    line=line.strip()
    if not line: continue
    try:
        d=json.loads(line)
        if 'DetectorName' in d:
            f=d['SourceMetadata']['Data']['Git']
            findings.append(f'  [{d[\"DetectorName\"]}] {f[\"file\"]}:{f[\"line\"]} — {d[\"Redacted\"]}')
    except: pass
if findings:
    for f in findings: print(f)
else:
    print('  Nenhum segredo detectado')
" 2>/dev/null || warn "trufflehog.json não encontrado — rode: make scan"
}

# ── Status ────────────────────────────────────────────────────────────────────
show_status() {
  echo ""
  echo -e "${BOLD}Containers:${RESET}"
  docker ps --format "  {{.Names}}\t{{.Status}}\t{{.Ports}}" \
    | grep -E "kaiser|dojo" || echo "  (nenhum rodando)"

  echo ""
  echo -e "${BOLD}Resultados em $RESULTS:${RESET}"
  if [[ -d "$RESULTS" ]]; then
    ls -lh "$RESULTS" | awk 'NR>1 {printf "  %-30s %s\n", $9, $5}'
  else
    echo "  (pasta não criada — rode: make scan)"
  fi
  echo ""
}

# ── Clean ─────────────────────────────────────────────────────────────────────
cleanup() {
  step "Parando e removendo containers"
  docker stop  "$DOJO_NAME" "$NGINX_NAME" "$DB_NAME" "$REDIS_NAME" "$MOBSF_NAME" 2>/dev/null || true
  docker rm    "$DOJO_NAME" "$NGINX_NAME" "$DB_NAME" "$REDIS_NAME" "$MOBSF_NAME" 2>/dev/null || true
  ok "Containers removidos (volumes preservados)"
}

reset_all() {
  step "Reset completo — apagando containers E volumes"
  docker stop  "$DOJO_NAME" "$NGINX_NAME" "$DB_NAME" "$REDIS_NAME" "$MOBSF_NAME" 2>/dev/null || true
  docker rm    "$DOJO_NAME" "$NGINX_NAME" "$DB_NAME" "$REDIS_NAME" "$MOBSF_NAME" 2>/dev/null || true
  docker volume rm kaiser-dojo-db kaiser-dojo-media 2>/dev/null || true
  ok "Tudo apagado — próximo 'make stack-up' começa do zero"
}

# ── Summary ───────────────────────────────────────────────────────────────────
print_summary() {
  echo ""
  echo -e "${BOLD}════════════════════════════════════════════════════${RESET}"
  echo -e "${BOLD}  AUDITORIA CONCLUÍDA — KaiserPlay${RESET}"
  echo -e "${BOLD}════════════════════════════════════════════════════${RESET}"
  echo ""

  # TruffleHog
  local thog_count=0
  [[ -f "$RESULTS/trufflehog.json" ]] && thog_count=$(wc -l < "$RESULTS/trufflehog.json" | tr -d ' ')
  if [[ "$thog_count" -gt 0 ]]; then
    echo -e "  ${RED}⚠ TruffleHog:${RESET}  $thog_count segredo(s) encontrado(s)"
  else
    echo -e "  ${GREEN}✔ TruffleHog:${RESET}  limpo"
  fi

  # Gitleaks
  local gitleaks_count=0
  if [[ -f "$RESULTS/gitleaks.json" ]]; then
    gitleaks_count=$(python3 -c "
import json
try:
    d=json.load(open('$RESULTS/gitleaks.json'))
    print(len(d) if isinstance(d,list) else 0)
except: print(0)
" 2>/dev/null || echo 0)
  fi
  if [[ "${gitleaks_count:-0}" -gt 0 ]]; then
    echo -e "  ${RED}⚠ Gitleaks:${RESET}    $gitleaks_count segredo(s) encontrado(s)"
  else
    echo -e "  ${GREEN}✔ Gitleaks:${RESET}    limpo"
  fi

  # Trivy
  local trivy_total=0
  if [[ -f "$RESULTS/trivy.json" ]]; then
    trivy_total=$(python3 -c "
import json
d=json.load(open('$RESULTS/trivy.json'))
r=d.get('Results',[])
print(sum(len(x.get('Vulnerabilities') or [])+len(x.get('Misconfigurations') or [])+len(x.get('Secrets') or []) for x in r))
" 2>/dev/null || echo 0)
  fi
  if [[ "$trivy_total" -gt 0 ]]; then
    echo -e "  ${RED}⚠ Trivy:${RESET}       $trivy_total achado(s)"
  else
    echo -e "  ${GREEN}✔ Trivy:${RESET}       limpo"
  fi

  # ZAP
  if [[ -f "$RESULTS/zap-report.json" ]]; then
    local zap_med zap_low
    zap_med=$(python3 -c "
import json
d=json.load(open('$RESULTS/zap-report.json'))
alerts=d.get('site',[{}])[0].get('alerts',[]) if d.get('site') else []
print(sum(1 for a in alerts if 'Medium' in a.get('riskdesc','')))
" 2>/dev/null || echo "?")
    zap_low=$(python3 -c "
import json
d=json.load(open('$RESULTS/zap-report.json'))
alerts=d.get('site',[{}])[0].get('alerts',[]) if d.get('site') else []
print(sum(1 for a in alerts if 'Low' in a.get('riskdesc','')))
" 2>/dev/null || echo "?")
    echo -e "  ${YELLOW}⚠ ZAP:${RESET}         ${zap_med} Medium, ${zap_low} Low"
  else
    echo -e "  ${YELLOW}? ZAP:${RESET}         relatório não encontrado"
  fi

  # Nikto
  local nikto_count=0
  if [[ -f "$RESULTS/nikto.json" ]]; then
    nikto_count=$(python3 -c "
import json
try:
    d=json.load(open('$RESULTS/nikto.json'))
    print(len(d.get('vulnerabilities',[]) if isinstance(d,dict) else []))
except: print(0)
" 2>/dev/null || echo 0)
  fi
  if [[ "${nikto_count:-0}" -gt 0 ]]; then
    echo -e "  ${YELLOW}⚠ Nikto:${RESET}       $nikto_count achado(s) no servidor"
  else
    echo -e "  ${GREEN}✔ Nikto:${RESET}       limpo"
  fi

  # Observatory
  if [[ -f "$RESULTS/observatory.json" ]]; then
    local obs_grade obs_score
    obs_grade=$(python3 -c "import json; print(json.load(open('$RESULTS/observatory.json')).get('grade','?'))" 2>/dev/null || echo "?")
    obs_score=$(python3 -c "import json; print(json.load(open('$RESULTS/observatory.json')).get('score','?'))" 2>/dev/null || echo "?")
    if [[ "$obs_grade" =~ ^[AB] ]]; then
      echo -e "  ${GREEN}✔ Observatory:${RESET} Grade $obs_grade (score: $obs_score/100)"
    elif [[ "$obs_grade" == "?" ]]; then
      echo -e "  ${YELLOW}? Observatory:${RESET} não executado (URL local)"
    else
      echo -e "  ${YELLOW}⚠ Observatory:${RESET} Grade $obs_grade (score: $obs_score/100)"
    fi
  else
    echo -e "  ${YELLOW}? Observatory:${RESET} relatório não encontrado"
  fi

  # Semgrep
  local semgrep_count=0
  if [[ -f "$RESULTS/semgrep.json" ]]; then
    semgrep_count=$(python3 -c "
import json
d=json.load(open('$RESULTS/semgrep.json'))
print(len(d.get('results',[])))
" 2>/dev/null || echo 0)
  fi
  if [[ "$semgrep_count" -gt 0 ]]; then
    echo -e "  ${RED}⚠ Semgrep:${RESET}     $semgrep_count padrão(ões) inseguro(s) no código"
  else
    echo -e "  ${GREEN}✔ Semgrep:${RESET}     limpo"
  fi

  # Retire.js
  local retire_count=0
  if [[ -f "$RESULTS/retirejs.json" ]]; then
    retire_count=$(python3 -c "
import json
try:
    d=json.load(open('$RESULTS/retirejs.json'))
    print(sum(len(f.get('results',[])) for f in (d if isinstance(d,list) else [])))
except: print(0)
" 2>/dev/null || echo 0)
  fi
  if [[ "$retire_count" -gt 0 ]]; then
    echo -e "  ${RED}⚠ Retire.js:${RESET}   $retire_count biblioteca(s) vulnerável(is)"
  else
    echo -e "  ${GREEN}✔ Retire.js:${RESET}   limpo"
  fi

  # Nuclei
  local nuclei_count=0
  [[ -f "$RESULTS/nuclei.json" ]] && nuclei_count=$(wc -l < "$RESULTS/nuclei.json" | tr -d ' ') || nuclei_count=0
  if [[ "${nuclei_count:-0}" -gt 0 ]]; then
    echo -e "  ${RED}⚠ Nuclei:${RESET}      $nuclei_count achado(s) Firebase/web"
  else
    echo -e "  ${GREEN}✔ Nuclei:${RESET}      limpo"
  fi

  # Bearer
  local bearer_count=0
  [[ -f "$RESULTS/bearer.json" ]] && bearer_count=$(python3 -c "
import json
try:
    d=json.load(open('$RESULTS/bearer.json'))
    print(sum(len(d.get(s,[])) for s in ['critical','high','medium','low','warning']))
except: print(0)" 2>/dev/null || echo 0)
  if [[ "${bearer_count:-0}" -gt 0 ]]; then
    echo -e "  ${RED}⚠ Bearer:${RESET}      $bearer_count vazamento(s) de dados"
  else
    echo -e "  ${GREEN}✔ Bearer:${RESET}      nenhum vazamento de dados"
  fi

  # testssl
  local testssl_count=0
  if [[ -f "$RESULTS/testssl.json" ]]; then
    testssl_count=$(python3 -c "
import json
try:
    d=json.load(open('$RESULTS/testssl.json'))
    bad=[x for x in (d if isinstance(d,list) else [])
         if x.get('severity','') in ('LOW','MEDIUM','HIGH','CRITICAL')]
    print(len(bad))
except: print(0)
" 2>/dev/null || echo 0)
  fi
  if [[ "${testssl_count:-0}" -gt 0 ]]; then
    echo -e "  ${RED}⚠ testssl:${RESET}     $testssl_count problema(s) TLS"
  else
    echo -e "  ${GREEN}✔ testssl:${RESET}     TLS ok"
  fi

  local total=$(( thog_count + gitleaks_count + trivy_total + nikto_count + semgrep_count + retire_count + nuclei_count + bearer_count + testssl_count ))
  echo ""
  echo -e "  ${BOLD}Total de achados:${RESET} $total (ZAP separado acima)"

  echo ""
  echo -e "${BOLD}════════════════════════════════════════════════════${RESET}"
  echo -e "${BOLD}  ACESSO AOS RESULTADOS${RESET}"
  echo -e "${BOLD}════════════════════════════════════════════════════${RESET}"
  echo ""
  echo -e "  ${CYAN}${BOLD}DefectDojo${RESET} — painel unificado com todos os achados"
  echo -e "    URL:   http://localhost:${DOJO_PORT}"
  echo -e "    Login: ${DOJO_USER} / ${DOJO_PASS}"
  echo -e "    Path:  Products → KaiserPlay → Findings"
  echo ""
  echo -e "  ${CYAN}${BOLD}MobSF${RESET} — análise do APK"
  echo -e "    URL:   http://localhost:${MOBSF_PORT}"
  echo -e "    Como:  arraste o .apk na tela inicial"
  echo ""
  echo -e "  ${CYAN}${BOLD}ZAP Report${RESET} — relatório visual do scan ao vivo"
  if [[ -f "$RESULTS/zap-report.html" ]]; then
    echo -e "    ${GREEN}Disponível:${RESET} $RESULTS/zap-report.html"
  else
    echo -e "    ${YELLOW}Não gerado${RESET}"
  fi
  echo ""
  echo -e "  ${CYAN}${BOLD}Arquivos brutos${RESET} — $RESULTS/"
  for f in trufflehog.json gitleaks.json trivy.json zap-report.xml nikto.json semgrep.json retirejs.json nuclei.json bearer.json observatory.json testssl.json; do
    if [[ -f "$RESULTS/$f" ]]; then
      size=$(du -sh "$RESULTS/$f" 2>/dev/null | cut -f1)
      echo -e "    ${GREEN}✔${RESET} $f  ${YELLOW}($size)${RESET}"
    else
      echo -e "    ${YELLOW}✗${RESET} $f  (não gerado)"
    fi
  done
  echo ""
  echo -e "  ${BOLD}Próximos passos:${RESET}"
  echo -e "    make import    → reimportar após novo scan"
  echo -e "    make clean     → parar containers (dados preservados)"
  echo -e "    make reset     → apagar tudo e recomeçar do zero"
  echo -e "    make status    → ver containers e arquivos atuais"
  echo ""
  echo -e "${BOLD}════════════════════════════════════════════════════${RESET}"
  echo ""
}

# ── Help ──────────────────────────────────────────────────────────────────────
show_help() {
  echo ""
  echo -e "${BOLD}KaiserPlay — Auditoria de Segurança${RESET}"
  echo ""
  echo -e "  ${CYAN}./audit.sh all${RESET}        Roda tudo (scan + stack + import + report)"
  echo -e "  ${CYAN}./audit.sh scan${RESET}       TruffleHog + Gitleaks + Trivy + ZAP + Nikto + Semgrep + Retire.js + Nuclei + Bearer + Observatory + testssl"
  echo -e "  ${CYAN}./audit.sh stack-up${RESET}   Sobe DefectDojo e MobSF"
  echo -e "  ${CYAN}./audit.sh import${RESET}     Importa resultados no DefectDojo"
  echo -e "  ${CYAN}./audit.sh report${RESET}     Mostra / abre os relatórios"
  echo -e "  ${CYAN}./audit.sh status${RESET}     Mostra containers e arquivos gerados"
  echo -e "  ${CYAN}./audit.sh clean${RESET}      Para e remove todos os containers (preserva banco)"
  echo -e "  ${CYAN}./audit.sh reset${RESET}      Clean + apaga o banco (use quando der erro 500)"
  echo ""
  echo -e "  ${BOLD}URL alvo (ZAP / Nikto / Nuclei / testssl):${RESET}"
  echo -e "  Padrão:  $PROD_URL"
  echo -e "  Local:   ${CYAN}TARGET_URL=http://localhost:5500 ./audit.sh scan${RESET}"
  echo -e "  Ou via Makefile: ${CYAN}make scan-local${RESET}  /  ${CYAN}make scan-url URL=https://...${RESET}"
  echo ""
  echo -e "  DefectDojo → http://localhost:8080  (admin / kaiseraudit2026)"
  echo -e "  MobSF      → http://localhost:8089  (arraste o .apk na interface)"
  echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  local cmd="${1:-help}"
  case "$cmd" in
    all)       run_scans; start_stack; import_results; open_reports; print_summary ;;
    scan)      run_scans ;;
    stack-up)  start_stack ;;
    import)    import_results ;;
    report)    open_reports ;;
    status)    show_status ;;
    clean)     cleanup ;;
    reset)     reset_all ;;
    help|*)    show_help ;;
  esac
}

main "$@"
