%{
 this.yy.a = {};
%}
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
'('                        return '('
')'                        return ')'
'+'                        return '+'
[\d]+                      return 'NUMBER'
<<EOF>>                    return 'EOF'



.                          return 'INVALID'



/lex


%start SSA

%% /* language grammar */

/* EXTENDED GRAMMER */

SSA: '[' ACTEURS ']' SA;
 
ACTEURS: '[' HASH NUMBER ']' ACTEURS
       { yy.a[$2] = $3; }
       | /* empty */
       { yy.a = {} }
       ;

VOTING: '[' HASH FLOAT ']' VOTING
        { $$ = yy.a[$2]*parseFloat($3)+$5; }
      | /* empty */
        { $$ = 0; }
      ;

DELEGATIONS: '[' HASH ';' HASH ']' DELEGATIONS
           | /*empty*/
           ;

/* OPTIONS */

O: '(' A '+' A ')' '&' '[' VOTING ']' O
 { $$ = $10.concat({k:$1+$2+$3+$4+$5,v:$8}); }
 | NUMBER '&' '[' VOTING ']' O
 { 
    $$ = $6.concat({k:$1,v:$4});
 }
 | /* empty */
 { $$ = []; }
 ;

/* ORIGINAL GRAMMER */

SA: A EOF
  { return $1; }
  ;

A: '(' A '+' A ')'
  { $$ = $1 + $2 + $3 + $4 + $5; }
 | NUMBER
  { $$ = $1; }
 | '[' O ']' '[' DELEGATIONS ']' /* EXTENDED */
  { 
    var k, v;
    $2.forEach(function(e){
      if( !v || e.v>v ) {
        v = e.v;
        k = e.k;
      }
    });
  $$ = k; }
 ;


%%

