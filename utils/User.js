const db = require('../models'); 
const Directory = require('./Directory'); 

function noSpecialChars(str){
 return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

module.exports = new function(){
  this.new = function(){
     return new Promise((resolve, reject) =>
      {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => 
        {
          if (err || !decodedToken)
          {
            return reject(err)
          }

          resolve(decodedToken)
        })
    })
  }
  this.auth = function(username,passwordHash){
    return new Promise(
    (resolve,reject)=>{
      if(noSpecialChars(username)){
        db.User.findAll({
          where: {
            name: username,
          }
        }).then((users)=>{
          if(users.length == 0)
            reject('no_user_found');
          else
          db.Password.findAll({
            where: {
              id: users[0].key_id
            }
          }).then((passwords)=>{

            if(passwords.length == 0)
              reject('no_password_found');
            else
              if(passwords[0].password == passwordHash)
                resolve(users[0]);
          }).catch(reject);
        }).catch(reject);
      }else{
        reject('no valid username');
      }
    })
  }
  this.getSaltByUsername = function(username){
    return new Promise(
    (resolve,reject)=>{
      if(noSpecialChars(username)){
        db.User.findAll({
          where: {
            name: username,
          }
        }).then((users)=>{
          if(users.length == 0)
            reject('no_user_found');
          else
          db.Password.findAll({
            where: {
              id: users[0].key_id
            }
          }).then((passwords)=>{

            if(passwords.length == 0)
              reject('no_password_found');
            else
              resolve({
                algorithm:passwords[0].algorithm,
                encryptedSalt:passwords[0].salt,
                passwordHash:passwords[0].password //@sec remove
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

            console.log('asdasd');
          //check username
          db.User.findAll({
            where: {
              name: username,
            }
          }).then((users)=>{
            console.log('asdasd');

            if(users.length > 0)
              reject('username_taken');
            else{
              //store password and key
              db.Password.create({algorithm:'tweetnacl.hash', salt:userKeys.encryptedSalt, password:userKeys.passwordHash}).then((password)=>{
                db.Key.create({type:'identity',public_key:userKeys.publicKey,secret_key:userKeys.encryptedSecretKey}).then((key)=>{
                  //store user
                  db.User.create({ name:username, type:'user',password_id:password.id,key_id:key.id})
                  .then(function(user){
                    console.log('create user directory...');
                    let userDir = new Directory();
                    userDir.properties = {
                      parent_directory_id:2, //home directory as defined in directory seed
                      name:user.id,
                      privacy:'s',
                      owner:user.id
                    }
                    console.log(userDir);
                    //create user home directory
                    userDir.create().then((directory)=>{
                      resolve(user);
                    }).catch((e)=>{
                        reject(e);
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