'use strict';
module.exports = (sequelize, DataTypes) => {
  const Link = sequelize.define('Link', {
    collection_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    link: DataTypes.STRING,
    owner: DataTypes.INTEGER,
    privacy: DataTypes.STRING
  }, {});
  Link.associate = function(models) {
    // associations can be defined here
  };
  return Link;
};