NPMBIN=$(shell npm bin)
BABEL=$(NPMBIN)/babel
BABEL_NODE=$(NPMBIN)/babel-node
JSHINT=$(NPMBIN)/jshint
JSDOC=$(NPMBIN)/jsdoc

all: dist test

clean: clean-docs
	rm -rf build dist

dist: dist/field-kit.js dist/field-kit.min.js docs

build:
	$(BABEL_NODE) script/build.js
	cp dist/field-kit.js public/field-kit.js

# Build the distribution file by using es6-modules to concatenate.
dist/field-kit.js: build

dist/%.min.js: dist/%.js
	cat $< | closure-compiler --language_in ECMASCRIPT5 > $@

docs: clean-docs
	$(JSDOC) -r lib -d docs

clean-docs:
	rm -rf docs

test-setup: dist/field-kit.js Makefile

lint: lib/*.js test/unit/*.js
	$(JSHINT) $^

test: test-setup build
	$(NPMBIN)/karma start --single-run && $(NPMBIN)/mocha --harmony -t 600000 test/selenium/index.js

.PHONY: test lint test-setup docs build
