const express = require("express");
const path = require("path");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const User = require("./models/user");
const errorsRoutes = require("./controllers/errors");
const connectDB = require("./util/database");
const config = require("config");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const https = require("https");
const app = express();

const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-wqvyp.mongodb.net/test?retryWrites=true&w=majority`;
const store = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

// app.engine("handlebars", expressHbs({layoutsDir : "views/layouts/", defaultLayout : "main-layout", extname : "hbs"}));
app.set("view engine", "ejs");
app.set("views", "views");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(helmet());
app.use(compression());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a", encoding: "utf8" }
);
app.use(morgan("combined", { stream: accessLogStream }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public", "/")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "mySecret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  try {
    let user = await User.findById(req.session.user._id);
    if (!user) {
      return next();
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    next(new Error(error));
  }
});

app.use(shopRoutes);
app.use(authRoutes);
app.use("/admin", adminRoutes.router);
app.get("/500", errorsRoutes.get500Page);
app.use("*", errorsRoutes.get404Page);

app.use((error, req, res, next) => {
  return res.status(500).render("500", {
    path: "/500",
    pageTitle: "Error!",
    isAuthenticated: req.session.isLoggedIn,
  });
});

const port = process.env.PORT || 5000;

connectDB()
  .then((result) => {
    console.log("DB connected");
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(port, console.log(`Server is running on port ${port}`));
    app.listen(port, console.log(`Server is running on port ${port}`));
  })
  .catch((err) => {
    console.log(err);
  });
