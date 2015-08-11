NPMBIN=$(shell npm bin)
BABEL=$(NPMBIN)/babel
BABEL_NODE=$(NPMBIN)/babel-node
JSHINT=$(NPMBIN)/jshint
JSDOC=$(NPMBIN)/jsdoc

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
