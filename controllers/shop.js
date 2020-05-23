const Product = require('../models/product');
const Cart = require("../models/cart");
const User = require("../models/user");
const Order = require("../models/order");
const PDFDocument = require("pdfkit");
const fileHelper = require("../util/file");
const fs = require("fs");
const path = require("path");

const ITEM_PER_PAGE = 2;
const NUMBER_NEXT_PAGES = 5 ; 

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
  const page = req.query.page;
  try {             
    let totalProducts = await Product.countDocuments();    
    
    let products = await Product.find().skip((page-1)*ITEM_PER_PAGE).limit(ITEM_PER_PAGE);          
    return res.render("shop/index", {
      prods : products,
      pageTitle: 'Shop',
      path : "/",  
      totalProducts : totalProducts,
      currentPage : page ,
      hasNextPage : totalProducts - page*ITEM_PER_PAGE > 0 ,
      hasPreviousPage : page > 1 ,
      nextPage : +page + 1 ,
      previousPage : +page - 1,
      lastPage : Math.ceil(totalProducts / ITEM_PER_PAGE)
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
    return res.redirect("/cart");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500 ; 
    return next(error);
  }
}

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = `invoice-${orderId}.pdf`;
  const invoicePath = path.join("data", "invoices", invoiceName);
  try {
    let order = await Order.findById(orderId);
    if(!order){
      return next(new Error("No order found"));
    }
    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error("No authorization"))
    }
    // fs.readFile(path.join("data", "invoices", invoiceName))
    // .then(data => {   
    //   res.setHeader("Content-Type","application/pdf");
    //   res.setHeader("Content-Disposition", "attachment; filename="+invoiceName);      
    //   return res.send(data);
    // })
    // .catch(err => {
    //   return next(err)
    // })

    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    res.setHeader("Content-Type","application/pdf");
    res.setHeader("Content-Disposition", "inline; filename="+invoiceName);  
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Invoice",{underline: true});
    pdfDoc.text("---------------------------");
    pdfDoc.fontSize(14);
    let totalPrice = 0; 
    order.products.forEach( product => {
      pdfDoc.text(`${product.product.title} - ${product.quantity} x $${product.product.price}`);
      totalPrice += product.product.price;
    });
    pdfDoc.text("-----");
    pdfDoc.fontSize(18).text(`Total Price : $${totalPrice}`);
    pdfDoc.end();

    // const file = fs.createReadStream(invoicePath);
   
    // file.pipe(res);
  } catch (error) {
    next(error);
  }
  
}
