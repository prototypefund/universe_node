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
  }
}

module.exports=Directory;