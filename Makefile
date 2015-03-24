NPMBIN=$(shell npm bin)
BABEL=$(NPMBIN)/babel
COMPILE_MODULES=$(NPMBIN)/compile-modules
JSHINT=$(NPMBIN)/jshint
JSDOC=$(NPMBIN)/jsdoc

all: dist test

clean: clean-docs
	rm -rf build dist

dist: dist/field-kit.js dist/field-kit.min.js docs

# Create rules dynamically of the form:
#
#   build/index.js: lib/index.js
#           babel -o $@ $<
#
define babelbuild
$(patsubst %.js, $(2)/%.js, $(notdir $(1))): $(1)
	@mkdir -p $(2)
	$(BABEL) -o $$@ --blacklist es6.modules,useStrict $$<
endef

# Build lib/*.js
$(foreach file,$(wildcard lib/*.js),$(eval $(call babelbuild, $(file), build/lib)))

# Build test/helpers/*.js
$(foreach file,$(wildcard test/helpers/*.js),$(eval $(call babelbuild, $(file), build/test/helpers)))

# Build test/*.js
$(foreach file,$(wildcard test/*.js),$(eval $(call babelbuild, $(file), build/test)))

# Collect the targets that may not exist yet for build/lib/*.js.
LIB_OBJS=$(foreach file,$(wildcard lib/*.js),build/lib/$(notdir $(file)))

# Collect the targets that may not exist yet for build/test/helpers/*.js.
TEST_HELPERS_OBJS=$(foreach file,$(wildcard test/helpers/*.js),build/test/helpers/$(notdir $(file)))

# Collect the targets that may not exist yet for build/test/*.js.
TEST_OBJS=$(foreach file,$(wildcard test/*.js),build/test/$(notdir $(file)))

# Build the distribution file by using es6-modules to concatenate.
dist/field-kit.js: $(LIB_OBJS) node_modules/stround/lib/*.js Makefile
	@mkdir -p dist
	$(COMPILE_MODULES) convert -I build/lib -I node_modules/stround/lib -f bundle -o $@ index

dist/%.min.js: dist/%.js
	cat $< | closure-compiler --language_in ECMASCRIPT5 > $@

docs: clean-docs
	$(JSDOC) -r lib -d docs

clean-docs:
	rm -rf docs

build/test/all.js: $(TEST_HELPERS_OBJS) $(TEST_OBJS) Makefile
	$(COMPILE_MODULES) convert -I build/test -f bundle -o $@ $(TEST_OBJS)

test-setup: dist/field-kit.js build/test/all.js Makefile

lint: lib/*.js test/*.js
	$(JSHINT) $^

test: lint test-setup
	node_modules/karma/bin/karma start --single-run

.PHONY: test lint test-setup docs
