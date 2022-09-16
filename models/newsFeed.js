'use strict';
import * as sequelizeExport from 'sequelize';

const { Model } = sequelizeExport.default || sequelizeExport;
export default  (sequelize, DataTypes) => {
  class NewsFeed extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "userId" })
      this.belongsTo(models.Category,{ foreignKey: "categoryId" });
      
    }
  };
  NewsFeed.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    title:  {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug:  {
        type: DataTypes.STRING,
        allowNull: false
      },
    body:  {
        type: DataTypes.TEXT,
        allowNull: false
      },
      views:{
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue:0
      },
      time2read:  {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      featuredImage:  {
        type: DataTypes.STRING,
        allowNull: true
      },
      imageGallery:  {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      }
  }, {
    sequelize,
    modelName: 'NewsFeed',
  });
  return NewsFeed;
};