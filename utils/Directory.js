const fs = require('fs');
const db = require('../models');

function noSpecialChars(str){
 return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

var Directory = function(){
  this.properties = {};
  this.getPath = function(id){
    const max_depth = 100;
    let path = '';
    var self = this;

    return new Promise(
      function (resolve, reject) {
        let callback = function(dir){
          if(dir === null)
            resolve('/');
          path = dir.name+'/'+path;
          if(dir.parent_directory_id > 0){

            db.Directory.findByPk(dir.parent_directory_id)
                .then(callback)
                .catch(reject)
          }else{
            resolve(path);
          }

        }
        db.Directory.findByPk(id)
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

            //get path of parent directory
            self.getPath(self.properties.parent_directory_id).then((path)=>{

              const abspath = __dirname + '/../upload/'+path+self.properties.name;
              if (fs.existsSync(abspath)) {
                  reject('error creating directory: path "'+path+'" exists');
              }
              else{
                try{
                  fs.mkdirSync(abspath, 0640);
                  db.Directory.create(self.properties)
                  .then(resolve)
                  .catch(reject)
                }
                catch(e){
                    reject(e)
                }
              }
            })
      });
  };
  this.getCollections = function(id){
    return new Promise(
      (resolve,reject)=>{
        db.Collection.findAll({
          where: {
            directory_id: id,
          }
        }).then((collection)=>{
          resolve(collection)
        }).catch(reject);
      });
  }
  this.getDirectories = function(id){
    return new Promise(
      (resolve,reject)=>{
        db.Directory.findAll({
          where: {
            parent_directory_id: id,
          }
        }).then((directories)=>{
          resolve(directories)
        }).catch(reject);
      });
  }
  this.getItems = function(id){
    console.log('get items');
    var self = this;
    return new Promise(
      (resolve, reject)=>{

        self.getPath(id)
        .then((path)=>{
          console.log('got path'+path);
          self.getDirectories(id)
          .then((directories)=>{
            console.log('got directories');
            self.getCollections(id)
            .then((collections)=>{
              resolve({
                info:{
                    path
                },
                directories,
                collections
              });
            }).catch(reject)
          })
          .catch(reject)
        }).catch(reject);
      });
  };
}

module.exports=Directory;