// [TODO] - get all candidates and their normalized votes

_ = require('underscore')._;
require('./debug.js');

Node = function( name, args, opt ){
  /* var vals = _.values(arguments); */
  
  this.name = name;
  this.rulename = name;
  // if(name == "ACTEURS")
  this.args = args;
  // this.action = action;
  if(opt && opt.rule) this.rule = opt.rule;
  
  // flags
  this.isOptionSet = !!(opt && opt.optionSet);
  this.options = [];
   
  // [TODO] - WARNING: COLLISION WITH ORIGINAL GRAMMER
  this.isOption = !!name.match(/^O_/);
  if( this.isOption ) this.rulename = this.name.slice(2)
  
  // inherented
  this.acteurs = {};
  this.delegations = opt && opt.delegations ||[];
  this._delegations = opt && opt.delegations ||[];
  
  // sythesize
  this.votes = opt && opt.votes ||{};

}

Node.prototype.build = function(){
  if( this.name == "SSA" ) {
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
      
      for(var i=0; i<this.args.length; i++ ) {
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
      for(var i=0; i<this.args.length; i++ ) {
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

Node.prototype.mapArguments = function(indent){
  var argumentMap = _.map( this.args, function(a){
    if( typeof a == "string" )
      return a;
    if( typeof a == "object" ) {
      if( typeof a.name == "string" ) {
        return a.stringify( indent );
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
  var voteMap = _.map(this.votes, function( v,k ){ 
    vote = v.toString();
    if( vote.indexOf('.') == -1 ) vote += '.0';
    return "["+k+" "+vote+"]" 
  });
  return voteMap.join(' ');
}

Node.prototype.mapDelegations = function(){
  var delegationsMap = _.map(this.delegations, function( v ){ return "["+v.join(' ')+"]"; });
  return delegationsMap.join(' ');
}


Node.prototype.toString = function( indent ){
  return this.stringify("  ");
}

Node.prototype.stringify = function( indent ){
  var string = "";
  
  if( this.name == "SSA" ) {
    
    aMap = _.map(this.acteurs, function( v,k ){ return "["+k+" "+v+"]" });
    optionMap = _.map(this.args[4], function(o){ return o.stringify( (indent?indent+'  ':false) ); });
    string = "[" + aMap.reverse().join(' ') + "] [" + optionMap.join(' ') + " ] [" + this.mapDelegations() + "]";
    
    return string;
  } else if( this.isOptionSet ) {
    oMap = _.map( this.options, function( o ){
      return o.stringify( (indent?indent+'  ':false) );
    });
    
    return "[" +(indent?'\n'+indent:'')+ oMap.join(' '+(indent?'\n'+indent:'')) +(indent?'\n':'')+ "] [" + this.mapDelegations() + "]" ;
  } else if( this.isOption ) {
    return this.mapArguments(indent) + " &[" + this.mapVotes() + "]";
  } else {
    return this.mapArguments(indent);
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
        if( !map[d[0]] ) { // der akteur hat noch nicht abgestimmt
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
      
      if( !kand || maxScore < score ) {
        maxScore = score;
        kand = o.getConsensString(); 
      }
    });
    
    var red = kand;
  } else if ( this.isOption ) {
    
    var map = _.map( this.args, function(a){ 
      var ret = typeof a == 'object' && a.getConsensString() || a && a.toString() || ""; 
      return ret;
    });
  
    // var red = _.reduce( ['',''], function( ss, s ){ return ""; }, "" );
    var red = map.reduce( function(ss,s){ return ss+' '+s; }, '' );
  } else {
    var map = _.map( this.args, function(a){ 
      var ret = typeof a == 'object' && a.getConsensString() || a && a.toString() || ""; 
      return ret;
    });
  
    // var red = _.reduce( ['',''], function( ss, s ){ return ""; }, "" );
    var red = map.reduce( function(ss,s){ return ss+' '+s; }, '' );
  }
  return red;
}

//
// is the change made by addr to the current word valide?
// 
// change is valide iff a change is made and the change is a valide change by acteur with the addres addr and the valide transaction criteria
//
// @return: Bool
//
Node.prototype.validate = function( to, addr ) {
  // instantiate global debugger
  
  // simmilar options are a valid change
  if(to.toString() == this.toString()) return true;
  
  var valideChange = true;
  var singleChange = false;
  
  
  if( this.isOptionSet ) {
    
    // look in options
    this.options.forEach( function( o, i ){
      if( !i in to.options ){
      } else if( o.toString() != to.options[i].toString() ) { 
        valideChange = valideChange && o.validate( to.options[i], addr );
      }
    });
    
    // option is added
    if( this.options.length < to.options.length ) {
      for(var i = this.options.length - 1; i < to.options.length; i++ ) {
        var valide = to.options[i].testNewOptionActor( addr );
        valideChange = valideChange && valide;
      }
    }
    
    
    // look in delegations
    if( JSON.stringify(this.delegations) != JSON.stringify(to.delegations) ) {
      var valide = this.validateDelegations(this.delegations, to.delegations, addr );
      valideChange = valideChange && valide;
    }
  } else if( to.isOptionSet ) { // option is created
    
    var valide = to.testNewOptionActor( addr );
    valideChange = valideChange && valide;
    
  } else if( this.isOption ) {
    // look in args
    valideChange = valideChange && this.diffArgs( to, addr );
    
    // look in voting set
    if( JSON.stringify(this.votes) != JSON.stringify(to.votes) ) {
      
      var valide = this.validateVotes(this.votes, to.votes, addr);
      
      valideChange = valide;
    }
  } else {
    valideChange = valideChange && this.diffArgs( to, addr );
  }
  

  
  
  return valideChange;

}

Node.prototype.testNewOptionActor = function( addr ){
  var valide = true;
    
  if( this.isOption ) {
    var keys = _.keys(this.votes);
    valide = valide && keys.length == 0 || (keys.length == 1 && keys[0] == addr);
  } else if(this.isOptionSet ){
    var keys = _.map(this.delegations, function(d){ return d[0]; });
    valide = valide && keys.length == 0 || (keys.length == 1 && keys[0] == addr);
    
    
    this.options.forEach( function(o){
      valide = valide && o.testNewOptionActor( addr );
    });
  }
  
  if( !this.isOptionSet ) {
    this.args.forEach( function(a){
      if( typeof a == 'object' ) {
        valide = valide && a.testNewOptionActor( addr );
      }
    });
  }

  // each nested
  return valide;
}

Node.prototype.validateDelegations = function( del1, del2, addr){
  var v1 = _.map( del1, function( v, k ){ return v.join(':'); });
  var v2 = _.map( del2, function( v, k ){ return v.join(':'); });
   
  // get all addresses of manipulated votes
  var diff = _.filter(_.union(v1, v2),function(e){ 
    var inV1 = v1.indexOf(e) != -1;
    var inV2 = v2.indexOf(e) != -1;
    return !(inV1 && inV2);
  }); // manipulated votes
  
  
  // test if acteur only manipulated own votes
  var valide = diff.reduce(function( m, e ){ 
    return m 
    && ( e.split(':')[0] == addr );
  }, true);
  
  return valide;
}

Node.prototype.validateVotes = function( json1, json2, addr){
  var v1 = _.map( json1, function( v, k ){ return k+':'+v; });
  var v2 = _.map( json2, function( v, k ){ return k+':'+v; });
   
  // get all addresses of manipulated votes
  var diff = _.filter(_.union(v1, v2),function(e){ 
    var inV1 = v1.indexOf(e) != -1;
    var inV2 = v2.indexOf(e) != -1;
    return !(inV1 && inV2);
  }); // manipulated votes
  
  
  // test if acteur only manipulated own votes
  var valide = diff.reduce(function( m, e ){ 
    return m 
    && ( e.split(':')[0] == addr );
  }, true);
  
  return valide;
}

Node.prototype.diffArgs = function( to, addr ){
  
  var valideChange = true;
  
  _.each( this.args, function(r,i) { 
    
    
    if( typeof r == 'object' && r.name ) {
      valideChange = valideChange && r.validate( to.args[i], addr ); 
    }
  });
  
  return valideChange;
  
}

// adding a w\in L(G) to this metaword
Node.prototype.add = function( w, parser ){
  
  if( this.name == 'SSA' ) {
    aMap = _.map(this.acteurs, function( v,k ){ return "["+k+" "+v+"]" });
  }
  
  var string = "[" + aMap.reverse().join(' ') + "] [" + w + "&[] ] [" + this.mapDelegations() + "]";
  
  var ast_ = parser.parse(string);
  this.addAST( ast_ );
  // console.log( ast_.toString() );
  
}

Node.prototype.addAST = function( ast ){
  if( this.name == 'SSA' && ast.name == "SSA" ) {
    this.args[4].forEach( function( o, i ){
      if( o.rule == ast.args[4][0].rule ) {
        o.merge( ast.args[4][0] );
      }
    });
  }
}

Node.prototype.merge = function( node ){
  
  mergeArgs = function ( node1, node2 ) {
    
    node1.args.forEach( function( a1, i ){
      var a2 = node2.args[i];
      if( typeof a1 == 'object' ) {
        a1.merge( a2 );
      } else if ( typeof a1 == 'string' ){
        if( a1 != a2 ) {
        } else {
        }
      }
    });
  }
  
  // if same rules are used
  if( this.rulename == node.rulename && this.rule == node.rule ) {
    
    if( this.isOptionSet ) {
    } else if( this.isOption ){ 
      
      mergeArgs( this, node );
    } else {
      // MERGE RULE
      mergeArgs( this, node );
    }
    
    // console.log( this, node );
  } else if( this.isOptionSet ) {
    var foundRule = false;
    
    // look for each option if current rule is al
    this.options.forEach( function( o, i ){
      if( o.rule == node.rule ) {
        foundRule = true;
        // [TODO] - find right option to continue merging or extend option set
        o.merge( node )
      }
    });
    
    // if rule is not found, add the new option to the option set
    if( !foundRule ) {
      node.isOption = true;
      this.options.push(node);
    }
    
  } else if( this.rulename == node.rulename && this.rule != node.rule ) {
    
    node.isOption = true;
    node.name = "O_" + node.name;
    
    var o1 = new Node( "O_"+this.rulename, this.args, { votes: this.votes, rule: this.rule } );
    
    this.rule = '';
    this.isOptionSet = true;
    this.options = [ o1, node ]; 
    this.args = [ '[', this.options, ']' ]
  } else {
  }
  
}

Node.prototype.genKG = function( kandidates ){
  if(! kandidates ) kandidates = []; 
  
  
  if( this.name == "SSA" ) {
    
    console.log('SSA');
    optionMap = _.flatten(_.map(this.args[4], function(o){ return o.genKG(); }));
    
    console.log('SSA',optionMap);
    return optionMap;
  } else if( this.isOptionSet ) {
    console.log('iOS');
    oMap = _.map( this.options, function( o ){
      return o.genKG( );
    });
    console.log('iOS', oMap);
    
    return _.flatten(oMap);
  } else if( this.isOption ) {
    console.log('O');
    var map = this.mapArgumentsKG(indent);
    console.log('O', map);
    return map;
  } else {
    console.log('N');
    var map = this.mapArgumentsKG(indent);
    console.log('N',map);
    return map;
  }
  console.log('uiuiui');
  return kandidates;
}


Node.prototype.mapArgumentsKG = function(){
  var argumentMap = [];
  _.each( this.args, function(a){
    if( typeof a == "string" )
      // console.log('a' ,a);
      argumentMap.push( a );
    if( typeof a == "object" ) {
      if( typeof a.name == "string" ) {
        
        kandidates = a.genKG();
        console.log('k',kandidates, kandidates.length);
        console.log('A', argumentMap, argumentMap.length);
        if( argumentMap.length == 0 ) {
          argumentMap = kandidates;
          return true;
        }
        argumentMap = _.map(argumentMap, function( arg ){
          return _.map(kandidates, function( k ){
            return arg + k;
          });
        });
        argumentMap = _.flatten( argumentMap );
        return true;
      } else {
        console.log("Unhandled", a);
        return "<!>";
      }
    }
  });
  
  return argumentMap;
}

