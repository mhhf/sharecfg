/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex

/*H2                         {H}{H}*/
/*H4                         {H2}{H2}*/
/*H8                         {H2}{H2}*/
/*H16                        {H8}{H8}*/
/*H32                        {H16}{H16}*/
/*H64                        {H32}{H32}*/

%%

/*%token block*/



\s                         /* IGNORE */


/*  ORIGINAL TOKENS  */
'('                        return '('
')'                        return ')'
'+'                        return '+'
[\d]+                      return 'NUM'
<<EOF>>                    return 'EOF'



.                          return 'INVALID'



/lex


%start SA

%% /* language grammar */


SA: A
  { 
  }
  ;

A: '(' A '+' A ')'
 { $$ = $2 + $4; }
 | NUM
 { $$ = parseInt($1); }
 ;


%%

