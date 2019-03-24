let Utils = new function(id){
  this.log = function(message){
    console.log(message);
  }
  this.resolveError = function(error,res){
    this.log(error);
    return res.status(200).send({status:error,error:error});
  };
  this.noSpecialChars = function(str){
    return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
  };
}

module.exports=Utils;