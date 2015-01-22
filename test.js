colors = require('colors');

fs = require('fs');
Parser = require('jison').Parser;
bnf = require('ebnf-parser');
Lexer = require('jison-lex');
chai = require('chai');

require('src/rule.js');
Preparser = require('src/gramext.js');

var grammar = fs.readFileSync('src/addGrammer.y','utf8');
var content = fs.readFileSync('content.md','utf8');
var content2 = fs.readFileSync('content2.md','utf8');



g = Preparser.parse( grammar )
// g = bnf.parse( grammar );

parser = new Parser(g);
lexer = new Lexer(g.lex);

// AST Parser
parser.yy.Node = Node;



// console.log(JSON.stringify(g,false,2))



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
// var output2 = parser.parse(content2);
console.log(output.toString())
// console.log(output2.build())
// var output2 = parser.parse(content2);

// output.seekDifference( output2 );

// console.log(JSON.stringify(output,null,2));
