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
 
ACTEURS: '[' HASH ';' NUMBER ']' ';' ACTEURS
       | /* empty */
       ;

VOTING: '[' HASH ';' FLOAT ']' ';' VOTING
      | /* empty */
      ;

DELEGATIONS: '[' HASH ';' HASH ']' ';' DELEGATIONS
           | /*empty*/
           ;


/* OPTIONS */

O: '(' A '+' A ')' '&' '[' VOTING ']' ';' O
 | NUMBER '&' '[' VOTING ']' ';' O
 | /* empty */
 ;

/* ORIGINAL GRAMMER */

SA: A EOF;

A: '(' A '+' A ')'
 | NUMBER
 | '[' O ']' '[' DELEGATIONS ']'
 ;


%%
