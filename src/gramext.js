
require('underscore')
fs = require('fs');
bnf = require('ebnf-parser');

var grammar = fs.readFileSync(__dirname+'/extention.y','utf8');

// BNF garammar extention
exports.parse = function( originalGrammarBNF ){
  
  
  grammarExtentionJSON = bnf.parse(grammar);
    
  origGrammarJSON = bnf.parse( originalGrammarBNF );
    
  
  // extend Lexer
  // TODO: test, if token is already in grammar
  origGrammarJSON.lex.rules = grammarExtentionJSON.lex.rules.concat( origGrammarJSON.lex.rules );
  // 
  // merge macros
  origGrammarJSON.lex.macros = 
    _.extend(
      grammarExtentionJSON.lex.macros,
      origGrammarJSON.lex.macros
    );
  

  // replace actions to construct an ast
  _.each( origGrammarJSON.bnf, function( v, k ){
    // each case
    v.forEach(function(r){
      // remove - not neccecerry any more
      if( typeof r == "object" && k != 'SSA' && k != 'ACTEURS' && k != 'VOTING' && k != 'DELEGATIONS' && !k.match(/^O_/) ) {
        s = r[0].split(' ');
        s = _.map(s, function( v, k ){
          return '$' + (k+1);
        });
        action = r[1].replace(/\n/g,'');
        // [TODO] - escape "
        a = "$$ = new yy.Node( \""+k+"\", ["+s.join(',')+"], {rule:\""+r[0]+"\"} );";
        r[1] = a;
      }
    })
    
  });


  
  optionSet = {};
  optSuffix = "& [ VOTING ]";
  _.each( origGrammarJSON.bnf, function( v, k ){
    // Extend Option Rule
    // 
    argNum = function(args){
      s = args.split(' ');
      s = _.map(s, function( v, k ){
        return '$' + (k+1);
      });
      return s.join(',');
    }

    optionSet["O_" + k] = [];
    v.forEach(function(v2){
      
      
      if( typeof v2 == "object" ) {
        o = _.clone(v2);
        args = argNum(o[0]);
        oldRule = o[0];
        o[0] = o[0] + " " + optSuffix + " " + "O_" + k ; 
        var optPos = o[0].split(' ').length;
        o[1] = " $$ = [new yy.Node('O_"+k+"', ["+args+"], {votes:$"+(optPos-2)+", rule:\"" + oldRule + "\"})].concat($"+optPos+");";
        
        o2 = _.clone(v2);
        o2[0] = o2[0] + " " + optSuffix; 
        o2[1] = " $$ = [new yy.Node('O_"+k+"', ["+args+"], {votes:$"+(optPos-2)+", rule:\"" + oldRule + "\"} )];";
        
        optionSet["O_" + k].push( o )
        optionSet["O_" + k].push( o2 )
      } else {
        var optPos = v2.split(' ').length;
        optionSet["O_" + k].push( [ 
          v2 + " " + optSuffix + " O_" + k,
          " $$ = [new yy.Node('O_" + k + "', [" + argNum(v2) + "], {votes:$" + ( optPos + 3 ) + ", rule:\"" + v2 + "\"} )];"
          ] );
      }
    });
    // optionSet["O_" + k].push( "" )
    
    origGrammarJSON.bnf[ k ].push([
        "[ O_" + k + " ] [ DELEGATIONS ]", 
        " $$ = new yy.Node('" + k + "', [$1, $2, $3], {optionSet: true, delegations: $5 })"
    ])
  });
  
  _.extend( origGrammarJSON.bnf, grammarExtentionJSON.bnf, optionSet );
  
  origGrammarJSON.start = "SSA";
  
  
  // TODO: reference old Start function
  
  
  // console.log(JSON.stringify( origGrammarJSON, false, 2 ))
  
  return origGrammarJSON;

}
