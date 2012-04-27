NODE_PATH ?= ./node_modules
JS_COMPILER = $(NODE_PATH)/uglify-js/bin/uglifyjs
JS_TESTER = $(NODE_PATH)/vows/bin/vows

all: \
	science.v1.js \
	science.v1.min.js \
	package.json

.INTERMEDIATE science.v1.js: \
	science.core.js \
	science.lin.js \
	science.stats.js \
	Makefile

science.core.js: \
	src/core/core.js \
	src/core/ascending.js \
	src/core/constants.js \
	src/core/expm1.js \
	src/core/functor.js \
	src/core/hypot.js \
	src/core/quadratic.js \
	src/core/zeroes.js

science.lin.js: \
	src/lin/lin.js \
	src/lin/decompose.js \
	src/lin/cross.js \
	src/lin/dot.js \
	src/lin/length.js \
	src/lin/normalize.js \
	src/lin/determinant.js \
	src/lin/gaussjordan.js \
	src/lin/inverse.js \
	src/lin/multiply.js \
	src/lin/transpose.js \
	src/lin/tridag.js

science.stats.js: \
	src/stats/stats.js \
	src/stats/bandwidth.js \
	src/stats/distance.js \
	src/stats/erf.js \
	src/stats/phi.js \
	src/stats/kernel.js \
	src/stats/kde.js \
	src/stats/kmeans.js \
	src/stats/hcluster.js \
	src/stats/iqr.js \
	src/stats/loess.js \
	src/stats/mean.js \
	src/stats/median.js \
	src/stats/mode.js \
	src/stats/quantiles.js \
	src/stats/variance.js \
	src/stats/distribution.js \
	src/stats/distribution/gaussian.js

test: all
	@$(JS_TESTER)

%.min.js: %.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@

%.js:
	@rm -f $@
	@echo '(function(exports){' > $@
	cat $(filter %.js,$^) >> $@
	@echo '})(this);' >> $@
	@chmod a-w $@

install:
	mkdir -p node_modules
	npm install

package.json: src/package.js
	@rm -f $@
	node src/package.js > $@
	@chmod a-w $@

clean:
	rm -f science*.js package.json
