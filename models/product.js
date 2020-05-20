const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new mongoose.Schema({
  title : {
    type : String ,
    require: true
  },
  imageUrl : {
    type : String ,
    require : true
  },
  price : {
    type : Number ,
    require : true
  },
  description : {
    type : String, 
    require : true
  },
  userId : {
    type : Schema.Types.ObjectId,
    ref : "user", 
    require : true 
  }
});

module.exports = mongoose.model("product", ProductSchema);