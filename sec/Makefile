SHELL := /bin/bash
LOCAL_URL ?= http://localhost:5500

.PHONY: all scan scan-local scan-url stack-up import report status clean reset help

## Roda tudo contra a URL de produção: scan → stack → import → report
all:
	@./audit.sh all

## Scan completo contra a URL de produção
scan:
	@./audit.sh scan

## Scan completo contra servidor local (padrão: http://localhost:5500)
## Uso: make scan-local  ou  make scan-local LOCAL_URL=http://localhost:8080
scan-local:
	@TARGET_URL=$(LOCAL_URL) ./audit.sh scan

## Scan contra qualquer URL: make scan-url URL=https://staging.exemplo.com
scan-url:
	@[ -n "$(URL)" ] || (echo "Uso: make scan-url URL=https://..." && exit 1)
	@TARGET_URL=$(URL) ./audit.sh scan

## Sobe DefectDojo + MobSF
stack-up:
	@./audit.sh stack-up

## Importa resultados no DefectDojo (requer stack-up)
import:
	@./audit.sh import

## Abre os relatórios
report:
	@./audit.sh report

## Status dos containers e arquivos gerados
status:
	@./audit.sh status

## Para e remove todos os containers (preserva banco)
clean:
	@./audit.sh clean

## Para containers E apaga o banco (reset total)
reset:
	@./audit.sh reset

help:
	@./audit.sh help
	@echo ""
	@echo "  Targets extras:"
	@echo "    make scan-local                    scan contra http://localhost:5500"
	@echo "    make scan-local LOCAL_URL=<url>    scan contra URL local customizada"
	@echo "    make scan-url URL=<url>            scan contra qualquer URL"
