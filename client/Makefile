RED=\033[31m
GREEN=\033[32m
YELLOW=\033[33m
BLUE=\033[34m
MAGENTA=\033[35m
CYAN=\033[36m
RESET=\033[0m

define print_in_color
	@printf "$1"
	@printf "$2"
	@printf "\033[0m"
endef

TSC=./node_modules/.bin/tsc
TFLAGS=--noImplicitAny --noImplicitReturns --noUnusedLocals --strict true
MODOPTS=--module es2015  --target es5 --esModuleInterop true
PORT=1337
BUILD_DIR=./dist
SRC_DIR=./src
WPACK=./node_modules/.bin/webpack
WPFLAGS=--progress --mode development
WPACK_DIR=./bundle

.PHONY: all run main editor clean stats

all: clean main editor bundle

run:
	$(call print_in_color, $(GREEN), \nRUNNING COMPILED JS:)
	$(call print_in_color, $(CYAN), \n----------------------\n\n)
	@node $(JSOUT)
	$(call print_in_color, $(CYAN), \n----------------------\n)

main:
	$(call print_in_color, $(GREEN), \nBUILDING MAIN CODE:\n)
	$(TSC) $(TFLAGS) $(MODOPTS) --outDir $(BUILD_DIR) $(SRC_DIR)/main.ts

editor:
	$(call print_in_color, $(GREEN), \nBUILDING EDITOR CODE:\n)
	$(TSC) $(TFLAGS) $(MODOPTS) --outDir $(BUILD_DIR) $(SRC_DIR)/editor.ts

bundle: main editor
	$(call print_in_color, $(GREEN), \nBUNDLING WEBPACKS:\n)
	$(WPACK) $(WPFLAGS) ./dist/editor.js -o $(WPACK_DIR) \
		--output-filename "editor.js"

stats:
	$(call print_in_color, $(YELLOW), \nCURRENT PROJECT SIZE BREAKDOWNS:\n)
	@du -h --exclude=node_modules | sort -rh

clean:
	$(call print_in_color, $(YELLOW), \nCLEANING...\n)
	rm -rf $(BUILD_DIR) $(WPACK_DIR)
	$(call print_in_color, $(GREEN), \nDONE.\n)
