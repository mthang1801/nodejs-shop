const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const auth = require("../middleware/auth");
const { check, body } = require("express-validator/check");
const User = require("../models/user");
router.get("/register", auth.checkLogout, authController.getRegister);

router.post(
  "/register",
  auth.checkLogout,
  [
    check("email").normalizeEmail()
    .isEmail()
    .withMessage("Email is invalid")
    .normalizeEmail()
    .custom((value, {req}) => {
      if(value === "test@test.com"){
        throw new Error("This email address is forbidden");
      }
      return User.findOne({email : value})
        .then(userDoc => {
          if(userDoc){
            return Promise.reject("Email has existed, please pick a different one");
          }
        })
    })
    ,
    body("password", "Password is invalid, at least 6 characters, including lowercase, uppercase, number and special character")
    .isLength({min: 6})
    .isAlphanumeric()
    .trim(),
    body("confirmPassword")
    .custom( (value, {req}) => {
      if(value !== req.body.password){
        throw new Error("Password and Confirm password are not match");
      }
      return true ;
    })
  ],
  authController.postRegister
);

router.get("/login", auth.checkLogout, authController.getLogin);

router.post("/login", auth.checkLogout, 
  check("email")
  .isEmail()
  .normalizeEmail()
  .withMessage("Invalid email")
, authController.postLogin);

router.post("/logout", auth.checkLogin, authController.postLogout);

router.get("/reset", auth.checkLogout, authController.getReset);

router.post("/reset", auth.checkLogout, authController.postReset);

router.get("/reset/:token", auth.checkLogout, authController.getResetToken);

router.post("/new-password", auth.checkLogout, authController.postNewPassword);
module.exports = router;
