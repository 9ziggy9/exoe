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
TFLAGS=--noImplicitAny --noImplicitReturns --noUnusedLocals --strict
PORT=1337
TSSRC=./main.ts
JSOUT=./main.js

.PHONY: all run ts clean serve

all: ts run clean

serve: clean ts
	python3 -m "http.server" $(PORT)

run:
	$(call print_in_color, $(GREEN), \nRUNNING COMPILED JS:)
	$(call print_in_color, $(CYAN), \n----------------------\n\n)
	@node $(JSOUT)
	$(call print_in_color, $(CYAN), \n----------------------\n)

ts:
	$(call print_in_color, $(GREEN), \nBUILDING TS:\n)
	$(TSC) $(TFLAGS) --outFile $(JSOUT) $(TSSRC)

clean:
	$(call print_in_color, $(YELLOW), \nCLEANING...\n)
	rm -f $(JSOUT)
	$(call print_in_color, $(GREEN), \nDONE.\n)
