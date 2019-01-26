'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {type:DataTypes.INTEGER, autoIncrement: true,primaryKey:true},
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    password_id: DataTypes.INTEGER,
    key_id: DataTypes.INTEGER,
    last_activity: DataTypes.DATE
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};