const fs = require('fs');
const db = require('../models');

const Directory = require('./Directory');
function noSpecialChars(str){
 return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

var Collection = function(id){
  this.id = id;
  this.properties = {};
  this.getPath = function(id){
    if(typeof id == 'undefined')
      id = this.id;

    const max_depth = 100;
    let path = '';
    var self = this;

    return new Promise(
      (resolve,reject)=>{

      db.Collection.findByPk(id)
                  .then((data)=>{
                      console.log(data.directory_id);

                      new Directory().getPath(data.directory_id).then((result)=>{
                        console.log('got directory path:'+result);
                        resolve(result);
                      }).catch(reject);
                  })
                  .catch(reject)
      });
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

      let result = {};
      db.Collection.findByPk(id)
      .then((collection)=>{
        db.File.findAll({
          where: {
            collection_id:id,
            temp:0
          }
        }).then((files)=>{



          db.Link.findAll({
            where: {
              collection_id:id
            }
          }).then((links)=>{
            result.info = {name:collection.name};
            result.files = files;
            result.links = links;
            resolve(result);
          })
          .catch(reject);


        }).catch(reject);

      })
      .catch((e)=>{
        console.log('error');
        console.log(e);
        reject(e);
      });
    });
  };
}

module.exports=Collection;