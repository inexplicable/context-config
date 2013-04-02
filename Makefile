all: clean install test

clean:
	-rm -fr node_modules

install:
	npm install;\
	npm link BitSet;\
	npm link;

.PHONY : test
test: 
	export NODE_PATH=./node_modules;\
	node_modules/.bin/mocha test/*.js 

test-part:
	export NODE_PATH=./node_modules;\
	node_modules/.bin/mocha test/*.js --reporter junit --output ../../reports

unpublish:
	npm --registry $(REGISTRY) unpublish

publish:
	npm --registry $(REGISTRY) publish

refresh:
	npm --registry $(REGISTRY) publish --force
