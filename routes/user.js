const express = require('express');
const middleware = require("../middleware");
const router = express.Router();
const User = require('../utils/User');   
const jwt = require('../middleware');




router.post('/createUser', function (req, res) {
  return User.create(req.body.username, req.body.userKeys)
  .then((user) => res.send(user))
  .catch((err) => {
      console.log('***There was an error creating a user')
      return res.status(400).send(err)
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

module.exports = router;