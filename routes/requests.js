const express = require('express');

const Request = require('../utils/Request'); 

const middleware = require("../middleware");


const router = express.Router()

console.log(middleware)
router.all('*', middleware.verify)
router.post('/', function (req, res) {
  console.log(req.body);
  Request.create(req.body.type, 1, req.body.user_b)
  .then((result)=>{
    console.log(result);
  })
  .catch((e)=>{
    console.log(e);
  });

});
module.exports = router;