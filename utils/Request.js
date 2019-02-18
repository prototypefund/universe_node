const db = require('../models'); 

module.exports = new function(){
  //type eather buddy or group
  //user_a always the requesting user
  
  this.create = function(type, user_a, user_b){
     return new Promise(
      function (resolve, reject) {
        //store user id, type, user_a, user_b, payload
        db.Request.create({ type:type, user_a:user_a,user_b:user_b})
        .then(function(request){
          resolve(request);
        }).catch((err) => {
          reject(err)
        })
      });

  }
}