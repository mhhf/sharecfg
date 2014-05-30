fs = require('fs');
Parser = require('jison').Parser;
bnf = require('ebnf-parser');
Lexer = require('jison-lex');
chai = require('chai');

var should = require('chai').should()


describe('slide Parser', function(){

	// Load the grammer file and parse the parser
  before( function(done){
    var grammar = fs.readFileSync('src/llmdParser.y','utf8');
    parser = new Parser(grammar);
    done();
	});

	it('should ectract --- lines', function() {
		parser.parse('slide1---\nstill slide 1').should.have.length(1);
		parser.parse('slide1\n ---\nstill slide 1').should.have.length(1);
		parser.parse('slide1').should.have.length(1);
		parser.parse('slide1\n---\nslide2').should.have.length(2);
		parser.parse('slide1\n---\nslide2\n---\nslide3').length.should.equal(3);
	});

  it('should ignore chars after "---" ', function() {
		parser.parse('slide1\n---   \nslide2').length.should.equal(2);
		parser.parse('slide1\n---   this should be ignored\nslide2').should.deep.equal(
       [{ from: 1, to: 2, md:[  'slide1' ], notes:[] }, { from: 3, to: 3, md:[  'slide2' ], notes:[] }]
      );
  });

  it('should ignore chars after "???" ', function() {
		parser.parse('slide1\n???   \nnotes2').length.should.equal(1);
		parser.parse('slide1\n???   this should be ignored\nnotes1').should.deep.equal(
       [{ from: 1, to: 3, md:[  'slide1' ], notes: ['notes1'] }]
      );
    parser.parse('slide1\n???').should.deep.equal(
        [{ from:1, to: 2, md:[  'slide1' ], notes:[] }]
      );
    parser.parse('slide1\n??? da fuck is this?').should.deep.equal(
        [{ from:1, to: 2, md:[  'slide1' ], notes:[] }]
      );
  });

  it('should extract notes split with the "???" seperator', function() {
		parser.parse('slide1???\nstill slide 1')[0].should.have
      .property('notes')
      .and.have.length(0);
		parser.parse('slide1\n ???\nstill slide 1')[0].should.have
      .property('notes')
      .and.have.length(0);
		parser.parse('slide1\n???\nnotes')[0].should.have
      .property('notes')
      .and.deep.equal(['notes']);
  });

  it('should ignore "---" and "???" in codelines', function() {
		parser.parse('slide\n```\n???\n```\n???\nnotes').should.deep.equal([
      { from: 1, to: 6, md:[  'slide\n```\n???\n```' ], notes: ['notes'] } 
    ]);
		parser.parse('slide\n```\n---\n```\n???\nnotes').should.deep.equal([
      { from: 1, to: 6, md:[  'slide\n```\n---\n```' ], notes: ['notes'] } 
    ]);
  });
  
  it('should extract package', function() {
    
    parser.parse('slide\n{{\npackageName  {\nbla:{a:\'blubb\'}\n}}}\n???\nnotes').should.deep.equal([
      { from: 1, to: 7, md:[ 'slide\n', {type:'package', name: "packageName", data:'  {\nbla:{a:\'blubb\'}\n}'} ], notes: ['notes'] } 
    ]);
    
    parser.parse('slide\n{{\npackageName  {\nbla:\'blubb\'\n}}}\n???\nnotes').should.deep.equal([
      { from: 1, to: 7, md:[ 'slide\n', {type:'package', name: "packageName", data:'  {\nbla:\'blubb\'\n}'} ], notes: ['notes'] } 
    ]);
    
    parser.parse('slide\n{{\npackageName  {\nbla:\'blubb\'\n}\n}}\n???\nnotes').should.deep.equal([
      { from: 1, to: 8, md:[ 'slide\n', {type:'package', name: "packageName", data:'  {\nbla:\'blubb\'\n}\n'} ], notes: ['notes'] } 
    ]);
    
    parser.parse('slide\n{{\npackageName{\nbla:\'blubb\'\n}\n}}\n???\nnotes').should.deep.equal([
      { from: 1, to: 8, md:[ 'slide\n', {type:'package', name: "packageName", data:'{\nbla:\'blubb\'\n}\n'} ], notes: ['notes'] } 
    ]);
    
    parser.parse('slide\n{{\npackageName\n{\nbla:\'blubb\'\n}\n}}\n???\nnotes').should.deep.equal([
      { from: 1, to: 9, md:[ 'slide\n', {type:'package', name: "packageName", data:'\n{\nbla:\'blubb\'\n}\n'} ], notes: ['notes'] } 
    ]);
    
    parser.parse('slide\n{{packageName\n{\nbla:\'blubb\'\n}\n}}\n???\nnotes').should.deep.equal([
      { from: 1, to: 8, md:[ 'slide\n', {type:'package', name: "packageName", data:'\n{\nbla:\'blubb\'\n}\n'} ], notes: ['notes'] } 
    ]);
  });
  
  it('should ignore [] brackets', function(){
    
    parser.parse('{{multipleChoice {\n"questions": [\n{"question": true }\n]\n}}}').should.deep.equal([
      { from: 1, to: 5, md:[ {type:'package', name: "multipleChoice", data:' {\n"questions": [\n{"question": true }\n]\n}'} ], notes: [] } 
    ]);
  })


})


describe('slide Parser', function(){
  
  
  
});

var test = function( name ){
	var test   = fs.readFileSync('./test/tests/'+name+'.md','utf8');
	var result = fs.readFileSync('./test/tests/'+name+'.out','utf8');
	parser.parse(test).should.equal(result);
}
