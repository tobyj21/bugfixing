"use strict";
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
//Set root folder of app in global space
global.appRoot = path.resolve(__dirname);

var express = require("express");
var app = express();
app.set("view engine", "ejs");

// Body parses reads HTTP POST data and exposes object as req.body
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ limit: "15mb", extended: true }));
app.use(bodyParser.json({ limit: "15mb", extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Cookies
const cookieParser = require("cookie-parser");
app.use(cookieParser("K3C8eCOfdWESXSsCBVEEcp2GRwQ"));

//Get DB pool
var db = require("./services/postgres");

//Session handling
app.set("trust proxy", 1);
const session = require("express-session");
const PostgreSqlStore = require("connect-pg-simple")(session);

//Set session age to 30 seconds
const sessionAge = 1 * 1 * 10 * 1000; // hour, min, sec, millisecond

var sessionConfig = {
   name: "mykey",
   secret: "K3C8eCOfdWESXSsCBVEEcp2GRwQ",
   resave: true,
   saveUninitialized: false,
   proxy: false,
   cookie: {
      key: "mykey",
      secure: false,
      sameSite: false,
      httpOnly: true,
      maxAge: sessionAge,
   },
   store: new PostgreSqlStore({
      pgPromise: db,
      ttl: 2 * 60 * 60, //Hours, minute, seconds
   }),
};
app.use(session(sessionConfig));

// Load Passport
var passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportConfig = require("./services/passportConfig");
app.use(passport.initialize());
app.use(passport.session());

//Use compression
const compression = require("compression");
app.use(compression());

//Require routes
require("./routes/global")(app);

//Make folders available to web requests
app.use(express.static("public"));

//  404 page
app.use(function (req, res, next) {
   res.sendStatus(404);
});

//  500 page
app.use(function (err, req, res, next) {
   console.error(err.stack);
   res.sendStatus(500);
});

app.listen(process.env.SERVER_PORT, function () {
   console.log("Server running at port", process.env.SERVER_PORT, ":", process.env.HOST_URL);
});
