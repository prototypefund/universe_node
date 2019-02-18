'use strict';
module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define('Request', {
    type: DataTypes.STRING,
    user_a: DataTypes.INTEGER,
    user_b: DataTypes.INTEGER,
    payload: DataTypes.STRING
  }, {});
  Request.associate = function(models) {
    // associations can be defined here
  };
  return Request;
};