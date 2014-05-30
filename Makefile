all: src/rlogParser.y
	jison src/rlogParser.y

test:
	mocha test

