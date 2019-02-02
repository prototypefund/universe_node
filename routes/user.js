var express = require('express');
var router = express.Router();
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

router.get('/user/getUserSalt/:username', (req, res) => {  
  return User.getSaltByUsername(req.params.username)
  .then((salt) => res.send(salt))
  .catch((error) => {
    return res.status(400).send({error:error})
  })
});

router.post('/user/login', (req, res) => {
  User.auth(req.body.username,req.body.passwordHash).then((user)=>{
    console.log('asd');
    let token = jwt.create(user);
    res.send({user:user, jwt:token});
  }).catch((err) => {
    res.status(400).send(err);
  })
});

module.exports = router;