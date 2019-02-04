const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];


const app = express();



app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(express.static(path.join(__dirname, '/universe_frontend/dist/'))); //  "public" off of current is root




app.use('/api/v1',require('./routes/user'));
app.use('/api/v1',require('./routes/directories'));
app.use('/api/v1',require('./routes/collections'));

app.listen(config.port);
console.log('Listening on port '+config.port);

