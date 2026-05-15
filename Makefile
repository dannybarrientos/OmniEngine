include .env
export

.PHONY: test-vision build clean

build:
	@mkdir -p bin
	@cd core-engine && go build -o ../bin/sanitizer sanitizer.go

test-vision: build
	@node agents-js/browser-engine.js | ./bin/sanitizer

clean:
	@rm -rf bin/
	@rm -rf agents-js/node_modules