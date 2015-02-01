
colors = require('colors');

fs = require('fs');
Parser = require('jison').Parser;
bnf = require('ebnf-parser');
Lexer = require('jison-lex');
chai = require('chai');

require('src/rule.js');
Preparser = require('src/gramext.js');

var grammar = fs.readFileSync('abcGrammer.y','utf8');
// var content = fs.readFileSync('abc1.md','utf8');
// var content2 = fs.readFileSync('abc2.md','utf8');


content = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [a a [b b &[] a b b &[] ][] &[] ] [[0x03 0x02]]";
content2 = "aa";
 

g = Preparser.parse( grammar );
// console.log( JSON.stringify(g.bnf, false, 2) );

// g = bnf.parse( grammar );
// g = bnf.parse( grammar );

parser = new Parser(g);
// parser = new Parser( grammar );
lexer = new Lexer(g.lex);

// AST Parser
parser.yy.Node = Node;

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
// var output = parser.parse(content2);
// var output2 = parser.parse(content2);
console.log( output.toString() );
 
// output.seekDifference( output2 );

