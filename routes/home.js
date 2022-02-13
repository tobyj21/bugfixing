"use strict";
var express = require("express");
var app = express();

//Get DB pool
var db = require("../services/postgres");

//CSRF protection
const csurf = require("csurf");
const csrfProtection = csurf({});

//Home page
app.get("/", csrfProtection, async function (req, res, next) {
   const user = req.user;

   res.render("home", {
      csrfToken: req.csrfToken(),
      isLoggedIn: user ? true : false,
   });
});

module.exports = app;
