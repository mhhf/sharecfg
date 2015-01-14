_ = require('underscore')._;

Node = function( name ){
  var vals = _.values(arguments);
  
  this.name = vals[0];
  this.args = _.rest(arguments);

}

Node.prototype.toString = function(){
  var map = _.map(this.args,function(a){ var ret = a && a.toString() || ""; return ret; });
  
  // var red = _.reduce( ['',''], function( ss, s ){ return ""; }, "" );
  var red = map.reduce( function(ss,s){ return ss+' '+s; }, '' );
  
  return red;
}

Node.prototype.seekDifference = function( to ){
  if(to.toString() == this.toString()) return null;
  console.log(this.name);
  
  _.each(this.args,function(r,i){ if( typeof r == 'object' ) r.seekDifference(to.args[i]); });

}
