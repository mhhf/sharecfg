
indent = function( j ){
  var ind= "";
  for(var i=0; i<j; i++ ) {
    ind += "  ";
  }
  return ind;
}

depth = 1;
debug = function( lvl ){
  
  // n arguments can be passed
  a = _.map(arguments,function(a){return a;});
   
  // if no level is specified, work on current depth
  if( typeof lvl != "number" ) {
    a = [lvl].concat(a);
    lvl = depth;
  }
  
  // insert linebreak after deptht has risen 
  if( depth > lvl ) {
    console.log();
    depth = lvl;
  }
  
  if( lvl == 0 ) {
    console.log();
    console.log("#########   ", a.slice(1).join(' ').toUpperCase());
    console.log();
  } else {
    console.log( indent( lvl - 1 ), a.slice(1).join(' ') )
  }
  
}
