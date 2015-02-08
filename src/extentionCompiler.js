bnf = require('ebnf-parser');
fs = require('fs');

var grammar = fs.readFileSync(__dirname+'/extention.y','utf8');
grammarExtentionJSON = bnf.parse(grammar);

var jsonString = 
    "grammarExtentionJSON = " 
    + JSON.stringify( grammarExtentionJSON, false, 2 ) 
    + ";";
    

fs.writeFileSync( __dirname + '/extention.js', jsonString );
