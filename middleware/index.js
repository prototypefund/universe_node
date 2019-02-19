'use strict';
require('dotenv').config();
const jwt = require('jsonwebtoken')

function verifyJWTToken(token) 
{
  return new Promise((resolve, reject) =>
  {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => 
    {
      if (err || !decodedToken)
      {
        return reject(err)
      }

      resolve(decodedToken)
    })
  })
}
module.exports = new function(){
  this.verify = function(req, res, next)
    {
      let token =  req.headers['x-access-token'] || req.headers['authorization'];
      if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
      if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
      }
      //let token = (req.method === 'POST') ? req.body.token : req.query.token
      verifyJWTToken(token)
        .then((decodedToken) =>
        {
          req.user = decodedToken.data
          next()
        })
        .catch((err) =>
        {
          console.log(err);
          res.status(400)
            .json({message: "Invalid auth token provided."})
        })
    }
    this.create = function(details)
    {
      if (typeof details !== 'object')
      {
        details = {}
      }

      if (!details.maxAge || typeof details.maxAge !== 'number')
      {
        details.maxAge = 3600
      }

      let token = jwt.sign({
         data: details.sessionData
        }, process.env.JWT_SECRET, {
          expiresIn: details.maxAge,
          algorithm: 'HS256'
      });

      return token
    }
}