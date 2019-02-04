'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Collections', [{
        id: 1,
        directory_id: 1,
        name: 'tescollection',
        info: 'this is a testcollection',
        owner: 0,
        privacy: 'p',
        createdAt: new Date().toDateString(),
        updatedAt: new Date().toDateString()
      }], {});
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.bulkDelete('Collections', null, {});
    
  }
};
