import express from "express";
import expressJwt from "express-jwt";

const router = express.Router();

// authentication middleware that helps us decode our jwt
// token and saves it in express' req object
const auth = expressJwt({
  secret: process.env.JWT_SECRET,
  // we'll put this property "payload" containing our decrypted jwt, inside express' req object
  userProperty: "payload",
  algorithms: ["HS256"],
  // if we didn't supply a valid token,
  // control flow continues at the bottom error handler in app.js
});

const methodNotAllowed = (req, res) => {
  res
    .status(405)
    .json({
      message: "This HTTP method is currently not allowed on this route",
    });
};

import {
  register,
  login,
  adminRegister,
  adminLogin,
  verifyOtp,
  forgotPasswordEmail,
  setPassword,
  resendOtp,
} from "../controllers/auth.js";

router.post("/register", register);
router.post("/login", login);
router.post("/admin/register", adminRegister);
router.post("/admin/login", adminLogin);

router.route("/otp").post(auth, verifyOtp).patch(auth, resendOtp);
router
  .route("/forgot-password/otp")
  .post(auth, verifyOtp)
  .patch(auth, resendOtp);
router.post("/forgot-password", forgotPasswordEmail);
router.route("/set-password").post(auth, setPassword);

export { router as authRouter };
