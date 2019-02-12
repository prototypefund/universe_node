const fs = require('fs');
const db = require('../models');

function noSpecialChars(str){
 return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

var Collection = function(id){
  this.id = id;
  this.properties = {};
  this.getPath = function(id){
    const max_depth = 100;
    let path = '';
    var self = this;
    return this.id;
    /*return new Promise(
      function (resolve, reject) {
        
      });*/
  }
  this.create = function(){
    var self = this;
    return new Promise(
      function (resolve, reject) {

        //check privacy

        //check name

        //check ownership
        db.Collection.create(self.properties)
        .then(resolve)
        .catch(reject)
      });
  };
  this.getItems = function(id){
    return new Promise(
      (resolve,reject)=>{
        db.Collection.findAll({
          where: {
            id: id,
          }
        }).then((directories)=>{
          resolve({directories})
        }).catch(reject);
      });
  };
}

module.exports=Collection;