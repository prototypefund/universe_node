const express = require('express');

const Request = require('../utils/Request'); 

const middleware = require("../middleware");


const router = express.Router()

router.all('*', middleware.verify)
router.post('/', function (req, res) {
  console.log(req.body);
  console.log(req.user);
  Request.create(req.body.type, 1, req.body.user_b)
  .then((result)=>{
    res.send(result);
  })
  .catch((e)=>{
    res.status(400).send(e);
  });

});
module.exports = router;