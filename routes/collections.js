const express = require('express');
const router = express.Router();
const Collection = require('../utils/Collections');  
//app.get('/api/directories',jwt.verify, (req, res) => {
router.get('/collections', (req, res) => {
  return db.Collection.findAll()
    .then((collections) => res.send(Collections))
    .catch((err) => {
      console.log('There was an error querying contacts', JSON.stringify(err))
      return res.send(err)
    });
});

router.get('/collections/:collectionId', (req, res) => {
  var collection = new Collection();
  return collection.getItems(req.params.directoryId)
  .then((items) => res.send(items))
  .catch((error) => {
    return res.status(400).send({error:error})
  })
});
router.post('/collection', (req, res) => {
  let collection = new Collection();
  collection.properties = {
    directory_id:req.body.directory_id,
    name:req.body.name,
    info:req.body.info,
    privacy:req.body.privacy
  }
  collection.create()
  .then((result) => res.send(result))
  .catch((error)=>{
    return res.status(400).send({error:error});
  });
});


module.exports = router;
