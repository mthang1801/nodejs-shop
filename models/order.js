const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  products : [
    {
      product : {
        type : Object,
        require: true 
      },
      quantity : {
        type : Number,
        require: true 
      }
    }
  ],
  user : {
    email : {
      type : String,
      require : true
    },
    userId : {
      type : Schema.Types.ObjectId,
      require : true ,
      ref : "user"
    }
  }
})


module.exports = mongoose.model("order", OrderSchema);