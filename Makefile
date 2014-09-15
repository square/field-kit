ESNEXT=./node_modules/.bin/esnext
COMPILE_MODULES=./node_modules/.bin/compile-modules
JSHINT=./node_modules/.bin/jshint

all: dist

clean:
	rm -rf build dist

dist: dist/field-kit.js dist/field-kit.min.js generate-docs

# Create rules dynamically of the form:
#
#   build/index.js: lib/index.js
#           esnext -o $@ $<
#
define esnextbuild
$(patsubst %.js, $(2)/%.js, $(notdir $(1))): $(1)
	@mkdir -p $(2)
	$(ESNEXT) -o $$@ $$<
endef

# Build lib/*.js
$(foreach file,$(wildcard lib/*.js),$(eval $(call esnextbuild, $(file), build/lib)))

# Build test/helpers/*.js
$(foreach file,$(wildcard test/helpers/*.js),$(eval $(call esnextbuild, $(file), build/test/helpers)))

# Build test/*.js
$(foreach file,$(wildcard test/*.js),$(eval $(call esnextbuild, $(file), build/test)))

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

generate-docs: clean-docs write-doc-files

clean-docs:
	rm -rf docs; mkdir docs;

write-doc-files:
	for i in $$(find lib -name '*.js'); do echo ;echo $$i; $$(npm bin)/markdox $$i -o docs/$$(basename $${i%.*}).md && echo '['$$(basename $${i%.*})']('$$(basename $${i%.*})'.md)' >> docs/README.md; echo ' ' >> docs/README.md; done

build/test/all.js: $(TEST_HELPERS_OBJS) $(TEST_OBJS) Makefile
	$(COMPILE_MODULES) convert -I build/test -f bundle -o $@ $(TEST_OBJS)

test-setup: dist/field-kit.js build/test/all.js Makefile

lint: lib/*.js test/*.js
	$(JSHINT) $^

test: lint test-setup
	node_modules/karma/bin/karma start --single-run

.PHONY: test lint test-setup
