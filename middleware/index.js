'use strict';
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
      let token = (req.method === 'POST') ? req.body.token : req.query.token

      verifyJWTToken(token)
        .then((decodedToken) =>
        {
          req.user = decodedToken.data
          next()
        })
        .catch((err) =>
        {
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
        }, 'sh a secret', {
          expiresIn: details.maxAge,
          algorithm: 'HS256'
      });

      return token
    }
}