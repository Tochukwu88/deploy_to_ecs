import * as sequelizeExport from 'sequelize';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const { Model } = sequelizeExport.default || sequelizeExport;

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Otp);
     
      User.hasMany(models.NewsFeed, { foreignKey: "userId" })
    }

    /**
     * Login a user using email and password
     * @param {string} email email address
     * @return {Promise}
     */
    static loginUsing(email, plainPassword) {
      return User.findOne({
        where: {
          email: email
        }
      }).then(user => {
        if (user == null)
          return null;
        if (user.isPasswordValid(plainPassword)) return user;
        else return null;
      }).catch(err => console.error(err));
    };

    /**
     * creates a password hash, from the plain string
     * @param {string} plainPassword plain password string
     */
    setPassword(plainPassword) {
      this.passwordSalt = crypto.randomBytes(16).toString('hex');
      this.setDataValue('password', crypto
        .pbkdf2Sync(plainPassword, this.passwordSalt, 1000, 64, 'sha512')
        .toString('hex'));
    }

    /**
     * is the plain password correct?
     * @param {string} plainPassword plain password string
     */
    isPasswordValid(plainPassword) {
      const passwordHash = crypto
        .pbkdf2Sync(plainPassword, this.getDataValue('passwordSalt'), 1000, 64, 'sha512')
        .toString('hex');
      return this.password === passwordHash;
    }

    /**
     * generates a signed jwt token for this user account object
     */
    generateJwt() {
      const expiry = new Date;
      // add 730 days to current day, so it doesn't expire soon
      expiry.setDate(expiry.getDate() + 730);
      return jwt.sign({
        id: this.id,
        email: this.email,
        isVerified: this.isVerified,
        isAuthenticated: true,
        isAdmin:this.isAdmin,
       // exp: parseInt(expiry.getTime() / 1000, 10)
      }, process.env.JWT_SECRET,{ expiresIn: process.env.TOKENVALIDITY });
    }

    generateTempJwt() {
      const expiry = new Date;
      expiry.setDate(expiry.getDate() + 7);
      return jwt.sign({
        email: this.email,
        isVerified: this.isVerified,
        isAuthenticated: false,
        isAdmin:this.isAdmin,
       // exp: parseInt(expiry.getTime() / 1000, 10)
      }, process.env.JWT_SECRET,{ expiresIn: process.env.TOKENVALIDITY });
    }
  };

  User.init({
    name: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    email: DataTypes.STRING,
    isVerified: DataTypes.BOOLEAN, // is email verified before
    password: DataTypes.STRING,
    passwordSalt: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};