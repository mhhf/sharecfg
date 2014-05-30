/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex

RN                    \r\n
EOL 									\r\n|\r|\n        /* end of line character */
NEOL									[^\r\n]	          /* not end of line character */
TB                    [^ \t\r\n]        /* textblock character */
WS                    [\t ]							/* whitespace character */
BL                    ({EOL}*{WS}*)*

%%

/*%token block*/

\s                         /* IGNORE */
'?'([\w\.]+)               { yytext = this.matches[1]; return 'QUESTION'; }
'{'                        return '{'
'}'                        return '}'
':'                        return ':'
'='                        return '='
','                        return ','
[\w-_\.]+                  return 'ID'
\".*\”                     return 'STRING'
\'.*\'                     return 'STRING'
[\d\.]+                    return 'NUMBER'
<<EOF>>                    return 'EOF'
.                          return 'INVALID'



/lex


%start APP

%% /* language grammar */

APP: EXPR EOF
   { return $1; }
   ;
   

EXPR : QUESTION '=' '{' OPT_PARAMS '}' EXPR
     { $$ = [{ name: 'question', validator: $OPT_PARAMS }].concat($EXPR); }
     | ID '=' ID EXPR
     { $$ = [{ name: 'expr', key: $1, value: $3 }].concat($EXPR); }
     | 
     { $$ = []; }
     ;
    
OPT_PARAMS : ID ':' ID
           { var o={}; o[$1]=$3; $$ = o; }
           | ID ':' ID ',' OPT_PARAMS
           { var o = $OPT_PARAMS; o[$1]=$3; $$ = o; }
           ;


%%
