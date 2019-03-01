'use strict';
module.exports = (sequelize, DataTypes) => {
  const Directory = sequelize.define('Directory', {
    id: {type:DataTypes.INTEGER, autoIncrement: true,primaryKey:true},
    parent_directory_id: DataTypes.INTEGER,
    path: DataTypes.STRING,
    name: DataTypes.STRING,
    owner: DataTypes.INTEGER,
    privacy: DataTypes.STRING
  }, {});
  Directory.associate = function(models) {
    // associations can be defined here
  };
  return Directory;
};