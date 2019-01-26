'use strict';
module.exports = (sequelize, DataTypes) => {
  const Key = sequelize.define('Key', {
    id: {type:DataTypes.INTEGER, autoIncrement: true,primaryKey:true},
    type: DataTypes.STRING,
    public_key: DataTypes.STRING,
    secret_key: DataTypes.STRING,
    signature: DataTypes.STRING
  }, {});
  Key.associate = function(models) {
    // associations can be defined here
  };
  return Key;
};