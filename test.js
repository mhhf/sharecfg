colors = require('colors');

fs = require('fs');
Parser = require('jison').Parser;
bnf = require('ebnf-parser');
Lexer = require('jison-lex');
chai = require('chai');

var grammar = fs.readFileSync('src/rlogParser.y','utf8');
var content = fs.readFileSync('content.md','utf8');

parser = new Parser(grammar);
lexer = new Lexer(grammar);




console.log('\nCONTENT:'.green);
console.log(content);

console.log('\nTOKENS:'.green);
var lex = lexer.setInput(content);
var token,i=0, max = 29;
do{
	(token = lex.lex());
	i++;
	console.log( '\t< '+token.yellow+', '+lex.yytext.red+' >' );
} while ( token != 'EOF' && (i<max || max == -1) )
console.log('\nOUTPUT:'.green);

var output = parser.parse(content);
console.log(JSON.stringify(output,null,2));
