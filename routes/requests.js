const express = require('express');

const Request = require('../utils/Request'); 

const middleware = require("../middleware");


const router = express.Router()

router.post('/', middleware.verify, function (req, res) {
  Request.create(req.body.type, req.user.id, req.body.user_b)
  .then((result)=>{
    res.send(result);
  })
  .catch((e)=>{
    res.status(400).send(e);
  });

});
module.exports = router;