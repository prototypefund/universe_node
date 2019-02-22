const fs = require('fs');
const path = require('path');
const db = require('../models');

const Directory = require('./Directory');  
const Collection = require('./Collection');  

var File = function(id){
  this.id = id;
  this.properties = {};
  this.readFile = function(id){
    if(!id)
      id = this.id
    else
      this.id = id

    return new Promise((resolve,reject)=>{
      this.getFileData()
      .then((file)=>{
        new Collection(file.collection_id).getPath()
        .then((collectionPath)=>{
          let filePath = path.resolve(__dirname, '../upload/'+collectionPath+file.store_filename);
          fs.readFile(filePath, function(err, f){
              // use the array
              resolve({
                file:file,
                filecontent:f.toString()});
          });
        })
        .catch((e)=>{
          reject(e);
        })
      })
      .catch((e)=>{
        reject(e)
      });
    });

    
  }
  this.getPath = function(id){
    if(!id)
      id = this.id
    else
      this.id = id

    return new Promise((resolve,reject)=>{
      this.getFileData()
      .then((file)=>{
        new Collection(file.collection_id).getPath()
        .then((collectionPath)=>{
          let filePath = path.resolve(__dirname, '../upload/'+collectionPath+file.store_filename);
          resolve(filePath);
        })
        .catch((e)=>{
          reject(e);
        })
      })
      .catch((e)=>{
        reject(e)
      });
    });


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

  this.getFileData = function(id){
    if(!id)
      id = this.id;


    return new Promise((resolve, reject)=>{
      db.File.findByPk(id)
      .then((file)=>{
        resolve(file);
      })
      .catch((e)=>{
        reject(e);
      })
    });
  }
}

module.exports=File;