const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new mongoose.Schema({
  email : {
    type : String ,
    require: true,
    unique  : true
  },
  password : {
    type : String,
    require : true
  },
  resetToken : String , 
  expireResetToken : Date,
  cart : {
    items : [
      {
        productId : {
          type : Schema.Types.ObjectId,
          ref : "product",
          require : true 
        },
        quantity : {
          type : Number ,
          require : true
        }
      }
    ]
  }
})

UserSchema.methods.addToCart = function(product){
  //check product has existed into cart
  const cartProductIndex = this.cart.items.findIndex(item => item.productId.toString() == product._id);
  let newQuantity = 1 ; 
  let updatedCartItems = [...this.cart.items];
  console.log(cartProductIndex);
  if(cartProductIndex > -1){
    updatedCartItems[cartProductIndex].quantity = updatedCartItems[cartProductIndex].quantity + 1 ;
  }else{
    updatedCartItems.push({productId : product._id , quantity : newQuantity});
  }
  this.cart = { items : updatedCartItems} ;
  return this.save()
};

UserSchema.methods.removeCartItem = function(productId){ 
  let products = this.cart.items.filter(item => item.productId != productId);
  this.cart.items = products;
  return this.save();
};

UserSchema.methods.clearCart = function(){
  this.cart = {items : []};
  return this.save();
}

module.exports = mongoose.model("user", UserSchema);