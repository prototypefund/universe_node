const fs = require('fs');
const db = require('../models');

var Link = function(id){
  this.id = id;
  this.properties = {};
  this.create = function(){
    var self = this;
    return new Promise(
      function (resolve, reject) {

        //check privacy

        //check name

        //check ownership
        db.Link.create(self.properties)
        .then(resolve)
        .catch(reject)
      });
  };
}

module.exports=Link;