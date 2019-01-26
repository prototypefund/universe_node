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

function noSpecialChars(str){
 return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

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
  this.getSaltByUsername = function(username){
    return new Promise(
    (resolve,reject)=>{
      if(noSpecialChars(username)){
        db.User.findAll({
          where: {
            name: username,
          }
        }).then((users)=>{
          console.log(users)
          db.Password.findAll({
            where: {
              id: users[0].key_id
            }
          }).then((passwords)=>{
            resolve({

            })
          }).catch(reject);
        }).catch(reject);
      }else{
        reject('no valid username');
      }
    })
  }
  this.create = function(username, userKeys){
    return new Promise(
      function (resolve, reject) {
          //check username
          db.User.findAll({
            where: {
              name: username,
            }
          }).then((users)=>{
            if(users.length > 0)
              reject('username_taken');
            else{
              //store password and key
              db.Password.create({algorithm:'tweetnacl.hash', salt:userKeys.encryptedSalt, password:userKeys.passwordHash}).then((password)=>{
                db.Key.create({type:'identity',public_key:userKeys.publicKey,secret_key:userKeys.encryptedSecretKey}).then((key)=>{
                  //store user
                  db.User.create({ name:username, type:'user',password_id:password.id,key_id:key.id})
                  .then(function(user){

                    let userDir = new Directory();
                    userDir.properties = {
                      parent_directory_id:2, //home directory as defined in directory seed
                      name:user.id,
                      privacy:'s',
                      owner:user.id
                    }
                    //create user home directory
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
            }

          }).catch(function(error){
            console.log('error');
            console.log(errror);
          });


      });
  }
}


app.post('/createUser', function (req, res) {
  return User.create(req.body.username, req.body.userKeys)
  .then((user) => res.send(user))
  .catch((err) => {
      console.log('***There was an error creating a user')
      return res.status(400).send(err)
    })
});

app.get('/api/user/getUserSalt/:username', (req, res) => {  
  return User.getSaltByUsername(req.params.username)
  .then((salt) => res.send(salt))
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

