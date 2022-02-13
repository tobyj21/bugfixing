"use strict";
var express = require("express");
const passport = require("passport");
const path = require("path");

//Use helmet to control headers
const helmet = require("helmet");

//Load middlewares
const isAuthenticated = require("./middleware/isAuthenticated");
const excludeCookieCache = require("./middleware/excludeCookieCache");
const contentSecurityPolicy = require("./middleware/contentSecurityPolicy");

module.exports = function (app) {
   app.use(helmet());
   app.use(excludeCookieCache);
   app.use(contentSecurityPolicy);

   //Add routes
   var home = require("./home");
   app.use("/", home);

   var restricted = require("./restricted");
   app.use("/restrictedContent", isAuthenticated, restricted);

   var auth = require("./auth");
   app.use("/", auth);

   //CSRF failure handling
   app.use(function (err, req, res, next) {
      if (err.code !== "EBADCSRFTOKEN") return next(err);
      console.log("CSRF rejection on: " + req.url);

      // handle CSRF token errors here
      res.status(403);
      res.sendFile(path.join(__dirname, "../public/403.html"));
   });
};
