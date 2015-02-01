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
(a)                          return 'a'
(b)                          return 'b'
(c)                          return 'c'
[\d]+                      return 'NUMBER'
<<EOF>>                    return 'EOF'



.                          return 'INVALID'



/lex


%start SA

%% /* language grammar */

/*  a^* b^* c^*  */

SA: A
  | 
  ;

A: 'a' A
 | 'a'
 | 'b' B
 | 'b' 
 ;

B: 'b' B
 | 'b'
 | 'c' C
 | 'c' 
 ;

C: 'c' C
 | 'c'
 ;


%%

