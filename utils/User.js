const db = require('../models'); 
const Directory = require('./Directory'); 
const Collection = require('./Collection'); 

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
  this.searchByUsername = function(username){
    return new Promise(
    (resolve,reject)=>{

        db.User.findAll({
          attributes: ['id', 'name', 'last_activity'],
          where: {
            name: username,
          }
        }).then((users)=>{
          if(users.length == 0)
            reject('no_user_found');
          else{
            users.forEach(function(v){ delete v.password_id });
            resolve(users);
          }
        }).catch(reject);
    });
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
            console.log('asdasd');

            if(users.length > 0)
              reject('username_taken');
            else{

              let passwordObj;
              //store password and key
              db.Password.create({algorithm:'tweetnacl.hash', salt:userKeys.encryptedSalt, password:userKeys.passwordHash}).then((password)=>{
                passwordObj = password;
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
                    //create user home directory
                    userDir.create().then((directory)=>{

                        //create user config collection
                        let collection = new Collection();

                        collection.properties = {
                          directory_id:directory.id,
                          name:'userconfig',
                          info:'',
                          privacy:'h',
                          owner:user.id
                        }
                        console.log('create user collection...');
                        collection.create()
                        .then((collection) => {
                          console.log('collection #'+collection.id+' created');
                          user.update({
                            userconfig_collection:collection.id
                          }).then((user)=>{
                            console.log('done updating the user')
                            resolve(user);
                          }).catch((e)=>{
                            //delete key, user and collection

                            console.log('error updating the user')

                            //delete password and key
                            password.destroy().on('success', function(p) {
                               key.destroy().on('success', function(k) {

                                  user.destroy().then((res)=>{

                                    reject(error);
                                  });
                               });
                            });
                          })

                        })
                        .catch((error)=>{
                          //delete password and key
                        });
                    }).catch((e)=>{

                      console.log('error creating directory, deleting password, key and user')
                      passwordObj.destroy().then((p)=> {
                        key.destroy().then((k)=>{
                          user.destroy().then((u)=>{
                            reject(e);
                          });
                        });
                      });
                    });

                  })
                  .catch((e) => {

                    console.log('error creating user, deleting password and key')
                    passwordObj.destroy().then((p)=> {
                        key.destroy().then((k)=>{
                            reject(e);
                        });
                    });
                  })
                }).catch((e)=>{
                  console.log('error creating key, deleting password')
                  passwordObj.destroy().then((p)=> {
                    reject(e);
                  });
                })
              })
            }

          }).catch(function(error){
            console.log('error');
            console.log(error);
          });


      });
  }
  this.getOpenRequests = function(userid){
     return new Promise((resolve, reject)=>{
       db.Request.findAll({
            where: {
              user_a: userid,
            }
       })
       .then((requests)=>{
        resolve(requests);
       })
       .catch((e)=>{
        reject(e);
       })
     });
  }
  this.fetchReload = function(userid){
    return new Promise((resolve, rejoct)=>{
      this.getOpenRequests(userid)
      .then((openRequests)=>{
        resolve({openRequests});
      })
      .catch((e)=>{
        reject(e);
      });
    });
  }
}