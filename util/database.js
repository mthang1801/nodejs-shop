const mongoose = require("mongoose");
const config = require("config");
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-wqvyp.mongodb.net/test?retryWrites=true&w=majority`;

const connectDB = () => {
  mongoose.Promise = require("bluebird");
  return mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = connectDB;
