'use strict';
module.exports = (sequelize, DataTypes) => {
  const Password = sequelize.define('Password', {
    id: {type:DataTypes.INTEGER, autoIncrement: true,primaryKey:true},
    algorythm: DataTypes.STRING,
    salt: DataTypes.STRING,
    password: DataTypes.STRING
  }, {});
  Password.associate = function(models) {
    // associations can be defined here
  };
  return Password;
};