const db = require('../models'); 
const Directory = require('./Directory'); 
const Collection = require('./Collection'); 
const File = require('./File'); 
const Utils = require('./Utils'); 
const fs = require('fs');


module.exports = new function(){
  this.new = function(){
     return new Promise((resolve, reject) =>
      {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => 
        {
          if (err || !decodedToken)
          {
            return reject(err);
          }

          resolve(decodedToken);
        });
    });
  };
  this.auth = function(username,passwordHash){
    return new Promise(
    (resolve,reject)=>{
      if(Utils.noSpecialChars(username)){
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
    });
  };
  this.getSaltByUsername = function(username){
    return new Promise(
    (resolve,reject)=>{
      if(Utils.noSpecialChars(username)){
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
              });
          }).catch(reject);
        }).catch(reject);
      }else{
        reject('no valid username');
      }
    });
  }
  this.getUserInfo = function(userid){
    return new Promise(
    (resolve,reject)=>{
        db.User.findAll({
          where: {
            id: userid,
          }
        }).then((users)=>{
          console.log(users);
          if(users.length == 0)
            reject('no_user_found');
          
          resolve({
                id:users[0].id,
                username:users[0].name,
                realname:users[0].realname
          })
        }).catch(reject);
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
          if(!Utils.noSpecialChars(username))
            reject('username_contains_illegal_chars');
          db.User.findAll({
            where: {
              name: username,
            }
          }).then((users)=>{

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
                        let userconfigCollection = new Collection();

                        userconfigCollection.properties = {
                          directory_id:directory.id,
                          name:'userconfig',
                          info:'',
                          privacy:'h',
                          owner:user.id
                        }
                        console.log('create user collection...');
                        userconfigCollection.create()
                        .then((userconfigCollection) => {

                          let messagesCollection = new Collection();
                          messagesCollection.properties = {
                            directory_id:directory.id,
                            name:'messages',
                            info:'this collection is used to store chat messages',
                            privacy:'h',
                            owner:user.id
                          }
                          messagesCollection.create()
                          .then((messagesCollection) => {

                            //update user row to change chat and userconfig collection
                            user.update({
                              userconfig_collection:userconfigCollection.id,
                              messages_collection:messagesCollection.id,
                            }).then((user)=>{
                              console.log('done updating the user',userconfigCollection.id)
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
    return new Promise((resolve, reject)=>{
      this.getOpenRequests(userid)
      .then((openRequests)=>{
        resolve({openRequests});
      })
      .catch((e)=>{
        reject(e);
      });
    });
  }
  this.getUserData = function(userid){
    return new Promise((resolve, reject)=>{
      db.User.findByPk(userid)
      .then((user)=>{
        resolve(user);
      })
      .catch((e)=>{
        reject(e);
      })
    });
  }
  this.getBuddylist = function(userid){
    console.log('get buddylist for user #'+userid);
    return new Promise((resolve, reject)=>{
      this.getUserData(userid)
      .then((user)=>{
        if(!user.buddylist_file)
          resolve(false)
        else{
          new File(user.buddylist_file).readFile()
          .then((file)=>{
            resolve(file);
          })
        }
      })
      .catch((e)=>{
        reject(e);
      });
    });
  }
  this.setConfig = function(userid, index, value){
    let self = this;
    return new Promise((resolve, reject)=>{
      //check if index is in allowed config fields
      if(['last_activity', 'buddylist_file'].indexOf(index) == -1)
        reject('index not valid')
      else
        self.getUserData(userid)
        .then((user)=>{
            let updateObj = {}
            updateObj[index] = value;
            
            user.update(updateObj).then((user)=>{
              resolve(user);
            }).catch((e)=>{
              //delete key, user and collection
              reject(e);
            })
        })
        .catch((e)=>{

        });
    });
  };
  this.getLastMessageFile = function(receiver_id,sender_id){
    return new Promise((resolve,reject)=>{
      db.User.findByPk(receiver_id)
      .then((user)=>{
        //get the receivers message collection    
        let collection = new Collection();
        collection.getItems(user.messages_collection)
        .then((items)=>{
          //check if a messagefile for sender already exists
          let message_file_id = false;
          let message_files = []; //array with all message files which belong to sender
          for(var i in items.files){
            /*
            The message files have the following format:
            fileid_userid (message files shouldnt be >1M, always the last file is used for writing)
            example content of messages_collection
            0_4 (fileid = 0, userid = 4)
            1_4 (fileid = 1, userid = 4)
            0_9
            1_9
            0_1123
            0_256789 (fileid = 0, userid = 256789)
            */
            if(items.files[i].filename.split('_')[1] == sender_id){
              message_files.push(items.files[i]);
            }
          }
          //if no messages_file for sender
          //exists -> create a new one
          if(message_files.length === 0){
            let filename, storeFilename;
            filename = storeFilename = '0_'+sender_id;
            let file = new File();
            file.properties = {
              collection_id:user.messages_collection,
              name:filename,
              filename:filename,
              store_filename:storeFilename,
              temp:0,
              owner:sender_id,
              privacy:'h'
            }
            file.create().then((result)=>{
              //new file created! get path & set content
              file.getPath().then((path)=>{
                console.log('got path', path);
                fs.writeFile(path, '', function(err) {
                    if(err) {
                      reject(err);
                    }
                console.log(file);
                    resolve(file);
                }); 

              }).catch((e)=>{
                reject(e);
              });

            })
            .catch((e)=>{
              reject(e);
            })
          }else{
            resolve(new File(message_files[0].id));
          }
        })
        .catch((e)=>{
          reject(e)
        });
      })
      .catch((e)=>{
        reject(e)
      })
    });

  }
  this.getMessages = function(receiver_id,sender_id){
      let self = this;
      return new Promise((resolve,reject)=>{
        self.getLastMessageFile(receiver_id,sender_id)
        .then((file)=>{
          file.readFile()
          .then((fileObj)=>{
            resolve(fileObj)
          })
          .catch((e)=>{
            reject(e);
          })
        });
      });
  }
  this.sendMessage = function(receiver_id,sender_id,message){
    let self = this;
    return new Promise((resolve,reject)=>{



      self.getLastMessageFile(receiver_id,sender_id)
      .then((file)=>{
              file.getPath()
              .then((path)=>{
                fs.appendFile(path, '"'+message+'",\n', function (err) {
                  if (err){
                    reject(err);
                  }
                  resolve();
                });
              })
              .catch((e)=>{
                reject(e)
              })

      })
      .catch((e)=>{

      });

    });
  }
}