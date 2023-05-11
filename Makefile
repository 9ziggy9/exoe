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

.PHONY: all run ts clean

all: ts run clean

run: ts
	$(call print_in_color, $(GREEN), \nRUNNING COMPILED JS:)
	$(call print_in_color, $(CYAN), \n----------------------\n\n)
	@node ./main.js
	$(call print_in_color, $(CYAN), \n----------------------\n)

ts:
	$(call print_in_color, $(GREEN), \nBUILDING TS:\n)
	$(TSC) $(TFLAGS) --outFile ./main.js ./hello.ts

clean:
	$(call print_in_color, $(YELLOW), \nCLEANING...\n)
	rm ./main.js
	$(call print_in_color, $(GREEN), \nDONE.\n)
