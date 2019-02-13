const fs = require('fs');
const db = require('../models');

const Directory = require('./Directory');  
const Collection = require('./Collection');  

var File = function(id){
  this.id = id;
  this.properties = {};
  this.getPath = function(id){
    
  }
  this.create = function(){
    console.log('create file');
    var self = this;
    return new Promise(
      function (resolve, reject) {
        //check privacy

        //check name

        //check ownership
        db.File.create(self.properties)
        .then((result)=>{
          resolve(result);
        })
        .catch((error)=>{
          reject(error);
        });
      });
  };
  this.saveTemp = function(id){

    if(typeof id == 'undefined')
      id = this.id;

    return new Promise(
      (resolve,reject)=>{

        db.File.findByPk(id)
        .then(function (file) {
          if (file) {
                  //get path of file
                  new Collection(file.collection_id).getPath()
                  .then((path)=>{

                    //rename file
                    let store_filename = './upload/'+path+file.store_filename;
                    fs.rename(store_filename, store_filename.slice(0,-5) /* remove .temp at the end */, function(err) {
                        if ( !err ) {

                          file.update({
                            temp: 0,
                            store_filename:store_filename.slice(0,-5)
                          })
                          .then((result)=>{
                            resolve(result)
                          })
                          .catch((e)=>{
                            reject(e);
                          });

                        }else{
                          reject(err)
                        }
                    });

                  })
                  .catch((error)=>{
                    console.log('asd');
                    console.log(error);
                    reject(error)

                  });
          }
        }).
        catch((e)=>{
          console.log('ERRRROR');
          console.log(e);
          reject(e);
        });



        
      })

  };
}

module.exports=File;