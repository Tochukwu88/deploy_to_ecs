import * as sequelizeExport from 'sequelize';

const { Model } = sequelizeExport.default || sequelizeExport;

export default (sequelize, DataTypes) => {
  class Otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Otp.belongsTo(models.User);
    }
  };
  Otp.init({
    otp: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Otp',
  });
  return Otp;
};