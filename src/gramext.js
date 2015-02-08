require('underscore')
fs = require('fs');
bnf = require('ebnf-parser');

// BNF garammar extention
exports.parse = function( originalGrammarBNF ){
  
  
  // grammarExtentionJSON = bnf.parse(grammar);
grammarExtentionJSON = {
  "lex": {
    "rules": [
      [
        "\\s",
        "/* IGNORE */"
      ],
      [
        "{H}{H32}",
        "return 'HASH'"
      ],
      [
        "(\\d+\\.\\d)",
        "return 'FLOAT'"
      ],
      [
        "[\\d]+",
        "return 'NUMBER'"
      ],
      [
        "\\[",
        "return '['"
      ],
      [
        "\\]",
        "return ']'"
      ],
      [
        "&",
        "return '&'"
      ]
    ],
    "macros": {
      "H64": "{H32}{H32}",
      "H32": "{H16}{H16}",
      "H16": "{H8}{H8}",
      "H8": "{H2}{H2}",
      "H4": "{H2}{H2}",
      "H2": "{H}{H}",
      "H": "([1-9A-Za-z][^OIl])"
    }
  },
  "start": "SSA",
  "moduleInclude": "\n\n",
  "bnf": {
    "SSA": [
      [
        "[ ACTEURS ] [ START ] [ DELEGATIONS ]",
        " \n    var node = new yy.Node('SSA',[ '[', $2, ']', '[', $5, ']', '[', $8, ']' ], {delegations: $8});\n    node.build();\n    return node;\n   "
      ]
    ],
    "ACTEURS": [
      [
        "[ HASH NUMBER ] ACTEURS",
        " \n        var obj;\n        if( typeof $5 == 'object' ) {\n          obj = $5; \n        } else {\n          obj = {}; \n        }\n        obj[$2] = parseInt($3); $$ = obj; \n       "
      ],
      ""
    ],
    "VOTING": [
      [
        "[ HASH FLOAT ] VOTING",
        " \n        var obj;\n        if( typeof $5 == 'object' ) {\n          obj = $5; \n        } else {\n          obj = {}; \n        }\n        if( obj[$2] ) throw new Error('multiple votes for one acteur are not allowed');\n        obj[$2] = parseFloat($3); $$ = obj; /* [TODO] - check if float is in range && float overflow */\n       "
      ],
      ""
    ],
    "DELEGATIONS": [
      [
        "[ HASH HASH ] DELEGATIONS",
        " $$ = [[$2,$3]].concat($5); "
      ],
      [
        "",
        " $$ = []; "
      ]
    ]
  }
};
  
  // grammarJSON = require( './extention.json');
  // console.log(JSON.stringify( grammarExtentionJSON, false, 2 ) );
    
  origGrammarJSON = bnf.parse( originalGrammarBNF );
    
  replaceToken = function( token, rule ){
    var replace = eval("(function(){"+rule+"})()");
    
    // Each rule
    _.each(grammarExtentionJSON.bnf, function( v, k ){
      
      v.forEach( function( r, i ){
        // Replace the tokens
        if( typeof r == 'string' ) {
          v[i] = v[i].replace(token, replace);
        } else {
          r[0] = r[0].replace(token, replace);
        }
      });
      
    });
    
  }
  
  origGrammarJSON.lex.rules.forEach( function( rule, i ){
    
    m = rule[0]; // match token regex
    r = rule[1]; // return rule with the token of orig grammar
    
    if( "1".match(m) && "1234567".match(m) && !"a".match(m) ) { // CHECK NUMBER
      replaceToken( 'NUMBER', r );
      grammarExtentionJSON.lex.rules.splice(3,1);
    } else if ( "1.0".match(m) && "0.0123".match(m) && !"a".match(m)) { // CHECK FLOAT
      replaceToken( 'FLOAT', r );
      grammarExtentionJSON.lex.rules.splice(2,1);
    } else if ( "0x00".match(m) && "0xaabbccddeeff0011223344556677889900".match(m) && !"x".match(m) ) { // CHECK HASH
      replaceToken( 'HASH', r );
      grammarExtentionJSON.lex.rules.splice(1,1);
    } else if ( "[".match(m) && !"]".match(m) ) { // CHECK [ <= has to be invalide
      replaceToken( '[', r );
    } else if ( "]".match(m) && !"[".match(m) ) { // CHECK ] <= has to be invalide
      replaceToken( ']', r );
    } else if ( "&".match(m) && !"%".match(m) ) { // CHECK & <= has to be invalide
      replaceToken( '&', r );
    }
    
    
  });
  
  
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
    // 

    origGrammarJSON.bnf[k] = _.map(v, function(r){
      if( typeof r == 'object' ) {
        s = r[0].split(' ');
      } else if (typeof r == 'string' ) {
        s = r.split(' ');
      }
      var rule = s.join(' ');
      
      s = _.map(s, function( v, k ){
        return '$' + (k+1);
      });
      
      return [ 
        rule,
        "$$ = new yy.Node( \""+k+"\", ["+s.join(',')+"], {rule:\""+rule+"\"} );"
      ];
      
    });

    // v.forEach(function(r){
    //   // remove - not neccecerry any more
    //   if( typeof r == "object" && k != 'SSA' && k != 'ACTEURS' && k != 'VOTING' && k != 'DELEGATIONS' && !k.match(/^O_/) ) {
    //     s = r[0].split(' ');
    //     s = _.map(s, function( v, k ){
    //       return '$' + (k+1);
    //     });
    //     // action = r[1].replace(/\n/g,'');
    //     // [TODO] - escape "
    //     a = "$$ = new yy.Node( \""+k+"\", ["+s.join(',')+"], {rule:\""+r[0]+"\"} );";
    //     r[1] = a;
    //   } else if(  ) {
    //   
    //   }
    // })
    
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
        
        if( v2 != "" ) {
          optionSet["O_" + k].push( [ 
            v2 + " " + optSuffix + " O_" + k,
            " $$ = [new yy.Node('O_" + k + "', [" + argNum(v2) + "], {votes:$" + ( optPos + 2 ) + ", rule:\"" + v2 + "\"} )];"
            ] );
        }
        
        optionSet["O_" + k].push( [ 
          v2 + (v2==""?"":" ") + optSuffix,
          " $$ = [new yy.Node('O_" + k + "', [" + argNum(v2) + "], {votes:$" + ( optPos + 2 ) + ", rule:\"" + v2 + "\"} )];"
          ] );
        
      }
    });
    // optionSet["O_" + k].push( "" )
    
    origGrammarJSON.bnf[ k ].push([
        "[ O_" + k + " ] [ DELEGATIONS ]", 
        " $$ = new yy.Node('" + k + "', [$1, $2, $3], {optionSet: true, delegations: $5 })"
    ])
  });
  
  // replacing start rule
  grammarExtentionJSON.bnf['SSA'][0][0] = grammarExtentionJSON.bnf['SSA'][0][0].replace( 'START', 'O_' + origGrammarJSON.start );
  
  _.extend( origGrammarJSON.bnf, grammarExtentionJSON.bnf, optionSet );
  
  origGrammarJSON.start = "SSA";
  
  
  // TODO: reference old Start function
  
  
  // console.log( JSON.stringify( origGrammarJSON, false, 2 ) );
  
  return origGrammarJSON;

}
