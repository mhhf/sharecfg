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

SSA: '[' ACTEURS ']' SA
   { 
   return new yy.Node('SSA','[',$2,']', $4);
   }
   ;
 
ACTEURS: '[' HASH NUMBER ']' ACTEURS
       { $$ = new yy.Node('ACTEURS','[', $2, $3, ']', $5) }
       | /* empty */
       ;

VOTING: '[' HASH FLOAT ']' VOTING
       { $$ = new yy.Node('VOTING','[', $2, $3, ']', $5) }
      | /* empty */
      ;

DELEGATIONS: '[' HASH HASH ']' DELEGATIONS
           { $$ = new yy.Node('DELEGATIONS','[', $2, $3, ']', $5) }
           | /*empty*/
           ;

/* OPTIONS */

O: '(' A '+' A ')' '&' '[' VOTING ']' O
 { $$ = new yy.Node('O','(', $2, '+', $4, ')', '&', '[' , $8, ']', $10) }
 | NUMBER '&' '[' VOTING ']' O
 { $$ = new yy.Node( 'O',$1, '&', '[', $4, ']', $6 ) }
 | /* empty */
 ;

/* ORIGINAL GRAMMER */

SA: A EOF
  { $$ = new yy.Node('SA', $1); }
  ;

A: '(' A '+' A ')'
 { $$ = new yy.Node( 'A', '(', $2, '+', $4, ')' ); }
 | NUMBER
 { $$ = new yy.Node('A', $1); }
 | '[' O ']' '[' DELEGATIONS ']' /* EXTENDED */
  { $$ = new yy.Node('A', '[', $2, ']', '[', $5, ']')}
 ;


%%

