const express = require('express');
const bodyParser = require('body-parser');
const busboy = require('connect-busboy');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];

const Search = require('./utils/Search');  

const app = express();



app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(bodyParser.json());
app.use(busboy({ immediate: true }));                   //top support file uploads
app.use(express.static(path.join(__dirname, '/universe_frontend/dist/'))); //  "public" off of current is root




app.use('/api/v1/user',require('./routes/user'));
app.use('/api/v1',require('./routes/directories'));
app.use('/api/v1',require('./routes/collections'));
app.use('/api/v1',require('./routes/files'));
app.use('/api/v1/links',require('./routes/links'));
app.use('/api/v1/requests',require('./routes/requests'));


app.get('/api/v1/search/:keyword', (req, res) => {
    console.log(req.params.keyword);
    new Search(req.params.keyword).search()
    .then((result)=>{

        return res.send(result);
    })
    .catch((e)=>{

        return res.status(400).send({error:e});
        console.log('ERROR!');
    });
});

let server = app.listen(config.port);
console.log('Listening on port '+config.port);
module.exports = server;

