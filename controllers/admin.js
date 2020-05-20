const Product = require("../models/product");
const mongoose = require("mongoose");
const {validationResult}  = require("express-validator/check");
exports.getAddProduct = (req, res, next) => {  
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
  const imageUrl = req.body.imageUrl; 
  const price = +req.body.price;
  const description = req.body.description.trim();
  console.log(title);
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
        imageUrl,
        price ,
        description
      },
      validationErrors : errors.array()
    })
  }
  try {     
    let product = new Product({      
      title,
      imageUrl,
      price,
      description,
      userId: req.user,
    });
    await product.save();  
    return res.redirect("/");
  } catch (err) {   
    console.log(err);    
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
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
  const imageUrl = req.body.imageUrl;
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
        imageUrl,
        price ,
        description
      },
      validationErrors :errors.array()
    })
  }
  try {    
    let product = await Product.findById(productId);    
    product.title = title;
    product.imageUrl = imageUrl;
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
    let result = await Product.deleteOne({_id : id , userId : req.user._id });   
    return res.redirect("/admin/products")
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
}
