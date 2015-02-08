grammarExtentionJSON = {
  "lex": {
    "rules": [
      [
        "\\s",
        "/* IGNORE */"
      ],
      [
        "H32\\b",
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