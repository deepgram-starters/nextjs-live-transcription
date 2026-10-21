.PHONY: check install start update clean eject-frontend test

check:
	@command -v git && command -v node && command -v pnpm

install:
	@corepack pnpm install

start:
	@corepack pnpm dev

update:
	@corepack pnpm update

clean:
	@rm -rf node_modules .next

eject-frontend:
	@git submodule update --init --recursive

test:
	@corepack pnpm test
