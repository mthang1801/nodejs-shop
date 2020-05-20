const Product = require('../models/product');
const Cart = require("../models/cart");
const User = require("../models/user");
const Order = require("../models/order")
exports.getProducts = async (req, res, next) => {
  try {
    let products = await Product.find();         
    return res.render("shop/products-list", {
      prods : products,
      pageTitle: 'Products',
      path : "/products"     
    })
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
};

exports.getIndex = async (req, res, next) => {
  try {             
    let products = await Product.find();          
    return res.render("shop/index", {
      prods : products,
      pageTitle: 'Shop',
      path : "/",
    })
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
};


exports.getOrders =  async (req, res, next) => {
  try {
    const orders = await Order.find ({"user.userId" : req.user._id});    
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders : orders      
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
 
};

exports.postOrders = async(req, res, next) =>{
  try {
    let cartProducts = await req.user.populate("cart.items.productId").execPopulate();
    let products = cartProducts.cart.items.map(item => ({product : {...item.productId._doc }, quantity : item.quantity}));
    let order = new Order({
      products : products,
      user : {
        email : req.user.email,
        userId : req.user._id
      }
    })
    await order.save();
    await req.user.clearCart();
    return res.redirect("/orders");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};

exports.getProductItem = async (req, res, next) => {   
  try {
    let id = req.params.id;
    const product = await Product.findById(id);
    product.price = product.price.toString() ;   
    res.render("shop/product-detail", {
      product : product ,
      pageTitle: `${product.title}`,
      path : `/products/${product._id}`
    })
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
};

exports.getCart = async (req, res, next) => {  
  try {       
    let cartProducts = await req.user.populate("cart.items.productId").execPopulate();   
    let products = cartProducts.cart.items;   
    let totalPrice = 0;
    totalPrice = products.reduce((total, item) => {
      return total + item.productId.price * item.quantity;
    },0)
    
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      prods : products,
      totalPrice
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
};


exports.postCart = async (req,res, next) => {
  const productId = req.body.productId ; 
  try {    
    //check cart existed or not          
    let product = await Product.findById(productId);
    await req.user.addToCart(product);
    return res.redirect("/cart");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
};



exports.deleteCart = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    await req.user.removeCartItem(productId);
    // let cart = await Cart.findOne({userId : req.user._id });          
    // let indexDeletedProduct = cart.items.findIndex(item => item._id == productId);
    // console.log(indexDeletedProduct);
    // if(indexDeletedProduct == -1){
    //   return res.status(400).send("Product not found in cart");
    // }
    // cart.items.splice(indexDeletedProduct, 1);
    // await cart.save();
    return res.redirect("/cart");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
}

