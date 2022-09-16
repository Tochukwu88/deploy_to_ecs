'use strict';
import * as sequelizeExport from 'sequelize';

const { Model } = sequelizeExport.default || sequelizeExport;
export default  (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.NewsFeed, { foreignKey: "categoryId" })
      
    }
  };
  Category.init({
   
    name:  {
      type: DataTypes.STRING,
      allowNull: false
    },
   
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};