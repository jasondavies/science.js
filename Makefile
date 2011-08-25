JS_COMPILER = ./node_modules/uglify-js/bin/uglifyjs
JS_TESTER = ./node_modules/vows/bin/vows

all: \
	science.js \
	science.min.js \
	science.lin.js \
	science.lin.min.js \
	science.stats.js \
	science.stats.min.js

.INTERMEDIATE science.js: \
	src/start.js \
	science.core.js \
	src/end.js

science.core.js: \
	src/core/core.js \
	src/core/functor.js \
	src/core/hypot.js \
	src/core/zeroes.js

science.lin.js: \
	src/start.js \
	src/lin/lin.js \
	src/lin/tridag.js \
	src/end.js

science.stats.js: \
	src/start.js \
	src/stats/stats.js \
	src/stats/bandwidth.js \
	src/stats/distance.js \
	src/stats/kernel.js \
	src/stats/kde.js \
	src/stats/kmeans.js \
	src/stats/iqr.js \
	src/stats/loess.js \
	src/stats/mean.js \
	src/stats/median.js \
	src/stats/mode.js \
	src/stats/quantiles.js \
	src/stats/variance.js \
	src/end.js

test: all
	@$(JS_TESTER)

%.min.js: %.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@

science.js science%.js: Makefile
	@rm -f $@
	cat $(filter %.js,$^) > $@
	@chmod a-w $@

%.test: %.js %.out all
	@/bin/echo -n "test: $* "
	@node $< > $*.actual
	@diff -U 3 $*.out $*.actual && rm -f $*.actual \
		&& echo '\033[1;32mPASS\033[0m' \
		|| echo test: $* '\033[1;31mFAIL\033[0m'

clean:
	rm -f science*.js
