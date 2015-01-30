fs = require('fs');
Parser = require('jison').Parser;
bnf = require('ebnf-parser');
Lexer = require('jison-lex');
chai = require('chai');

var should = require('chai').should()

require('src/rule.js');
Preparser = require('src/gramext.js');

// describe('Grammar', function(){
//   it('bla', function(){
//     bla
//   });
// })


describe('word change validator', function(){
  
  beforeEach(function(){
    
    grammar = fs.readFileSync('src/addGrammer.y','utf8');
    g = Preparser.parse( grammar )
    parser = new Parser(g);
    parser.yy.Node = Node;
    content = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
    
  });
  
  it('should compile', function(){
    var ast = parser.parse(content);
    
    ast.toString().should.equal(content)
  });
  
  it('should accept submit voting by correct actor', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 1.0] [0x01 0.1]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
    
    var ast = parser.parse(content);
    var isValid = ast.validate( content2, addr );
    isValid.should.be.True;
  });
  
  it('should decline submit voting by wrong actor', function(){
    addr = "0x00"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 1.0] [0x01 0.1]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
    
    var ast = parser.parse(content);
    var isValid = ast.validate( content2, addr );
    isValid.should.be.False;
  });
  
  // test multiple changes
  // test no changes
  // test invalid changes

  // test voting update of acteur
  // test voting update of other actor
  // test multiple voting updates
  // test voting removal
  
  // test delegation of actor
  // test delegation of other actor
  // test multiple delegations
  // test delegation removal
  
  // test option extention
  // test option creation
  	
});
