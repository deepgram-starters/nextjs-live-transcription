PNPM := corepack pnpm

.PHONY: check check-prereqs init install install-frontend start start-backend start-frontend build test validate-contracts update clean status eject-frontend

check: check-prereqs

check-prereqs:
	@command -v git >/dev/null && command -v node >/dev/null && command -v corepack >/dev/null
	@test "$$(node -p 'process.versions.node.split(".")[0]')" -ge 24

init: check-prereqs
	git submodule update --init --recursive
	$(PNPM) install --frozen-lockfile
	cd frontend && $(PNPM) install --frozen-lockfile

install:
	$(PNPM) install --frozen-lockfile

install-frontend:
	cd frontend && $(PNPM) install --frozen-lockfile

start:
	@$(MAKE) start-backend & $(MAKE) start-frontend & wait

start-backend:
	$(PNPM) run dev

start-frontend:
	cd frontend && $(PNPM) run dev -- --port 8080 --no-open

build:
	$(PNPM) run build
	cd frontend && $(PNPM) run build

test:
	$(PNPM) test

validate-contracts:
	bash contracts/tests/live-transcription/structure/validate-contracts.sh .
	bash contracts/tests/live-transcription/structure/validate-frontend.sh .

update:
	git submodule update --remote --merge

clean:
	rm -rf node_modules .next frontend/node_modules frontend/dist

status:
	git status --short
	git submodule status

eject-frontend:
	@echo "The frontend remains a pinned submodule; use git submodule update --init --recursive."
