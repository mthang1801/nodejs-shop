const mongoose = require('mongoose');
const config = require("config");
const connectDB = () => {
  mongoose.Promise = require('bluebird');
  return mongoose.connect(config.get("MONGO_URI"),{useNewUrlParser: true, useUnifiedTopology:true});  
}

module.exports = connectDB;