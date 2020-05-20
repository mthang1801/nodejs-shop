const express = require("express");
const path = require("path");
const adminController = require("../controllers/admin");
const router = express.Router();
const auth = require("../middleware/auth");
const {check, body} = require("express-validator/check");
router.get("/add-product", auth.checkLogin, adminController.getAddProduct);

router.post("/add-product", auth.checkLogin, [
  body("title", "title must have at least 3 characters")  
    .isLength({min : 3}),    
  body("imageUrl" , "imageURL mast be url file")
    .isURL(),
  body("price", "price must be double type")
    .isFloat(),
  body("description","description at least 5 characters")  
    .isLength({min: 5, max : 500 })  
] , adminController.postAddProduct);

router.get("/edit-product/:productId", auth.checkLogin,adminController.getEditProduct);

router.post("/edit-product", auth.checkLogin, [
  body("title", "title must have at least 3 characters")    
    .isLength({min : 3}),    
  body("imageUrl" , "imageURL mast be url file")
    .isURL(),
  body("price", "price must be double type")
    .isFloat(),
  body("description","description at least 5 characters")    
    .isLength({min: 5, max : 500 })   
],adminController.postEditProduct);

router.post("/delete-product",auth.checkLogin, adminController.postDeleteProduct);

router.get("/products", auth.checkLogin, adminController.getProducts);

exports.router = router;
