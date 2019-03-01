const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const os = require('os');
const path = require('path');
const fs = require('fs');


const File = require('../utils/File');  
const Collection = require('../utils/Collection');

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+'-'+S4()+'-'+S4()+'-'+S4()+'-'+S4()+S4()+S4());
}

router.get('/files/:fileId', (req, res) => {
	new File().readFile(req.params.fileId)
    .then((file)=>{
          	console.log('got file!')
          	console.log(file);
          	res.send(file);
            
    })
    .catch((e)=>{
    	return res.status(400).send({error:e})
    });
});

router.post('/files/upload/temp', function (req, res) {
   if(req.busboy) {
        let fileObj = new File();
        req.busboy.on('file', function(fieldname, file, filename, m) {

            console.log('storing temp file in collection'+req.headers.collection_id);
            new Collection(req.headers.collection_id).getPath().then((collectionPath)=>{
              storeFilename = guidGenerator()+'.temp';

              if(!req.headers.collection_id)
                return reject({error:'no collection_id'});

              fileObj.properties = {
                collection_id:req.headers.collection_id,
                name:filename,
                filename:filename,
                store_filename:storeFilename,
                temp:1,
                owner:1,
                privacy:req.headers.privacy
              };
              var saveTo = path.join('./upload/'+collectionPath, path.basename(storeFilename));

              file.pipe(fs.createWriteStream(saveTo));
            }).catch((error)=>{
                return res.status(400).send({error:error});
            });
        });
        req.busboy.on('finish', function() {
          fileObj.create()
          .then((result) => {
                res.send(result);
                return req.pipe(req.busboy);
              /*res.writeHead(200, { 'Connection': 'close' });
              res.end("That's all folks!");*/
            })
          .catch((error)=>{
            return res.status(400).send({error:error});
          });

        });
    }
});

//receives array of file ids
//removes .temp from the file name
//and updates db entry
router.post('/files/savetemp', function (req, res) {
    let promises = [];

    for(var i in req.body.files){
        promises.push = new File(req.body.files[i]).saveTemp()
    }
    Promise.all(promises.map(p => p.catch(e => e)))
      .then(results => {
        res.send({status:'ok'});

      }) // 1,Error: 2,3
      .catch(e => console.log(e));
});

router.post('/files/upload', function (req, res) {
   if(req.busboy) {
    req.busboy.on('field', function(fieldname, val) {
        console.log(fieldname, val);
        req.body[fieldname] = val;
    });

        let fileObj = new File();
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

            //verify has to be used that way, otherwise busboy wont work
            middleware.verify(req,res,function(){

            //////////////

            console.log('storing temp file in collection'+req.body.collection_id);
            let collection_id = req.body.collection_id;
            if(req.body.collection_id == '_USERCONFIG'){
                console.log(req.user);
                collection_id = req.user.userconfig_collection;
            }

            new Collection(collection_id).getPath().then((collectionPath)=>{
              storeFilename = guidGenerator();

              if(!collection_id)
                return reject({error:'no collection_id'});

              fileObj.properties = {
                collection_id:collection_id,
                name:filename,
                filename:filename,
                store_filename:storeFilename,
                temp:0,
                owner:req.user.id,
                privacy:req.body.privacy
              }
              var saveTo = path.join('./upload/'+collectionPath, path.basename(storeFilename));

              file.pipe(fs.createWriteStream(saveTo));
            }).catch((error)=>{
                return res.status(400).send({error:error});
            });

            ///////////

            });
        });
        req.busboy.on('finish', function() {
          fileObj.create()
          .then((result) => {
                res.send(result);
                return req.pipe(req.busboy);
              /*res.writeHead(200, { 'Connection': 'close' });
              res.end("That's all folks!");*/
            })
          .catch((error)=>{
            return res.status(400).send({error:error});
          });

        });
    }
});


router.post('/files/update', function (req, res) {
   if(req.busboy) {

        let filePath = '';

        req.busboy.on('field', function(fieldname, val) {
            console.log(fieldname, val);
            req.body[fieldname] = val;
        });

        let fileObj;
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

            //verify has to be used that way, otherwise busboy wont work
            middleware.verify(req,res,function(){

            //////////////

                console.log('updating file #'+req.body.file_id);

                fileObj = new File(req.body.file_id).getPath().then((filepath)=>{

                  filePath = filepath;
                  console.log('got filepath: '+filepath);



                  //we store the file to temp until upload is finished, than delete the original file and rename the temp file
                  var saveTo = filepath+'.temp';

                  file.pipe(fs.createWriteStream(saveTo));
                  

                })
                .catch((e)=>{

                });




            });
        });
        req.busboy.on('finish', function() {

            console.log(fileObj,filePath,'finish');
            //done with uploading file

            //delete old file
            fs.unlink(filePath,function(err){
                if(err) return res.send(err);
                console.log('file deleted successfully');

                //rename temp file
                fs.rename(filePath+'.temp', filePath, function(err) {
                    if ( err ) return res.send(err)
                        
                    res.send({status:'ok'});
                    return req.pipe(req.busboy);

                });
            }); 



        });
    }
});




module.exports = router;