'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NewsFeed', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      categoryId:{
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title:  {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug:  {
        type: Sequelize.STRING,
        allowNull: false
      },
      body:  {
          type: Sequelize.TEXT,
          allowNull: false
        },
        views:{
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue:0
        },
        time2read:  {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        featuredImage:  {
          type: Sequelize.STRING,
          allowNull: true
        },
        imageGallery:  {
          type: Sequelize.ARRAY(Sequelize.STRING),
          allowNull: true
        },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('NewsFeed');
  }
};