const express = require('express');
const router = express.Router();
const Link = require('../utils/Link');  
//app.get('/api/directories',jwt.verify, (req, res) => {

router.post('/', (req, res) => {
  let link = new Link();
  link.properties = {
    collection_id:req.body.collection_id,
    name:req.body.name,
    link:req.body.link,
    privacy:req.body.privacy,
    owner:1
  }
  link.create()
  .then((result) => res.send(result))
  .catch((error)=>{
    return res.status(400).send({error:error});
  });
});


module.exports = router;
