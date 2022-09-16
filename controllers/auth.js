import Sequelize from 'sequelize';
import models from '../models/index.js';
import passport from 'passport';
import { sendOtp, generateRandomFourDigits } from '../utilities/functions.js';
import { errorResponse } from '../utils/responseHandler.js';
import jwt from 'jsonwebtoken'

const register = async (req, res) => {
  if (!req.body?.email || !req.body?.password)
    return res.status(400)
      .json({ message: "'email' and 'password' are required." });

  const { name, phoneNumber, email } = req.body;
  const isAdmin = req.body.isAdmin ?? false;
  let newUser = models.User.build({ name, phoneNumber, email, isAdmin });

  try {
    if (req.body.password != req.body.retypePassword)
      throw new Error("Passwords do not match");
    newUser.setPassword(req.body.password);

    let user = await newUser.save();
    const isOtpSent = await pushOtp(user);
    if (user != null && isOtpSent) {
      // don't send secrets
      user.password = user.passwordSalt = undefined;
      delete user.dataValues["id"];

      const token = newUser.generateTempJwt();
      res.status(201)
        .json({ token, data: user, message: "Account created successfully." });
    } else {
      res.status(400)
        .json({ message: "Error creating new user." });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Sequelize.ValidationError)
      return res.status(409)
        .json({ message: "Account already exists." });
    res.status(400) // catch errors such as Passwords do not match
      .json({ message: error.message }); // safe to disclose
  }
}

const login = (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(400)
      .json({ message: "Both email and password is required." })

  // this is a function call, to invoke
  // the configured passport strategy in config/passport.js
  passport.authenticate('local', (err, user, info) => { // 'local' is strategy
    let token = null;
    if (err) { // passport returns an error
      console.error(err);
      return res.status(500)
        .json({ message: "An unknown error occured while logging in." });
    }

    // we've already logged in the user from config/passport.js
    if (user instanceof models.User) {
      Promise.all([pushOtp(user), user.save()])
        .then(result => {
          const [isOtpSent, user] = result;
          token = user.generateTempJwt();
          const { name, phoneNumber, email, isVerified } = user.toJSON();

          if (isOtpSent)
            res.status(200)
              .json({
                token, data: { name, phoneNumber, email, isVerified },
                message: "Login successful!"
              });
        })
        .catch(error => console.error(error))
    } else {
      res.status(401)
        // why did the authentication fail?
        // for example, was the login incorrect?
        // this error message typically comes from the one set in config/passport.js
        .json(info);
    }
  })(req, res);
  // we make req and res available to passport
  // this proves this is a function call
}

const adminRegister = (req, res) => {
  req['body']['isAdmin'] = true;
  return register(req, res);
}

const adminLogin = (req, res) => {
  return login(req, res);
}
const adminAuth = async(req, res, next) => {

  const authorizationHeaader = req.headers
  try {
      if (authorizationHeaader) {
          const token = authorizationHeaader.authorization.split(' ')[1]



          let decoded =  jwt.verify(token, process.env.JWT_SECRET, { expiresIn: process.env.TOKENVALIDITY })
          
          if(!decoded.isAdmin){
            return errorResponse(res, "access denied,admin resource", 403)
        }
          req.user = decoded


      }
      next()



  } catch (err) {
    console.log(err)
      return errorResponse(res, "please login", 401)


  }


}
const verifyToken = async(req, res, next) => {

  const authorizationHeaader = req.headers
  try {
      if (authorizationHeaader) {
          const token = authorizationHeaader.authorization.split(' ')[1]



          let decoded =  jwt.verify(token, process.env.JWT_SECRET, { expiresIn: process.env.TOKENVALIDITY })
        
          req.user = decoded


      }
      next()



  } catch (err) {
      return errorResponse(res, "please login", 401)


  }


}

const verifyOtp = async (req, res) => {
  models.User.findOne({ where: { email: req.payload.email } })
    .then(async user => {
      const otpList = await user.getOtps()
      const verified = otpList.find(otp => otp.otp == req.body.otp)
      if (typeof verified != 'undefined') {
        user.isVerified = true;
        await user.save();
        const token = user.generateJwt();
        await models.Otp.destroy({ where: { UserId: user.id } })

        // don't send secrets
        user.password = user.passwordSalt = undefined;
        delete user.dataValues["id"];
        res.status(200).json({ token, message: "Otp validation successful" })
      } else {
        res.status(400).json({ message: "Otp validation failed. Incorrect OTP." })
      }
    }).catch(error => {
      res.status(400).json({ message: "Operation failed." })
      console.error(error)
    })
}

const forgotPasswordEmail = (req, res) => {
  models.User.findOne({
    where: { email: req.body.email }
  }).then(async user => {
    const isOtpSent = await pushOtp(user);
    if (isOtpSent) res.status(200).json({
      token: user.generateTempJwt(),
      message: "Email sent successfully."
    })
    else throw new Error("Email not sent successfully.")
  }).catch(error => {
    res.status(400).json({ message: error.message });
  });
}

const setPassword = (req, res) => {
  if (!req.body?.newPassword)
    return res.status(400)
      .json({ message: "'password' is required." });

  models.User.findOne({
    where: { email: req.payload.email } // secured with public key cryptography
  }).then(async user => {
    try {
      if (req.body.newPassword != req.body?.retypeNewPassword)
        throw new Error("Passwords do not match.");
      user.setPassword(req.body.newPassword);
      await user.save();
      res.status(200).json({ message: "Password changed successfully." })
    } catch (error) {
      console.error(error);
      res.status(400) // catch errors such as Passwords do not match
        .json({ message: error.message });
    }
  }).catch(error => {
    res.status(400).json({ message: "Operation failed." });
  });
}

const resendOtp = (req, res) => {
  models.User.findOne({ where: { email: req.payload.email } })
    .then(async user => {
      const isOtpSent = await pushOtp(user)
      if (isOtpSent)
        return res.status(200).json({ message: "Otp resent successfully." })
      res.status(400).json({ message: "Otp resend failed." })
    }).catch(error => res.status(400).json({ message: "Otp resend failed." }));
}

const editPassword = (req, res) => { }

const pushOtp = async user => {
  const otp = generateRandomFourDigits();
  // console.log("OTP: ", otp);
  sendOtp(user.email, user.phoneNumber, otp);
  const result = await user.createOtp({ otp });
  if (result instanceof models.Otp) return true
  else return false;
}

export {
  register,
  login,
  adminRegister,
  adminLogin,
  verifyOtp,
  forgotPasswordEmail,
  setPassword,
  resendOtp,
  verifyToken,
  adminAuth
}
