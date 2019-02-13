'use strict';
module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    collection_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    filename: DataTypes.STRING,
    store_filename: DataTypes.STRING,
    temp: DataTypes.BOOLEAN,
    owner: DataTypes.INTEGER,
    privacy: DataTypes.STRING
  }, {});
  File.associate = function(models) {
    // associations can be defined here
  };
  return File;
};