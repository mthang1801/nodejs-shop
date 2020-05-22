const Product = require("../models/product");
const mongoose = require("mongoose");
const {validationResult}  = require("express-validator/check");
const fileHelper = require("../util/file");
const multer = require("multer");
exports.getAddProduct = (req, res, next) => {  
  console.log(1);
  console.log(req.session.csrfToken)
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product" ,
    editMode : false,    
    errorMessage : null,
    product : {
      title : "", 
      imageUrl: "",
      price :"" ,
      description : ""
    },
    validationErrors : []
  });
};

exports.postAddProduct = async (req, res, next) => {
    const title = req.body.title.trim() ; 
    const image = req.file; 
    const price = +req.body.price;
    const description = req.body.description.trim();
    console.log(image);
    if(!image){
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product" ,
        editMode : false, 
        errorMessage : "Attached file is not an image",
        product : {
          title,          
          price ,
          description
        },
        validationErrors : []
      })
    }
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      const errorsArr = errors.array();
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product" ,
        editMode : false, 
        errorMessage : errorsArr.map(({msg}) => msg),
        product : {
          title,           
          price ,
          description
        },
        validationErrors : errors.array()
      })
    }
    const imageUrl = image.path ;
    try {           
      let product = new Product({      
        title : title ,
        imageUrl : imageUrl ,
        price : price ,
        description : description,
        userId: req.user,
      });   
      await product.save() ;
      return res.redirect("/");
    } catch (err) {      
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; 
      next(error)
    }
};

exports.getEditProduct = async (req, res, next) => {  
  let edit = req.query.edit ; 
  let productId = req.params.productId;    
  try {            
    let product = await Product.findById(productId);    
    res.render("admin/edit-product",{
      pageTitle: `Edit ${product.title}`,
      path: `/admin/edit-product/${productId}`,   
      editMode : edit == "true" ? true : false,
      errorMessage : null ,
      product : product ,
      validationErrors :[]
    })
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
};


exports.postEditProduct = async (req, res, next) => {  
  const productId = req.body.productId;
  const title = req.body.title ;
  const image = req.file;
  const price = req.body.price ;
  const description = req.body.description;
  const errors = validationResult(req);
  
  if(!errors.isEmpty()){
    const errorsArr = errors.array();
    return res.status(422).render("admin/edit-product",{
      pageTitle: `Edit ${title}`,
      path: `/admin/edit-product/${productId}`,   
      editMode : true ,
      errorMessage : errorsArr.map(({msg}) => msg) ,
      product : {
        _id : productId,
        title, 
        price ,
        description
      },
      validationErrors :errors.array()
    })
  }
  try {    
    let product = await Product.findById(productId);    
    product.title = title;
    if(image){
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    product.description = description;
    product.price = price;
    await product.save();
    return res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
};



exports.getProducts = async (req, res, next) => { 
  try {   
    console.log(req.user._id);
    let products = await Product.find({userId : req.user._id });
    console.log(products);
    // .select("title price description -_id")
    // .populate("userId", "email");         
    return res.render("admin/products", {
      prods : products,
      pageTitle: 'Admin products',
      path : "/admin/products"      
    })
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  try {
    const id = req.body.id ;   
    let product=  await Product.findById(id);
    if(!product){
      return next(new Error("No Product found"));
    }   
    await Product.deleteOne({_id : id , userId : req.user._id });
    fileHelper.deleteFile(product.imageUrl);
    console.log("DELETE SUCCESS")
    return res.redirect("/admin/products")
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
}
