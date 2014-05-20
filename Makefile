ESNEXT=./node_modules/.bin/esnext
COMPILE_MODULES=./node_modules/.bin/es6-modules

all: dist

clean:
	rm -rf build dist

dist: dist/field-kit.js dist/field-kit.min.js

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
	$(COMPILE_MODULES) convert -I build/lib -I node_modules/stround/lib -f export-variable -o $@ index

dist/%.min.js: dist/%.js
	cat $< | closure-compiler --language_in ECMASCRIPT5 > $@

build/test/all.js: $(TEST_HELPERS_OBJS) $(TEST_OBJS) Makefile
	$(COMPILE_MODULES) convert -I build/test -f export-variable -o $@ $(TEST_OBJS)

test-setup: dist/field-kit.js build/test/all.js Makefile

test: test-setup
	node_modules/karma/bin/karma start --single-run

.PHONY: test test-setup
