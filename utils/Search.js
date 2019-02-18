const db = require('../models');
const User = require('./User'); 

var Search = function(keyword){
  this.keyword = keyword;

  this.search = function(){
    let self = this;
    return new Promise(
      (resolve,reject)=>{
      	User.searchByUsername(keyword)
      	.then((users)=>{
        	resolve({users});
      	}).catch(reject);
      })
  }
}

module.exports=Search;