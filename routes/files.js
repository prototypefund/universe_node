const express = require('express');
const router = express.Router();
const jwt = require('../middleware');
const os = require('os');
const path = require('path');
const fs = require('fs');


const File = require('../utils/File');  
const Collection = require('../utils/Collection');

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

router.post('/files/upload/temp', function (req, res) {
   if(req.busboy) {
   		let fileObj = new File();
	    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

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
		      }
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
		promises.push = new File(req.body.files[i]).saveTemp
	}

	Promise.all(promises.map(p => p.catch(e => e)))
	  .then(results => {
		res.send({status:'ok'});
	  	console.log(results)

	  }) // 1,Error: 2,3
	  .catch(e => console.log(e));
});


module.exports = router;