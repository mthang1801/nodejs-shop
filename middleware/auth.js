const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

const auth = (req, res, next) => {
  console.log(req.user);
  next();
}

const checkLogin = (req, res, next) => {
  if(!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
}

const checkLogout = (req, res, next) => {
  if(req.session.isLoggedIn) {
    return res.redirect("/");
  }
  next();
}

module.exports = {
  auth ,
  checkLogin,
  checkLogout
};
