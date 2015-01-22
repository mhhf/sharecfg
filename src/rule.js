_ = require('underscore')._;
require('debug');

Node = function( name, args, opt ){
  /* var vals = _.values(arguments); */
  
  this.name = name;
  // if(name == "ACTEURS")
  this.args = args;
  // this.action = action;
  
  // flags
  this.isOptionSet = !!(opt && opt.optionSet);
  this.options = [];
   
  // [TODO] - WARNING: COLLISION WITH ORIGINAL GRAMMER
  this.isOption = !!name.match(/^O_/);
  
  // inherented
  this.acteurs = {};
  this.delegations = opt && opt.delegations || [];
  this._delegations = opt && opt.delegations || [];
  
  // sythesize
  this.votes = opt && opt.votes || {};

}

Node.prototype.build = function(){
  if( this.name == "SSA" ) {
    this.acteurs = this.args[1];
    var self = this;
    this.args[4].forEach(function(o){
      o.inherit( self.acteurs, self._delegations );
    });
    this.isOptionSet = true;
    this.options = this.args[4];
    return this.getConsensString();
  } else {
    if( this.isOption ) {
      
      for(var i=0; i<this.args.length; i++ ) {
        if( typeof this.args[i] == 'object' ) {
          this.args[i].inherit( this.acteurs, this._delegations );
        }
      }
    } else if( this.isOptionSet ){ // simple rule && option choice
      this.options = this.args[1];
      var self = this;
      this.options.forEach(function(o){
          o.inherit( self.acteurs, self._delegations );
      });
      
    } else { // simple rule 
      for(var i=0; i<this.args.length; i++ ) {
        if( typeof this.args[i] == 'object' ) {
          this.args[i].inherit( this.acteurs, this._delegations );
        }
      }
    }
  }
}

Node.prototype.inherit = function( acteurs, delegations ){
  _.extend( this.acteurs, acteurs );
  this._delegations = this.delegations.concat( delegations );
  this.build();
}

Node.prototype.mapArguments = function(){
  var argumentMap = _.map( this.args, function(a){
    if( typeof a == "string" )
      return a;
    if( typeof a == "object" ) {
      if( typeof a.name == "string" ) {
        return a.toString();
      // } else {
      //   ret = JSON.stringify(a);
      } else {
        console.log("Unhandled", a);
        return "<!>";
      }
    }
  });
  
  return argumentMap.join(' ');
}

Node.prototype.mapVotes = function(){
  var voteMap = _.map(this.votes, function( v,k ){ return "["+k+" "+v+"]" });
  return voteMap.join(' ');
}

Node.prototype.mapDelegations = function(){
  var delegationsMap = _.map(this.delegations, function( v ){ return "["+v.join(' ')+"]"; });
  return delegationsMap.join(' ');
}

Node.prototype.toString = function(){
  var string = "";
  
  if( this.name == "SSA" ) {
    aMap = _.map(this.acteurs, function( v,k ){ return "["+k+" "+v+"]" });
    optionMap = _.map(this.args[4], function(o){ return o.toString(); });
    string = "[" + aMap.reverse().join(' ') + "] [" + optionMap.join(' ') + " ] [" + this.mapDelegations() + "]";
    
    return string;
  } else if( this.isOptionSet ) {
    oMap = _.map( this.options, function( o ){
      return o.toString();
    });
    return "[" + oMap.join(' ') + "] [" + this.mapDelegations() + "]" ;
  } else if( this.isOption ) {
    return this.mapArguments() + " &[" + this.mapVotes() + "]";
  } else {
    return this.mapArguments();
  }
}

Node.prototype.getConsensString = function(  ){
  
  if( this.isOptionSet ) {

    var maxScore = -1;
    var kand;
    
    this.options.forEach(function(o){
      var map = _.clone(o.votes);
      // TODO: Compute transitive Hull
      o.delegations.forEach(function(d){
        if( !map[d[0]] ) { // der akteur hat noch nicht abgestimmt
          if( map[d[1]] ) { // der delegant hat abgestimmt
            map[d[0]] = map[d[1]]
          }
        } 
      });

      map = _.map(map,function( ammount, usr ){
        return o.acteurs[usr] * ammount;
      });
      var score = map.reduce(function(m, x){ return x + m; },0);
      // console.log(score, o.getConsensString());
      
      if( !kand || maxScore < score ) {
        maxScore = score;
        kand = o.getConsensString(); 
      }
    });
    
    var red = kand;
  } else if ( this.isOption ) {
    
    var map = _.map( this.args, function(a){ 
      var ret = typeof a == 'object' && a.getConsensString() || a && a.toString() || ""; 
      return ret;
    });
  
    // var red = _.reduce( ['',''], function( ss, s ){ return ""; }, "" );
    var red = map.reduce( function(ss,s){ return ss+' '+s; }, '' );
  } else {
    var map = _.map( this.args, function(a){ 
      var ret = typeof a == 'object' && a.getConsensString() || a && a.toString() || ""; 
      return ret;
    });
  
    // var red = _.reduce( ['',''], function( ss, s ){ return ""; }, "" );
    var red = map.reduce( function(ss,s){ return ss+' '+s; }, '' );
  }
  return red;
}

Node.prototype.seekDifference = function( to ) {
  if(to.toString() == this.toString()) return null;
  var foundDifference = false;
  
    
  
  debug( 1, 'looking in rule', this.name, this.isOptionSet?":Option Set":"");
  
  if( this.isOptionSet ) {
    
    // look in options
    this.options.forEach( function( o, i ){
      if( o.toString() != to.options[i].toString() ) { 
        foundDifference = true;
        o.seekDifference( to.options[i] );
      }
    });
    
    // look in delegations
    if( JSON.stringify(this.delegations) != JSON.stringify(to.delegations) ) {
      debug(3, "found difference in deligations".green);
    }
    
  } else if( this.isOption ) {
    // look in args
    this.diffArgs( to );
    
    // look in voting set
    if( JSON.stringify(this.votes) != JSON.stringify(to.votes) ) {
      debug(3, "found difference in voting".green)
    }
  } else {
    
    this.diffArgs( to );
  }
  
  

  

}

Node.prototype.diffArgs = function( to ){
  
  _.each( this.args, function(r,i) { 
    debug( 2, 'looking in', typeof r, r )
    
    
    if( typeof r == 'object' && r.name ) {
      r.seekDifference( to.args[i] ); 
    }
  });
  
}
