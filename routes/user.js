const express = require('express');
const middleware = require("../middleware");
const router = express.Router();
const User = require('../utils/User'); 
const Utils = require('../utils/Utils'); 
const jwt = require('../middleware');




router.post('/createUser', function (req, res) {
  return User.create(req.body.username, req.body.userKeys)
  .then((user) => res.send(user))
  .catch((err) => {
      console.log('***There was an error creating a user')
      return res.status(400).send(err)
    })
});

router.get('/getUserInfo/:userid', (req, res) => {  
  return User.getUserInfo(req.params.userid)
  .then((info) => res.send(info))
  .catch((error) => {
    return res.status(400).send({error:error})
  })
});
router.get('/getUserSalt/:username', (req, res) => {  
  return User.getSaltByUsername(req.params.username)
  .then((salt) => res.send(salt))
  .catch((error) => {
    return res.status(400).send({error:error})
  })
});

router.post('/login', (req, res) => {
  User.auth(req.body.username,req.body.passwordHash).then((user)=>{

    let details = {
      sessionData:user
    }
    let token = jwt.create(details);
    res.send({user:user, jwt:token});
  }).catch((err) => {
    res.status(400).send(err);
  })
});

router.get('/reload', middleware.verify, (req, res) => {

  User.fetchReload(req.user.id)
  .then((result)=>{

    res.status(200).send(result)
  })
  .catch((e)=>{

    res.status(400).send(e)

  })
});


router.get('/buddylist', middleware.verify, (req, res) => {
  User.getBuddylist(req.user.id)
  .then((result)=>{
    res.status(200).send(result)
  })
  .catch((e)=>{
    res.status(400).send(e)

  })
});

router.post('/setConfig', middleware.verify, (req, res) => {
  User.setConfig(req.user.id, req.body.index, req.body.value)
  .then((result)=>{
    res.status(200).send(result)
  })
  .catch((e)=>{
    res.status(400).send(e)
  })
});

router.post('/:userid/sendMessage', middleware.verify, (req,res) => {
  const fs = require('fs');

  const db = require('../models');
  const Collection = require('../utils/Collection');
  const File = require('../utils/File');

  let receiver_id = req.params.userid;
  let sender_id = req.user.id;

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
          owner:req.user.id,
          privacy:'h'
        }
        file.create().then((result)=>{
          //new file created! get path & set content
          file.getPath().then((path)=>{
            fs.writeFile(path, '\''+req.body.message+'\'\n', function(err) {
                if(err) {
                    Utils.resolveError(err,res);
                }
                res.status(200).send({status:ok});
            }); 

          }).catch((e)=>{

          });

        })
        .catch((e)=>{
          Utils.resolveError(e,res);
        })
      }else{
        let message_file_id = message_files[0].id;
        let file = new File(message_file_id);
        file.getFileData()
        .then((fileObj)=>{
          file.getPath()
          .then((path)=>{
            fs.appendFile(path, ',\n\''+req.body.message+'\'', function (err) {
              if (err){
                //ERROR
                Utils.resolveError(err,res);
              }
              res.status(200).send({status:'ok'});
            });
          })
          .catch((e)=>{
            Utils.resolveError(e,res);
          })
        })
        .catch((e)=>{
          Utils.resolveError(e,res);
        });
      }

        //if yes => id
        //if not => create => id

          //add message to message file
    })
    .catch((e)=>{

    });
  })
  .catch((e)=>{
    //ERROR
  })


});

module.exports = router;