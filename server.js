const express = require("express");
const path = require("path");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const User = require("./models/user");
const errorsRoutes = require('./controllers/errors');
const ejs = require("ejs");
const connectDB = require("./util/database");
const config = require("config");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const app = express();

const store = new MongoDBStore({
  uri : config.get("MONGO_URI"),
  collection : "sessions"
});
const csrfProtection = csrf();

app.use(express.json());
app.use(express.urlencoded({ extended : false}));
app.use(express.static(path.join(__dirname, "public", "/")));


// app.engine("handlebars", expressHbs({layoutsDir : "views/layouts/", defaultLayout : "main-layout", extname : "hbs"}));
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(session({ secret : "mySecret", resave: false, saveUninitialized : false, store : store}));
app.use(csrfProtection);
app.use(flash());


app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(async(req, res, next) => {  
  if(!req.session.user){
    return next();
  }
  try {
    let user = await User.findById(req.session.user._id) ; 
    throw new Error("Dummy");
    if(!user){
      return next();
    }
    req.user = user;
    next();
  } catch (error) {
    next(new Error(error));
  }
});


app.use(shopRoutes);
app.use(authRoutes);
app.use("/admin", adminRoutes.router);
app.get("/500",errorsRoutes.get500Page );
app.use("*", errorsRoutes.get404Page);


app.use((error,req, res, next) => {
  res.status(500).render("500" , { 
    pageTitle : "Error!",
    path : "/500",
    isAuthenticated : req.session.isLoggedIn,
  })
})

const  port = process.env.PORT || 5000;

connectDB()
  .then( result => {    
    console.log("DB connected");
    app.listen(port , console.log(`Server is running on port ${port}`))
  })
  .catch(err => {
    console.log(err);
  })
