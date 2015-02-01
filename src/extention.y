/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex

H                          [0-9a-f]
/*H2                         {H}{H}*/
/*H4                         {H2}{H2}*/
/*H8                         {H2}{H2}*/
/*H16                        {H8}{H8}*/
/*H32                        {H16}{H16}*/
/*H64                        {H32}{H32}*/

%%

/*%token block*/



\s                         /* IGNORE */


/*  EXTENDED TOKENS  */

0x{H}+                     return 'HASH'
\d+\.\d                    return 'FLOAT'
'['                        return '['
']'                        return ']'
';'                        return ';'
'&'                        return '&'


/*  ORIGINAL TOKENS  */



/lex


%start SSA

%% /* language grammar */

/* EXTENDED GRAMMER */


/*
SSA: '[' ACTEURS ']' SA
   { return new yy.Node('SSA',[ '[', $2, ']', $4 ]); }
   ;
*/

SSA: '[' ACTEURS ']' '[' O_SA ']' '[' DELEGATIONS ']'
   { 
    var node = new yy.Node('SSA',[ '[', $2, ']', '[', $5, ']', '[', $8, ']' ], {delegations: $8});
    node.build();
    return node;
   }
   ;
 
ACTEURS: '[' HASH NUMBER ']' ACTEURS
       { 
        var obj;
        if( typeof $5 == 'object' ) {
          obj = $5; 
        } else {
          obj = {}; 
        }
        obj[$2] = parseInt($3); $$ = obj; 
       }
       | /* empty */
       ;

/* TODO: rewrite voting and deligation as own classes */
VOTING: '[' HASH FLOAT ']' VOTING
       { 
        var obj;
        if( typeof $5 == 'object' ) {
          obj = $5; 
        } else {
          obj = {}; 
        }
        if( obj[$2] ) throw new Error('multiple votes for one acteur are not allowed');
        obj[$2] = parseFloat($3); $$ = obj; /* [TODO] - check if float is in range && float overflow */
       }
      | /* empty */
      ;

DELEGATIONS: '[' HASH HASH ']' DELEGATIONS
           { $$ = [[$2,$3]].concat($5); }
           | /*empty*/
           { $$ = []; }
           ;



%%

