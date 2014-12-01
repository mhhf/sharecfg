all: src/rlogParser.y
	jison src/rlogParser.y
	echo "\nRlogParser = rlogParser;" >> rlogParser.js

test:
	mocha test

