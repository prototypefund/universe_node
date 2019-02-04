'use strict';
module.exports = (sequelize, DataTypes) => {
  const Collection = sequelize.define('Collection', {
    id: {type:DataTypes.INTEGER, autoIncrement: true,primaryKey:true},
    directory_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    info: DataTypes.STRING,
    owner: DataTypes.INTEGER,
    privacy: DataTypes.STRING
  }, {});
  Collection.associate = function(models) {
    // associations can be defined here
  };
  return Collection;
};