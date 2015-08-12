NPMBIN=$(shell npm bin)
JSDOC=$(NPMBIN)/jsdoc

docs: clean-docs
	$(JSDOC) -r lib -d docs

clean-docs:
	rm -rf docs

.PHONY: docs
