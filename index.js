const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const db = require('./models'); // new require for db object  

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(express.static(path.join(__dirname, '/universe_frontend/dist/'))); //  "public" off of current is root

const Directory = function(){
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

              const abspath = __dirname + '/upload/'+path+self.properties.name;
              if (fs.existsSync(abspath)) {
                  reject('error creating directory: path "'+path+'" exists');
              }
              else{
                  fs.mkdirSync(abspath, 0640);
                    db.Directory.create(self.properties)
                    .then(resolve)
                    .catch(reject)
              }
            })
      });
  }
}

const User = new function(){
  this.create = function(username, userKeys){
    return new Promise(
      function (resolve, reject) {
            console.log(userKeys);
            /*
            { publicKey: '5zA6FiYh4ajec765nQ7yGl9DPo/znHVfacgBK/IC9wY=',
  encryptedSecretKey: 'Cm25iqV+9Qkj1iIXOqJUVfGWmtcqW3z0VKBhsWCINMRR5odcR/zTmvrH6ZHzYwAFPD+cmyztn+ZUjwyALJjEtUvb/gwQIinSPAB2QEkSNHoJhIt/3731oS0YCLJva7Oi18Ns8gvWbJtq1J4FfJvO9Wdaa2+3iAT1kVBb7oxj2p/Y5TfdlHW+QPNQby0xoNjrHQkJZUvdWjMdfEKQcbeu1qz113UUNZV1wUB4csfG22/Bhii+UtRHsIfzBzKRjDL8TAL9qcl8YmiMnrfrb4aaDEOF9vBxAzNjKCVqSdI8fiRkEhOud4lYlxSImO5UZmqyPWW1kacYg7B9zYLppzQIaci4mo2M05Pod7ApqVCGdqSyU1aAIq3dLelbSIuoBIa5kzijUDWxbg2KSwTUBWUArDc=',
  encryptedSalt: 'dd8iHpNsZiVxy2kpB99JiNxGm+mseqh07s6yxYlxjFbBKeAY9PbFGpsPkOKjWc4fZOscENl8W24=',
  passwordHash: 'RIIgAEYElc/Yl720UXNXjqhOu30aWTBTJwOmWXScBpCxL+QibHPT8xGais+3KTtPHJ2w3105T3nD5akYBrjLAg==' }

            */

            db.Password.create({algorythm:'tweetnacl.hash', salt:userKeys.encryptedSalt, password:userKeys.passwordHash}).then((password)=>{

              db.Key.create({type:'identity',public_key:userKeys.publicKey,secret_key:userKeys.encryptedSecretKey}).then((key)=>{

                db.User.create({ name:username, type:'user',password_id:password.id,key_id:key.id})
                .then(function(user){

                  let userDir = new Directory();
                  userDir.properties = {
                    parent_directory_id:2,
                    name:user.id,
                    privacy:'p',
                    owner:user.id
                  }
                  userDir.create().then((directory)=>{
                    console.log('userdirectory created');
                    resolve(user);
                  });
                })
                .catch((err) => {
                  reject(err)
                })


              })

              
            })

            

      });
  }
}


app.post('/createUser', function (req, res) {
  return User.create(req.body.username, req.body.userKeys)
  .then((user) => res.send(user))
  .catch((err) => {
      console.log('***There was an error creating a contact', JSON.stringify(contact))
      return res.status(400).send(err)
    })
});

app.get('/api/directories', (req, res) => {  
  return db.Directory.findAll()
    .then((contacts) => res.send(contacts))
    .catch((err) => {
      console.log('There was an error querying contacts', JSON.stringify(err))
      return res.send(err)
    });
});

app.listen(1312);
console.log('Listening on port 80');

