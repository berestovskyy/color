check:: install build fmt lint

help::
	@echo "Main targets:"
	@echo "    check       Run quick checks: install, build, fmt, lint."
	@echo "    help        This help message."
	@echo "    install     Install dependencies."
	@echo "    clean       Remove generated artifacts."
	@echo "Test targets:"
	@echo "    build       Run install, build."
	@echo "    lint        Run install, lint."
	@echo "Misc targets:"
	@echo "    fmt         Run instal, gts fix."
	@echo "    publish     Run clean, build, vsce package."

install::
	npm install
	npm prune
	npm install -g @vscode/vsce

clean::
	rm -rdf build node_modules

build:: install
	npm run compile

lint:: install
	npm run lint

fmt:: install
	npx gts fix

publish:: clean build
	vsce package
