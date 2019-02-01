const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./models'); 
const User = require('./utils/User');   

const jwt = require('./middleware');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(express.static(path.join(__dirname, '/universe_frontend/dist/'))); //  "public" off of current is root


app.post('/createUser', function (req, res) {
  return User.create(req.body.username, req.body.userKeys)
  .then((user) => res.send(user))
  .catch((err) => {
      console.log('***There was an error creating a user')
      return res.status(400).send(err)
    })
});

app.get('/user/getUserSalt/:username', (req, res) => {  
  return User.getSaltByUsername(req.params.username)
  .then((salt) => res.send(salt))
  .catch((error) => {
    return res.status(400).send({error:error})
  })
});

app.post('/user/login', (req, res) => {
  User.auth(req.body.username,req.body.passwordHash).then((user)=>{
    console.log('asd');
    let token = jwt.create(user);
    res.send({user:user, jwt:token});
  }).catch((err) => {
    res.status(400).send(err);
  })
});

app.get('/api/directories',jwt.verify, (req, res) => {
  return db.Directory.findAll()
    .then((contacts) => res.send(contacts))
    .catch((err) => {
      console.log('There was an error querying contacts', JSON.stringify(err))
      return res.send(err)
    });
});

app.listen(1312);
console.log('Listening on port 80');

