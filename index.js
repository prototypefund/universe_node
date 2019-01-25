var express = require('express');
var app = express();
var path = require('path');

//app.use(express.static(__dirname)); // Current directory is root
app.use(express.static(path.join(__dirname, '/universe_frontend/dist/'))); //  "public" off of current is root
//  server.use(express.static(__dirname + '/universe_frontend/build/'));


app.get('/createUser', function (req, res) {
  console.log(req);
  res.send('Hello World!');
});

app.listen(1312);
console.log('Listening on port 80');

