fs = require('fs');
Parser = require('jison').Parser;
bnf = require('ebnf-parser');
Lexer = require('jison-lex');
chai = require('chai');

var should = require('chai').should()
var expect = require('chai').expect

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
  
  ///////////////////////////////////// GENEREL COMPILER
  
  it('should compile', function(){
    var ast = parser.parse(content);
    
    ast.toString().should.equal(content)
  });
  
  it('should throw an Error on multiple votes by one acteur', function(){
    addr = "0x00"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 1.0] [0x00 0.1]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
    expect(parser.parse.bind(parser, content2)).to.throw();
  });
  
  ///////////////////////////////////// VOTING
  
  it('should accept submit voting by correct actor', function(){
    addr = "0x01"
    
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 1.0] [0x01 0.1]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
    
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.true;
  });
  
  it('should decline submit voting by wrong actor', function(){
    addr = "0x00"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 1.0] [0x01 0.1]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
    
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.false;
  });
  

  it('should accept remove voting by right actor', function(){
    addr = "0x00"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
    
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.true;
  });
  
  it('should decline remove voting by wrong actor', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.false;
  });
  
  it('should accept change voting by right actor', function(){
    addr = "0x00"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 0.1]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
    
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.true;
  });
  
  it('should decline change voting by wrong actor', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 0.1]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.false;
  });
  
  it('should accept add deligation by right actor', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02] [0x01 0x02]]";
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.true;
  });
  
  it('should decline add deligation by wrong actor', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02] [0x00 0x02]]";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.false;
  });
  
  it('should accept remove deligation by right actor', function(){
    addr = "0x03"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] []";
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.true;
  });
  
  it('should decline remove deligation by wrong actor', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] []";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.false;
  });
  
  // test no changes
  // test invalid changes
  
  // test option extention
  // test option creation
  
  it('should accept new options', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]] 3&[]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.true;
  });
  
  it('should decline new options with wrong acteur inheretence', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( 1 + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]] 3&[[0x00 1.0]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.false;
  });
  

  it('should accept new option creation', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( [ 1&[] 2&[] ][] + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.true;
  });
  
  it('should accept new option creation with correct voting from acteur', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( [ 1&[[0x01 1.0]] 2&[] ][] + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.true;
  });
  
  it('should decline new option creation with non acteur voting', function(){
    addr = "0x01"
    
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( [ 1&[[0x00 1.0]] 2&[] ][] + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.false;
  });
  
  it('should decline new option creation with non acteur delegation', function(){
    addr = "0x01"
    
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( [ 1&[] 2&[] ][[0x00 0x01]] + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.false;
  });
  
  
  it('should accept new option creation with nested options', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( [ 1&[] ( [1&[]][] + 2 )&[] ][] + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.true;
  });
  
  it('should decline new option creation with nested options and votes by right acteur', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( [ 1&[] ( [1&[[0x01 1.0]]][] + 2 )&[] ][] + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.true;
  });

  it('should decline new option creation with nested options and votes by wrong acteur', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( [ 1&[] ( [1&[[0x00 1.0]]][] + 2 )&[] ][] + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.false;
  });
  
  it('should accept new option creation with nested options and delegations by right acteur', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( [ 1&[] ( [1&[]][[0x01 0x00]] + 2 )&[] ][] + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.true;
  });

  it('should decline new option creation with nested options and delegations by wrong acteur', function(){
    addr = "0x01"
    content2 = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [( [ 1&[] ( [1&[]][[0x00 0x01]] + 2 )&[] ][] + [1 &[[0x00 1.0]] 2 &[[0x01 0.6]]] [[0x03 0x00] [0x02 0x01]] ) &[] ] [[0x03 0x02]]";
  
    var ast = parser.parse(content);
    var ast2 = parser.parse(content2);
    var isValid = ast.validate( ast2, addr );
    isValid.should.be.false;
  });
  
  // test option creation vote inherencement

  	
});

describe('w+mw', function() {
  
  it('should create an option set', function(){
    
    grammar = fs.readFileSync('abcGrammer.y','utf8');
    g = Preparser.parse( grammar )
    parser = new Parser(g);
    parser.yy.Node = Node;
    content = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [a a b b &[] ] [[0x03 0x02]]";
    
    var ast = parser.parse(content);
    ast.add( 'aaabb', parser );
    var string = ast.toString();
    string.should.equal( "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [a a [b b &[] a b b &[]] [] &[] ] [[0x03 0x02]]" );
    
  });
  

  it('should extend an option set', function(){
    
    grammar = fs.readFileSync('abcGrammer.y','utf8');
    g = Preparser.parse( grammar )
    parser = new Parser(g);
    parser.yy.Node = Node;
    content = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [a a [b b &[]] [] &[] ] [[0x03 0x02]]";
    
    var ast = parser.parse(content);
    ast.add( 'aaabb', parser );
    var string = ast.toString();
    string.should.equal( "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [a a [b b &[] a b b &[]] [] &[] ] [[0x03 0x02]]" );
    
  });
  

  it('should create a nested option set', function(){
    
    grammar = fs.readFileSync('abcGrammer.y','utf8');
    g = Preparser.parse( grammar )
    parser = new Parser(g);
    parser.yy.Node = Node;
    content = "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [a a [b b &[] a b b &[]] [] &[] ] [[0x03 0x02]]";
    
    var ast = parser.parse(content);
    ast.add( 'aaaabb', parser );
    var string = ast.toString();
    string.should.equal( "[[0x00 10] [0x01 20] [0x02 10] [0x03 5]] [a a [b b &[] a [b b &[] a b b &[]] [] &[]] [] &[] ] [[0x03 0x02]]" );
    
  });
  

  // [TODO] - vote inherencements
  // [TODO] - reject manipulation of acteurs
  
});
