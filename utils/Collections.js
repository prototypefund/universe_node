const fs = require('fs');
const db = require('../models');

function noSpecialChars(str){
 return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

var Collection = function(){
  this.properties = {};
  this.getPath = function(id){
    const max_depth = 100;
    let path = '';
    var self = this;

    return new Promise(
      function (resolve, reject) {
        let callback = function(dir){
          if(dir === null)
            reject('could not find directory');
          path = dir.name+'/'+path;
          if(dir.parent_directory_id > 0){

            db.Directory.findById(dir.parent_directory_id)
                .then(callback)
                .catch(reject)
          }else{
            resolve(path);
          }

        }
        db.Directory.findById(id)
                .then(callback)
                .catch(reject)
      });
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