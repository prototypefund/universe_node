'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
     return queryInterface.bulkInsert('Directories', [{
      id: 1,
      parent_directory_id: 0,
      name: 'main',
      owner: 0,
      privacy: 'p',
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      id: 2,
      parent_directory_id: 1,
      name: 'home',
      owner: 0,
      privacy: 'p',
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      id: 3,
      parent_directory_id: 1,
      name: 'documents',
      owner: 0,
      privacy: 'p',
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }], {});
  },
  down: (queryInterface, Sequelize) => {
   return queryInterface.bulkDelete('Directories', null, {});
  }
};
