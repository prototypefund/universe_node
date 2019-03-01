const express = require('express');
const router = express.Router();
const Directory = require('../utils/Directory');  
//app.get('/api/directories',jwt.verify, (req, res) => {
router.get('/directories', (req, res) => {
  return db.Directory.findAll()
    .then((contacts) => res.send(contacts))
    .catch((err) => {
      console.log('There was an error querying contacts', JSON.stringify(err));
      return res.send(err);
    });
});

router.get('/directories/:directoryId', (req, res) => {
  var directory = new Directory();
  return directory.getItems(req.params.directoryId)
  .then((items) => res.send(items))
  .catch((error) => {
    return res.status(400).send({error:error});
  });
});
router.post('/directories', (req, res) => {
  console.log('create directory');
  console.log(req.body);
  let directory = new Directory();
  directory.properties = {
    parent_directory_id:req.body.parent_directory_id,
    name:req.body.name,
    privacy:req.body.privacy
  };
  directory.create()
  .then((result) => res.send(result))
  .catch((error)=>{
    return res.status(400).send(error);
  });
});



module.exports = router;
