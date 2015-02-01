
indent = function( j ){
  var ind= "";
  for(var i=0; i<j; i++ ) {
    ind += "  ";
  }
  return ind;
}

Debuger = function( active ){
  if(Debuger.instance) { return Debuger.instance; }
  this.lvl = 0;
  this.active = active
  console.log(this.lvl);
  
  this.inc = function(){
    this.lvl += 1;
  };
  
  this.dec = function(){
    this.lvl -= 1;
  };
  
  this.set = function(lvl){
    this.lvl = lvl;
  };

  this.debug = function(){
    if(!this.active) return null;
    var args = [].splice.call(arguments,0);
    debug.apply(this, [this.lvl].concat(args) )
  };
  
  Debuger.instance = this;
}

Debuger.instance;

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
