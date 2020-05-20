const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");
const sendEmail = require("../config/mail");
const crypto = require("crypto");
const {validationResult} = require("express-validator/check")
exports.getRegister = (req, res, next) => {
  let errMessage = req.flash("error");
  if(errMessage.length){
    errMessage = errMessage[0];
  }else{
    errMessage = null ;
  }
  let successMessage = req.flash("success");
  if(successMessage.length){
    successMessage = successMessage[0];
  }else{
    successMessage = null;
  }
  res.render("auth/register", {
    path : "register", 
    pageTitle : "Register",
    errorMessage : errMessage,
    successMessage : successMessage,
    oldInput : {
      email : "", 
      password : "",
      confirmPassword : ""
    },
    validationErrors : []
  });
}

exports.postRegister = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password ; 
    const confirmPassword = req.body.confirmPassword    
    let errors = validationResult(req);
    if(!errors.isEmpty()){
      const errorsArr = errors.array().map( ({msg}) => msg);
      console.log(errors.array());
      return res.status(422).render("auth/register", {
        path : "register", 
        pageTitle : "Register",
        errorMessage : errorsArr,   
        successMessage : null ,
        oldInput : {
          email,
          password , 
          confirmPassword
        },
        validationErrors : errors.array()
      })
    }      
    const hashPassword = await bcrypt.hash(password, 12);
    let user = new User({
      email,
      password : hashPassword,
      cart : {
        items : []
      } 
    });  
    await user.save();
    const subject = "Signup successfully";
    const html = "<h1>You signed up successfully!!!</h1>";    
    await sendEmail(email, subject, html);    
    req.flash("success", "Sign up successfully");
    return res.status(200).redirect("/register");
  
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
};

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
 
  if(message.length){
    message = message[0];
  }else{
    message = null ;
  } 
  let successMsg = req.flash("success");
  if(successMsg.length){
    successMsg = successMsg[0];
  }else{
    successMsg = null;   
  }
  res.render("auth/login", {
    path : "login",
    pageTitle : "Login",
    errorMessage : message,
    successMessage : successMsg,
    oldInput : {
      email : "",
      password : ""
    },
    validationErrors : []
  })
}

exports.postLogin = async (req, res, next) => {
  try {
    const email = req.body.email ; 
    const password = req.body.password;
    const errors = validationResult(req)  ;
    if(!errors.isEmpty()){
      console.log(errors.array()[0].msg);
      return res.status(422).render("auth/login", {
        path : "login",
        pageTitle : "Login",
        errorMessage : errors.array()[0].msg,
        successMessage : null,
        oldInput : {
          email,
          password 
        },
        validationErrors : errors.array()
      })
    }
    const user = await User.findOne({email : email});
    const checkPassword = await bcrypt.compare(password, user.password);
    if(!checkPassword){
      req.flash("error", "Invalid email or password!!")
      return res.redirect("/login")
    }
    
    req.session.user = user;
    req.session.isLoggedIn = true ;     
    req.session.save(err => {
      console.log(err);
      res.redirect("/");
    })   
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
}

exports.postLogout = async (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/login")
  });
}

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if(message.length){
    message = message[0];
  }else{
    message = null ;
  } 
  return res.render("auth/reset", {
    path : "/reset",
    pageTitle : "Reset Password",
    errorMessage : message
  })
}

exports.postReset = (req, res, next) =>{
  try {
    const email = req.body.email;
    crypto.randomBytes(32 , async (err, buffer) => {
      if(err){
        return res.status(400).redirect("/reset");
      }
      const token = buffer.toString("hex");
      let user = await User.findOne({email : email});
      if(!user){
        req.flash("error", "No account with that email found");
        return res.redirect("/reset");
      }
      user.resetToken = token ; 
      user.expireResetToken = Date.now() + 3600000;
      await user.save();
      const subject = "Reset password"
      const protocol = req.protocol;
      const host = req.get("host");      
      const html = `<h3>We have received your request to reset password</h3>
                    <div>Click <a href="${protocol}://${host}/reset/${token}">here</a> to reset your password</div>
      `
      sendEmail(email, subject, html );
      req.flash("success", "Your request to reset password successully, please check your email to renew password");
      return res.redirect("/login")
    })
  
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
}

exports.getResetToken = async (req, res, next) => {
  try {
    let token = req.params.token;
    console.log(token);
    let user = await User.findOne({resetToken : token, expireResetToken : {$gt : Date.now()}});
    if(!user){
      req.flash("error", "verify token is invalid or expired");  
      return res.redirect("/login") ;
    }    
    let message = req.flash("error");
    if(message.length){
      message = message[0];
    }else{
      message = null ;
    } 
    return res.render("auth/new-password", {
      path : "/new-password",
      pageTitle : "Set new password",
      errorMessage : message,
      userId : user._id,
      token : token
    })
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
}

exports.postNewPassword = async (req, res, next) => {
  try {
    const userId = req.body.userId ; 
    const password = req.body.password ; 
    const confirmPassword = req.body.confirmPassword ; 
    const token =req.body.token ; 
    if(password != confirmPassword){
      req.flash("error", "Password and confirm password are not match");
      return res.redirect(`/reset/${token}`)
    }    
    let user = await User.findOne({_id : userId , resetToken : token });
    console.log(user);
    if(!user){
      req.flash("error", "verify token is invalid or expired");      
      return res.redirect("/login");
    }
    let hashPassword = await bcrypt.hash(password,12);
    user.password = hashPassword;
    user.expireResetToken = undefined;
    user.resetToken = undefined;
    await user.save();
    req.flash("success", "Update password successfully");
    return res.redirect("/login");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
}

